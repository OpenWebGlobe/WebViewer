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
 #                              (c) 2010-2012 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/

goog.provide('owg.ogVector');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');
goog.require('owg.Surface');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {ogObject}
 * @description Vector class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogVector()
{
   /** @type {string} */
   this.name = "ogGeometry";
   /** @type {number} */
   this.type = OG_OBJECT_GEOMETRY;
   /** @type {string} */
   this.jsonUrl = "";
   /** @type {?function(number)} */
   this.cbr = null;
   /** @type {?function(number)} */
   this.cbf = null;
   /** @type {Object} */
   this.options = null;
   /** @type {Array.<Surface>}*/
   this.surfaces = [];
   /**@type {number} */
   this.indexInRendererArray = -1;
   /** @type {number} */
   this.layerID = -1; //the id of the vector layer containing this geometry.
   /** @type {Array.<number>} */
   this.color = [1,1,1,1];
   /** @type {Array.<number>} */
   this.highlightcolor = [1,1,1,1];
   /** @type {string} */
   this.userid = "unknown";
   /** @type {number} */
   this.linewidth = 10; // in meters
   /** @type {number} */
   this.pointsize = 10; // in meters
   /** @type {number} */
   this.minelv = -1000;
   /** @type {number} */
   this.maxelv = 9000;
}
//------------------------------------------------------------------------------
/** @extends {ogObject} */
ogVector.prototype = new ogObject();

//------------------------------------------------------------------------------
/**
 * @description parse options
 * @param {Object} options
 * @ignore
 */
ogVector.prototype.ParseOptions = function(options)
{
   this.options = options;

   if(options["url"])
   {
      if (options["type"] == "GeoJSON")
      {
         this.LoadGeoJSON(options["url"]);
      }
   }

}
//------------------------------------------------------------------------------
/**
 * @description Called when object is destroyed. Never call manually.
 * @ignore
 */
ogVector.prototype._OnDestroy = function()
{
   var renderer = this._GetVectorRenderer();
   renderer.RemoveVector(this.indexInRendererArray);
}
//------------------------------------------------------------------------------
/**
 *  @returns {VectorRenderer} the geometry-renderer
 */
ogVector.prototype._GetVectorRenderer = function()
{
   /** @type {VectorRenderer} */
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
         renderer = engine.scene.nodeRenderObject.vectorrenderer;
      }
   }
   return renderer;
}
//------------------------------------------------------------------------------
/**
 * @description retrieve Engine
 * @return {engine3d}
 */
ogVector.prototype._GetEngine = function()
{
   /** @type {VectorRenderer} */
   var renderer = null;
   /** @type {ogScene} */
   var scene = /** @type ogScene */this.parent;
   /** @type {ogContext} */
   var context =  /** @type ogContext */scene.parent;
   // Get the engine
   /** @type {engine3d} */
   var engine = context.engine;

   return engine;
}
//------------------------------------------------------------------------------
/**
 * @description hides the geometry
 */
