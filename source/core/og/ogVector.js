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
goog.require('owg.poly2tri');

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
 * @description Intersect line A0A1 with line B0B1.
 * based on the geometric approach described at
 * http://softsurfer.com/Archive/algorithm_0106/algorithm_0106.htm
 * @param {Array.<number>} A0
 * @param {Array.<number>} A1
 * @param {Array.<number>} B0
 * @param {Array.<number>} B1
 * @return {Object}
 *
 * The returned Object has the following attributes:
 *
 *    parallel :  true if lines are parallel or almost parallel (boolean)
 * valid if parallel == false:
 *    point1:     intersection point or point with shortest distance (array 3 numbers)
 *    point2:     intersection point or point with shortest distance (array 3 numbers)
 *
 * Note: this function should move to "geometryutils.js"
 */
ogVector.prototype._LineLineIntersection = function(A0,A1,B0,B1)
{
   var result = {parallel: false, distance:0, point1 : [0,0,0], point2 : [0,0,0]};
   var u = [ A1[0]-A0[0],  A1[1]-A0[1], A1[2]-A0[2] ];
   var v = [ B1[0]-B0[0],  B1[1]-B0[1], B1[2]-B0[2] ];
   var w = [ A0[0]-B0[0],  A0[1]-B0[1], A0[2]-B0[2] ];
   var a = u[0]*u[0] + u[1]*u[1] + u[2]*u[2];
   var b = u[0]*v[0] + u[1]*v[1] + u[2]*v[2];
   var c = v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
   var d = u[0]*w[0] + u[1]*w[1] + u[2]*w[2];
   var e = v[0]*w[0] + v[1]*w[1] + v[2]*w[2];
   var D = a*c - b*b;
   var s,t;

   if (D < 1e-14) // lines are parallel
   {
      result.parallel = true;
      s = 0.0;
      t = (b>c ? d/b : e/c);
   }
   else
   {
      s = (b*e - c*d) / D;
      t = (a*e - b*d) / D;
   }

   result.point1 = [A0[0] + s*u[0], A0[1] + s*u[1], A0[2] + s*u[2]];
   result.point2 = [B0[0] + t*v[0], B0[1] + t*v[1], B0[2] + t*v[2]];

   return result;
}
//------------------------------------------------------------------------------
/**
 * Append a cuboid to pointlist/indexlist (internally used)
 *
 *    P00       P20
 *     +--------+
 *     |\        \
 *     | \________\ P21
 *     | |      |  |
 * P10 +-|------+ P30
 *      \|       \ |
 *       \________\|
 *      P11       P31
 *
 *
 * @param {number} idx start-index
 * @param P00
 * @param P01
 * @param P21
 * @param P20
 * @param P10
 * @param P11
 * @param P31
 * @param P30
 * @param pointlist
 * @param indexlist
 * @return {number} incremented index
 */
ogVector.prototype._AppendCuboid = function(idx, P00, P01, P21, P20, P10, P11, P31, P30, pointlist, indexlist)
{
   var idx00, idx10, idx20, idx30;
   var idx01, idx11, idx21, idx31;

   pointlist.push(P00[0]); pointlist.push(P00[1]); pointlist.push(P00[2]);
   idx00 = idx; idx++;
   pointlist.push(P10[0]); pointlist.push(P10[1]); pointlist.push(P10[2]);
   idx10 = idx; idx++;
   pointlist.push(P20[0]); pointlist.push(P20[1]); pointlist.push(P20[2]);
   idx20 = idx; idx++;
   pointlist.push(P30[0]); pointlist.push(P30[1]); pointlist.push(P30[2]);
   idx30 = idx; idx++;
   pointlist.push(P01[0]); pointlist.push(P01[1]); pointlist.push(P01[2]);
   idx01 = idx; idx++;
   pointlist.push(P11[0]); pointlist.push(P11[1]); pointlist.push(P11[2]);
   idx11 = idx; idx++;
   pointlist.push(P21[0]); pointlist.push(P21[1]); pointlist.push(P21[2]);
   idx21 = idx; idx++;
   pointlist.push(P31[0]); pointlist.push(P31[1]); pointlist.push(P31[2]);
   idx31 = idx; idx++;

   // Front:
   indexlist.push(idx01); indexlist.push(idx11); indexlist.push(idx21);
   indexlist.push(idx11); indexlist.push(idx31); indexlist.push(idx21);
   // Back:
   indexlist.push(idx00); indexlist.push(idx20); indexlist.push(idx10);
   indexlist.push(idx10); indexlist.push(idx20); indexlist.push(idx30);
   // Left:
   indexlist.push(idx00); indexlist.push(idx10); indexlist.push(idx01);
   indexlist.push(idx10); indexlist.push(idx11); indexlist.push(idx01);
   // Right:
   indexlist.push(idx20); indexlist.push(idx21); indexlist.push(idx31);
   indexlist.push(idx30); indexlist.push(idx20); indexlist.push(idx31);
   // Top:
   indexlist.push(idx00); indexlist.push(idx01); indexlist.push(idx20);
   indexlist.push(idx01); indexlist.push(idx21); indexlist.push(idx20);
   // Bottom:
   indexlist.push(idx10); indexlist.push(idx31); indexlist.push(idx11);
   indexlist.push(idx10); indexlist.push(idx30); indexlist.push(idx31);

   return idx;

}
//------------------------------------------------------------------------------
/**
 * @param {Array.<number>} pointlist
 * @param {Array.<number>} indexlist
 * @return {Surface}
 */
