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
* @description todo...
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
}




PointSprite.prototype.SetPoints = function(options)
{
  this.pointdata = new Float32Array(options['Vertices']);

  if(options['Center'])
  {
      this.SetAsNavigationFrame(options['Center'][0],options['Center'][1],options['Center'][2]);
  }
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



PointSprite.prototype.Draw = function()
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
    //case "pc": 
                      this.gl.enableVertexAttribArray(0);
                      this.gl.enableVertexAttribArray(1);
                      this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 7*4, 0*4); // position
                      this.gl.vertexAttribPointer(1, 4, this.gl.FLOAT, false, 7*4, 3*4); // color
                      this.engine.shadermanager.UseShader_PC(this.engine.matModelViewProjection);
                 //     break;
  
    //this.gl.enable(this.gl.BLEND);
    //this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE);

  //4. draw the points
   this.gl.drawArrays(this.gl.POINTS,0,this.pointdata.length/7); //2=anzahl punkte
                    
      if (this.texture)
      {
         this.texture.Disable();
      }
  //5. disable webgl things
  
      this.gl.disableVertexAttribArray(0);
      this.gl.disableVertexAttribArray(1); 
  
      if(this.modelMatrix)
      {     
         this.engine.PopMatrices();   
      } 
}


PointSprite.prototype._ToGPU = function()
{
   //test vertexbufferdata ungleich null
   // Create VB
    this.vbo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.pointdata, this.gl.STATIC_DRAW);
    
    /*
    // Create IB
    this.ibo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indexbufferdata, this.gl.STATIC_DRAW);
    */
}


