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

goog.provide('owg.GlobeCache');

goog.require('owg.Cache');
goog.require('owg.TerrainBlock');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Cache Manager for virtual globe
 * @author Martin Christen, martin.christen@fhnw.ch
 * @param {engine3d} engine
 * @param {Array.<ImageLayer>} imagelayerlist
 * @param {Array.<ElevationLayer>} elevationlayerlist
 * @param {MercatorQuadtree} quadtree
 * @param {number} cachesize
 */
function GlobeCache(engine, imagelayerlist, elevationlayerlist, quadtree, cachesize)
{
   /** @type {engine3d} */
   this.engine = engine;
   /** @type {Array.<ImageLayer>} */
   this.imagelayerlist = imagelayerlist;
   /** @type {Array.<ElevationLayer>} */
   this.elevationlayerlist = elevationlayerlist;
   /** @type {MercatorQuadtree} */
   this.quadtree = quadtree;
   
   this.cache = new Cache(cachesize, false);
}
//------------------------------------------------------------------------------
/**
 * @description Destroy Cache. Clear all memory.
 */
GlobeCache.prototype.Destroy = function()
{
   this.engine = null;
   this.imagelayerlist = null;
   this.elevationlayerlist = null;
   this.quadtree = null;
   this.cache.clear();
   this.cache = null;  
}
//------------------------------------------------------------------------------
/**
 * @description Returns true if cache is ready to be used.
 * Please note that for some tile services creation of cache needs async requests.
 * You can't make tile requests before this function returns true.
 */
GlobeCache.prototype.IsReady = function()
{
   // atleast one image layer is required
   if (!this.imagelayerlist) { return false; }
   
   if (this.imagelayerlist.length == 0) {return false;}
   
   for (var i=0;i<this.imagelayerlist.length;i++)
   {
      if (!this.imagelayerlist[i].Ready())
      {
         return false;
      }
   }
   
   // elevation layers are optional, but if an elevation layer was added
   // it must be checked if available
   if (this.elevationlayerlist)
   {
      for (var i=0;i<this.elevationlayerlist.length;i++)
      {
         if (!this.elevationlayerlist[i].Ready())
         {
            return false;
         }
      }
   }
  
   return true; // all image layers/elevation layers are ready!
}
//------------------------------------------------------------------------------
/**
 * @description Request a new Terrainblock. This is async. 
 * Always returns a terrain block (possibly marked as not ready)
 * @param {string} quadcode
 */
//------------------------------------------------------------------------------
GlobeCache.prototype.RequestBlock = function(quadcode)
{
   var terrainblock = this.cache.getItem(quadcode);
   
   if (terrainblock == null)
   {
      // item doesn't exist yet, create a new one and request data (async)
      terrainblock = new TerrainBlock(this.engine, quadcode, this.quadtree);
      terrainblock._AsyncRequestData(this.imagelayerlist, this.elevationlayerlist);
      this.cache.setItem(quadcode, terrainblock);
   }
   
   return terrainblock;
}
//------------------------------------------------------------------------------
/**
 * @description Get an already cached block (or null if unavailable)
 * This doesn't force downloading a block if not available.
 * Returns terrain block or null.
 * @param {string} quadcode
 */
GlobeCache.prototype.GetCachedBlock = function(quadcode)
{
   var terrainblock = this.cache.getItem(quadcode);
   return terrainblock;
}
//------------------------------------------------------------------------------
/**
 * @description Retrieve maximum level of detail
 */
GlobeCache.prototype.GetMaxLod = function()
{
   var maxlod = 0;
   
   if (this.elevationlayerlist.length > 0)
   {
      for (var i=0;i<this.elevationlayerlist.length;i++)
      {
         maxlod = Math.max(maxlod, this.elevationlayerlist[i].GetMaxLod())-1;
      }
   }
   else
   {
      for (var i=0;i<this.imagelayerlist.length;i++)
      {
         maxlod = Math.max(maxlod, this.imagelayerlist[i].GetMaxLod());
      }
   }
   
   return maxlod;
}
//------------------------------------------------------------------------------

goog.exportSymbol('GlobeCache', GlobeCache);
goog.exportProperty(GlobeCache.prototype, 'IsReady', GlobeCache.prototype.IsReady);
goog.exportProperty(GlobeCache.prototype, 'RequestBlock', GlobeCache.prototype.RequestBlock);
