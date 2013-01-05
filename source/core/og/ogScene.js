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

goog.provide('owg.ogScene');

goog.require('owg.ObjectDefs');

goog.require('owg.ogObject');
goog.require('owg.ogWorld');
goog.require('owg.ogCamera');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {ogObject} 
 * @description Scene class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogScene()
{
   /** @type {string} */
   this.name = "ogScene";
   /** @type {number} */
   this.type = OG_OBJECT_SCENE;
   /** @type {ogWorld} */
   this.world = null;
   /** @type {ogCamera} */
   this.activecamera = null;
   /** @type {Array.<ogCamera>}*/
   this.cameras = [];
   /** @type {number} */
   this.scenetype = OG_SCENE_3D_ELLIPSOID_WGS84;
   /** @type {boolean} */
   this.rendertotexture = true;
   /** @type {boolean} */
   this.shownavigation = true;
}
//------------------------------------------------------------------------------
ogScene.prototype = new ogObject();
//------------------------------------------------------------------------------
/**
* @description parse options
* @param {Object} options
* @ignore
*/
ogScene.prototype.ParseOptions = function(options)
{
   if (options == null)
   {
      goog.debug.Logger.getLogger('owg.ogScene').warning("** ERROR: no options for scene creation!");
      return;  // no options!!
   }
   
   if (goog.isDef(options["type"]))
   {
      this.scenetype = options["type"];
   }

   if (goog.isDef(options["rendertotexture"]))
   {
      this.rendertotexture = options["rendertotexture"];
   }
   
   if (goog.isDef(options["shownavigation"])) 
   {
   	this.shownavigation = options["shownavigation"];
   }
}
//------------------------------------------------------------------------------
/**
* @description Pick globe
* @param {number} mx x-coord of mouse
* @param {number} my y-coord of mouse
*/
ogScene.prototype.Pick = function(mx, my)
{
   /** @type {ogContext} */
   var context = /** @type ogContext */this.parent;
   /** @type {Object} */
   var pickresult = {};
   context.engine.PickGlobe(mx, my, pickresult);
   
   var result = new Array(4);
   result[0] = pickresult["hit"];
   result[1] = pickresult["lng"];
   result[2] = pickresult["lat"];
   result[3] = pickresult["elv"];
   result[4] = pickresult["x"];
   result[5] = pickresult["y"];
   result[6] = pickresult["z"];
   
   return result;
}
//------------------------------------------------------------------------------
/**
* @description Pick poi's
* @param {number} mx x-coord of mouse
* @param {number} my y-coord of mouse
*/
ogScene.prototype.PickPOI = function(mx, my)
{
   /** @type {ogContext} */
   var context = /** @type ogContext */this.parent;
   /** @type {Poi} */
   var poi = context.engine.PickPOI(mx, my);
   
   if (poi)
   {
      return poi.ogpoi.id;
   }
   
   return -1;
}
//------------------------------------------------------------------------------
/**
* @description Pick surfaces
* @param {number} mx x-coord of mouse
* @param {number} my y-coord of mouse
*/
ogScene.prototype.PickSurface = function(mx, my)
{
  /** @type {ogContext} */
   var context = /** @type ogContext */this.parent;
   
   return context.engine.PickSurface(mx, my); //returns the surface id.
}
//------------------------------------------------------------------------------
/**
* @description Pick billboards
* @param {number} mx x-coord of mouse
* @param {number} my y-coord of mouse
*/
ogScene.prototype.PickBillboard = function(mx, my)
{
  /** @type {ogContext} */
   var context = /** @type ogContext */this.parent;
   return context.engine.PickBillboard(mx, my); //returns the billboard_id and the normalized coordinate on the billboard.
}
//------------------------------------------------------------------------------
/**
 * @description sets a new active camera.
 * 
 */
ogScene.prototype.SetActiveCamera = function(camera_id)
{
   /** @type {ogCamera} */
   var cam = /** @type {ogCamera} */ _GetObjectFromId(camera_id);
   if (cam && cam.type == OG_OBJECT_CAMERA)
   {
      cam.UpdateNavigationNode();
   }
   this.activecamera = cam;
   
}
//------------------------------------------------------------------------------
/**
 * @description appends the new camera to the camera array.
 * 
 */
ogScene.prototype.AddCamera = function(camera)
{
   this.cameras.push(camera);
}
//------------------------------------------------------------------------------
/**
 *
 * @param {number} navigationmode
 * @param {Object} opt_options
 */
ogScene.prototype.SetNavigationMode = function(navigationmode, opt_options)
{
   /** @type {ogContext} */
   var context = /** @type ogContext */this.parent;
   /** @type {engine3d} */
   var engine = context.engine;

   if (navigationmode == OG_NAVIGATIONMODE_GLOBE)
   {
      opt_options["type"] = "globe";
   }
   else if (navigationmode == OG_NAVIGATIONMODE_FLIGHT)
   {
      opt_options["type"] = "fly";
   }
   else if (navigationmode == OG_NAVIGATIONMODE_CONSTRAINED)
   {
      opt_options["type"] = "constrained";
   }
   else if (navigationmode == OG_NAVIGATIONMODE_DYNAMIC)
   {
      opt_options["type"] = "dynamic";
   }
   else
   {
      return;
   }

   engine.scene.SetNavigationMode(opt_options);
}
//------------------------------------------------------------------------------
/**
 * @param {boolean} hide
 */
ogScene.prototype.HideLogo = function(hide)
{
   /** @type {ogContext} */
   var context = /** @type ogContext */this.parent;

   context.engine.scene.nodeLogos.HideLogo(hide);
}

