/*******************************************************************************
#      ____               __          __  _      _____ _       _               #
#     / __ \              \ \        / / | |    / ____| |     | |              #
#    | |  | |_ __   ___ _ __ \  /\  / /__| |__ | |  __| | ___ | |__   ___      #
#    | |  | | '_ \ / _ \ '_ \ \/  \/ / _ \ '_ \| | |_ | |/ _ \| '_ \ / _ \     #
#    | |__| | |_) |  __/ | | \  /\  /  __/ |_) | |__| | | (_) | |_) |  __/     #
#     \____/| .__/ \___|_| |_|\/  \/ \___|_.__/ \_____|_|\___/|_.__/ \___|     #
#           | |                                                                #
#           |_|                 _____ _____  _  __                             #
#                              / ____|  __ \| |/ /                             #
#                             | (___ | |  | | ' /                              #
#                              \___ \| |  | |  <                               #
#                              ____) | |__| | . \                              #
#                             |_____/|_____/|_|\_\                             #
#                                                                              #
#                              (c) 2010-2011 by                                #
#           University of Applied Sciences Northwestern Switzerland            #
#                     Institute of Geomatics Engineering                       #
#                           martin.christen@fhnw.ch                            #
********************************************************************************
*     Licensed under MIT License. Read the file LICENSE for more information   *
*******************************************************************************/

goog.provide('owg.Cache');

goog.require('goog.debug.Logger');

/*
This code is based on jscache, available at https://github.com/monsur/jscache/
and is also released under MIT license 
(see LICENSE file and CREDITS file for more information)
Copyright (c) 2007 Monsur Hossain (http://monsur.hossai.in)
This version is slightly modified for the OpenWebGlobe cache 

Modifications from original code:
If the item has a function called "Destroy()" it is called when purged 
from cache. This way you don't have to specify a callback function for
every item. (i.e. using prototype function to save memory).

Planned modifications:
(1) remove debugging/logging for better performance 
(2) remove options (Cache priority etc.) for better performance
(3) rename some functions
*/

//------------------------------------------------------------------------------
/**
 * An easier way to refer to the priority of a cache item
 * @enum {number}
 */
var CachePriority = 
{
  'LOW': 1,
  'NORMAL': 2,
  'HIGH': 4
};

//------------------------------------------------------------------------------
/**
 * Creates a new Cache object.
 * @param {number} maxSize The maximum size of the cache (or -1 for no max).
 * @param {boolean} debug Whether to log events
 * @constructor
 */
function Cache(maxSize, debug) 
{
    /** @type {number} */
    this.maxSize_ = maxSize || -1;
    /** @type {boolean} */
    this.debug_ = debug || false;
    /** @type {Object} */
    this.items_ = {};
    /** @type {number} */
    this.count_ = 0;

    /** @type {number} */
    var fillFactor = .75;
    /** @type {number} */
    this.purgeSize_ = Math.round(this.maxSize_ * fillFactor);

    /** @type {Object} */
    this.stats_ = {};
    this.stats_['hits'] = 0;
    this.stats_['misses'] = 0;
    this.log_('Initialized cache with size ' + maxSize);
}

//------------------------------------------------------------------------------
/**
 * Retrieves an item from the cache.
 * @param {string} key The key to retrieve.
 * @return {Object} The item, or null if it doesn't exist.
 */
Cache.prototype.getItem = function(key) 
{
  // retrieve the item from the cache
  var item = this.items_[key];

  if (item != null) 
  {
    if (!this.isExpired_(item)) 
    {
      // if the item is not expired
      // update its last accessed date
      item.lastAccessed = new Date().getTime();
    } 
    else 
    {
      // if the item is expired, remove it from the cache
      this.removeItem_(key);
      item = null;
    }
  }

  // return the item value (if it exists), or null
  var returnVal = item ? item.value : null;
  if (returnVal) 
  {
    this.stats_['hits']++;
    this.log_('Cache HIT for key ' + key)
  } 
  else 
  {
    this.stats_['misses']++;
    this.log_('Cache MISS for key ' + key)
  }
  return returnVal;
};

/**
 * @typedef {{
 *     expirationAbsolute: Date,
 *     expirationSliding: number,
 *     priority: CachePriority,
 *     callback: function(string, Object)
 * }}
 */
var CacheSetItemOptions;

//------------------------------------------------------------------------------
/**
 * Sets an item in the cache.
 * @param {string} key The key to refer to the item.
 * @param {Object} value The item to cache.
 * @param {CacheSetItemOptions=} opt_options an optional object which controls various caching
 *    options:
 *      expirationAbsolute: the datetime when the item should expire
 *      expirationSliding: an integer representing the seconds since
 *                         the last cache access after which the item
 *                         should expire
 *      priority: How important it is to leave this item in the cache.
 *                You can use the values CachePriority.Low, .Normal, or 
 *                .High, or you can just use an integer.  Note that 
 *                placing a priority on an item does not guarantee 
 *                it will remain in cache.  It can still be purged if 
 *                an expiration is hit, or if the cache is full.
 *      callback: A function that gets called when the item is purged
 *                from cache.  The key and value of the removed item
 *                are passed as parameters to the callback function.
 */
