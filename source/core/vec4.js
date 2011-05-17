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

goog.provide('owg.vec4');

//Constructor
//vec4()     Vector is initialized with [0.0,0.0,0.0,0.0]
//Set(r,g,b,a)         
//Get                   returns the values as array




/** 
 * 
 * @class vec4
 * @constructor
 * @description vec4 4-component vector, mainly used for colors 
 * @author Martin Christen martin.christen@fhnw.ch 
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch
 *
 * @param {number=} opt_x component of vector (optional)
 * @param {number=} opt_y component of vector (optional)
 * @param {number=} opt_z component of vector (optional)
 * @param {number=} opt_w component of vector (optional)
 */
function vec4(opt_x,opt_y,opt_z,opt_w)
{
   /** @type number*/
   var x = opt_x || 0;
   /** @type number*/
   var y = opt_y || 0;
   /** @type number*/
   var z = opt_z || 0;
   /** @type number*/
   var w = opt_w || 0;
   
   /** @type {!Float32Array} */
   this._values = new Float32Array([x, y, z, w]);
}

/**
 * Set Values
 *
 * @param {number} r - red
 * @param {number} g - green
 * @param {number} b - blue
 * @param {number} a - alpha
 */
vec4.prototype.Set = function(r,g,b,a)
{
      this._values[0]=r;
      this._values[1]=g;
      this._values[2]=b;
      this._values[3]=a;
}

/**
 * Get Values 
 *
 * @return {!Float32Array} returns an array with all values [r,g,b,a]
 */
vec4.prototype.Get = function()
{
   return this._values;
}

/**
 * ToString
 *
 * @return {string} returns a string like: [1,0,1,1]
 */
vec4.prototype.ToString = function()
{
   return "["+this._values[0]+","+this._values[1]+","+this._values[2]+","+this._values[3]+"]";
}

goog.exportSymbol('vec4', vec4);
goog.exportProperty(vec4.prototype, 'Get', vec4.prototype.Get);
goog.exportProperty(vec4.prototype, 'Set', vec4.prototype.Set);
