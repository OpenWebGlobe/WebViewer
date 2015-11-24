/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/


goog.provide('owg.RenderObjectNode');

goog.require('owg.GlobeRenderer');
goog.require('owg.VectorRenderer');
goog.require('owg.PoiRenderer');
goog.require('owg.GeometryRenderer');
goog.require('owg.BillboardRenderer');
goog.require('owg.ScenegraphNode');
goog.require('owg.AoeImageRenderer');

/**
 * Render Object Node. Renders OpenWebGlobe objects, including virtual globe 
 * @author Martin Christen martin.christen@fhnw.ch 
 * @constructor
 * @param {Object} options
 */
function RenderObjectNode(options)
{
      /** @type {GlobeRenderer} */
      this.globerenderer = null;
      /** @type {vec3} */
      this.camera = new vec3();
      /** @type {PoiRenderer} */
      this.poirenderer = null;
      /** @type {GeometryRenderer} */
      this.geometryrenderer = null;
      /** @type {BillboardRenderer} */
      this.billboardrenderer = null;
      /** @type {AoeImageRenderer} */
      this.aoeimagerenderer = null;
      /** @type {VectorRenderer} */
      this.vectorrenderer = null;
      /** @type {boolean} */
      this.bRenderTexture = options["rendertotexture"];
      /** @type {Texture} */
      this.texture = null;
      /** @type {Texture} */
      this.leftImage = null;
      /** @type {Texture} */
      this.rightImage = null;
      /** @type {boolean} */
      this.stereoscopic = false;
      /** @type {number} */
      this.stereomode = RenderObjectNode.STEREOMODE.ANAGLYPH;
      /** @type {number} */
      this.elevation = 0;
      /** @type {boolean} */
      this.custom = false;
      /** @type {Surface} */
      this.globeshape = null;
      /** @type {number} */
      this.sep = 0;
      /** @type {number} */
      this.w = 0;
      /** @type {number} */
      this.h = 0;

      if (options["type"] == "custom")
      {
         this.custom = true;
      }
      
      //------------------------------------------------------------------------
      this.OnChangeState = function()
      {
         
      }
     
      //------------------------------------------------------------------------
      this.OnRender = function()
      {
         if (this.stereoscopic)
         {
            if (this.leftImage == null)
            {
               this.leftImage = new Texture(this.engine, true, this.w, this.h, true);
            }
            if (this.rightImage == null)
            {
               this.rightImage = new Texture(this.engine, true, this.w, this.h, true);
            }

            if ( this.stereomode == RenderObjectNode.STEREOMODE.TOPBOTTOM )
            {
               var oldmat = new mat4();
               oldmat.CopyFrom(this.engine.matView);

               // do calculations:
               //var basis = 0.000003;
               var basis = 0.000024;
               // modify matrix:
               var move = new vec3(0, -basis, 0);
               var move2 = new vec3(0, basis, 0);
               var v = this.engine.matView.MultiplyVec3(move);
               var v2 = this.engine.matView.MultiplyVec3(move2);

               // Render right Image:
               this.engine.matView.OverwriteTranslation(v._values[0],v._values[1],v._values[2]);
               this.engine._UpdateMatrices();
               this._doRender(this.rightImage, 2);

               this.engine.matView.OverwriteTranslation(v2._values[0],v2._values[1],v2._values[2]);
               this.engine._UpdateMatrices();
               this._doRender(this.leftImage, 1);
            }
            else if ( this.stereomode == RenderObjectNode.STEREOMODE.ANAGLYPH )
            {
               var oldmat = new mat4();
               oldmat.CopyFrom(this.engine.matView);

               // do calculations:
               var basis = 0.000003;
               // modify matrix:
               var move = new vec3(0, -basis, 0);
               var move2 = new vec3(0, basis, 0);
               var v = this.engine.matView.MultiplyVec3(move);
               var v2 = this.engine.matView.MultiplyVec3(move2);

               // Render right Image:
               this.engine.matView.OverwriteTranslation(v._values[0],v._values[1],v._values[2]);
               this.engine._UpdateMatrices();
               this._doRender(this.rightImage, 3);
               this.engine.matView.CopyFrom(oldmat);

               // Render Left Image:
               this.engine.matView.OverwriteTranslation(v2._values[0],v2._values[1],v2._values[2]);
               this.engine._UpdateMatrices();
               this._doRender(this.leftImage, 4);

               // Combineright and left image.. render them using optimized anaglyph
               if (!goog.isNull(this.leftImage.blitMesh))
               {
                  // Black & White Anaglyph:
                  //this.leftImage.blitMesh.colormat0.SetFromArray([.299,.587,.114,0,  0,0,0,0, 0,0,0,0, 0,0,0,1]);
                  //this.leftImage.blitMesh.colormat1.SetFromArray([0,0,0,0,  .299,.587,.114,0, .299,.587,.114,0, 0,0,0,1]);

                  // Optimized Anaglyph:
                  this.leftImage.blitMesh.colormat0.SetFromArray([0,0.7,0.3,0,  0,0,0,0, 0,0,0,0, 0,0,0,1]);
                  this.leftImage.blitMesh.colormat1.SetFromArray([0,  0, 0, 0,  0,1,0,0, 0,0,1,0, 0,0,0,1]);
                  this.leftImage.blitMesh.dx = 1.0/this.leftImage.width;
                  this.leftImage.blitMesh.dy = 1.0/this.leftImage.height;

                  this.leftImage.blitMesh.mode = "pt_stereo";
               }
               this.leftImage.Blit(0,0, 0, 0, 1, 1, true, true, 1.0, null, this.rightImage);

               // reset:
               //this.engine.ColorMask(true,true,true,true);
               this.engine.matView.CopyFrom(oldmat);
               this.engine._UpdateMatrices();
            }
         }
         else
         {
            this._doRender(this.texture, 0);
         }
      }
      //------------------------------------------------------------------------
      this._doRender = function(target_texture, mode)
      {
         if (this.bRenderTexture)
         {
            this.engine.PushRenderTarget(target_texture);
            this.engine.SetupDepthTextureTarget();
         }

         if (this.globerenderer)
         {
            if (this.globeshape)
            {
               this.engine.DisableDepthTest();
               this.globeshape.Draw();
               this.engine.EnableDepthTest();
            }

            this.globerenderer.Render(this.camera, this.engine.matModelViewProjection);

         }
         this.vectorrenderer.Render(this.camera, this.engine.matModelViewProjection);
         this.poirenderer.Render(this.camera, this.engine.matModelViewProjection);
         this.geometryrenderer.Render(this.camera, this.engine.matModelViewProjection);
         this.billboardrenderer.Render(this.camera, this.engine.matModelViewProjection);
         this.aoeimagerenderer.Render(this.camera, this.engine.matModelViewProjection);

         if (this.bRenderTexture)
         {
            this.engine.PopRenderTarget();

            if (mode == 0)
            {
               target_texture.Blit(0,0, 0, 0, 1, 1, true, true, 1.0);
               target_texture.blitMesh.mode = "pt";
            }
            else if (mode == 1)
            {
               target_texture.Blit(0,0, 0, 0, 1, 0.5, true, true, 1.0);
               target_texture.blitMesh.mode = "pt";
            }
            else if (mode == 2)
            {
               target_texture.Blit(0,this.engine.height/2, 0, 0, 1, 0.5, true, true, 1.0);
               target_texture.blitMesh.mode = "pt";
            }
         }
      }
      //------------------------------------------------------------------------
      this.OnTraverse = function(ts)
      {
          var pos = ts.GetPosition();
          this.camera.Set(pos.x, pos.y, pos.z);
          this.elevation = ts.geoposition.elevation;
      }
      
      //------------------------------------------------------------------------
      this.OnInit = function()
      {
         if (!this.custom)
         {
            this.globeshape = new Surface(this.engine);
            if (this.bRenderTexture)
            {
               this.globeshape.SolidGeosphere([1,0,1,0], 3);
            }
            else
            {
               this.globeshape.SolidGeosphere([0,0,0,1], 2);
            }
            this.globerenderer = new GlobeRenderer(this.engine);
         }
         this.vectorrenderer = new VectorRenderer(this.engine);
         this.poirenderer = new PoiRenderer(this.engine);
         this.geometryrenderer = new GeometryRenderer(this.engine);
         this.billboardrenderer = new BillboardRenderer(this.engine);
         this.aoeimagerenderer = new AoeImageRenderer(this.engine);

      }
      
      //------------------------------------------------------------------------
      this.OnExit = function()
      {
         if (this.texture)
         {
            this.texture.Destroy();
            this.texture = null;
         }
         if (this.rightImage)
         {
            this.rightImage.Destroy();
            this.rightImage = null;
         }
         if (this.leftImage)
         {
            this.leftImage.Destroy();
            this.leftImage = null;
         }
         if (this.globeshape)
         {
            this.globeshape.Destroy();
            this.globeshape = null;
         }
         if (this.globerenderer)
         {
            this.globerenderer.Destroy(); // free all memory
            this.globerenderer = null;
         }

      }

      //------------------------------------------------------------------------
      this.DoResize = function(w,h)
      {
         this.w = w;
         this.h = h;

         if (this.stereoscopic)
         {
            if (this.leftImage == null)
            {
               this.leftImage = new Texture(this.engine, true, w, h, true);
            }
            else
            {
               this.leftImage.UpdateFBO(w, h, true);
            }

            if (this.rightImage == null)
            {
               this.rightImage = new Texture(this.engine, true, w, h, true);
            }
            else
            {
               this.rightImage.UpdateFBO(w, h, true);
            }
         }

         if (this.bRenderTexture)
         {
            if (this.texture == null)
            {
               this.texture = new Texture(this.engine, true, w, h, true);
            }
            else
            {
               this.texture.UpdateFBO(w, h, true);
            }
         }
      }
      //------------------------------------------------------------------------
   //---------------------------------------------------------------------------
   this.OnUnregisterEvents = function ()
   {
      goog.events.unlistenByKey(this.evtKeyDown);
   }
   //---------------------------------------------------------------------------
   this.OnRegisterEvents = function (context)
   {
   }
   //---------------------------------------------------------------------------
}

RenderObjectNode.prototype = new ScenegraphNode();


/** @enum {number} */
RenderObjectNode.STEREOMODE = {
   ANAGLYPH:0,
   TOPBOTTOM:1
};