Cache.prototype.setItem = function(key, value, opt_options) 
{

  /** @constructor */
  function CacheItem(k, v, o) 
  {
    if ((k == null) || (k == '')) 
    {
      throw new Error("key cannot be null or empty");
    }
    this.key = k;
    this.value = v;
    if (o == null) 
    {
      o = {};
    }
    if (o.expirationAbsolute != null) 
    {
      o.expirationAbsolute = o.expirationAbsolute.getTime();
    }
    if (o.priority == null) 
    {
      o.priority = CachePriority.NORMAL;
    }
    this.options = o;
    this.lastAccessed = new Date().getTime();
  }

  // add a new cache item to the cache
  if (this.items_[key] != null) 
  {
    this.removeItem_(key);
  }
  this.addItem_(new CacheItem(key, value, opt_options));
  this.log_("Setting key " + key);

  // if the cache is full, purge it
  if ((this.maxSize_ > 0) && (this.count_ > this.maxSize_)) 
  {
    var that = this;
    setTimeout(function() 
    {
      that.purge_.call(that);
    }, 0);
  }
};

//------------------------------------------------------------------------------
/**
 * Removes all items from the cache.
 */
Cache.prototype.clear = function() {
  // loop through each item in the cache and remove it
  for (var key in this.items_) {
    this.removeItem_(key);
  }
  this.log_('Cache cleared');
};

//------------------------------------------------------------------------------
/**
 * @return {Object} The hits and misses on the cache.
 */
Cache.prototype.getStats = function() 
{
  return this.stats_;
};


//------------------------------------------------------------------------------
/**
 * @return {string} Returns an HTML string representation of the cache.
 */
Cache.prototype.toHtmlString = function() 
{
  var returnStr = this.count_ + " item(s) in cache<br /><ul>";
  for (var key in this.items_) 
  {
    var item = this.items_[key];
    returnStr = returnStr + "<li>" + item.key.toString() + " = " +
        item.value.toString() + "</li>";
  }
  returnStr = returnStr + "</ul>";
  return returnStr;
};

//------------------------------------------------------------------------------
/**
 * Removes expired items from the cache.
 */
Cache.prototype.purge_ = function() 
{

  var tmparray = new Array();

  // loop through the cache, expire items that should be expired
  // otherwise, add the item to an array
  for (var key in this.items_) 
  {
    var item = this.items_[key];
    if (this.isExpired_(item)) 
    {
      this.removeItem_(key);
    } 
    else 
    {
      tmparray.push(item);
    }
  }

  if (tmparray.length > this.purgeSize_) 
  {
    // sort this array based on cache priority and the last accessed date
      tmparray = tmparray.sort(
         function(a, b) 
         { 
            if (a.options.priority != b.options.priority) 
            {
               return b.options.priority - a.options.priority;
            } 
            else 
            {
               return b.lastAccessed - a.lastAccessed;
            }
         }
      );

    // remove items from the end of the array
    while (tmparray.length > this.purgeSize_) 
    {
      var ritem = tmparray.pop();
      this.removeItem_(ritem.key);
    }
  }
  this.log_('Purged cached');
};

//------------------------------------------------------------------------------
/**
 * Add an item to the cache.
 * @param {Object} item The cache item to add.
 * @private
 */
Cache.prototype.addItem_ = function(item) 
{
  this.items_[item.key] = item;
  this.count_++;
};


//------------------------------------------------------------------------------
/**
 * Remove an item from the cache, call the callback function (if it exists).
 * @param {string} key The key of the item to remove
 * @private
 */
Cache.prototype.removeItem_ = function(key) 
{
  var item = this.items_[key];
  delete this.items_[key];
  this.count_--;
  this.log_("removed key " + key);

  // if there is a callback function, call it at the end of execution
  if (item.options.callback != null) 
  {
    setTimeout(function() 
    {
      item.options.callback.call(null, item.key, item.value);
    }, 0);
  }
  
  if (item.Destroy != null)
  {
    setTimeout(function() 
    {
       item.Destroy();
    }, 0);
  }
};

//------------------------------------------------------------------------------
/**
 * @param {Object} item A cache item.
 * @return {boolean} True if the item is expired
 * @private
 */
Cache.prototype.isExpired_ = function(item) 
{
  var now = new Date().getTime();
  var expired = false;
  if (item.options.expirationAbsolute && (item.options.expirationAbsolute < now)) 
  {
      // if the absolute expiration has passed, expire the item
      expired = true;
  } 
  if (!expired && item.options.expirationSliding) 
  {
    // if the sliding expiration has passed, expire the item
    var lastAccess = item.lastAccessed + (item.options.expirationSliding * 1000);
    if (lastAccess < now) { expired = true; }
  }
  return expired;
};

//------------------------------------------------------------------------------
/**
 * Logs a message if debug is set to true.
 * @param {string} msg The message to log.
 * @private
 */
Cache.prototype.log_ = function(msg) 
{
  if (this.debug_) 
  {
    goog.debug.Logger.getLogger('owg.Cache').info(msg);
  }
};

//------------------------------------------------------------------------------
