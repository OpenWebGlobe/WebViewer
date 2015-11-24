/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
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
 * @author Benjamin Loesch, benjamin.loesch@fhnw.ch
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
   /** @type {number} */
   this.layerID = -1; //the id of the geometrylayer containing this geometry.
   /** @type {ogPointSprite}*/
   this.ogpointsprite = null;
   /** @type {ogEarthPolyline}*/
   this.ogearthpolyline = null;
   
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

   var scene = this.parent;
   if(options["url"])
   {
      this.loadGeometryFromJSON(options["url"]);
   }
   if(options["jsonobject"])
   {
      this.CreateFromJSONObject(options["jsonobject"]);
   }

   if(options["type"] == "EarthPolyline")
   {
      this.CreateEarthPolyLine(options);
      return;
   }
   else if (options["type"] == "solidcube")
   {
      this.CreateSolidCube(options);
      return;
   }
   else if (options["type"] == "solidgeosphere")
   {
      this.CreateSolidGeosphere(options);
      return;
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

   if(this.ogpointsprite!=null)
   {
      this.ogpointsprite.UnregisterObject();
   }
   else
   {
         for(var j=0;j<this.meshes_og.length;j++)
      {
         var mesh_og = /** @type {ogMeshObject}*/ this.meshes_og[j];
         mesh_og.UnregisterObject();
      }
      this.geometryarray = null;  
   }
 
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


//------------------------------------------------------------------------------
/**
 * @description Sets the postion of the whole geometry
 * @param {number} lng
 * @param  {number} lat
 * @param  {number} elv
 * @param  {number=} yaw
 * @param  {number=} pitch
 * @param  {number=} roll
 */
ogGeometry.prototype.SetPositionWGS84 = function(lng, lat, elv, yaw, pitch, roll)
{
   for(var j=0;j<this.meshes_og.length;j++)
   {
      /**@type {ogMeshObject} */
      var mesh = /**@type {ogMeshObject} */this.meshes_og[j];
      mesh.SetPositionWGS84(lng,lat,elv,yaw,pitch,roll);
   }
}

//------------------------------------------------------------------------------
/**
 * @description Sets the postion of the whole geometry
 * @param {number} lng
 * @param  {number} lat
 * @param  {number} elv
 * @param {Array.<{number}>} quat quaternion paramters qx,qy,qz,qw
 */
ogGeometry.prototype.SetPositionWGS84Quat = function(lng, lat, elv, quat)
{
   for(var j=0;j<this.meshes_og.length;j++)
   {
      /**@type {ogMeshObject} */
      var mesh = /**@type {ogMeshObject} */this.meshes_og[j];
      mesh.SetPositionWGS84Quat(lng,lat,elv,quat);
   }
}

//------------------------------------------------------------------------------
/**
 * @description Sets the orientation
 * @param {number} yaw
 * @param {number} pitch
 * @param {number} roll
 */
ogGeometry.prototype.SetOrientation = function(yaw,pitch,roll)
{
   for(var j=0;j<this.meshes_og.length;j++)
   {
      /**@type {ogMeshObject} */
      var mesh = /**@type {ogMeshObject} */this.meshes_og[j];
      mesh.SetOrientation(yaw,pitch,roll);
   }
}
//------------------------------------------------------------------------------
/**
 * @description Sets the postion of the whole geometry
 * @param {number} scalex the scale-x factor
 * @param {number} scaley the scale-y factor
 * @param {number} scalez the scale-z factor
 */
ogGeometry.prototype.SetScale = function(scalex,scaley,scalez)
{
   for(var j=0;j<this.meshes_og.length;j++)
   {
      /**@type {ogMeshObject} */
      var mesh = /**@type {ogMeshObject} */this.meshes_og[j];
      mesh.SetScale(scalex,scaley,scalez);
   }
}
//------------------------------------------------------------------------------
/**
 * @description hides the geometry
 */
ogGeometry.prototype.Hide = function()
{
   if(this.ogpointsprite != null)
   {
      this.ogpointsprite.Hide();
      
   }
   else
   {
      for(var j=0;j<this.meshes_og.length;j++)
      {
         /**@type {ogMeshObject} */
         var mesh = /**@type {ogMeshObject} */this.meshes_og[j];
         mesh.Hide();
      }
   }

}

//------------------------------------------------------------------------------
/**
 * @description shows the geometry
 */
ogGeometry.prototype.Show = function()
{
   
   if(this.ogpointsprite != null)
   {
      this.ogpointsprite.Show(); 
   }
   else
   {
      for(var j=0;j<this.meshes_og.length;j++)
      {
         /**@type {ogMeshObject} */
         var mesh = /**@type {ogMeshObject} */this.meshes_og[j];
         mesh.Show();
      }
   }
}


//------------------------------------------------------------------------------
/**
 * @description hides the geometry
 */
ogGeometry.prototype.SetHighlightColor = function(r,g,b,a)
{
   if(this.ogpointsprite != null)
   {
      
      
   }
   else
   {
      for(var j=0;j<this.meshes_og.length;j++)
      {
         /**@type {ogMeshObject} */
         var mesh = /**@type {ogMeshObject} */this.meshes_og[j];
         mesh.SetHighlightColor(r,g,b,a);
      }
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
         var jsonobj = goog.json.parse(data);
         this.CreateFromJSONObject(jsonobj);  
      }     
   }    
}

