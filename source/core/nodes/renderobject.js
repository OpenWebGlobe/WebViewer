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
goog.require('owg.ScenegraphNode');

/**
 * Render Object Node. Renders OpenWebGlobe objects, including virtual globe 
 * @author Martin Christen martin.christen@fhnw.ch 
 * @constructor
 */
function RenderObjectNode()
{
      /** @type GlobeRenderer */
      this.globerenderer = null;
      /** @type vec3 */
      this.camera = new vec3();
      
      //------------------------------------------------------------------------
      this.OnChangeState = function()
      {
         
      }
     
      //------------------------------------------------------------------------
      this.OnRender = function()
      {
         this.globerenderer.Render(this.camera, this.engine.matModelViewProjection);
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
            this.globerenderer = new GlobeRenderer(this.engine);
      }
      
      //------------------------------------------------------------------------
      this.OnExit = function()
      {
      
      }
      
      //------------------------------------------------------------------------
      this.OnRegisterEvents = function()
      {
         this.engine.eventhandler.AddKeyDownCallback(this, this.OnKeyDown);
      }
      //------------------------------------------------------------------------
      this.OnKeyDown = function(sender, key)
      {
         sender.globerenderer.OnKey(key);
      }
      //------------------------------------------------------------------------
}

RenderObjectNode.prototype = new ScenegraphNode();
