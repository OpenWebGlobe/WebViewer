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
goog.require('owg.NavigationNode');
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
   /** @type engine3d */
   this.engine = engine;         // Render Engine
   
   // Access Nodes:
   this.nodeNavigation = new NavigationNode();     // Navigation Node (for view matrix)
   this.nodeCamera = new CameraNode();             // Camera Node (for projection matrix)
   this.nodeBeginRender = new BeginRenderNode();   // Begin Render Node (for multipass rendering, currently unsupported)
   this.nodeRenderObject = new RenderObjectNode(); // Render Object Node (render openglobe objects, e.g. the virtual globe)
   this.nodeRender = new RenderNode();             // Generic Rendering Node (currently unused, render custom objects)
   this.nodeEndRender = new EndRenderNode();       // End Render Node (for multipass rendering, currently unsupported)
   this.nodeLogos = new LogosNode();               // Node for rendering logos (render openwebglobe logos and navigation compass)
   
   this.nodeNavigation.SetEngine(engine);
   this.nodeNavigation.InitNode();
   
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
 * Traverse Scenegraph 
 */
SceneGraph.prototype.Traverse = function()
{
   this.traversalstate.PushModel(this.matModel);
   this.traversalstate.PushView(this.matModel);
   this.traversalstate.PushProjection(this.matProj);
   
   this.nodeNavigation.OnTraverse(this.traversalstate); 
   this.nodeCamera.OnTraverse(this.traversalstate);           
   this.nodeBeginRender.OnTraverse(this.traversalstate);   
   this.nodeRenderObject.OnTraverse(this.traversalstate); 
   this.nodeRender.OnTraverse(this.traversalstate);          
   this.nodeEndRender.OnTraverse(this.traversalstate);     
   this.nodeLogos.OnTraverse(this.traversalstate);               
   
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
   this.nodeNavigation.OnChangeState();
   this.nodeNavigation.OnRender();  
   
   this.nodeCamera.OnChangeState(); 
   this.nodeCamera.OnRender();          
    
   this.nodeBeginRender.OnChangeState();
   this.nodeBeginRender.OnRender();
       
   this.nodeRenderObject.OnChangeState();
   this.nodeRenderObject.OnRender(); 
   
   this.nodeRender.OnChangeState();
   this.nodeRender.OnRender(); 
            
   this.nodeEndRender.OnChangeState();
   this.nodeEndRender.OnRender();  
       
   this.nodeLogos.OnChangeState();
   this.nodeLogos.OnRender();        
}

//------------------------------------------------------------------------------



