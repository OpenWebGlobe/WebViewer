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

goog.provide('owg.PointSprite');

goog.require('goog.debug.Logger');
goog.require('owg.GeoCoord');
goog.require('owg.Texture');
goog.require('owg.mat4');

/** 
* @class point
* @constructor
* 
* @description a pointsprite class
* 
* @author Benjamin Loesch benjamin.loesch@fhnw.ch
* 
* @param {engine3d} engine
*/
function PointSprite(engine)
{
  /** @type {engine3d} */
  this.engine = engine;
  /** @type {WebGLRenderingContext} */
  this.gl = engine.gl;
 
  this.pointdata = null;
  
  this.vbo = null;
  
  this.modelMatrix = null;

  this.newModelMatrix = new mat4();
  
  this.points = [];
  
  this.offset = 0;
  this.numofpoints = 0;
  this.totalnumpoints = 70000000;

  
}

PointSprite.prototype.SetCenter = function(lng,lat,elv)
{
      this.SetAsNavigationFrame(lng,lat,elv);
}


/**
 * @description sets the point data
 * @param {Array.<number>} newpoints the options object includes the center position as wgs84 and the point positions as x,y,z
 */
PointSprite.prototype.SetPoints = function(newpoints)
{
  this.numofpoints += newpoints.length/7;
 //console.log(this.points.length);
  this.pointdata=null;
  this.pointdata = new Float32Array(newpoints);
  this._ToGPU();
//  console.log("number of points: "+this.numofpoints);
}


PointSprite.prototype.SetNumberOfPoints = function(numberofpoints)
{
  this.totalnumpoints1 = numberofpoints;
  
}

/**
 * @description frees all memory
 */
PointSprite.prototype.Destroy = function()
{

   if (this.vbo)
   {
      this.gl.deleteBuffer(this.vbo);
      this.vbo = null;
   }
   this.pointdata = null;
   this.vbo = null;

}





/**
 * @description sets the model matrix as a navigation frame matrix.
 * @param {number} lng the longitude coordinate
 * @param {number} lat the latitude coordinate
 * @param {number} elv the elevation 
 */
PointSprite.prototype.SetAsNavigationFrame = function(lng,lat,elv)
{
     var coords = new GeoCoord(lng, lat,elv);
     var cartesianCoordinates = new Array(3);
     coords.ToCartesian(cartesianCoordinates);
     
     var matTrans = new mat4();
     matTrans.Translation(cartesianCoordinates[0],cartesianCoordinates[1],cartesianCoordinates[2]);
       
     var mat = new mat4();
     mat.CalcNavigationFrame(lng,lat);
     
     var a = new Float32Array(16);
     var mmatvals = mat.Get();
     a[0] = mmatvals[0];
     a[1] = mmatvals[1];
     a[2] = mmatvals[2];
     a[3] = mmatvals[3];
     a[4] = mmatvals[4];
     a[5] = mmatvals[5];
     a[6] = mmatvals[6];
     a[7] = mmatvals[7];
     a[8] = mmatvals[8];
     a[9] = mmatvals[9];
     a[10] = mmatvals[10];
     a[11] = mmatvals[11];
     a[12] = cartesianCoordinates[0];
     a[13] = cartesianCoordinates[1];
     a[14] = cartesianCoordinates[2];
     a[15] = 1;
     
     var navMat = new mat4();
     navMat.Set(a);
     
     //scaling because the units of a 3d models are meters
     var scaleMat = new mat4();
     scaleMat.Scale(CARTESIAN_SCALE_INV,CARTESIAN_SCALE_INV,CARTESIAN_SCALE_INV)
     
     var scaledNavMat = new mat4();
     scaledNavMat.Multiply(navMat,scaleMat);
     
     var rotatedMat = new mat4();
     rotatedMat.RotationX(-1.57079633);
     
     var scaledRotNavMat = new mat4();
     scaledRotNavMat.Multiply(scaledNavMat,rotatedMat);
     
     this.modelMatrix = scaledRotNavMat;
     //this.UpdateAABB();
}


/**
 * @description draws the points.
 */
PointSprite.prototype.Draw = function()
{
    if(this.pointdata != null)
    {
      //1. set points into gpu
      if(!this.vbo)
      {
        this._ToGPU();
      }
    
  
      if(this.modelMatrix)
     {     
        this.engine.PushMatrices();
        this.newModelMatrix.Multiply(this.modelMatrix,this.engine.matModel);
        this.engine.SetModelMatrix(this.newModelMatrix);   
     }
     
     
     // setup interleaved VBO and IBO
     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
   
    //3. activate shader and get attribute pointers
   
      this.gl.enableVertexAttribArray(0);
      this.gl.enableVertexAttribArray(1);
      this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 7*4, 0*4); // position
      this.gl.vertexAttribPointer(1, 4, this.gl.FLOAT, false, 7*4, 3*4); // color
      var invmvp = new mat4();
      invmvp.Inverse(this.engine.matModelViewProjection);
      this.engine.shadermanager.UseShader_Point(this.engine.matModelViewProjection,invmvp);
                        
                        
  
    //4. draw the points
     this.gl.drawArrays(this.gl.POINTS,0,this.numofpoints); //2=anzahl punkte
                      
  
    
      this.gl.disableVertexAttribArray(0);
      this.gl.disableVertexAttribArray(1); 
      
      if(this.modelMatrix)
      {     
         this.engine.PopMatrices();   
      }
    }
}


/**
 * @description internal function writes everything to the gpu
 */

PointSprite.prototype._ToGPU = function()
{
   // Create VB
   if(this.vbo === null)
   {
    
    this.vbo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.totalnumpoints, this.gl.STATIC_DRAW);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER,0,this.pointdata);
    this.offset += (this.pointdata.length)*4;
   }
   else
   {
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER,this.offset,this.pointdata);
    this.offset += (this.pointdata.length)*4;

   }
   
    
}


