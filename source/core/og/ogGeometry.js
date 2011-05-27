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

goog.provide('owg.ogGeometry');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');

//------------------------------------------------------------------------------
/**
 * @typedef {{
 *     url     : Array.<string>,
 *     layer   : string,
 *     service : string,
 *     transparency : number,
 *     maxlod : number
 * }}
 */
var GeometryOptions;
//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {ogObject} 
 * @description Geometry class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogGeometry()
{
   /** @type {string} */
   this.name = "ogGeometry";
   /** @type {number} */
   this.type = OG_OBJECT_GEOMETRY;
   this.meshes = [];
}
//------------------------------------------------------------------------------
/** @extends {ogObject} */
ogGeometry.prototype = new ogObject();

//------------------------------------------------------------------------------
/**
* @description parse options
* @param {GeometryOptions} options
* @ignore
*/
ogGeometry.prototype.ParseOptions = function(options)
{  
   if(options["type"] == "MESH")
   {
      var scene = this.parent;
      var ogMesh = _CreateObject(OG_OBJECT_MESH, scene, options); //to discuss: müssen diese objecte auch über diese globale CreateObject funktion erzeugt werden?
      this.meshes.push(ogMesh)
   }
   
   //add to geometry renderer...
   var renderer = this._GetGeometryRenderer();
   renderer.AddGeometry(this); 
}

//------------------------------------------------------------------------------
/**
* @description parse options
* @param {GeometryOptions} options
* @ignore
*/
ogGeometry.prototype.Add= function(options)
{  
   if(options["type"] == "MESH")
   {
      var scene = this.parent;
      var ogMesh = _CreateObject(OG_OBJECT_MESH, scene, options); //to discuss: müssen diese objecte auch über diese globale CreateObject funktion erzeugt werden?
      this.meshes.push(ogMesh)
   }
}

//------------------------------------------------------------------------------
/**
 * will be called from geometryrenderer. to discuss.
 *
 */
ogGeometry.prototype.Draw = function()
{
   for (var i=0;i<this.meshes.length;i++)
   {
      this.meshes[i].Draw();
   }
}


//------------------------------------------------------------------------------
/**
 * @description Called when object is destroyed. Never call manually.
 * @ignore
 */
ogGeometry.prototype._OnDestroy = function()
{
   
   //free all memory
}


//------------------------------------------------------------------------------
/**
 *  @returns {GeometryRenderer} the geometry-renderer
 */
ogGeometry.prototype._GetGeometryRenderer = function()
{
   /** @type {PoiRenderer} */
   var renderer = null;
   /** @type {ogScene} */
   var scene = /** @type ogScene */this.parent;
   /** @type {ogContext} */
   var context =  /** @type ogContext */scene.parent;
   // Get the engine
   /** @type {engine3d} */
   var engine = context.engine;
   
   // test if there is a scenegraph attached
   if (engine.scene)
   {
      if (engine.scene.nodeRenderObject)
      {
         renderer = engine.scene.nodeRenderObject.geometryrenderer;  
      }
   }
   return renderer;
}





