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

goog.provide('owg.mat4');
goog.require('owg.vec3');

/** 
 * mat4()                Matrix is initialized with identity.
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
 * @constructor
 * @return A new 4 x 4 Identity-Matrix
 */
function mat4()
{
   /** @type {!Float32Array} */
   this._values = new Float32Array([1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0]);
}

//------------------------------------------------------------------------------
/**
 * Set Values
 * @param {Array.<number>|Float32Array} oMatrix an array of any type containing 16 values 
 */
mat4.prototype.Set = function(oMatrix)
{
   if (oMatrix.length == 16)
   {
      for (var i = 0; i < 16; i++)
      {
         this._values[i] = oMatrix[i];
      }
   }
}

//------------------------------------------------------------------------------
/**
 * Get Values
 * 
 * @return {!Float32Array} An array with the 16 element values.
 */
mat4.prototype.Get = function()
{
   return this._values;
}

//------------------------------------------------------------------------------
/**
 * Copy matrix (creates new array)
 * 
 * @return {mat4} a copy of this mat4 object.
 */
mat4.prototype.Copy = function()
{
   var cpy = new mat4();

   for (var i = 0; i < 16; i++)
   {
      cpy._values[i] = this._values[i];
   } 

   return cpy;
}

//------------------------------------------------------------------------------
/**
 * CopyFrom: Copy matrix to an existing matrix
 * @param{mat4} cpy The matrix to copy from
 * 
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
 *
 */
mat4.prototype.Zero = function()
{
   this._values[0] = 0; this._values[4] = 0; this._values[8]  = 0; this._values[12] = 0;
   this._values[1] = 0; this._values[5] = 0; this._values[9]  = 0; this._values[13] = 0;
   this._values[2] = 0; this._values[6] = 0; this._values[10] = 0; this._values[14] = 0;
   this._values[3] = 0; this._values[7] = 0; this._values[11] = 0; this._values[15] = 1;
}
//------------------------------------------------------------------------------
/**
 * Translation
 * sets the matrix values to a translation matrix.
 * 
 * 
 * @param {number} x sets the translation in x direction.
 * @param {number} y sets the translation in y direction.
 * @param {number} z sets the translation in z direction.
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
 * @description Overwrites the Translation values in matrix mat with x,y,z. 
 *
 * @param {mat4} mat mat4 matrix wich will be overwritten
 * @param {number} x translation in x direction
 * @param {number} y translation in y direction
 * @param {number} z translation in z direction
 */
mat4.prototype.OverwriteTranslation = function(mat,x,y,z)
{     
 mat._values[12] = x;
 mat._values[13] = y;
 mat._values[14] = z;

}
//------------------------------------------------------------------------------
/**
 * Scale
 * sets the matrix values to a translation matrix. 
 * 
 * @param {number} x Sets the x scale factor.
 * @param {number} y Sets the y scale factor.
 * @param {number} z Sets the z scale factor.
 */
mat4.prototype.Scale = function(x,y,z)
{
   this._values[0]  = x; this._values[4] = 0; this._values[8]   = 0; this._values[12] = 0;
   this._values[1]  = 0; this._values[5] = y; this._values[9]   = 0; this._values[13] = 0;
   this._values[2]  = 0; this._values[6] = 0; this._values[10]  = z; this._values[14] = 0;
   this._values[3] = 0;  this._values[7] = 0;  this._values[11] = 0; this._values[15] = 1;
   
   return true;
}
//------------------------------------------------------------------------------
/**
 * RotationX
 * sets the matrix to a x-rotation matrix.
 *
 * 
 * @param {number} angle the rotation angle in degrees.
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

//------------------------------------------------------------------------------
/**
 * RotationY
 * sets the matrix to a y-rotation matrix.
 *
 * 
 * @param {number} angle the rotation angle in degrees.
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

//------------------------------------------------------------------------------
/**
 * RotationZ
 * sets the matrix to a z-rotation matrix.
 * 
 * @param {number} angle the rotation angle in degrees.
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
/**
 * Creates a LookAt matrix
 * 
 * @param {number} eyex x-coordinate of eye
 * @param {number} eyey y-coordinate of eye
 * @param {number} eyez z-coordinate of eye
 * @param {number} centerx x-coordinate of position to look at
 * @param {number} centery y-coordinate of position to look at
 * @param {number} centerz z-coordinate of position to look at
 * @param {number} upx x-coordinate of up-vector
 * @param {number} upy y-coordinate of up-vector
 * @param {number} upz z-coordinate of up-vector
 */ 
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
   
   this._values[0] = x0; this._values[4] = x1; this._values[8] = x2;  this._values[12] = -(x0*eyex + x1*eyey + x2*eyez);//-eyex;
   this._values[1] = y0; this._values[5] = y1; this._values[9] = y2;  this._values[13] = -(y0*eyex + y1*eyey + y2*eyez);//-eyey;
   this._values[2] = z0; this._values[6] = z1; this._values[10] = z2; this._values[14] = -(z0*eyex + z1*eyey + z2*eyez);//-eyez;
   this._values[3] = 0;  this._values[7] = 0;  this._values[11] = 0;  this._values[15] = 1;
   
}
//------------------------------------------------------------------------------
/**
 * Multiply
 * overwrites the element values to the resulting elements of matA times matB.
 * Ensure that wheter matA nor matB is an instance of this mat4 object.
 * 
 * @param {mat4} a 
 * @param {mat4} b 
 */ 
