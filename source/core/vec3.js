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

goog.provide('owg.vec3');

//------------------------------------------------------------------------------
/** 
 * @class vec3
 * @description Vector class (3 components)
 * {@link http://www.openwebglobe.org} 
 *
 * @author Martin Christen martin.christen@fhnw.ch  
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch 
 * @version 0.1  
 */

//------------------------------------------------------------------------------
/**
 * Create a new Vector Object
 * Initialised the vector as [0,0,0]
 * This is the basic vec3.class 
 * @constructor
 * 
 * @param {number=} opt_x component of vector (optional)
 * @param {number=} opt_y component of vector (optional)
 * @param {number=} opt_z component of vector (optional)
 */
function vec3(opt_x, opt_y, opt_z)
{
   /** @type number*/
   var x = opt_x || 0;
   /** @type number*/
   var y = opt_y || 0;
   /** @type number*/
   var z = opt_z || 0;
   
   /** @type {Array.<number>} */
   this._values = [x, y, z];

   /** @type {Float32Array} */
   this._float32values = new Float32Array([x, y, z]);
}

//------------------------------------------------------------------------------
/**
 * Set Values
 *
 * @param {number} x 
 * @param {number} y 
 * @param {number} z
 */
vec3.prototype.Set = function(x,y,z)
{
      this._values[0]=x;
      this._values[1]=y;
      this._values[2]=z;
}

//------------------------------------------------------------------------------
/**
 * Get Values as Float32Array
 *
 * @return {Float32Array} returns a float32 array with all values [r,g,b,a]
 */
vec3.prototype.ToFloat32Array = function()
{
   this._float32values[0] = this._values[0];
   this._float32values[1] = this._values[1];
   this._float32values[2] = this._values[2];

   return this._float32values;
}
//------------------------------------------------------------------------------
/**
 * Returns the values as array
 *
 * @return {Array.<number>}
 */
vec3.prototype.Get = function()
{
   return this._values;
}

//------------------------------------------------------------------------------
/**
 * @description Returns a copy of the vec3 object. (Allocates memory)
 *
 * @return {vec3}
 */
vec3.prototype.Copy = function()
{
   var cpy = new vec3();
   cpy.Set(this._values[0],this._values[1],this._values[2]);
   return cpy;  
}

//------------------------------------------------------------------------------
/**
 * Adds the vector vec to this instance
 * @param {vec3} vec
 * @return {vec3}
 */
vec3.prototype.Add = function(vec)
{   
   this._values[0]=this._values[0]+vec._values[0];
   this._values[1]=this._values[1]+vec._values[1];
   this._values[2]=this._values[2]+vec._values[2];
   return this;  
}

//------------------------------------------------------------------------------
/**
 * Subtracts the vector vec from this instance
 * @param {vec3} vec
 * @return {vec3}
 */
vec3.prototype.Sub = function(vec)
{
   this._values[0]=this._values[0]-vec._values[0];
   this._values[1]=this._values[1]-vec._values[1];
   this._values[2]=this._values[2]-vec._values[2];
   return this;
}

//-----------------------------------------------------------------------
/**
 * Subtracts the vector vec1-vec2 and stores the result in this instance
 *
 * @param {vec3} vec1
 * @param {vec3} vec2
 */
vec3.prototype.Subtract = function(vec1, vec2)
{
   this._values[0]=vec1._values[0]-vec2._values[0];
   this._values[1]=vec1._values[1]-vec2._values[1];
   this._values[2]=vec1._values[2]-vec2._values[2];
}

//------------------------------------------------------------------------------
/**
 * Calculates the cross product of this instance and the vector vec.
 * @param {vec3} vec
 */
vec3.prototype.Cross = function(vec)
{
   var x1=this._values[0];
   var y1=this._values[1];
   var z1=this._values[2];

   var x2=vec._values[0];
   var y2=vec._values[1];
   var z2=vec._values[2];

   this._values[0]=y1*z2-y2*z1;
   this._values[1]=z1*x2-z2*x1;
   this._values[2]=x1*y2-x2*y1;
   return this;
}  

