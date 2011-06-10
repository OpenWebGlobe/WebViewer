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
   /** @type {?Array.<{ogMeshObject}>}*/
   this.meshes_og = [];
   /** @type {?Array.<Array.<{Mesh}>>}*/
   this.meshes = [];
   /**@type {number} */
   this.indexInRendererArray = -1;
   
   /** @type {boolean} */
   this.hide = false;
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
      var mesh = _CreateObject(OG_OBJECT_MESH, this, options); 
      this.meshes_og.push(mesh)
      this.meshes.push(mesh.GetSurfaceArray());
   }
   
   //add to geometry renderer...
   var renderer = this._GetGeometryRenderer();
   this.indexInRendererArray = renderer.AddGeometry(this.meshes);
   
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
      var mesh = _CreateObject(OG_OBJECT_MESH, this, options); 
      this.meshes_og.push(mesh)
      this.meshes.push(mesh.GetSurfaceArray());
   }
}



//------------------------------------------------------------------------------
/**
 * @description Called when object is destroyed. Never call manually.
 * @ignore
 */
ogGeometry.prototype._OnDestroy = function()
{
   var renderer = this._GetGeometryRenderer();
   renderer.RemoveGeometry(this.indexInRendererArray);

   for(var j=0;j<this.meshes.length;j++)
   {
      var surfaces = this.meshes[j];
      for(var k=0; k<surfaces.length;k++)
      {
         /**@type {Surface} */
         var surface = /**@type {Surface}*/surfaces[k];
         surface.Destroy();
      } 
   }
   this.geometryarray = null;   
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
//------------------------------------------------------------------------------
/**
* @description gets the number of meshes
* @returns {number}
*/
ogGeometry.prototype.GetNumMeshes = function()
{
   return this.meshes_og.length;
}


//------------------------------------------------------------------------------
/**
* @description gets the number of meshes
* @returns {number}
*/
ogGeometry.prototype.GetMeshAt = function(index)
{
   return this.meshes_og[index].id;
}

/**
 * @description hides the geometry
 */
ogGeometry.prototype.Hide = function()
{
   for(var j=0;j<this.meshes_og.length;j++)
   {
      /**@type {ogMeshObject} */
      var mesh = /**@type {ogMeshObject} */this.meshes_og[j];
      mesh.Hide();
   }

}


/**
 * @description shows the geometry
 */
ogGeometry.prototype.Show = function()
{
   for(var j=0;j<this.meshes_og.length;j++)
   {
      /**@type {ogMeshObject} */
      var mesh = /**@type {ogMeshObject} */this.meshes_og[j];
      mesh.Show();
   }
}







