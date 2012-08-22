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
      // todo: change to enum
      // 0: no stereo,
      // 1: render top,
      // 2: render bottom
      /** @type {number} */
      this.stereoscopic = 0;
      /** @type {number} */
      this.elevation = 0;
      /** @type {boolean} */
      this.custom = false;
      /** @type {Surface} */
      this.globeshape = null;
      /** @type {boolean} */
      this.postprocess = true;

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
         if (this.bRenderTexture)
         {
            this.engine.PushRenderTarget(this.texture);
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

            if (this.stereoscopic == 0)
            {
               if (goog.isDef(this.texture.blitMesh) && !goog.isNull(this.texture.blitMesh))
               {
                  if (this.postprocess)
                  {
                     this.texture.blitMesh.mode = "blur";
                  }
                  else
                  {
                     this.texture.blitMesh.mode = "pt";
                  }
               }
               this.texture.Blit(0,0, 0, 0, 1, 1, true, true, 1.0);
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
      this.OnRegisterEvents = function(context)
      {

      }
      //------------------------------------------------------------------------
}

RenderObjectNode.prototype = new ScenegraphNode();