ogVector.prototype._CreateSurface = function(pointlist,indexlist)
{
   /** @type {ObjectJSON} */
   var object = {"VertexSemantic" : "", "Vertices" : null, "IndexSemantic":"", "Indices":null};
   object["VertexSemantic"]  = "p";
   object["IndexSemantic"] = "TRIANGLES";
   object["Vertices"] = pointlist;
   object["Indices"] = indexlist;

   /** @type {engine3d} */
   var engine = this._GetEngine();
   /** @type {Surface} */
   var surface = new Surface(engine);

   surface.CreateFromJSONObject(object, null, null, surface);

   if (this.color.length == 4)
   {
      surface.solidcolor.Set(this.color[0],this.color[1],this.color[2],this.color[3]);
   }
   else if (this.color.length == 3)
   {
      surface.solidcolor.Set(this.color[0],this.color[1],this.color[2],1);
   }

   return surface;
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
                     this.userid = properties['id']; // todo: type check
                  }

                  if (goog.isDef(properties['color']))
                  {

                     this.color = properties['color']; // todo: type check
                  }

                  if (goog.isDef(properties['highlightcolor']))
                  {
                     this.highlightcolor = properties['highlightcolor']; // todo: type check
                  }

                  if (goog.isDef(properties['linewidth'])) // LineString/MultiLineString only..
                  {
                     this.linewidth = properties['linewidth']; // todo: type check
                  }

                  if (goog.isDef(properties['pointsize'])) // Point, Multipoint only...
                  {
                     this.pointsize = properties['pointsize']; // todo: type check
                  }

                  if (goog.isDef(properties['minelv'])) // Point, Multipoint only...
                  {
                     this.minelv = properties['minelv']; // todo: type check
                  }

                  if (goog.isDef(properties['maxelv'])) // Point, Multipoint only...
                  {
                     this.maxelv = properties['maxelv']; // todo: type check
                  }

                  // 2) Parse Geometry

                  if (goog.isDef(geometry['type']))
                  {
                     var geometrytype = geometry['type'];
                     if (geometrytype == "LineString")
                     {
                        var geopairs = [];
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

                        var w = 0.5 * this.linewidth * CARTESIAN_SCALE_INV;

                        var idx = 0;
                        var P0,P1,P2,P3,P4,P5;
                        var P00,P10,P20,P30;
                        var P01,P11,P21,P31;
                        var P40,P41,P50,P51;
                        var nx1, ny1, nz1;
                        var nx2, ny2, nz2;

                        if (geopairs.length == 4)
                        {
                           // Special Case: cuboid
                           P0 = geopairs[0];
                           P1 = geopairs[1];
                           P2 = geopairs[2];
                           P3 = geopairs[3];

                           var ux = P2[0]-P0[0];
                           var uy = P2[1]-P0[1];
                           var uz = P2[2]-P0[2];

                           var vx = P1[0]-P0[0];
                           var vy = P1[1]-P0[1];
                           var vz = P1[2]-P0[2];

                           // cross product n = u x v
                           var nx = uy*vz-uz*vy;
                           var ny = uz*vx-ux*vz;
                           var nz = ux*vy-uy*vx;
                           // normalize n (including cartesian scaled linewidth)
                           var leninv = w/Math.sqrt(nx*nx+ny*ny+nz*nz);
                           nx = nx*leninv;
                           ny = ny*leninv;
                           nz = nz*leninv;

                           P00 = [P0[0]+nx, P0[1]+ny, P0[2]+nz];
                           P10 = [P1[0]+nx, P1[1]+ny, P1[2]+nz];
                           P20 = [P2[0]+nx, P2[1]+ny, P2[2]+nz];
                           P30 = [P3[0]+nx, P3[1]+ny, P3[2]+nz];

                           P01 = [P0[0]-nx, P0[1]-ny, P0[2]-nz];
                           P11 = [P1[0]-nx, P1[1]-ny, P1[2]-nz];
                           P21 = [P2[0]-nx, P2[1]-ny, P2[2]-nz];
                           P31 = [P3[0]-nx, P3[1]-ny, P3[2]-nz];

                           idx = this._AppendCuboid(0, P00, P01, P21, P20, P10, P11, P31, P30, pointlist, indexlist);
                           var smallsurface = this._CreateSurface(pointlist, indexlist);
                           this.surfaces.push(smallsurface);
                        }
                        else if (geopairs.length>=6)
                        {
                           P0 = geopairs[0];
                           P1 = geopairs[1];
                           P2 = geopairs[2];
                           P3 = geopairs[3];
                           P4 = geopairs[4];
                           P5 = geopairs[5];

                           // calculate first normal (Triangle P0, P1, P2)
                           var ux = P2[0]-P0[0];
                           var uy = P2[1]-P0[1];
                           var uz = P2[2]-P0[2];

                           var vx = P1[0]-P0[0];
                           var vy = P1[1]-P0[1];
                           var vz = P1[2]-P0[2];

                           nx1 = uy*vz-uz*vy;
                           ny1 = uz*vx-ux*vz;
                           nz1 = ux*vy-uy*vx;
                           // normalize n (including cartesian scaled linewidth)
                           var leninv = w/Math.sqrt(nx1*nx1+ny1*ny1+nz1*nz1);
                           nx1 = nx1*leninv;
                           ny1 = ny1*leninv;
                           nz1 = nz1*leninv;

                           // The first plane is rectangular and can be calculated now
                           P00 = [P0[0]+nx1, P0[1]+ny1, P0[2]+nz1];
                           P10 = [P1[0]+nx1, P1[1]+ny1, P1[2]+nz1];
                           P01 = [P0[0]-nx1, P0[1]-ny1, P0[2]-nz1];
                           P11 = [P1[0]-nx1, P1[1]-ny1, P1[2]-nz1];

                           for (var j=4;j<geopairs.length;j=j+2)
                           {
                              P4 = geopairs[j];
                              P5 = geopairs[j+1];

                              // calculate second normal (Triangle P2, P3, P4)
                              ux = P4[0]-P2[0];
                              uy = P4[1]-P2[1];
                              uz = P4[2]-P2[2];

                              vx = P3[0]-P2[0];
                              vy = P3[1]-P2[1];
                              vz = P3[2]-P2[2];

                              nx2 = uy*vz-uz*vy;
                              ny2 = uz*vx-ux*vz;
                              nz2 = ux*vy-uy*vx;
                              // normalize n (including cartesian scaled linewidth)
                              leninv = w/Math.sqrt(nx2*nx2+ny2*ny2+nz2*nz2);
                              nx2 = nx2*leninv;
                              ny2 = ny2*leninv;
                              nz2 = nz2*leninv;

                              // calculate P21, P20, P31, P30

                              vx = P3[0]-P1[0];
                              vy = P3[1]-P1[1];
                              vz = P3[2]-P1[2];
                              var l = Math.sqrt(vx*vx+vy*vy+vz*vz);
                              vx /= l; vy /= l; vz /= l;

                              ux = P3[0]-P5[0];
                              uy = P3[1]-P5[1];
                              uz = P3[2]-P5[2];
                              l = Math.sqrt(ux*ux+uy*uy+uz*uz);
                              ux /= l; uy /= l; uz /= l;

                              // temporary points to get parallel line
                              var tP50 = [P5[0]+nx2, P5[1]+ny2,P5[2]+nz2];
                              var tP51 = [P5[0]-nx2, P5[1]-ny2,P5[2]-nz2];
                              var tP40 = [P4[0]+nx2, P4[1]+ny2,P4[2]+nz2];
                              var tP41 = [P4[0]-nx2, P4[1]-ny2,P4[2]-nz2];

                              // Calculate P30:
                              var result_p30 = this._LineLineIntersection(
                                 [P10[0], P10[1], P10[2]],
                                 [P10[0] + vx, P10[1] + vy, P10[2] + vz ],
                                 [tP50[0], tP50[1], tP50[2]],
                                 [tP50[0] + ux, tP50[1] + uy, tP50[2] + vz ]);

                              // Calculate P31
                              var result_p31 = this._LineLineIntersection(
                                 [P11[0], P11[1], P11[2]],
                                 [P11[0] + vx, P11[1] + vy, P11[2] + vz ],
                                 [tP51[0], tP51[1], tP50[2]],
                                 [tP51[0] + ux, tP51[1] + uy, tP51[2] + vz ]);

                              // Calculate P20
                              var result_p20 = this._LineLineIntersection(
                                 [P00[0], P00[1], P00[2]],
                                 [P00[0] + vx, P00[1] + vy, P00[2] + vz ],
                                 [tP40[0], tP40[1], tP40[2]],
                                 [tP40[0] + ux, tP40[1] + uy, tP40[2] + vz ]);

                              // Calculate P21
                              var result_p21 = this._LineLineIntersection(
                                 [P01[0], P01[1], P01[2]],
                                 [P01[0] + vx, P01[1] + vy, P01[2] + vz ],
                                 [tP41[0], tP41[1], tP41[2]],
                                 [tP41[0] + ux, tP41[1] + uy, tP41[2] + vz ]);

                              if (!result_p30.parallel && !result_p31.parallel &&
                                  !result_p20.parallel && !result_p21.parallel)
                              {
                                 P30 = [result_p30.point1[0], result_p30.point1[1], result_p30.point1[2]];
                                 P31 = [result_p31.point1[0], result_p31.point1[1], result_p31.point1[2]];
                                 P20 = [result_p20.point1[0], result_p20.point1[1], result_p20.point1[2]];
                                 P21 = [result_p21.point1[0], result_p21.point1[1], result_p21.point1[2]];
                              }
                              else
                              {
                                 P30 = [P3[0] + nx1, P3[1] + ny1, P3[2] + nz1];
                                 P31 = [P3[0] - nx1, P3[1] - ny1, P3[2] - nz1];
                                 P20 = [P2[0] + nx1, P2[1] + ny1, P2[2] + nz1];
                                 P21 = [P2[0] - nx1, P2[1] - ny1, P2[2] - nz1];
                              }

                              idx = this._AppendCuboid(0, P00, P01, P21, P20, P10, P11, P31, P30, pointlist, indexlist);
                              var surface = this._CreateSurface(pointlist, indexlist);
                              this.surfaces.push(surface);
                              pointlist = []; indexlist = [];

                              // fwd
                              nx1 = nx2;
                              ny1 = ny2;
                              nz1 = nz2;
                              P0 = P2;
                              P1 = P3;
                              P2 = P4;
                              P3 = P5;
                              P10 = P30;
                              P11 = P31;
                              P00 = P20;
                              P01 = P21;
                           }

                           // the last plane is rectangular and must be calculated now:
                           // create last shape

                           // calculate second normal (Triangle P2, P3, P4)
                           ux = P4[0]-P2[0];
                           uy = P4[1]-P2[1];
                           uz = P4[2]-P2[2];

                           vx = P3[0]-P2[0];
                           vy = P3[1]-P2[1];
                           vz = P3[2]-P2[2];

                           nx2 = uy*vz-uz*vy;
                           ny2 = uz*vx-ux*vz;
                           nz2 = ux*vy-uy*vx;
                           // normalize n (including cartesian scaled linewidth)
                           leninv = w/Math.sqrt(nx2*nx2+ny2*ny2+nz2*nz2);
                           nx2 = nx2*leninv;
                           ny2 = ny2*leninv;
                           nz2 = nz2*leninv;

                           P50 = [P5[0]+nx1, P5[1]+ny1, P5[2]+nz1];
                           P51 = [P5[0]-nx1, P5[1]-ny1, P5[2]-nz1];
                           P40 = [P4[0]+nx1, P4[1]+ny1, P4[2]+nz1];
                           P41 = [P4[0]-nx1, P4[1]-ny1, P4[2]-nz1];

                           idx = this._AppendCuboid(0, P20, P21, P41, P40, P30, P31, P51, P50, pointlist, indexlist);
                           var endsurface = this._CreateSurface(pointlist, indexlist);
                           this.surfaces.push(endsurface);

                        }

                        bCreated = true;

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























