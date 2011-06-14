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
   /** @type {string} */
   this.jsonUrl = "";
   /** @type {?function(number)} */
   this.cbr = null;
   /** @type {?function(number)} */
   this.cbf = null;
   /** @type {Object} */
   this.options = null;
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
   this.options = options;
   if(options["type"] == "MESH")
   {
      var scene = this.parent;
      if(options["url"])
      {
         this.loadGeometryFromJSON(options["url"],null,null);
      }  
   }
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


//------------------------------------------------------------------------------
/** 
 * @description download callback
 * @ignore
 */
ogGeometry.prototype._cbfjsondownload = function()
{
   if (this.http.readyState==4)
   {
      if(this.http.status==404)
      {
         if (this.cbf)
         {
            this.cbf(this.id);
         }
      }
      else
      {
         var data=this.http.responseText;      
         var mesharray=/** @type {ObjectJSON} */ goog.json.parse(data);
         
         for(var i=0; i<mesharray.length; i++)
         {
            this.options.jsonobject = mesharray[i];
            var mesh = _CreateObject(OG_OBJECT_MESH, this, this.options); 
            this.meshes_og.push(mesh)
            this.meshes.push(mesh.GetSurfaceArray());
         }
         if(this.cbr)
         {
            this.cbr(this.id);
         }
            
         //add to geometry renderer...
         var renderer = this._GetGeometryRenderer();
         this.indexInRendererArray = renderer.AddGeometry(this.meshes);
      }     
   }    
}

//------------------------------------------------------------------------------
/**
 * @description Load surface-data from a JSON file.
 * @param {string} url the url to the JSON file.
 * @param {?function(number)} opt_callbackready optional function called when surface finished download
 * @param {?function(number)} opt_callbackfailed optional function called when surface failed download
 */
ogGeometry.prototype.loadGeometryFromJSON = function(url, opt_callbackready, opt_callbackfailed)
{
   if(url == null) 
   {
      alert("invalid json-url");
      return;
   }  
   this.jsonUrl=url;
      
   this.http=new window.XMLHttpRequest();
   this.http.open("GET",this.jsonUrl,true);
   //this.http.setRequestHeader("Cache-Control", "public");
   
   this.cbr = opt_callbackready;
   this.cbf = opt_callbackfailed;
   
   var me=this;
   this.http.onreadystatechange = function(){me._cbfjsondownload();};
   this.http.send();  
}