mat4.prototype.Multiply = function(a,b)
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

//------------------------------------------------------------------------------
/**
 * Transpose
 * Transpose the matrix.
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

//------------------------------------------------------------------------------
/**
 * MultiplyVec3
 * Multiply the matrix by a 3-element vector.
 * The vector is changed internally to a homogenous coordinate vector.
 * 
 * @param {vec3} vec
 * @return {vec3}
 */ 
mat4.prototype.MultiplyVec3 = function(vec)
{
   var resVec = new vec3();
   resVec._values[0]=this._values[0]*vec._values[0]+this._values[4]*vec._values[1]+this._values[8]*vec._values[2]+this._values[12];
   resVec._values[1]=this._values[1]*vec._values[0]+this._values[5]*vec._values[1]+this._values[9]*vec._values[2]+this._values[13];
   resVec._values[2]=this._values[2]*vec._values[0]+this._values[6]*vec._values[1]+this._values[10]*vec._values[2]+this._values[14];
   var w=this._values[3]*vec._values[0]+this._values[7]*vec._values[1]+this._values[11]*vec._values[2]+this._values[15];

   resVec._values[0]=resVec._values[0]/w;
   resVec._values[1]=resVec._values[1]/w;
   resVec._values[2]=resVec._values[2]/w;

   return resVec;
}

//------------------------------------------------------------------------------
/**
 * Frustum
 * Sets the matrix to a frustum matrix.
 * 
 * @param {number} left
 * @param {number} right
 * @param {number} bottom
 * @param {number} top
 * @param {number} znear
 * @param {number} zfar
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

//------------------------------------------------------------------------------
/**
 * Perspective
 * sets the matrix to be a perspective matrix.
 * 
 * @param {number} fovy
 * @param {number} aspect
 * @param {number} znear
 * @param {number} zfar
 * 
 */
mat4.prototype.Perspective = function(fovy, aspect, znear, zfar)
{  
   /*var top = znear*Math.tan(fovy*Math.PI / 360.0);
   var right = top*aspect;
   this.Frustum(-right, right, -top, top, znear, zfar);*/
   
  
   var f = 1.0 / Math.tan(fovy * Math.PI / 360.0);
   
   var r0 = f / aspect;
   
   var r10 = (zfar+znear) / (znear-zfar);
   var r11 = 2*zfar*znear / (znear-zfar);
    
   this._values[0] = r0; this._values[4] = 0; this._values[8]  = 0;   this._values[12] = 0;
   this._values[1] = 0;  this._values[5] = f; this._values[9]  = 0;   this._values[13] = 0;
   this._values[2] = 0;  this._values[6] = 0; this._values[10] = r10; this._values[14] = r11;
   this._values[3] = 0;  this._values[7] = 0; this._values[11] = -1;  this._values[15] = 0; 
   
  
}

//------------------------------------------------------------------------------
/**
 * Ortho
 * sets the matrix to be a perspective matrix.
 * 
 * @param {number} left
 * @param {number} right
 * @param {number} bottom
 * @param {number} top
 * @param {number} znear
 * @param {number} zfar
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

//------------------------------------------------------------------------------
/**
 * Ortho2D
 * sets the matrix to be a orthogonal 2D matrix.
 * 
 * @param {number} left
 * @param {number} right
 * @param {number} bottom
 * @param {number} top
 */
