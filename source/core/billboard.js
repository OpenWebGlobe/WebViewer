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

goog.provide('owg.Billboard');

goog.require('goog.debug.Logger');
goog.require('owg.CanvasTexture');
goog.require('owg.Font');
goog.require('owg.GeoCoord');
goog.require('owg.Surface');
goog.require('owg.Texture');

/** 
* @class poi
* @constructor
* 
* @description A "Point Of Interest" Class.
* 
* @author Benjamin Loesch benjamin.loesch@fhnw.ch
* 
* @param {engine3d} engine
*/
function Billboard(engine)
{
  /** @type {engine3d} */
  this.engine = engine;
  /** @type {WebGLRenderingContext} */
  this.gl = engine.gl;
  /** @type {number} */
  this.lat = 0.0;
  /** @type {number} */
  this.lng = 0.0;
  /** @type {number} */
  this.elv = 0.0;
  /** @type {?number} */
  
  this.canvas = null;
  
  this.meshWidth = 0;
  this.meshHeight = 0;
  this.surface = null;
  this.ctx = null;
  this.ogId = -1;
  
}

Billboard.prototype.Create = function(canvas)
{
  //create a mesh accoring to the canvas width and height.
  //set the canvas as texture.
   // set it as Billboard
   this.canvas = canvas;
   
   this.ctx = this.canvas.getContext('2d');
   this.meshWidth = this.ctx.canvas.width;
   this.meshHeight = this.ctx.canvas.height;
   
   //set canvas as texture
   this.tex = new Texture(this.engine);
   this.tex.texture = this.gl.createTexture();
      

   //create surface
   this.surface = new Surface(this.engine);
   this.surface.SetTexture(this.tex);
   
    //get next power of two    
   this.textureWidth = MathUtils.GetNextPowerOfTwo(this.meshWidth);
   this.textureHeight = MathUtils.GetNextPowerOfTwo(this.meshHeight);  

   var vert = new Array();
  
   vert.push(-this.meshWidth/2,this.meshHeight/2,0,0,0);
   vert.push(-this.meshWidth/2,-this.meshHeight/2,0,0,(1/this.textureHeight*this.meshHeight));
   vert.push(this.meshWidth/2,-this.meshHeight/2,0,1/this.textureWidth*this.meshWidth,(1/this.textureHeight*this.meshHeight));
   vert.push(this.meshWidth/2,this.meshHeight/2,0,(1/this.textureWidth*this.meshWidth),0);  
  
                 
   this.surface.SetBufferPoi(vert);
   this.surface.SetIndexBuffer([0, 1, 2, 0, 2, 3],"TRIANGLES");
   
   this.surface.bbmin = [-this.meshWidth/2,-this.meshHeight/2,0] 
   this.surface.bbmax = [this.meshWidth/2,this.meshHeight/2,0]
   
   this.surface.meshWidth = this.meshWidth;
   this.surface.meshHeight = this.meshHeight;
   
   this.ToGPU();
}

/**
 * Binds the texture
 * @ignore 
 */
Billboard.prototype.ToGPU = function()
{
     this.gl.enable(this.gl.TEXTURE_2D);
     this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex.texture); 
     this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 0);
     this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.engine.gl.RGBA,this.gl.UNSIGNED_BYTE, this.canvas);
     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
   //  this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);         
     this.gl.bindTexture(this.gl.TEXTURE_2D, null);
     this.tex.ready = true;
}

Billboard.prototype.SetPosition = function(lng,lat,elv)
{
   var coord = new GeoCoord(lng,lat,elv);
   var cartesian = [];
   coord.ToCartesian(cartesian);
   this.surface.SetAsBillboard(cartesian[0],cartesian[1],cartesian[2],CARTESIAN_SCALE_INV,CARTESIAN_SCALE_INV,0);
   
}
//------------------------------------------------------------------------------
/**
* @description Draws the poi.
*/ 
Billboard.prototype.Draw = function()
{
  this.scale = 20; //todo...
  
   this.engine.gl.enable(this.engine.gl.BLEND);
   this.engine.gl.depthFunc(this.engine.gl.LEQUAL);
   this.engine.gl.blendFunc(this.engine.gl.SRC_ALPHA,this.engine.gl.ONE_MINUS_SRC_ALPHA);
 
 
   if(this.surface)
   {
      this.surface.UpdateBillboardMatrix();
   }

   this.engine.PushMatrices();
   var mmat = new mat4();
   mmat.Scale(CARTESIAN_SCALE_INV*this.scale,CARTESIAN_SCALE_INV*this.scale,1)
   this.engine.SetModelMatrix(mmat);
   
   if(this.surface)
   {
      this.surface.Draw(false,0,0,null,null);
   }
 
   this.engine.PopMatrices();
   this.engine.gl.disable(this.engine.gl.BLEND);
}
//------------------------------------------------------------------------------
/**
* @description Set the poi size.
* @param {number} size the poi size in meters, default is 20.
*/
Billboard.prototype.SetSize = function(size)
{
  this.scale = size;
  
  
  // this.SetPosition(this.posX,this.posY,this.posZ,null);
  
}
//------------------------------------------------------------------------------
/**
* @description Checks if this poi is picked.
* @param {number} mx mouse x position
* @param {number} my mouse y position
* @returns {Object} the picked coordinates
*/
Billboard.prototype.Pick = function(mx,my)
{
   if(this.surface)
   {
      var ray = this.engine.GetDirectionMousePos(mx,my,this.engine.matModelViewProjection);
      var hitbillboard = this.surface.TestRayIntersection(ray.x,ray.y,ray.z,ray.dirx,ray.diry,ray.dirz);
   }
  
  var x = 0;
  var y = 0;
  
  var u = hitbillboard.u;
  var v = hitbillboard.v;
  var w = (1-u-v);
  
  if(hitbillboard.triangleindex == 0)
  {
    x = (u*-this.meshWidth/2+v*this.meshWidth/2+w*-this.meshWidth/2/(u+v+w))+this.meshWidth/2;
    y = (u*this.meshWidth/2+v*this.meshWidth/2+w*-this.meshWidth/2/(u+v+w))+this.meshWidth/2;
  
  }else if (hitbillboard.triangleindex == 1)
  {
    x = (u*this.meshWidth/2+v*this.meshWidth/2+w*-this.meshWidth/2/(u+v+w))+this.meshWidth/2;
    y = (u*this.meshWidth/2+v*-this.meshWidth/2+w*-this.meshWidth/2/(u+v+w))+this.meshWidth/2;
  }
  
  x = x/this.meshWidth; //normalization 
  y = y/this.meshHeight;//normalization 
  
  var hitresult = {};
  hitresult.id = this.ogId;
  hitresult.x = x;
  hitresult.y = y;
  return hitresult;
}
//------------------------------------------------------------------------------
/**
* @description Destroy the poi
*/
Billboard.prototype.Destroy = function()
{  
  if(this.surface)
  {
    this.surface.Destroy();
    this.tex.Destroy();
  }
  
}

