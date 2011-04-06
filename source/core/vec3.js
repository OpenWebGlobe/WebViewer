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


//Constructor
//vec3(string type)     with "double" or "float"(default) Vector is initialized with [0.0,0.0,0.0]
//Set(array values)         
//Get                   returns the values as array
//Copy                  returns a vec3 object
//Add(vec3 vec)         Adds the vector vec to this instance
//Sub(vec3 vec)         Subtracts the vector vec from this instance
//Cross(vec3 vec)       Calculates the cross product of this instance and the vector vec
//Dot(vec3 vec)         Calculates the dot product of this instance and the vector vec     
//Length                Returns the vector length
//Normalize             Normalizes this vector instance, the length will then be equal to 1
//Neg                   Negates every element of this instance
//ToString              Returns a string like this: "[1.0,2.44,1.2]"
//Test(vec3 vec)        Tests all implemented functions, displays the results using "console.log(..)"           



//------------------------------------------------------------------------------
// Constructor
//------------------------------------------------------------------------------
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

/*function vec3(typeparam,x,y,z)
{
   if (typeparam == "double")
   {
      this._values = new Float64Array([x, y, z]);  
   }
   else //(typeparam == "float")
   {
      this._values = new Float32Array([x, y, z]);
   }
}*/
//------------------------------------------------------------------------------
// Set Values
//------------------------------------------------------------------------------
vec3.prototype.Set = function(x,y,z)
{
      this._values[0]=x;
      this._values[1]=y;
      this._values[2]=z;
}
//------------------------------------------------------------------------------
// Get Values (returns an array)
//------------------------------------------------------------------------------
vec3.prototype.Get = function()
{
   return this._values;
}
//------------------------------------------------------------------------------
// Get a Copy (returns a vec3 object)
//------------------------------------------------------------------------------
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
//------------------------------------------------------------------------------
// Add 
//------------------------------------------------------------------------------
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
// Sub
//------------------------------------------------------------------------------
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
//------------------------------------------------------------------------------
// Cross Product
//------------------------------------------------------------------------------
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

Cross = function(result, v1, v2)
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
// Dot Product
//------------------------------------------------------------------------------
vec3.prototype.Dot = function(vec)
{
   if(vec instanceof vec3)
   {
      return this._values[0]*vec._values[0]+this._values[1]*vec._values[1]+this._values[2]*vec._values[2];
   }
   
}
//------------------------------------------------------------------------------
// Length
//------------------------------------------------------------------------------
vec3.prototype.Length = function()
{
   return Math.sqrt(Math.pow(this._values[0],2)+Math.pow(this._values[1],2)+Math.pow(this._values[2],2));
}
//------------------------------------------------------------------------------
// Normalize
//------------------------------------------------------------------------------
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
// Neg
//------------------------------------------------------------------------------
vec3.prototype.Neg = function()
{
   var l=this.Length();
   this._values[0]=-this._values[0];
   this._values[1]=-this._values[1];
   this._values[2]=-this._values[2];
   return this;
}
//------------------------------------------------------------------------------  
// To String
//------------------------------------------------------------------------------
vec3.prototype.ToString = function()
{
   return "["+this._values[0]+","+this._values[1]+","+this._values[2]+"]";
}
//------------------------------------------------------------------------------
// Test all class functions. 
//------------------------------------------------------------------------------
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