mat4.prototype.Ortho2D = function(left, right, bottom, top) 
{
    this.Ortho(left, right, bottom, top, -1, 1);
};

//------------------------------------------------------------------------------
/**
 * @description calc navigation frame, lng and lat in degree!
 *
 * @param {number} lng_deg
 * @param {number} lat_deg
 */
mat4.prototype.CalcNavigationFrame = function(lng_deg, lat_deg)
{
   var lng = lng_deg*0.017453292519943295769236907684886;
   var lat = lat_deg*0.017453292519943295769236907684886;
   
   var sinlat = Math.sin(lat);
   var sinlng = Math.sin(lng);
   var coslat = Math.cos(lat);
   var coslng = Math.cos(lng);
   
   this._values[0] = -sinlat*coslng;   this._values[4] = -sinlng; this._values[8]  = -coslat*coslng;  this._values[12] = 0;
   this._values[1] = -sinlat*sinlng;   this._values[5] = coslng;  this._values[9]  = -coslat*sinlng;  this._values[13] = 0;
   this._values[2] = coslat;           this._values[6] = 0;       this._values[10] = -sinlat;          this._values[14] = 0;
   this._values[3] = 0;                this._values[7] = 0;       this._values[11] = 0;               this._values[15] = 1;
}

//------------------------------------------------------------------------------
/**
 * @description calc navigation frame, lng and lat in degree!
 *
 * @param {number} lng_deg
 * @param {number} lat_deg
 */
mat4.prototype.CalcNavigationFrame2 = function(lng_deg, lat_deg)
{
   var lng = lng_deg*0.017453292519943295769236907684886;
   var lat = lat_deg*0.017453292519943295769236907684886;
   
   var sinlat = Math.sin(lat);
   var sinlng = Math.sin(lng);
   var coslat = Math.cos(lat);
   var coslng = Math.cos(lng);
   
   this._values[0] = -sinlng;          this._values[4] = coslng;           this._values[8]  = 0;         this._values[12] = 0;
   this._values[1] = -sinlat*coslng;   this._values[5] = -sinlat*sinlng;   this._values[9]  = -coslat;   this._values[13] = 0;
   this._values[2] = coslat*coslng;    this._values[6] = coslat*sinlng;    this._values[10] = sinlat;    this._values[14] = 0;
   this._values[3] = 0;                this._values[7] = 0;                this._values[11] = 0;         this._values[15] = 1;
}

//------------------------------------------------------------------------------
/**
 * @description calc body frame, yaw, pitch and roll are in RAD
 *
 * @param {number} yaw
 * @param {number} pitch
 * @param {number} roll
 */
mat4.prototype.CalcBodyFrame = function(yaw, pitch, roll)
{
   var cosPitch = Math.cos(pitch);
   var cosRoll = Math.cos(roll);
   var cosYaw = Math.cos(yaw);
   var sinPitch = Math.sin(pitch);
   var sinRoll = Math.sin(roll);
   var sinYaw = Math.sin(yaw);
   
   this._values[0] = cosPitch*cosYaw;  this._values[4] = -cosRoll*sinYaw+sinRoll*sinPitch*cosYaw;  this._values[8]  = sinRoll*sinYaw+cosRoll*sinPitch*cosYaw;  this._values[12] = 0;
   this._values[1] = cosPitch*sinYaw;  this._values[5] = cosRoll*cosYaw+sinRoll*sinPitch*sinYaw;   this._values[9]  = -sinRoll*cosYaw+cosRoll*sinPitch*sinYaw; this._values[13] = 0;
   this._values[2] = -sinPitch;        this._values[6] = sinRoll*cosPitch;                         this._values[10] = cosRoll*cosPitch;                        this._values[14] = 0;
   this._values[3] = 0;                this._values[7] = 0;                                        this._values[11] = 0;                                       this._values[15] = 1;
}

//------------------------------------------------------------------------------
/**
 * @description Swap Axis: geocentric cartesian system to graphics engine coordinate system
 *
 */
