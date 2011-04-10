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

As a special  exception to the  GPL, any HTML  file which merely  makes function
calls to  this code,  and for  that purpose  includes it  by reference, shall be
deemed a separate work for copyright law purposes. If you modify this code,  you
may extend this exception to your version of the code, but you are not obligated
to do so. If you do not wish to do so, delete this exception statement from your
version.

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
 * mat4(string type)     with type "double", "float" or "native". Matrix is initialized with identity.
 * Set(array mat)        mat is an array with 16 values (4x4)
 * Copy()                copy matrix, returs an exact copy of the matrix
 * CopyFrom(M)           copy matrix from another matrix
 * Creators
 * Identity()            set identity matrix
 * Zero()                set zero matrix
 * Translation([x,y,z])  set translation matrix
 * Scale([x,y,z])        set scale matrix
 * RotationX(angle)      create rotation matrix around X-Axis. Angle in rad.
 * RotationY(angle)      create rotation matrix around Y-Axis. Angle in rad.
 * RotationZ(angle)      create rotation matrix around Z-Axis. Angle in rad.
 * Operations:
 * Transpose()           transpose current matrix
 * Multiply(A,B)         multiply A * B and store in current matrix
 * 
 * {@link http://www.openwebglobe.org} 
 *
 * @author Martin Christen martin.christen@fhnw.ch   
 */

//------------------------------------------------------------------------------
/**
 * Create a new Matrix Object
 * @class This is the basic mat4.class 
 * @param {string} typeparam "float": matrix values will be stored as float32. "double": matrix values will be stored as float64. 
 * @constructor
 * @return A new 4 x 4 Identity-Matrix
 */
function mat4(typeparam)
{
   if (typeparam == "double")
   {
      this._values = new Float64Array([1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0]);
   }
   else//(typeparam == "float")
   {
      this._values = new Float32Array([1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0]);
   }
}

//------------------------------------------------------------------------------
/**
 * Set Values
 * @extends mat4
 *
 * @param {Float32Array} oMatrix Float32Array or Float64Array with the 16 element values. 
 */
mat4.prototype.Set = function(oMatrix)
{
   if (oMatrix instanceof Float32Array || 
      oMatrix instanceof Float64Array)
   {
      // 4x4 Matrix (16 values)
      if (oMatrix.length == 16)
      {
         for (var i = 0; i < 16; i++)
         {
            this._values[i] = oMatrix[i];
         }
         return true;
      }
   }

  return false;
}

//------------------------------------------------------------------------------
/**
 * Get Values
 * @extends mat4
 * 
 * @return Float32Array or Float64Array with the 16 element values.
 */
mat4.prototype.Get = function()
{
   return this._values;
}

//------------------------------------------------------------------------------
/**
 * Copy
 * @extends mat4
 * 
 * @return a copy of this mat4 object.
 */
mat4.prototype.Copy = function()
{
   var cpy;

   if (this._values instanceof Array)
   {
      cpy = new mat4("native");
   }
   else if (this._values instanceof Float32Array)
   {
      cpy = new mat4("float");
   }
   else if (this._values instanceof Float64Array)
   {
      cpy = new mat4("double");
   }

   for (var i = 0; i < 16; i++)
   {
      cpy._values[i] = this._values[i];
   } 
   
   return cpy;
}

//------------------------------------------------------------------------------
/**
 * CopyFrom
 * @param{mat4} cpy The matrix to copy from
 * 
 * @return a copy of this mat4 object.
 */
mat4.prototype.CopyFrom = function(cpy)
{
   for (var i = 0; i < 16; i++)
   {
      this._values[i] = cpy._values[i];
   } 
}
//------------------------------------------------------------------------------
/**
 * Identity
 * sets the matrix elements to identity. 
 * @extends mat4
 *
 */
//------------------------------------------------------------------------------ 
mat4.prototype.Identity = function()
{
   this._values[0] = 1; this._values[4] = 0; this._values[8]  = 0; this._values[12] = 0;
   this._values[1] = 0; this._values[5] = 1; this._values[9]  = 0; this._values[13] = 0;
   this._values[2] = 0; this._values[6] = 0; this._values[10] = 1; this._values[14] = 0;
   this._values[3] = 0; this._values[7] = 0; this._values[11] = 0; this._values[15] = 1;
}

//------------------------------------------------------------------------------ 
/**
 * Zero
 * sets all matrix element to zero.
 * @extends mat4
 *
 */
mat4.prototype.Zero = function()
{
   this._values[0] = 0; this._values[4] = 0; this._values[8]  = 0; this._values[12] = 0;
   this._values[1] = 0; this._values[5] = 0; this._values[9]  = 0; this._values[13] = 0;
   this._values[2] = 0; this._values[6] = 0; this._values[10] = 0; this._values[14] = 0;
   this._values[3] = 0; this._values[7] = 0; this._values[11] = 0; this._values[15] = 1;
}

/**
 * Translation
 * sets the matrix values to a translation matrix.
 * @extends mat4
 * 
 * 
 * @param {float} x sets the translation in x direction.
 * @param {float} y sets the translation in y direction.
 * @param {float} z sets the translation in z direction.
 */
mat4.prototype.Translation = function(x,y,z)
{     
   this._values[0] = 1; this._values[4] = 0; this._values[8]  = 0; this._values[12] = x;
   this._values[1] = 0; this._values[5] = 1; this._values[9]  = 0; this._values[13] = y;
   this._values[2] = 0; this._values[6] = 0; this._values[10] = 1; this._values[14] = z;
   this._values[3] = 0; this._values[7] = 0; this._values[11] = 0; this._values[15] = 1;
}

//------------------------------------------------------------------------------
/**
 * Scale
 * sets the matrix values to a translation matrix. 
 * @extends mat4
 * 
 * @param {float} x Sets the x scale factor.
 * @param {float} y Sets the y scale factor.
 * @param {float} z Sets the z scale factor.
 */
mat4.prototype.Scale = function(x,y,z)
{
   this._values[0]  = x; this._values[4] = 0; this._values[8]   = 0; this._values[12] = 0;
   this._values[1]  = 0; this._values[5] = y; this._values[9]   = 0; this._values[13] = 0;
   this._values[2]  = 0; this._values[6] = 0; this._values[10]  = z; this._values[14] = 0;
   this._values[3] = 0;  this._values[7] = 0;  this._values[11] = 0; this._values[15] = 1;
   
   return true;
}

/**
 * RotationX
 * sets the matrix to a x-rotation matrix.
 * @extends mat4
 *
 * 
 * @param {float} angle the rotation angle in degrees.
 */
mat4.prototype.RotationX = function(angle)
{
   var fSin = Math.sin(angle);
   var fCos = Math.cos(angle);
   this._values[0] = 1;  this._values[1] = 0;      this._values[2]  = 0;    this._values[3]  = 0;
   this._values[4] = 0;  this._values[5] = fCos;   this._values[6]  = fSin; this._values[7]  = 0;
   this._values[8] = 0;  this._values[9] = -fSin;  this._values[10] = fCos; this._values[11] = 0;
   this._values[12] = 0; this._values[13] = 0;     this._values[14] = 0;    this._values[15] = 1;
}

/**
 * RotationY
 * sets the matrix to a y-rotation matrix.
 * @extends mat4
 *
 * 
 * @param {float} angle the rotation angle in degrees.
 */ 
mat4.prototype.RotationY = function(angle)
{
   var fSin = Math.sin(angle);
   var fCos = Math.cos(angle);
   this._values[0]  = fCos;  this._values[1]  = 0;     this._values[2]  = -fSin; this._values[3]  = 0;
   this._values[4]  = 0;     this._values[5]  = 1;     this._values[6]  = 0;     this._values[7]  = 0;
   this._values[8]  = fSin;  this._values[9]  = 0;     this._values[10] = fCos;  this._values[11] = 0;
   this._values[12] = 0;     this._values[13] = 0;     this._values[14] = 0;     this._values[15] = 1;
}

/**
 * RotationZ
 * sets the matrix to a z-rotation matrix.
 * @extends mat4
 * 
 * @param {float} angle the rotation angle in degrees.
 */ 
mat4.prototype.RotationZ = function(angle)
{   
   var fSin = Math.sin(angle);
   var fCos = Math.cos(angle);
   this._values[0]  = fCos;  this._values[1]  = fSin;  this._values[2]  = 0;    this._values[3]  = 0;
   this._values[4]  = -fSin; this._values[5]  = fCos;  this._values[6]  = 0;    this._values[7]  = 0;
   this._values[8]  = 0;     this._values[9]  = 0;     this._values[10] = 1;    this._values[11] = 0;
   this._values[12] = 0;      this._values[13] = 0;     this._values[14] = 0;   this._values[15] = 1;
}

//------------------------------------------------------------------------------
// Set Matrix to Look At
//------------------------------------------------------------------------------
mat4.prototype.LookAt = function(eyex, eyey, eyez, centerx, centery, centerz, upx, upy, upz)
{
   var z0,z1,z2,x0,x1,x2,y0,y1,y2,len;
   
   z0 = eyex - centerx;
   z1 = eyey - centery;
   z2 = eyez - centerz;
   
   len = 1/Math.sqrt(z0*z0 + z1*z1 + z2*z2);
   z0 *= len; z1 *= len; z2 *= len;
   
   x0 = upy*z2 - upz*z1; x1 = upz*z0 - upx*z2; x2 = upx*z1 - upy*z0;
   len = Math.sqrt(x0*x0 + x1*x1 + x2*x2);
   if (!len) 
   {
      x0 = 0; x1 = 0; x2 = 0;
   } 
   else 
   {
      len = 1/len; x0 *= len; x1 *= len; x2 *= len;
   }
   
   y0 = z1*x2 - z2*x1; y1 = z2*x0 - z0*x2; y2 = z0*x1 - z1*x0;
   
   len = Math.sqrt(y0*y0 + y1*y1 + y2*y2);
   if (!len)
   {
      y0 = 0; y1 = 0; y2 = 0;
   } 
   else 
   {
      len = 1/len;
      y0 *= len; y1 *= len; y2 *= len;
   }
   
   this._values[0] = x0; this._values[4] = x1; this._values[8] = x2;  this._values[12] = -eyex;
   this._values[1] = y0; this._values[5] = y1; this._values[9] = y2;  this._values[13] = -eyey;
   this._values[2] = z0; this._values[6] = z1; this._values[10] = z2; this._values[14] = -eyez;
   this._values[3] = 0;  this._values[7] = 0;  this._values[11] = 0;  this._values[15] = 1;
   
}


/**
 * Multiply
 * overwrites the element values to the resulting elements of matA times matB.
 * Ensure that wheter matA nor matB is an instance of this mat4 object.
 * @extends mat4
 * 
 * @param {mat4} a 
 * @param {mat4} b 
 */ 
mat4.prototype.Multiply = function(a,b)
{
   if (a instanceof mat4 && b instanceof mat4)
   {
      var a00 = a._values[0],  a01 = a._values[1],  a02 = a._values[2],  a03 = a._values[3];
      var a10 = a._values[4],  a11 = a._values[5],  a12 = a._values[6],  a13 = a._values[7];
      var a20 = a._values[8],  a21 = a._values[9],  a22 = a._values[10], a23 = a._values[11];
      var a30 = a._values[12], a31 = a._values[13], a32 = a._values[14], a33 = a._values[15];
   
      var b00 = b._values[0],  b01 = b._values[1],  b02 = b._values[2],  b03 = b._values[3];
      var b10 = b._values[4],  b11 = b._values[5],  b12 = b._values[6],  b13 = b._values[7];
      var b20 = b._values[8],  b21 = b._values[9],  b22 = b._values[10], b23 = b._values[11];
      var b30 = b._values[12], b31 = b._values[13], b32 = b._values[14], b33 = b._values[15];
      
      this._values[0] = b00*a00 + b01*a10 + b02*a20 + b03*a30;
      this._values[1] = b00*a01 + b01*a11 + b02*a21 + b03*a31;
      this._values[2] = b00*a02 + b01*a12 + b02*a22 + b03*a32;
      this._values[3] = b00*a03 + b01*a13 + b02*a23 + b03*a33;
      
      this._values[4] = b10*a00 + b11*a10 + b12*a20 + b13*a30;
      this._values[5] = b10*a01 + b11*a11 + b12*a21 + b13*a31;
      this._values[6] = b10*a02 + b11*a12 + b12*a22 + b13*a32;
      this._values[7] = b10*a03 + b11*a13 + b12*a23 + b13*a33;
      
      this._values[8] = b20*a00 + b21*a10 + b22*a20 + b23*a30;
      this._values[9] = b20*a01 + b21*a11 + b22*a21 + b23*a31;
      this._values[10] = b20*a02 + b21*a12 + b22*a22 + b23*a32;
      this._values[11] = b20*a03 + b21*a13 + b22*a23 + b23*a33;
      
      this._values[12] = b30*a00 + b31*a10 + b32*a20 + b33*a30;
      this._values[13] = b30*a01 + b31*a11 + b32*a21 + b33*a31;
      this._values[14] = b30*a02 + b31*a12 + b32*a22 + b33*a32;
      this._values[15] = b30*a03 + b31*a13 + b32*a23 + b33*a33;
   }
}

/**
 * Transpose
 * Transpose the matrix.
 * @extends mat4
 *
 * 
 */ 
mat4.prototype.Transpose = function()
{
   var cpy = this.Copy();  // Copy current matrix
   
   for (var j = 0; j < 4; j++)
   {
      for (var i = 0; i < 4; i++)
      {
         this._values[4*j+i] = cpy._values[4*i+j];
      }  
   }
}

/**
 * MultiplyVec3
 * Multiply the matrix by a 3-element vector.
 * The vector is changed internally to a homogenous coordinate vector.
 * @extends mat4
 * 
 * @param{vec3} vec3 
 */ 
mat4.prototype.MultiplyVec3 = function(vec)
{
   if(vec instanceof vec3)
   {
      if(this._values instanceof Float32Array)
      {
         resVec = new vec3("float"); 
      }
      else
      {
       resVec = new vec3("double");
      }  
      resVec._values[0]=this._values[0]*vec._values[0]+this._values[4]*vec._values[1]+this._values[8]*vec._values[2]+this._values[12];
      resVec._values[1]=this._values[1]*vec._values[0]+this._values[5]*vec._values[1]+this._values[9]*vec._values[2]+this._values[13];
      resVec._values[2]=this._values[2]*vec._values[0]+this._values[6]*vec._values[1]+this._values[10]*vec._values[2]+this._values[14];
      var w=this._values[3]*vec._values[0]+this._values[7]*vec._values[1]+this._values[11]*vec._values[2]+this._values[15]; 
      
      resVec._values[0]=resVec._values[0]/w;
      resVec._values[1]=resVec._values[1]/w;
      resVec._values[2]=resVec._values[2]/w;
             
      return resVec;
   }
}

/**
 * Frustum
 * Sets the matrix to a frustum matrix.
 * @extends mat4
 * 
 * @param{float} left
 * @param{float} right
 * @param{float} bottom
 * @param{float} top
 * @param{float} znear
 * @param{float} zfar
 * 
 */
mat4.prototype.Frustum = function(left, right, bottom, top, znear, zfar)
{    
   var rl = (right - left);
   var tb = (top - bottom);
   var fn = (zfar - znear);
   
   this._values[0] = (znear*2)/rl; this._values[4] = 0;            this._values[8] = (right+left)/rl;   this._values[12] = 0;
   this._values[1] = 0;            this._values[5] = (znear*2)/tb; this._values[9] = (top+bottom)/tb;   this._values[13] = 0;
   this._values[2] = 0;            this._values[6] = 0;            this._values[10] = -(zfar+znear)/fn; this._values[14] = -(zfar*znear*2) / fn;
   this._values[3] = 0;            this._values[7] = 0;            this._values[11] = -1;               this._values[15] = 0; 
   
}
/**
 * Perspective
 * sets the matrix to be a perspective matrix.
 * @extends mat4
 * 
 * @param{float} fovy
 * @param{float} aspect
 * @param{float} znear
 * @param{float} zfar
 * 
 */
mat4.prototype.Perspective = function(fovy, aspect, znear, zfar)
{  
   /*var top = znear*Math.tan(fovy*Math.PI / 360.0);
   var right = top*aspect;
   this.Frustum(-right, right, -top, top, znear, zfar);*/
   
   var f = 1.0 / Math.tan(fovy * Math.PI / 360.0)
   var r0 = f / aspect;
   
   var r10 = (zfar+znear) / (znear-zfar);
   var r11 = 2*zfar*znear / (znear-zfar);
    
   this._values[0] = r0; this._values[4] = 0; this._values[8]  = 0;   this._values[12] = 0;
   this._values[1] = 0;  this._values[5] = f; this._values[9]  = 0;   this._values[13] = 0;
   this._values[2] = 0;  this._values[6] = 0; this._values[10] = r10; this._values[14] = r11;
   this._values[3] = 0;  this._values[7] = 0; this._values[11] = -1;  this._values[15] = 0; 
   
}

/**
 * Ortho
 * sets the matrix to be a perspective matrix.
 * @extends mat4
 * 
 * @param{float} left
 * @param{float} right
 * @param{float} bottom
 * @param{float} top
 * @param{float} znear
 * @param{float} zfar
 */
mat4.prototype.Ortho = function(left, right, bottom, top, znear, zfar)
{   
   var rl = (right - left);
   var tb = (top - bottom);
   var fn = (zfar - znear);
   this._values[0] = 2 / rl;
   this._values[1] = 0;
   this._values[2] = 0;
   this._values[3] = 0;
   
   this._values[4] = 0;
   this._values[5] = 2 / tb;
   this._values[6] = 0;
   this._values[7] = 0;
   
   this._values[8] = 0;
   this._values[9] = 0;
   this._values[10] = -2 / fn;
   this._values[11] = 0;
   
   this._values[12] = -(left + right) / rl;
   this._values[13] = -(top + bottom) / tb;
   this._values[14] = -(zfar + znear) / fn;
   this._values[15] = 1;
}

/**
 * Ortho2D
 * sets the matrix to be a orthogonal 2D matrix.
 * @extends mat4
 * 
 * @param{float} left
 * @param{float} right
 * @param{float} bottom
 * @param{float} top
 */
mat4.prototype.Ortho2D = function(left, right, bottom, top) 
{
    this.Ortho(left, right, bottom, top, -1, 1);
};

/**
 * Print
 * plots the matrix elements using console.log
 * @extends mat4
 *
 *
 */
mat4.prototype.Print = function()
{
   if (this._values.length != 16)
   {
      console.log("Wrong matrix dimension! How can this happen!!<br/>");
      return false;
   }
   
   if (this._values instanceof Array)
   {
      //document.write("Matrix is native Array<br/>");
   }
   else if (this._values instanceof Float32Array)
   {
      //document.write("Matrix is Float32Array<br/>");
   }
   else if (this._values instanceof Float64Array)
   {
      //document.write("Matrix is Float64Array<br/>");
   }
   else
   {
      document.write("Error: Matrix type is wrong<br/>");
      return false;
   }
   
   for (var j = 0; j < 4; j++)
   {
      for (var i = 0; i < 4; i++)
      {
         console.log(this._values[4*j+i] + " ");
      }
   }
}

/**
 * ToString
 * @extends mat4
 *
 * @return A string with all matrix elements.
 *
 */
mat4.prototype.ToString = function()
{
 return "[ "+this._values[0]+" "+this._values[4]+" "+this._values[8]+" "+this._values[12]+
         "\n  "+this._values[1]+" "+this._values[5]+" "+this._values[9]+" "+this._values[13]+
         "\n  "+this._values[2]+" "+this._values[6]+" "+this._values[10]+" "+this._values[14]+
         "\n  "+this._values[3]+" "+this._values[7]+" "+this._values[11]+" "+this._values[15]+" ]";      
}
