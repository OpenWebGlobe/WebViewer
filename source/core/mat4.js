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
 * @fileoverview Mat4.js
 * mat4(string type)     with type "double", "float" or "native". Matrix is initialized with identity.
 * Set(array mat)        mat is an array with 16 values (4x4)
 * Copy()                copy matrix, returs an exact copy of the matrix
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
 * @version 0.1  
 */


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

/**
 * Identity
 * sets the matrix elements to identity. 
 * @extends mat4
 *
 */
mat4.prototype.Identity = function()
{
   this.Set([1,0,0,0,
             0,1,0,0,
             0,0,1,0,
             0,0,0,1]);
}

/**
 * Zero
 * sets all matrix element to zero.
 * @extends mat4
 *
 */
mat4.prototype.Zero = function()
{
   this.Set([0,0,0,0,
             0,0,0,0,
             0,0,0,0,
             0,0,0,0]);
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
   this._values[0]  = 1; this._values[1]  = 0; this._values[2]  = 0; this._values[3]  = x;
   this._values[4]  = 0; this._values[5]  = 1; this._values[6]  = 0; this._values[7]  = y;
   this._values[8]  = 0; this._values[9]  = 0; this._values[10] = 1; this._values[11] = z;
   this._values[12] = 0; this._values[13] = 0; this._values[14] = 0; this._values[15] = 1;
  
}

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
   this._values[0]  = x; this._values[1]  = 0; this._values[2]  = 0; this._values[3]  = 0;
   this._values[4]  = 0; this._values[5]  = y; this._values[6]  = 0; this._values[7]  = 0;
   this._values[8]  = 0; this._values[9]  = 0; this._values[10] = z; this._values[11] = 0;
   this._values[12] = 0; this._values[13] = 0; this._values[14] = 0; this._values[15] = 1;
   
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
   this._values[0]  = 1; this._values[1]  = 0;      this._values[2]  = 0;     this._values[3]  = 0;
   this._values[4]  = 0; this._values[5]  = fCos;   this._values[6]  = fSin;  this._values[7]  = 0;
   this._values[8]  = 0; this._values[9]  = -fSin;  this._values[10] = fCos;  this._values[11] = 0;
   this._values[12] = 0; this._values[13] = 0;      this._values[14] = 0;     this._values[15] = 1;
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
   this._values[0]  = fCos;  this._values[1]  = fSin;  this._values[2]  = 0;      this._values[3]  = 0;
   this._values[4]  = -fSin; this._values[5]  = fCos;  this._values[6]  = 0;     this._values[7]  = 0;
   this._values[8]  = 0;     this._values[9]  = 0;     this._values[10] = 1;     this._values[11] = 0;
   this._values[12] = 0;     this._values[13] = 0;     this._values[14] = 0;     this._values[15] = 1;
}

/**
 * Multiply
 * overwrites the element values to the resulting elements of matA times matB.
 * Ensure that wheter matA nor matB is an instance of this mat4 object.
 * @extends mat4
 * 
 * @param {mat4} matA 
 * @param {mat4} matB 
 */ 