mat4.prototype.Cami3d = function()
{
   this._values[0] = 0; this._values[4] = 0;  this._values[8]  = -1; this._values[12] = 0;
   this._values[1] = 1; this._values[5] = 0;  this._values[9]  = 0;  this._values[13] = 0;
   this._values[2] = 0; this._values[6] = -1; this._values[10] = 0;  this._values[14] = 0;
   this._values[3] = 0; this._values[7] = 0;  this._values[11] = 0;  this._values[15] = 1;
}

//------------------------------------------------------------------------------
/**
 * @description Calculate Inverse Matrix
 * 
 */
mat4.prototype.Inverse = function(M)
{
   // cache values of matrix
   var a11 = M._values[0],  a12 = M._values[1],  a13 = M._values[2],  a14 = M._values[3];
   var a21 = M._values[4],  a22 = M._values[5],  a23 = M._values[6],  a24 = M._values[7];
   var a31 = M._values[8],  a32 = M._values[9],  a33 = M._values[10], a34 = M._values[11];
   var a41 = M._values[12],  a42 = M._values[13],  a43 = M._values[14], a44 = M._values[15];
             
   // calculate determinant (and hope there is no typo!)        
   var det = a11*a22*a33*a44 + a11*a23*a34*a42 + a11*a24*a32*a43
            +  a12*a21*a34*a43 + a12*a23*a31*a44 + a12*a24*a33*a41
            +  a13*a21*a32*a44 + a13*a22*a34*a41 + a13*a24*a31*a42
            +  a14*a21*a33*a42 + a14*a22*a31*a43 + a14*a23*a32*a41
            -  a11*a22*a34*a43 - a11*a23*a32*a44 - a11*a24*a33*a42
            -  a12*a21*a33*a44 - a12*a23*a34*a41 - a12*a24*a31*a43
            -  a13*a21*a34*a42 - a13*a22*a31*a44 - a13*a24*a32*a41
            -  a14*a21*a32*a43 - a14*a22*a33*a41 - a14*a23*a31*a42;
   
   var invdet = 1/det;
   
   var b11 = (a22*a33*a44 + a23*a34*a42 + a24*a32*a43 - a22*a34*a43 - a23*a32*a44 - a24*a33*a42) * invdet;
   var b12 = (a12*a34*a43 + a13*a32*a44 + a14*a33*a42 - a12*a33*a44 - a13*a34*a42 - a14*a32*a43) * invdet;
   var b13 = (a12*a23*a44 + a13*a24*a42 + a14*a22*a43 - a12*a24*a43 - a13*a22*a44 - a14*a23*a42) * invdet;
   var b14 = (a12*a24*a33 + a13*a22*a34 + a14*a23*a32 - a12*a23*a34 - a13*a24*a32 - a14*a22*a33) * invdet;
   var b21 = (a21*a34*a43 + a23*a31*a44 + a24*a33*a41 - a21*a33*a44 - a23*a34*a41 - a24*a31*a43) * invdet;
   var b22 = (a11*a33*a44 + a13*a34*a41 + a14*a31*a43 - a11*a34*a43 - a13*a31*a44 - a14*a33*a41) * invdet;
   var b23 = (a11*a24*a43 + a13*a21*a44 + a14*a23*a41 - a11*a23*a44 - a13*a24*a41 - a14*a21*a43) * invdet;
   var b24 = (a11*a23*a34 + a13*a24*a31 + a14*a21*a33 - a11*a24*a33 - a13*a21*a34 - a14*a23*a31) * invdet;
   var b31 = (a21*a32*a44 + a22*a34*a41 + a24*a31*a42 - a21*a34*a42 - a22*a31*a44 - a24*a32*a41) * invdet;
   var b32 = (a11*a34*a42 + a12*a31*a44 + a14*a32*a41 - a11*a32*a44 - a12*a34*a41 - a14*a31*a42) * invdet;
   var b33 = (a11*a22*a44 + a12*a24*a41 + a14*a21*a42 - a11*a24*a42 - a12*a21*a44 - a14*a22*a41) * invdet;
   var b34 = (a11*a24*a32 + a12*a21*a34 + a14*a22*a31 - a11*a22*a34 - a12*a24*a31 - a14*a21*a32) * invdet;
   var b41 = (a21*a33*a42 + a22*a31*a43 + a23*a32*a41 - a21*a32*a43 - a22*a33*a41 - a23*a31*a42) * invdet;
   var b42 = (a11*a32*a43 + a12*a33*a41 + a13*a31*a42 - a11*a33*a42 - a12*a31*a43 - a13*a32*a41) * invdet;
   var b43 = (a11*a23*a42 + a12*a21*a43 + a13*a22*a41 - a11*a22*a43 - a12*a23*a41 - a13*a21*a42) * invdet;
   var b44 = (a11*a22*a33 + a12*a23*a31 + a13*a21*a32 - a11*a23*a32 - a12*a21*a33 - a13*a22*a31) * invdet;

   this._values[0] = b11; this._values[4] = b21;  this._values[8]  = b31;  this._values[12] = b41;
   this._values[1] = b12; this._values[5] = b22;  this._values[9]  = b32;  this._values[13] = b42;
   this._values[2] = b13; this._values[6] = b23;  this._values[10] = b33;  this._values[14] = b43;
   this._values[3] = b14; this._values[7] = b24;  this._values[11] = b34;  this._values[15] = b44;
                   
}
//------------------------------------------------------------------------------
/**
 * ToString
 *
 * @return {string} A string with all matrix elements.
 *
 */
