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

goog.provide('owg.ogWorld');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');
goog.require('owg.GlobeRenderer');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {ogObject} 
 * @description World class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogWorld()
{
   this.name = "ogWorld";
   this.type = OG_OBJECT_WORLD;
}


//------------------------------------------------------------------------------
ogWorld.prototype = new ogObject();

//------------------------------------------------------------------------------
ogWorld.prototype.ParseOptions = function(options)
{
   if (options == null)
   {
      goog.debug.Logger.getLogger('owg.ogTexture').warning("** ERROR: no options for texture creation!");
      return;  // no options!!
   }

   if (options["scenetype"])
   {
      
      /** @type {ogContext} */
      var context = /** @type ogContext */this.parent.parent;
      /** @type {ogScene} */
      var scene = /** @type ogScene */ this.parent;
      /** @type {engine3d} */
      var engine = context.engine;

      /** @type {Object} */
      var sceneoptions =   // more options will be available in future
      {
         "rendertotexture" : scene.rendertotexture,
         "shownavigation" : scene.shownavigation
      };

      if (options["scenetype"] == OG_SCENE_3D_ELLIPSOID_WGS84)
      {
         engine.SetWorldType(1);
         engine.CreateScene(sceneoptions);
         if (engine.scene)
         {
            engine.scene.world = this;
         }
      }
      else if (options["scenetype"] == OG_SCENE_3D_FLAT_CARTESIAN)
      {
         engine.SetWorldType(2);
         engine.CreateScene(sceneoptions);
         if (engine.scene)
         {
            engine.scene.world = this;
         }
      }
      else if (options["scenetype"] == OG_SCENE_2D_SCREEN)
      {
         engine.SetWorldType(3);
         engine.CreateScene(sceneoptions);
         if (engine.scene)
         {
            engine.scene.world = this;
         }
      }
      else if (options["scenetype"] == OG_SCENE_CUSTOM)
      {
         engine.SetWorldType(0);
         engine.CreateScene(sceneoptions);
         if (engine.scene)
         {
            engine.scene.world = this;
         }
      }
      
   }
}
//------------------------------------------------------------------------------
ogWorld.prototype.SetNorthpoleColor = function(red, green, blue)
{
      /** @type {ogContext} */
      var context = /** @type ogContext */this.parent.parent;
      /** @type {engine3d} */
      var engine = context.engine;
      
      /** @type {GlobeRenderer} */
      var renderer = engine.scene.nodeRenderObject.globerenderer;
      
      renderer.northpolecolor = [red, green, blue];
}
//------------------------------------------------------------------------------
ogWorld.prototype.SetSouthpoleColor = function(red, green, blue)
{
      /** @type {ogContext} */
      var context = /** @type ogContext */this.parent.parent;
      /** @type {engine3d} */
      var engine = context.engine;
      
      /** @type {GlobeRenderer} */
      var renderer = engine.scene.nodeRenderObject.globerenderer;
      
      renderer.southpolecolor = [red, green, blue]; 
}
//------------------------------------------------------------------------------
ogWorld.prototype.SetRenderQuality = function(quality)
{
      /** @type {ogContext} */
      var context = /** @type ogContext */this.parent.parent;
      /** @type {engine3d} */
      var engine = context.engine;
      
      /** @type {GlobeRenderer} */
      var renderer = engine.scene.nodeRenderObject.globerenderer;
      
      if (quality > 0 && quality <= 3)
      {
         renderer.quality = quality;
      }
}
//------------------------------------------------------------------------------
/** @description set render effect
 *  @param {number} rendereffect
 *  @param {Object=} param
 */
ogWorld.prototype.SetRenderEffect = function(rendereffect, param)
{
   /** @type {ogContext} */
   var context = /** @type ogContext */this.parent.parent;
   /** @type {engine3d} */
   var engine = context.engine;
      
   /** @type {GlobeRenderer} */
   var renderer = engine.scene.nodeRenderObject.globerenderer;
   
   switch (rendereffect)
   {
      case OG_RENDEREFFECT_RGB:
         renderer.SetRenderEffect(GlobeRenderer.RenderEffect.RGB);
         renderer.SetRenderParam(param);
         break;
      case OG_RENDEREFFECT_CHROMADEPTH:
         renderer.SetRenderEffect(GlobeRenderer.RenderEffect.CHROMADEPTH);
         renderer.SetRenderParam(param);
         break;
      default:
         return;
   }
}
//------------------------------------------------------------------------------
/**
 * Return the engine
 * @return {engine3d}
 */
ogWorld.prototype.GetEngine = function()
{
   /** @type {ogContext} */
   var context = /** @type ogContext */this.parent.parent;
   /** @type {engine3d} */
   var engine = context.engine;
   return engine;
}
//------------------------------------------------------------------------------
/** @description Hide Elevation tile if there is a point-cloud
 *  @param {boolean} yes
 */
ogWorld.prototype.HideElevationOnPointCloud = function(yes)
{
    /** @type {ogContext} */
    var context = /** @type ogContext */this.parent.parent;
    /** @type {engine3d} */
    var engine = context.engine;

    /** @type {GlobeRenderer} */
    var renderer = engine.scene.nodeRenderObject.globerenderer;
    renderer.hideelvonpt = yes;
}
