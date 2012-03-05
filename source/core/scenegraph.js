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

goog.require('owg.BeginRenderNode');
goog.require('owg.CameraNode');
goog.require('owg.EndRenderNode');
goog.require('owg.LogosNode');
goog.require('owg.GlobeNavigationNode');
goog.require('owg.RenderObjectNode');
goog.require('owg.RenderNode');
goog.require('owg.TraversalState');
goog.require('owg.mat4');

//------------------------------------------------------------------------------
/**
 * Scenegraph Class.
 * @author Martin Christen martin.christen@fhnw.ch 
 * @constructor
 * @param{engine3d} engine the engine
 */
function SceneGraph(engine)
{
   /** @type {engine3d} */
   this.engine = engine;         // Render Engine
   
   this.navigation = /*new NavigationNode();*/ new GlobeNavigationNode();
   this.navigation.SetEngine(engine);
   this.navigation.InitNode();
   
   // Access Nodes:
   this.nodeNavigation = this.navigation;               // Navigation Node (for view matrix)
   this.nodeCamera = new CameraNode();                  // Camera Node (for projection matrix)
   this.nodeBeginRender = new BeginRenderNode();        // Begin Render Node (for multipass rendering, currently unsupported)
   this.nodeRenderObject = new RenderObjectNode();      // Render Object Node (render openglobe objects, e.g. the virtual globe)
   this.nodeRender = new RenderNode();                 // Generic Rendering Node (currently unused, render custom objects)
   this.nodeEndRender = new EndRenderNode();           // End Render Node (for multipass rendering, currently unsupported)
   this.nodeLogos = new LogosNode();                   // Node for rendering logos (render openwebglobe logos and navigation compass)
   
   this.nodeCamera.SetEngine(engine);
   this.nodeCamera.InitNode();
   
   this.nodeBeginRender.SetEngine(engine);
   this.nodeBeginRender.InitNode();
   
   this.nodeRenderObject.SetEngine(engine);
   this.nodeRenderObject.InitNode();
   
   this.nodeRender.SetEngine(engine);
   this.nodeRender.InitNode();
   
   this.nodeEndRender.SetEngine(engine);
   this.nodeEndRender.InitNode();
   
   this.nodeLogos.SetEngine(engine);
   this.nodeLogos.InitNode();
   
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
   this.nodeBeginRender.OnTick(nMSeconds);
   this.nodeRenderObject.OnTick(nMSeconds);
   this.nodeRender.OnTick(nMSeconds);
   this.nodeEndRender.OnTick(nMSeconds);
   this.nodeLogos.OnTick(nMSeconds);
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
   
   this.nodeNavigation.OnTraverse(this.traversalstate);    // Navigation Node (for view matrix)
   this.nodeCamera.OnTraverse(this.traversalstate);        // �޸���traversalstate��PerspectiveProjectionΪ(45, 0.00001, 10.0)    
   this.nodeBeginRender.OnTraverse(this.traversalstate);   // Begin Render Node (for multipass rendering, currently unsupported)
   this.nodeRenderObject.OnTraverse(this.traversalstate);  // �޸���camera��position
   this.nodeRender.OnTraverse(this.traversalstate);        // Generic Rendering Node (currently unused, render custom objects)  
   this.nodeEndRender.OnTraverse(this.traversalstate);     // End Render Node (for multipass rendering, currently unsupported)
   this.nodeLogos.OnTraverse(this.traversalstate);         // logo      
   
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
   this.nodeNavigation.OnRender();              // nothing
   
   this.nodeCamera.OnChangeState();             // SetProjectionMatrix
   this.nodeCamera.OnRender();                  // nothing
    
   this.nodeBeginRender.OnChangeState();        // nothing
   this.nodeBeginRender.OnRender();             // nothing
       
   this.nodeRenderObject.OnChangeState();       // nothing
   this.nodeRenderObject.OnRender();            // globerenderer.Render
   
   this.nodeRender.OnChangeState();             // nothing
   this.nodeRender.OnRender();                  // nothing
            
   this.nodeEndRender.OnChangeState();          // nothing
   this.nodeEndRender.OnRender();               // nothing
       
   this.nodeLogos.OnChangeState();
   this.nodeLogos.OnRender();        
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

   if (this.nodeBeginRender)
   {
      this.nodeBeginRender.OnDestroy();
      this.nodeBeginRender = null;
   }

   if (this.nodeRenderObject)
   {
      this.nodeRenderObject.OnDestroy();
      this.nodeRenderObject = null;
   }
   if (this.nodeRender)
   {
      this.nodeRender.OnDestroy();
      this.nodeRender = null;
   }
   if (this.nodeEndRender)
   {
      this.nodeEndRender.OnDestroy();
      this.nodeEndRender = null;
   }
   if (this.nodeLogos)
   {
      this.nodeLogos.OnDestroy();
      this.nodeLogos = null;
   }
}