mat4.prototype.ToString = function()
{
 return "[ "+this._values[0]+" "+this._values[4]+" "+this._values[8]+" "+this._values[12]+
         "\n  "+this._values[1]+" "+this._values[5]+" "+this._values[9]+" "+this._values[13]+
         "\n  "+this._values[2]+" "+this._values[6]+" "+this._values[10]+" "+this._values[14]+
         "\n  "+this._values[3]+" "+this._values[7]+" "+this._values[11]+" "+this._values[15]+" ]";      
}

//------------------------------------------------------------------------------

goog.exportSymbol('mat4', mat4);
goog.exportProperty(mat4.prototype, 'CalcBodyFrame', mat4.prototype.CalcBodyFrame);
goog.exportProperty(mat4.prototype, 'CalcNavigationFrame', mat4.prototype.CalcNavigationFrame);
goog.exportProperty(mat4.prototype, 'Cami3d', mat4.prototype.Cami3d);
goog.exportProperty(mat4.prototype, 'CopyFrom', mat4.prototype.CopyFrom);
goog.exportProperty(mat4.prototype, 'Copy', mat4.prototype.Copy);
goog.exportProperty(mat4.prototype, 'Frustum', mat4.prototype.Frustum);
goog.exportProperty(mat4.prototype, 'Get', mat4.prototype.Get);
goog.exportProperty(mat4.prototype, 'Identity', mat4.prototype.Identity);
goog.exportProperty(mat4.prototype, 'Inverse', mat4.prototype.Inverse);
goog.exportProperty(mat4.prototype, 'LookAt', mat4.prototype.LookAt);
goog.exportProperty(mat4.prototype, 'Multiply', mat4.prototype.Multiply);
goog.exportProperty(mat4.prototype, 'MultiplyVec3', mat4.prototype.MultiplyVec3);
goog.exportProperty(mat4.prototype, 'Ortho2D', mat4.prototype.Ortho2D);
goog.exportProperty(mat4.prototype, 'Ortho', mat4.prototype.Ortho);
goog.exportProperty(mat4.prototype, 'OverwriteTranslation', mat4.prototype.OverwriteTranslation);
goog.exportProperty(mat4.prototype, 'Perspective', mat4.prototype.Perspective);
goog.exportProperty(mat4.prototype, 'RotationX', mat4.prototype.RotationX);
goog.exportProperty(mat4.prototype, 'RotationY', mat4.prototype.RotationY);
goog.exportProperty(mat4.prototype, 'RotationZ', mat4.prototype.RotationZ);
goog.exportProperty(mat4.prototype, 'Scale', mat4.prototype.Scale);
goog.exportProperty(mat4.prototype, 'Set', mat4.prototype.Set);
goog.exportProperty(mat4.prototype, 'ToString', mat4.prototype.ToString);
goog.exportProperty(mat4.prototype, 'Translation', mat4.prototype.Translation);
goog.exportProperty(mat4.prototype, 'Transpose', mat4.prototype.Transpose);
goog.exportProperty(mat4.prototype, 'Zero', mat4.prototype.Zero);
