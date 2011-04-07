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
#                           martin.christen@fhnw.ch                            #
********************************************************************************

This file is part of the OpenWebGlobe SDK

GPL LICENSE

i3D OpenWebGlobe SDK is free software: you can redistribute it and/or modify  it
under the  terms of  the GNU  General Public  License as  published by  the Free
Software Foundation, either version  2 of the License,  or (at your option)  any
later version.

i3D OpenWebGlobe  SDK is  distributed in  the hope  that it  will be useful, but
WITHOUT ANY WARRANTY;  without even the  implied warranty of  MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See  the GNU General Public License for  more
details.

You should have received a copy of the GNU General Public License along with i3D
OpenWebGlobe SDK.  If not, see <http://www.gnu.org/licenses/>.

Commercial License

OEMs (Original  Equipment Manufacturers),  ISVs (Independent  Software Vendors),
VARs (Value Added Resellers) and other distributors that combine and  distribute
commercially licensed  software with  i3D OpenWebGlobe  SDK and  do not  wish to
distribute the source code for the commercially licensed software under  version
2 of the  GNU General Public  License (the "GPL")  must enter into  a commercial
license agreement with the Institute of Geomatics Engineering at the  University
of Applied Sciences Northwestern Switzerland (FHNW).
*******************************************************************************/        

/** 
 * @fileoverview vec3.js

 * 
 * {@link http://www.openwebglobe.org} 
 *
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch  
 * @version 0.1  
 */


/**
 * Create a new Vector Object
 * Initialised the vector as [0,0,0]
 * @class This is the basic vec3.class 
 * @param {string} typeparam "float": vector values will be stored as float32. "double": vector values will be stored as float64. 
 * @constructor
 */
function vec3(typeparam)
{
   if (typeparam == "double")
   {
      this._values = new Float64Array([0.0, 0.0, 0.0]);  
   }
   else //(typeparam == "float")
   {
      this._values = new Float32Array([0.0, 0.0, 0.0]);
   }
}


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

/**
 * Returns the values as array
 * @extends vec3
 *
 */
vec3.prototype.Get = function()
{
   return this._values;
}

/**
 * returns a copy of this vec3 object
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
   if (this._values instanceof Float64Array)
   {
      cpy = new vec3("double");
   }

   cpy.Set(this._values[0],this._values[1],this._values[2]);
    
   return cpy;  
}

/**
 * Adds the vector vec to this instance
 * @extends vec3
 * @param {vec3} 
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

/**
 * Subtracts the vector vec from this instance
 * @extends vec3
 * @param {vec3} 
 */
vec3.prototype.Sub = function(vec)
{
   if(vec instanceof vec3)
   {
      this._values[0]=this._values[0]-vec._values[0];
      this._values[1]=this._values[1]-vec._values[1];
      this._values[2]=this._values[2]-vec._values[2];
      return this;
   }
}

/**
 * Calculates the cross product of this instance and the vector vec.
 * @extends vec3
 * @param {vec3} 
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

/**
 * Calculates the dot product.
 * @extends vec3
 * @param {vec3} 
 */
vec3.prototype.Dot = function(vec)
{
   if(vec instanceof vec3)
   {
      return this._values[0]*vec._values[0]+this._values[1]*vec._values[1]+this._values[2]*vec._values[2];
   }
   
}

/**
 * Calculates the length of the vector.
 * @extends vec3
 * @return length of the current vector instance. length=sqrt(x^2+y^2+z^2)
 */
vec3.prototype.Length = function()
{
   return Math.sqrt(Math.pow(this._values[0],2)+Math.pow(this._values[1],2)+Math.pow(this._values[2],2));
}

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

/**
 * 
 * @extends vec3
 * @return a string like: "[1,2,3]";
 */
vec3.prototype.ToString = function()
{
   return "["+this._values[0]+","+this._values[1]+","+this._values[2]+"]";
}

/**
 * Internal test function. Tests for all functions.
 * Plots the results using console.log.
 * @extends vec3
 * @param vec the vector for testing adding or subtracting methods.
 */
vec3.prototype.Test=function(vec){
   if(vec instanceof vec3 && vec._values.length == 3)
   {
    console.log(this.ToString()+".Copy() = "+this.Copy().ToString()); 
    console.log(this.ToString()+".Add("+vec.ToString()+") = "+this.Add(vec).ToString());
    console.log(this.ToString()+".Sub("+vec.ToString()+") = "+this.Sub(vec).ToString());
    console.log(this.ToString()+".Dot("+vec.ToString()+") = "+this.Dot(vec));
    console.log(this.ToString()+".Cross("+vec.ToString()+") = "+this.Cross(vec).ToString());
    console.log(this.ToString()+".Length("+vec.ToString()+") = "+this.Length(vec));
    console.log(this.ToString()+".Neg"+vec.ToString()+") = "+this.Neg(vec).ToString());
    console.log(this.ToString()+".Normalize = "+this.Normalize().ToString());
    }
    else
    {
       console.log("Wrong Datatype in Argument");
    }
}


