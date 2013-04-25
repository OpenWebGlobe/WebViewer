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

goog.provide('owg.SceneGraph');

goog.require('owg.CameraNode');
goog.require('owg.LogosNode');
goog.require('owg.GlobeNavigationNode');
goog.require('owg.ConstrainedNavigationNode');
goog.require('owg.DynamicNavigationNode');
goog.require('owg.RenderObjectNode');
goog.require('owg.TraversalState');
goog.require('owg.mat4');

//------------------------------------------------------------------------------
/**
 * Scenegraph Class.
 * @author Martin Christen martin.christen@fhnw.ch 
 * @constructor
 * @param {engine3d} engine the engine
 * @param {Object} options options for Scenegraph
 */
function SceneGraph(engine, options)
{
   /** @type {engine3d} */
   this.engine = engine;         // Render Engine
   
   this.nodeNavigation = /*new NavigationNode();*/ new GlobeNavigationNode();
   this.nodeNavigation.SetEngine(engine);
   this.nodeNavigation.InitNode();

   // Access Nodes:
   this.nodeCamera = new CameraNode();                      // Camera Node (for projection matrix)
   this.nodeRenderObject = new RenderObjectNode(options);   // Render Object Node (render openglobe objects, e.g. the virtual globe)
      
   if (!goog.isDef(options["shownavigation"])) 
   {
      options["shownavigation"] = true;
   }
      
   if (options["shownavigation"]) 
   {
      this.nodeLogos = new LogosNode();
   }
   
   this.nodeCamera.SetEngine(engine);
   this.nodeCamera.InitNode();

   this.nodeRenderObject.SetEngine(engine);
   this.nodeRenderObject.InitNode();

   if (this.nodeLogos)
   {
      this.nodeLogos.SetEngine(engine);
      this.nodeLogos.InitNode();
   }
   
   this.traversalstate = new TraversalState();

   // init matrices
   this.matModel = new mat4(); // model matrix
   this.matView = new mat4(); // view matrix
   this.matProj = new mat4(); // projection matrix
   
} 
//------------------------------------------------------------------------------
/**
 * Update Scenegraph
 * @param {number} nMSeconds
 */
SceneGraph.prototype.Tick = function(nMSeconds)
{
   this.nodeNavigation.OnTick(nMSeconds);
   this.nodeCamera.OnTick(nMSeconds);
   this.nodeRenderObject.OnTick(nMSeconds);
   if (this.nodeLogos)
   {
      this.nodeLogos.OnTick(nMSeconds);
   }
};
//------------------------------------------------------------------------------
/**
 * Traverse Scenegraph 
 */
SceneGraph.prototype.Traverse = function()
{
   this.traversalstate.PushModel(this.matModel);
   this.traversalstate.PushView(this.matView);
   this.traversalstate.PushProjection(this.matProj);
   
   this.nodeNavigation.OnTraverse(this.traversalstate);
   this.nodeCamera.OnTraverse(this.traversalstate);
   this.nodeRenderObject.OnTraverse(this.traversalstate);
      
   if (this.nodeLogos)
   {
      this.nodeLogos.OnTraverse(this.traversalstate);
   }
   
   this.traversalstate.PopModel();
   this.traversalstate.PopView();
   this.traversalstate.PopProjection();
   

}
//------------------------------------------------------------------------------
/**
 * @description Render Scenegraph
 */
SceneGraph.prototype.Render = function()
{
   this.nodeNavigation.OnChangeState();         // ViewMatrix
   this.nodeNavigation.OnRender();

   this.nodeCamera.OnChangeState();             // SetProjectionMatrix
   this.nodeCamera.OnRender();

   // Render globe, poi, geometry, billboards, images on terrain
   this.nodeRenderObject.OnChangeState();
   this.nodeRenderObject.OnRender();
   
   if (this.nodeLogos) 
   {    
      this.nodeLogos.OnChangeState();
      this.nodeLogos.OnRender();        
	}
}

//------------------------------------------------------------------------------
/**
 * @description Destroy Scenegraph - free all memory
 */
SceneGraph.prototype.Destroy = function()
{
   if (this.nodeNavigation)
   {
      this.nodeNavigation.OnDestroy();
      this.nodeNavigation = null;
   }

   if (this.nodeCamera)
   {
      this.nodeCamera.OnDestroy();
      this.nodeCamera = null;
   }

   if (this.nodeRenderObject)
   {
      this.nodeRenderObject.OnDestroy();
      this.nodeRenderObject = null;
   }

   if (this.nodeLogos)
   {
      this.nodeLogos.OnDestroy();
      this.nodeLogos = null;
   }
}

/**
 * @param {Object} options
 */
SceneGraph.prototype.SetNavigationMode = function(options)
{
   var lng, lat, elv;
   var yaw, pitch, roll;
   if (goog.isDef(options["type"]))
   {
      if (options["type"] == "globe")
      {
         this.nodeNavigation.OnDestroy();
         this.nodeNavigation = new GlobeNavigationNode();
         this.nodeNavigation.SetEngine(this.engine);
      }
      else if (options["type"] == "fly")
      {
         this.nodeNavigation.OnDestroy();
         this.nodeNavigation = new NavigationNode();
         this.nodeNavigation.SetEngine(this.engine);
      }
      else if (options["type"] == "constrained")
      {
         this.nodeNavigation.OnDestroy();
         this.nodeNavigation = new ConstrainedNavigationNode(options);
         this.nodeNavigation.SetEngine(this.engine);
      }
      else if (options["type"] == "dynamic")
      {
         this.nodeNavigation.OnDestroy();
         this.nodeNavigation = new DynamicNavigationNode(options);
         this.nodeNavigation.SetEngine(this.engine);
      }

      lng = this.nodeNavigation._longitude;
      lat = this.nodeNavigation._latitude;
      elv = this.nodeNavigation._ellipsoidHeight;
      yaw = this.nodeNavigation._yaw;
      pitch = this.nodeNavigation._pitch;
      roll = this.nodeNavigation._roll;

      if (goog.isDef(options["Longitude"])) { lng = options["Longitude"];}
      if (goog.isDef(options["Latitude"])) { lat = options["Latitude"];}
      if (goog.isDef(options["Elevation"])) { elv = options["Elevation"];}
      if (goog.isDef(options["Yaw"])) { yaw = MathUtils.Deg2Rad(options["Yaw"]);}
      if (goog.isDef(options["Pitch"])) { pitch = MathUtils.Deg2Rad(options["Pitch"]);}
      if (goog.isDef(options["Roll"])) { roll = MathUtils.Deg2Rad(options["Roll"]);}

      this.nodeNavigation.SetPosition(lng, lat, elv);
      this.nodeNavigation.SetOrientation(yaw, pitch, roll);

      this.nodeNavigation.InitNode();

   }
}



