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
 */
function RenderObjectNode()
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
      
      //------------------------------------------------------------------------
      this.OnChangeState = function()
      {
         
      }
     
      //------------------------------------------------------------------------
      this.OnRender = function()
      {
         this.globerenderer.Render(this.camera, this.engine.matModelViewProjection);
         this.vectorrenderer.Render(this.camera, this.engine.matModelViewProjection);
         this.poirenderer.Render(this.camera, this.engine.matModelViewProjection);
         this.geometryrenderer.Render(this.camera, this.engine.matModelViewProjection);
         this.billboardrenderer.Render(this.camera, this.engine.matModelViewProjection);
         this.aoeimagerenderer.Render(this.camera, this.engine.matModelViewProjection);
      }
      
      //------------------------------------------------------------------------
      this.OnTraverse = function(ts)
      {
          var pos = ts.GetPosition();
          this.camera.Set(pos.x, pos.y, pos.z);
      }
      
      //------------------------------------------------------------------------
      this.OnInit = function()
      {
            this.globerenderer = new GlobeRenderer(this.engine, true); // true: enable render to texture
            this.vectorrenderer = new VectorRenderer(this.engine);
            this.poirenderer = new PoiRenderer(this.engine);
            this.geometryrenderer = new GeometryRenderer(this.engine);
            this.billboardrenderer = new BillboardRenderer(this.engine);
            this.aoeimagerenderer = new AoeImageRenderer(this.engine);
      }
      
      //------------------------------------------------------------------------
      this.OnExit = function()
      {
         this.globerenderer.Destroy(); // free all memory
         this.globerenderer = null;
      }

      //------------------------------------------------------------------------
      this.DoResize = function(w,h)
      {
         if (this.globerenderer)
         {
            this.globerenderer.DoResize(w,h);
         }
      }
      //------------------------------------------------------------------------
      this.OnRegisterEvents = function(context)
      {

      }
      //------------------------------------------------------------------------
}

RenderObjectNode.prototype = new ScenegraphNode();