//------------------------------------------------------------------------------
/**
 * Calculates the cross product of two vectors and stores the result in a previously allocated vector
 * @param {vec3} result previously allocated result vec
 * @param {vec3} v1 first vector to calculate cross product
 * @param {vec3} v2 second vector to calculate cross product
 * @ignore
 */
function Cross(result, v1, v2)
{
   var x1=v1._values[0];
   var y1=v1._values[1];
   var z1=v1._values[2];
   var x2=v2._values[0];
   var y2=v2._values[1];
   var z2=v2._values[2];
   result._values[0]=y1*z2-y2*z1;
   result._values[1]=z1*x2-z2*x1;
   result._values[2]=x1*y2-x2*y1;
}

//------------------------------------------------------------------------------
/**
 * Calculates the dot product.
 * @param {vec3} vec
 */
vec3.prototype.Dot = function(vec)
{
   return this._values[0]*vec._values[0]+this._values[1]*vec._values[1]+this._values[2]*vec._values[2];
}

//------------------------------------------------------------------------------
/**
 * Calculates the length of the vector.
 * @return {number} length of the current vector instance. length=sqrt(x^2+y^2+z^2)
 */
vec3.prototype.Length = function()
{
   var x2 = this._values[0]; x2 *= x2;
   var y2 = this._values[1]; y2 *= y2;
   var z2 = this._values[2]; z2 *= z2;
   return Math.sqrt(x2+y2+z2);
}


//------------------------------------------------------------------------------
/**
 * Calculates the squared length of the vector.
 * @return {number} squared length of the current vector instance. len=x^2+y^2+z^2
 */
vec3.prototype.SquaredLength = function()
{
   var x2 = this._values[0]; x2 *= x2;
   var y2 = this._values[1]; y2 *= y2;
   var z2 = this._values[2]; z2 *= z2;
   return x2+y2+z2;
}

//------------------------------------------------------------------------------
/**
 * Normalizes this vector instance. Afterward the vector length will be 1.
 * @return {vec3} length of the current vector instance. length=sqrt(x^2+y^2+z^2)
 */
vec3.prototype.Normalize = function()
{
   var l=this.Length();
   if (l!=0)
   {
      this._values[0]=this._values[0]/l;
      this._values[1]=this._values[1]/l;
      this._values[2]=this._values[2]/l;
   }
   return this;
}

//------------------------------------------------------------------------------
/**
 * Negates all elements.
 * @return {vec3}
 */
vec3.prototype.Neg = function()
{
   var l=this.Length();
   this._values[0]=-this._values[0];
   this._values[1]=-this._values[1];
   this._values[2]=-this._values[2];
   return this;
}

//------------------------------------------------------------------------------
/**
 * 
 * @return {string} a string like: "[1,2,3]";
 */
vec3.prototype.ToString = function()
{
   return "["+this._values[0]+","+this._values[1]+","+this._values[2]+"]";
}

//------------------------------------------------------------------------------

goog.exportSymbol('Cross', Cross);
goog.exportSymbol('vec3', vec3);
goog.exportProperty(vec3.prototype, 'Add', vec3.prototype.Add);
goog.exportProperty(vec3.prototype, 'Cross', vec3.prototype.Cross);
goog.exportProperty(vec3.prototype, 'Dot', vec3.prototype.Dot);
goog.exportProperty(vec3.prototype, 'Get', vec3.prototype.Get);
goog.exportProperty(vec3.prototype, 'Length', vec3.prototype.Length);
goog.exportProperty(vec3.prototype, 'Neg', vec3.prototype.Neg);
goog.exportProperty(vec3.prototype, 'Normalize', vec3.prototype.Normalize);
goog.exportProperty(vec3.prototype, 'Set', vec3.prototype.Set);
goog.exportProperty(vec3.prototype, 'SquaredLength', vec3.prototype.SquaredLength);
goog.exportProperty(vec3.prototype, 'Subtract', vec3.prototype.Subtract);
goog.exportProperty(vec3.prototype, 'Sub', vec3.prototype.Sub);
goog.exportProperty(vec3.prototype, 'ToString', vec3.prototype.ToString);
