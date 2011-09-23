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

goog.provide('owg.ogAoeImage');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');


//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {ogObject} 
 * @description Image class (OpenWebGlobe object)
 * @author feng lei, fenglei@aoe.ac.cn
 */
function ogAoeImage()
{
   /** @type {string} */
   this.name = "ogAoeImage";
   /** @type {number} */
   this.type = OG_OBJECT_AOEIMAGE;
   /**@type {number} */
   this.indexInRendererArray = -1;
   /** @type {boolean} */
   this.hide = false;
   /** @type {Object} */
   this.options = null;
   /** @type {number} */
   this.layerID = -1; //the id of the aoeimagelayer containing this geometry.
   
   /** @type {number} */
   this.longitude0  = -180.0;
   /** @type {number} */
   this.latitude0   = -90.0;
   /** @type {number} */
   this.longitude1  =  180.0;
   /** @type {number} */   
   this.latitude1   =  90.0;
   /** @type {string} */
   this.imagesource = "";
   
   this.ready = false;
   
   this.mergedtexture = null;// new Texture(this._ctx.engine, true, 256, 256);
   this.texture = null;// new Texture(this._ctx.engine);
   
   this.meshes = new Array();
   this.drawmeshes = new Array();
}
//------------------------------------------------------------------------------
/** @extends {ogObject} */
ogAoeImage.prototype = new ogObject();

//------------------------------------------------------------------------------
/**
* @description parse options
* @param {GeometryOptions} options
* @ignore
*/
ogAoeImage.prototype.ParseOptions = function(options)
{
   this.options = options;
    // options = 
    // {
    //  longitude0 : 0,
    //  latitude0  :  0 ,
    //  longitude1 : 180,
    //  latitude1  : 90,
    //  url        : url
    //};
   this.longitude0   = options["longitude0"];// parseFloat(options[0]);
   this.latitude0    = options["latitude0"];// parseFloat(options[1]);
   this.longitude1   = options["longitude1"];// parseFloat(options[2]);
   this.latitude1    = options["latitude1"];// parseFloat(options[3]);
   this.image_source = options["url"];// options[4];
   
   var scene = this.parent;
   var context =  /** @type ogContext */scene.parent;
   var engine = context.engine;
   this.mergedtexture = new Texture(engine, true, 256, 256);
   this.texture = new Texture(engine);
   this.texture.parent = this;
   this.texture.loadTexture(this.image_source, _cbAoeImageReady, _cbAoeImageFailed, true);
   
     //add to ogAoeImage renderer...
   var renderer = this._GetAoeImageRenderer();
   this.indexInRendererArray = renderer.AddAoeImage(this);
}


//------------------------------------------------------------------------------
/**
 * @description Called when object is destroyed. Never call manually.
 * @ignore
 */
ogAoeImage.prototype._OnDestroy = function()
{
   var renderer = this._GetAoeImageRenderer();
   renderer.RemoveAoeImage(this.indexInRendererArray);
}


//------------------------------------------------------------------------------
/**
 *  @returns {AoeImageRenderer} the aoeimage-renderer
 */
ogAoeImage.prototype._GetAoeImageRenderer = function()
{
   /** @type {AoeImageRenderer} */
   var renderer = null;
   /** @type {ogScene} */
   var scene = /** @type ogScene */this.parent;
   /** @type {ogContext} */
   var context =  /** @type ogContext */scene.parent;
   // Get the engine
   /** @type {engine3d} */
   var engine = context.engine;
   
   // test if there is a scenegraph attached
   if (engine.scene)
   {
      if (engine.scene.nodeRenderObject)
      {
         renderer = engine.scene.nodeRenderObject.aoeimagerenderer;  
      }
   }
   return renderer;
}


//------------------------------------------------------------------------------
/**
 * @description hides the geometry
 */
ogAoeImage.prototype.Hide = function()
{
  

}

//------------------------------------------------------------------------------
/**
 * @description shows the geometry
 */
ogAoeImage.prototype.Show = function()
{
  
}

ogAoeImage.prototype.Render = function()
{
   this._UpdateTerrainBlocks();
   this._DrawMeshes();
}