ogVector.prototype.Hide = function()
{


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
 * @description download callback
 * @ignore
 */
ogVector.prototype._cbfjsondownload = function()
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
ogVector.prototype.CreateFromJSONObject = function(jsonobject)
{
   ogLog("CreateFromJSONObject");
   var gc = new GeoCoord();
   var cart0 = [0,0,0];
   var cart1 = [0,0,0];
   var bCreated = false;

   if(jsonobject['type']=="FeatureCollection")
   {
      ogLog("[GeoJSON Parser] type = FeatureCollection");
      if (goog.isDef(jsonobject['features']))
      {
         var feature = jsonobject['features'];
         var numFeatures = feature.length;
         ogLog("[GeoJSON Parser] numFeatures:" + numFeatures);
         for (var i=0;i<numFeatures;i++)
         {
            if (goog.isDef(feature[i]['type']) && feature[i]['type'] == "Feature")
            {
               if (goog.isDef(feature[i]['properties']) && goog.isDef(feature[i]['geometry']))
               {
                  var properties = feature[i]['properties'];
                  var geometry = feature[i]['geometry'];

                  // 1) read optional properties
                  if (goog.isDef(properties['id']))
                  {
                     ogLog("[GeoJSON Parser] Found user property id=" + properties['id']);
                     this.userid = properties['id']; // todo: type check
                  }

                  if (goog.isDef(properties['color']))
                  {
                     ogLog("[GeoJSON Parser] Found user property color");
                     this.color = properties['color']; // todo: type check
                  }

                  if (goog.isDef(properties['highlightcolor']))
                  {
                     ogLog("[GeoJSON Parser] Found user property highlightcolor");
                     this.highlightcolor = properties['highlightcolor']; // todo: type check
                  }

                  if (goog.isDef(properties['linewidth'])) // LineString/MultiLineString only..
                  {
                     ogLog("[GeoJSON Parser] Found user property linewidth");
                     this.linewidth = properties['linewidth']; // todo: type check
                  }

                  if (goog.isDef(properties['pointsize'])) // Point, Multipoint only...
                  {
                     ogLog("[GeoJSON Parser] Found user property pointsize");
                     this.pointsize = properties['pointsize']; // todo: type check
                  }

                  // 2) Parse Geometry

                  if (goog.isDef(geometry['type']))
                  {
                     var geometrytype = geometry['type'];
                     if (geometrytype == "LineString")
                     {
                        var geopairs = [];
                        var geopairsrev = [];
                        if (goog.isDef(geometry['coordinates'] && goog.isArray(geometry['coordinates'])))
                        {
                           var coords = geometry['coordinates'];
                           var numcoords = coords.length;
                           if (numcoords > 1)
                           {
                              for (var j=0;j<numcoords;j++)
                              {
                                 var lng = coords[j][0];
                                 var lat = coords[j][1];

                                 gc.Set(lng, lat, this.maxelv);
                                 gc.ToCartesian(cart0);
                                 gc.Set(lng, lat, this.minelv);
                                 gc.ToCartesian(cart1);

                                 geopairs.push([cart0[0], cart0[1], cart0[2]]);
                                 geopairs.push([cart1[0], cart1[1], cart1[2]]);
                              }

                           }
                        }

                        var indexlist = [];
                        var pointlist = [];
                        if (geopairs.length >=2)
                        {
                           var idx = 0;

                           // todo: extrude
                           for (var j=0;j<geopairs.length;j++)
                           {
                              var pt = geopairs[j]; indexlist.push(idx); idx++;
                              pointlist.push(pt[0]); pointlist.push(pt[1]); pointlist.push(pt[2]);
                           }

                           /** @type {ObjectJSON} */
                           var object = {"VertexSemantic" : "", "Vertices" : null, "IndexSemantic":"", "Indices":null};
                           object["VertexSemantic"]  = "p";
                           object["IndexSemantic"] = "TRIANGLESTRIP";
                           object["Vertices"] = pointlist;
                           object["Indices"] = indexlist;

                           var engine = this._GetEngine();
                           var surface = new Surface(engine);

                           surface.CreateFromJSONObject(object, null, null, surface);
                           //surface.SolidCube([0,0.06,0],[2,0.002,2],[1,1,1,1]);

                           this.surfaces.push(surface);

                           bCreated = true;
                        }
                     }
                     else if (geometrytype == "MultiLineString")
                     {
                        ogError("MultiLineString is not yet supported")
                     }
                     else if (geometrytype == "Polygon")
                     {
                        ogError("Polygon is not yet supported")
                     }
                     else if (geometrytype == "MultiPolygon")
                     {
                        ogError("MultiPolygon is not yet supported")
                     }
                     else if (geometrytype == "Point")
                     {
                        ogError("Point is not yet supported")
                     }
                     else if (geometrytype == "MultiPoint")
                     {
                        ogError("MultiPoint is not yet supported")
                     }
                  }
               }
            }
         }
      }
   }
   else
   {
      // not yet supported...
   }

   if (bCreated)
   {
      var renderer = this._GetVectorRenderer();
      this.indexInRendererArray = renderer.AddVector(this.surfaces);
   }
}

//------------------------------------------------------------------------------
/**
 * @description Load surface-data from a JSON file.
 * @param {string} url the url to the JSON file.
 */
ogVector.prototype.LoadGeoJSON = function(url)
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























