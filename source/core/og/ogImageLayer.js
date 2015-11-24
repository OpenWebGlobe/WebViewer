/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/



goog.provide('owg.ogImageLayer');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');
goog.require('owg.ogScene');
goog.require('owg.ogWorld');
goog.require('owg.ogContext');
goog.require('owg.engine3d');
goog.require('owg.GlobeRenderer');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {ogObject} 
 * @description Image-Layer class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 * 
 */
function ogImageLayer()
{
   /** @type {string} */
   this.name = "ogImageLayer";
   /** @type {number} */
   this.type = OG_OBJECT_IMAGELAYER;
   /** @type {number} */
   this.layerindex = -1;
}

//------------------------------------------------------------------------------
ogImageLayer.prototype = new ogObject();
//------------------------------------------------------------------------------
/**
 * @description Get the current globe renderer or null if there is none
 * @ignore 
 * @returns {GlobeRenderer}
 */
ogImageLayer.prototype.GetGlobeRenderer = function()
{
   /** @type {GlobeRenderer} */
   var renderer = null;
         
   //parent of ogImageLayer is ogWorld
   /** @type {ogWorld} */
   var world = /** @type ogWorld */this.parent;
   
   // parent of world is scene
   
   var scene = /** @type ogScene */world.parent;
   
   // parent of scene is context
   /** @type {ogContext} */
   var context = /** @type ogContext */scene.parent;
   
   // Get the engine
   /** @type {engine3d} */
   var engine = context.engine;
   
   // test if there is a scenegraph attached
   if (engine.scene)
   {
      if (engine.scene.nodeRenderObject)
      {
         renderer = engine.scene.nodeRenderObject.globerenderer;  
      }
   }
   return renderer;
}

//------------------------------------------------------------------------------
/**
 * @description Add an image layer to the world
 */
ogImageLayer.prototype.AddImageLayer = function(options)
{
   /** @type {GlobeRenderer} */
   var renderer = this.GetGlobeRenderer();
   if (renderer)
   {
      this.layerindex = renderer.AddImageLayer(options);
   }
}
//------------------------------------------------------------------------------
/**
 * @description Remove image layer
 */
ogImageLayer.prototype.RemoveImageLayer = function()
{
   /** @type {GlobeRenderer} */
   var renderer = this.GetGlobeRenderer();
   if (renderer && this.layerindex != -1)
   {
       renderer.RemoveImageLayer(this.layerindex);
   }
}
//------------------------------------------------------------------------------
/**
 * @param {ImageLayerOptions} options
 */
ogImageLayer.prototype.ParseOptions = function(options)
{
   this.AddImageLayer(options);
}

//------------------------------------------------------------------------------