ogAoeImage.prototype._DrawMeshes = function()
{

   for(var meshkey in this.drawmeshes)
   {
      var mesh = this.drawmeshes[meshkey];
      var model = new mat4();
      model.CopyFrom(mesh.engine.matModel);
      // virtual camera offset:
      model._values[12] += mesh.vOffset0;
      model._values[13] += mesh.vOffset1;
      model._values[14] += mesh.vOffset2;
      
      mesh.engine.PushMatrices();
      mesh.engine.SetModelMatrix(model);
         
      mesh.Draw();
      mesh.engine.PopMatrices();

   } 
}
ogAoeImage.prototype._UpdateTerrainBlocks = function()
{
   var scene = /** @type ogScene */this.parent;
   /** @type {ogContext} */
   var context =  /** @type ogContext */scene.parent;
   // Get the engine
   /** @type {engine3d} */
   var engine = context.engine;   if (this.ready == false) return;
   var cnt = engine.scene.nodeRenderObject.globerenderer.lstFrustum.length;
   var lng0, lat0, lng1, lat1;
   var tb = null;
   this.drawmeshes = null;
   this.drawmeshes = new Array();
   for(var i = 0; i < cnt; i++)
   {
      tb = engine.scene.nodeRenderObject.globerenderer.lstFrustum[i];
      if (tb.quadcode.length < 1) continue;
      if (tb.hasaoeimage) continue;
      lng0 = tb.longitude0;
      lat0 = tb.latitude0;
      lng1 = tb.longitude1;
      lat1 = tb.latitude1;
      
      var m = this.longitude0 > lng1 | this.longitude1 < lng0;
      var n = this.latitude0 > lat1  | this.latitude1 < lat0;
      if (m|n)
      {
         //no intersection
         continue;
      }
      // has intersection
      this.drawmeshes[tb.quadcode] = this.meshes[tb.quadcode];
      if (this.meshes[tb.quadcode]) continue;
      
      var mesh = new Surface(tb.engine);
      mesh.CopyFrom(tb.mesh);
      
      
      var tbtexture = tb.texture;
      var mergedtexture = new Texture(tb.engine, true, 256, 256);
      mergedtexture.EnableRenderToTexture();
      tbtexture.Blit(0, 0, 0, 0, 1, 1,true, true, 1.0);
      var x, y, scalex, scaley;
      x = (this.longitude0 - lng0) * 256.0 / (lng1 - lng0);
      y = (this.latitude0 - lat0) * 256.0 / (lat1 - lat0);
      scalex = ((this.longitude1 - this.longitude0)/this.texture.width) / ((lng1 - lng0) / 256) ;
      scaley = ((this.latitude1 - this.latitude0)/this.texture.height) / ((lat1 - lat0)/ 256);
      
      this.texture.Blit(x, y, 0, 0, scalex, scaley, true, true, 1.0);
      
      mergedtexture.DisableRenderToTexture();
      mesh.SetTexture(mergedtexture);
      mesh.vOffset0 = tb.vOffset[0];
      mesh.vOffset1 = tb.vOffset[1];
      mesh.vOffset2 = tb.vOffset[2];
      this.meshes[tb.quadcode] = mesh;
      this.drawmeshes[tb.quadcode] =  mesh;
    
   }
   
}

//------------------------------------------------------------------------------
/**
* @description internal callback function for image
* @ignore
*/
function _cbAoeImageReady(imgTex)
{
   var p = imgTex.parent;
   p.ready = true;
   if (imgTex.cbfReady) imgTex.cbfReady(imgTex.quadcode, imgTex, imgTex.layer);
   imgTex.cbfReady = null;
   imgTex.cbfFailed = null;
   imgTex.quadcode = null;
   imgTex.caller = null;
   imgTex.layer = null;
}
//------------------------------------------------------------------------------
/**
 * @description internal callback function for image
 * @ignore
 */
function _cbAoeImageFailed(imgTex)
{
   if (imgTex.cbfFailed) imgTex.cbfFailed(imgTex.quadcode, imgTex.caller, imgTex.layer);
   imgTex.cbfReady = null;
   imgTex.cbfFailed = null;
   imgTex.quadcode = null; 
   imgTex.caller = null;
   imgTex.layer = null;
}


