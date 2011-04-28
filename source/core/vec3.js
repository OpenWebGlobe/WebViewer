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
 * float32 and 
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
 * @param {string} typeparam "float": vector values will be stored as float32. "double": vector values will be stored as float64. 
 * @constructor
 */
function vec3(typeparam)
{
   if (typeparam == "double")
   {
      this._values = new Array([0.0, 0.0, 0.0]);  
   }
   else //(typeparam == "float")
   {
      this._values = new Float32Array([0.0, 0.0, 0.0]);
   }
}

//------------------------------------------------------------------------------
/**
 * Set Values
 * @extends vec3
 *
 * @param {float} x 
 * @param {float} y 
 * @param {float} z
 */
vec3.prototype.Set = function(x,y,z)
{
      this._values[0]=x;
      this._values[1]=y;
      this._values[2]=z;
}

//------------------------------------------------------------------------------
/**
 * Returns the values as array
 * @extends vec3
 *
 */
vec3.prototype.Get = function()
{
   return this._values;
}

//------------------------------------------------------------------------------
/**
 * @description Returns a copy of the vec3 object. (Allocates memory)
 * @extends vec3
 *
 */
vec3.prototype.Copy = function()
{
   var cpy;
   if (this._values instanceof Float32Array)
   {
      cpy = new vec3("float");
   }
   if (this._values instanceof Array)
   {
      cpy = new vec3("double");
   }

   cpy.Set(this._values[0],this._values[1],this._values[2]);
    
   return cpy;  
}

//------------------------------------------------------------------------------
/**
 * Adds the vector vec to this instance
 * @extends vec3
 * @param{vec3} vec
 */
vec3.prototype.Add = function(vec)
{   
   if(vec instanceof vec3)
   {
      this._values[0]=this._values[0]+vec._values[0];
      this._values[1]=this._values[1]+vec._values[1];
      this._values[2]=this._values[2]+vec._values[2];
      return this;  
   }
}

//------------------------------------------------------------------------------
/**
 * Subtracts the vector vec from this instance
 * @extends vec3
 * @param{vec3} vec
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
 * @extends vec3
 * @param{vec3} vec
 */
vec3.prototype.Cross = function(vec)
{
   if(vec instanceof vec3)
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
 * @extends vec3
 * @param {vec3} vec
 */
vec3.prototype.Dot = function(vec)
{
   if(vec instanceof vec3)
   {
      return this._values[0]*vec._values[0]+this._values[1]*vec._values[1]+this._values[2]*vec._values[2];
   }
}

//------------------------------------------------------------------------------
/**
 * Calculates the length of the vector.
 * @extends vec3
 * @return length of the current vector instance. length=sqrt(x^2+y^2+z^2)
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
 * @extends vec3
 * @return squared length of the current vector instance. len=x^2+y^2+z^2
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
 * @extends vec3
 * @return length of the current vector instance. length=sqrt(x^2+y^2+z^2)
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
 * @extends vec3
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
 * @extends vec3
 * @return a string like: "[1,2,3]";
 */
vec3.prototype.ToString = function()
{
   return "["+this._values[0]+","+this._values[1]+","+this._values[2]+"]";
}

//------------------------------------------------------------------------------

goog.exportSymbol('vec3', vec3);
goog.exportProperty(vec3.prototype, 'Set', vec3.prototype.Set);