//------------------------------------------------------------------------------
/**
 * @description Load model data from json object
 * @param {Object} jsonobject the json object.
 */
ogGeometry.prototype.CreateFromJSONObject = function(jsonobject)
{
   var mesharray = jsonobject;
   if(jsonobject['Type']=="pointcloud")
   {
      //if there is no indexbuffer -> display the geometry as pointsprite.
      this.options = jsonobject;
      this.ogpointsprite = _CreateObject(OG_OBJECT_POINTSPRITE,this,this.options)
      
      //add to geometry renderer...
      var renderer = this._GetGeometryRenderer();
      this.indexInRendererArray = renderer.AddGeometry(this.ogpointsprite.pointsprite);
   }
   else
   {
      for(var i=0; i<mesharray.length; i++)
      {
         this.options["jsonobject"] = mesharray[i];
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
//------------------------------------------------------------------------------
/**
 * @description Load surface-data from a JSON file.
 * @param {string} url the url to the JSON file.
 */
ogGeometry.prototype.loadGeometryFromJSON = function(url)
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
   
   var me=this;
   this.http.onreadystatechange = function(){me._cbfjsondownload();};
   //this.http.onprogress = function(){me._cbfonprogress();}
   this.http.send();  
}
//------------------------------------------------------------------------------
/**
 * @param {Object} options
 */
ogGeometry.prototype.CreateEarthPolyLine = function(options)
{
   this.ogearthpolyline = _CreateObject(OG_OBJECT_EARTHPOLYLINE,this,this.options)
   //add to geometry renderer...
   var renderer = this._GetGeometryRenderer();
   this.indexInRendererArray = renderer.AddGeometry(this.ogearthpolyline.earthpolyline);
}
//------------------------------------------------------------------------------
/**
 * @param {Object} options
 */
ogGeometry.prototype.CreateSolidCube = function(options)
{
   if (!goog.isDef(options["srs"]))
   {
      options["srs"] = "EPSG:4326"; // default value
   }
   if (!goog.isDef(options["position"]))
   {
      options["position"] = [0,0,0];
   }
   if (!goog.isDef(options["color"]))
   {
      options["color"] = [1,1,1];
   }
   var scene = /** @type ogScene */this.parent;
   /** @type {ogContext} */
   var context =  /** @type ogContext */scene.parent;
   // Get the engine
   /** @type {engine3d} */
   var engine = context.engine;

   /** @type {GeometryRenderer} */
   var renderer = null;

   // test if there is a scenegraph attached
   if (engine.scene)
   {
      if (engine.scene.nodeRenderObject)
      {
         renderer = engine.scene.nodeRenderObject.geometryrenderer;
      }
   }

   if (renderer)
   {
      var cube = new Surface(engine);

      var position = options["position"];
      var length = options["length"];
      var color = options["color"];
      if (options["srs"] == "EPSG:4326")
      {
         cube.SolidCube([0,0,0],[length,length,length],color);
         cube.SetAsNavigationFrame(position[0],position[1],position[2],0,0,0);
         this.indexInRendererArray = renderer.AddGeometry([[cube]]);
      }
      else if (options["srs"] == "cartesian")
      {
         cube.SolidCube(position,[length,length,length],color);
         this.indexInRendererArray = renderer.AddGeometry([[cube]]);
      }

   }

}
//------------------------------------------------------------------------------
/**
 * @param {Object} options
 */
ogGeometry.prototype.CreateSolidGeosphere = function(options)
{
   if (!goog.isDef(options["color"]))
   {
      options["color"] = [1,1,1];
   }

   if (!goog.isDef(options["subdivisions"]))
   {
      options["subdivisions"] = 1;
   }
   var scene = /** @type ogScene */this.parent;
   /** @type {ogContext} */
   var context =  /** @type ogContext */scene.parent;
   // Get the engine
   /** @type {engine3d} */
   var engine = context.engine;

   /** @type {GeometryRenderer} */
   var renderer = null;

   // test if there is a scenegraph attached
   if (engine.scene)
   {
      if (engine.scene.nodeRenderObject)
      {
         renderer = engine.scene.nodeRenderObject.geometryrenderer;
      }
   }

   if (renderer)
   {
      var geosphere = new Surface(engine);

      var color = options["color"];
      var subdiv = options["subdivisions"];
      geosphere.SolidGeosphere(color, subdiv);
      this.indexInRendererArray = renderer.AddGeometry([[geosphere]]);
   }

}
//------------------------------------------------------------------------------





