mat4.prototype.Multiply = function(matA,matB)
{
   if (matA instanceof mat4 && matB instanceof mat4)
   {
   if (matA._values.length == 16 && matB._values.length == 16)
      {
        this._values[0]  = matA._values[0]  * matB._values[0] + matA._values[1]  * matB._values[4] + matA._values[2]  * matB._values[8]  + matA._values[3]  * matB._values[12];
        this._values[1]  = matA._values[0]  * matB._values[1] + matA._values[1]  * matB._values[5] + matA._values[2]  * matB._values[9]  + matA._values[3]  * matB._values[13];
        this._values[2]  = matA._values[0]  * matB._values[2] + matA._values[1]  * matB._values[6] + matA._values[2]  * matB._values[10] + matA._values[3]  * matB._values[14];
        this._values[3]  = matA._values[0]  * matB._values[3] + matA._values[1]  * matB._values[7] + matA._values[2]  * matB._values[11] + matA._values[3]  * matB._values[15];
        this._values[4]  = matA._values[4]  * matB._values[0] + matA._values[5]  * matB._values[4] + matA._values[6]  * matB._values[8]  + matA._values[7]  * matB._values[12];
        this._values[5]  = matA._values[4]  * matB._values[1] + matA._values[5]  * matB._values[5] + matA._values[6]  * matB._values[9]  + matA._values[7]  * matB._values[13];
        this._values[6]  = matA._values[4]  * matB._values[2] + matA._values[5]  * matB._values[6] + matA._values[6]  * matB._values[10] + matA._values[7]  * matB._values[14];
        this._values[7]  = matA._values[4]  * matB._values[3] + matA._values[5]  * matB._values[7] + matA._values[6]  * matB._values[11] + matA._values[7]  * matB._values[15];
        this._values[8]  = matA._values[8]  * matB._values[0] + matA._values[9]  * matB._values[4] + matA._values[10] * matB._values[8]  + matA._values[11] * matB._values[12];
        this._values[9]  = matA._values[8]  * matB._values[1] + matA._values[9]  * matB._values[5] + matA._values[10] * matB._values[9]  + matA._values[11] * matB._values[13];
        this._values[10] = matA._values[8]  * matB._values[2] + matA._values[9]  * matB._values[6] + matA._values[10] * matB._values[10] + matA._values[11] * matB._values[14];
        this._values[11] = matA._values[8]  * matB._values[3] + matA._values[9]  * matB._values[7] + matA._values[10] * matB._values[11] + matA._values[11] * matB._values[15];
        this._values[12] = matA._values[12] * matB._values[0] + matA._values[13] * matB._values[4] + matA._values[14] * matB._values[8]  + matA._values[15] * matB._values[12];
        this._values[13] = matA._values[12] * matB._values[1] + matA._values[13] * matB._values[5] + matA._values[14] * matB._values[9]  + matA._values[15] * matB._values[13];
        this._values[14] = matA._values[12] * matB._values[2] + matA._values[13] * matB._values[6] + matA._values[14] * matB._values[10] + matA._values[15] * matB._values[14];
        this._values[15] = matA._values[12] * matB._values[3] + matA._values[13] * matB._values[7] + matA._values[14] * matB._values[11] + matA._values[15] * matB._values[15];
      }
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

    this._values[0] = 2*znear/(right-left);
    this._values[5] = 2*znear/(top-bottom);
    this._values[8] = (right+left)/(right-left);
    this._values[9] = (top+bottom)/(top-bottom);
    this._values[10] = -(zfar+znear)/(zfar-znear);
    this._values[11] = -1;
    this._values[14] = -2*zfar*znear/(zfar-znear);

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
    var ymax = znear * Math.tan(fovy * Math.PI / 360.0); 
    var ymin = -ymax;
    var xmin = ymin * aspect;
    var xmax = ymax * aspect;

    return this.Frustum(xmin, xmax, ymin, ymax, znear, zfar);
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

    this._values[0] = 2 / (right-left);
    this._values[5] = 2 / (top-bottom);
    this._values[10] = -2 / (zfar-znear);
    this._values[12] = -(right+left)/(right-left);
    this._values[13] = -(top+bottom)/(top-bottom);
    this._values[14] = -(zfar+znear)/(zfar-znear);
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

    return this.Ortho(left, right, bottom, top, -1, 1);
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
 return "[ "+this._values[0]+" "+this._values[1]+" "+this._values[2]+" "+this._values[3]+
         "\n  "+this._values[4]+" "+this._values[5]+" "+this._values[6]+" "+this._values[7]+
         "\n  "+this._values[8]+" "+this._values[9]+" "+this._values[10]+" "+this._values[11]+
         "\n  "+this._values[12]+" "+this._values[13]+" "+this._values[14]+" "+this._values[15]+" ]";      
}
