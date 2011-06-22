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

goog.provide('owg.GlobeRenderer');

goog.require('goog.debug.Logger');
goog.require('owg.GlobeCache');
goog.require('owg.MercatorQuadtree');
goog.require('owg.OSMImageLayer');
goog.require('owg.ViewFrustum');
goog.require('owg.i3dImageLayer');
goog.require('owg.owgImageLayer');
goog.require('owg.i3dElevationLayer');

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
var ImageLayerOptions;
//------------------------------------------------------------------------------
/**
 * @typedef {{
 *     url     : Array.<string>,
 *     layer   : string,
 *     service : string,
 *     maxlod : number
 * }}
 */
var ElevationLayerOptions;
//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Rendering the virtual globe...
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function GlobeRenderer(engine)
{
   /** @type {engine3d} */
   this.engine = engine;
   /** @type {Array.<ImageLayer>} */
   this.imagelayerlist = new Array();
   /** @type {Array.<ElevationLayer>} */
   this.elevationlayerlist = new Array();

   this.quadtree = new MercatorQuadtree();
   /** @type {number} */
   this.cachesize = 1000;
   /** @type {GlobeCache} */
   this.globecache = null;
   /** @type {Array} */
   this.lstFrustum = [];
   /** @type {number} */
   this.lastalt = 0;
   
   /** @type {Object} */
   this.iterator = new Object();
   /** @type {number} */
   this.iterator.cnt = 0;
   
   this.cameraposition = null;
   /** @type {number} */
   this.maxlod = 0;
   /** @type {number} */
   this.quality = 0.75; // quality parameter, reduce for lower quality
   
   // current view frustum (for view frustum culling)
   
   this.frustum = new ViewFrustum();
   this.vDir = new Array(3);
   
   this.matPick = new mat4(); // stored mvp matrix for picking
}

//------------------------------------------------------------------------------
/**
 * @description Add an image layer
 * Option is a Javascript Object with the following keys:
 * 
 *    url: ARRAY of urls (it it always an array, even if there is only 1 url)
 *    layer: name of layer
 *    service: i3d for i3d tile layout (deprecated)
 *             osm for OpenStreetMap tile layout
 *             owg for OpenWebGlobe tile layout (default)
 *    
 *  Example:
 *    var imglayer = 
 *    {
 *        url     : ["http://www.openwebglobe.org/data/img"],
 *        layer   : "World500",
 *        service : "i3d"
 *    }; 
 * 
 *    globerenderer.AddImageLayer(imglayer);
 *
 *  @param {ImageLayerOptions} options
 *  @returns index of array where this image layer is placed, or -1 on failure 
 *  
 */
GlobeRenderer.prototype.AddImageLayer = function(options)
{
   /** @type {number} */
   var index = -1;
   
   if (options["service"] == "i3d")
   {
      // i3d tile service
      if (options["url"] && options["layer"])
      {
         if (options["url"].length>0)
         {
            /** @type {string} */
            var url = options["url"][0];
            /** @type {string} */
            var layer = options["layer"];
            
            // Create i3d layer:
            var imgLayer = new i3dImageLayer();
            imgLayer.Setup(url, layer, options["transparency"]);
            index = this.imagelayerlist.length;
            this.imagelayerlist.push(imgLayer);
            this._UpdateLayers();
         }
      }
   }
   else if (options["service"] == "osm")
   {
      if (options["url"] && options["url"].length>0)
      {
         var imgLayer = new OSMImageLayer();
         imgLayer.Setup(options["url"]);
         index = this.imagelayerlist.length;
         this.imagelayerlist.push(imgLayer);
         this._UpdateLayers(); 
      }
   }
   else if (options["service"] == "owg")
   {
      if (options["url"] && options["url"].length>0)
      {
         var layer = options["layer"];
         var imgLayer = new owgImageLayer();
         imgLayer.Setup(options["url"], layer, options["transparency"]);
         index = this.imagelayerlist.length;
         this.imagelayerlist.push(imgLayer);
         this._UpdateLayers(); 
      }
   }

   return index;
}

//------------------------------------------------------------------------------
/**
 * @description Add an elevation layer
 * Option is a Javascript Object with the following keys:
 * 
 *    url: ARRAY of urls (it it always an array, even if there is only 1 url)
 *    layer: name of layer
 *    service: i3d for i3d tile layout
 *    
 *  Example:
 *    var o = 
 *    {
 *        url     : ["http://www.openwebglobe.org/data/elv"],
 *        layer   : "SRTM",
 *        service : "i3d"
 *    }; 
 * 
 *    globerenderer.AddElevationLayer(o);
 *    
 *  @param {ElevationLayerOptions} options
 *  @returns index of array where this elevation layer is placed, or -1 on failure
 *  
 */
GlobeRenderer.prototype.AddElevationLayer = function(options)
{
   var index = -1;
   if (options["service"] == "i3d")
   {
      // i3d elevation tile service
      if (options["url"] && options["layer"])
      {
         if (options["url"].length>0)
         {
            var url = options["url"][0];
            var layer = options["layer"];
             
            // Create i3d layer:
            var elvLayer = new i3dElevationLayer();
            elvLayer.Setup(url, layer);
            index = this.elevationlayerlist.length;
            this.elevationlayerlist.push(elvLayer);
            this._UpdateLayers();
         }
      }
   }
   
   return index;
}

//------------------------------------------------------------------------------
/**
 * @description Remove image layer at specified index
 * @param {number} index the index of the elevation layer to be removed
 */
GlobeRenderer.prototype.RemoveImageLayer = function(index)
{
   if (index<0 || index>=this.imagelayerlist.length)
   {
      return; // wrong index!!
   }
   
   this.imagelayerlist.splice(index, 1);
   this._UpdateLayers();
}

//------------------------------------------------------------------------------
/**
 * @description Remove elevation layer at specified index
 * @param {number} index the index of the elevation layer to be removed
 */
GlobeRenderer.prototype.RemoveElevationLayer = function(index)
{
   if (index<0 || index>=this.elevationlayerlist.length)
   {
      return; // wrong index!!
   }
   
   this.elevationlayerlist.splice(index, 1);
   this._UpdateLayers();
}
//------------------------------------------------------------------------------
/**
 * @description Swap order of image layers
 * @param {number} index1
 * @param {number} index2
 */
GlobeRenderer.prototype.SwapImageLayers = function(index1, index2)
{
   if (index1 <0 || index2<0 || index1>=this.elevationlayerlist.length || index2>=this.elevationlayerlist.length)
   {
      return; // wrong index!!
   }
   
   var tmp = this.elevationlayerlist[index1];
   this.elevationlayerlist[index1] = this.elevationlayerlist[index2];
   this.elevationlayerlist[index2] = tmp;
   this._UpdateLayers();
}
//------------------------------------------------------------------------------
/**
 * @description Swap order of image layers
 * @param {number} index1
 * @param {number} index2
 */
GlobeRenderer.prototype.SwapElevationLayers = function(index1, index2)
{
   if (index1 <0 || index2<0 || index1>=this.imagelayerlist.length || index2>=this.imagelayerlist.length)
   {
      return; // wrong index!!
   }
   
   var tmp = this.imagelayerlist[index1];
   this.imagelayerlist[index1] = this.imagelayerlist[index2];
   this.imagelayerlist[index2] = tmp;
   this._UpdateLayers();
}
//------------------------------------------------------------------------------
/**
 * @description update layers, this is called when layers change.
 * @ignore
 */
GlobeRenderer.prototype._UpdateLayers = function()
{ 
   // update layers by creating a new globe cache: The old cache will be deleted
   var cachesize = 1000;
   if (this.globecache)
   {
      this.globecache.Destroy();  // free memory of old cache, especally GPU memory!
      this.globecache = null;
   }
   this.globecache = new GlobeCache(this.engine, this.imagelayerlist, this.elevationlayerlist, this.quadtree, this.cachesize);
}

//------------------------------------------------------------------------------
/**
 * @description Render function
 */
GlobeRenderer.prototype.Render = function(vCameraPosition, matModelViewProjection)
{
   this.matPick.CopyFrom(matModelViewProjection);  // copy last mvp for pick-event
   
   this.frustum.Update(matModelViewProjection);
   this.cameraposition = vCameraPosition;
   
   // before rendering make sure all layers are available
   if (!this.globecache) {return;}
   if (!this.globecache.IsReady()) {return;}
   
   this.maxlod = this.globecache.GetMaxLod();
   
   var tb0 = this.globecache.RequestBlock("0");
   var tb1 = this.globecache.RequestBlock("1");
   var tb2 = this.globecache.RequestBlock("2");
   var tb3 = this.globecache.RequestBlock("3");
     
   if (!tb0.IsAvailable() || 
       !tb1.IsAvailable() ||
       !tb2.IsAvailable() ||
       !tb3.IsAvailable())
   {
      return; 
   }  
   
   this.lstFrustum = []; 
   this.lstFrustum.push(tb0);
   this.lstFrustum.push(tb1);
   this.lstFrustum.push(tb2);
   this.lstFrustum.push(tb3);
   
   this._Divide();  // Subdivide Planet
   this._Optimize(); // Optimize Planet: Remove Hidden Tiles!
   
   
   for (var i=0;i<this.lstFrustum.length;i++)
   {
      this.lstFrustum[i].Render();
   }
   
   
   // GeneratePoles();
}
//------------------------------------------------------------------------------


GlobeRenderer.prototype._Divide = function()
{
   this.iterator.cnt = 0;
   while (this.iterator.cnt != this.lstFrustum.length)
   {
      this._SubDivide();
   }
}

//------------------------------------------------------------------------------
GlobeRenderer.prototype._SubDivide = function()
{
   var i = this.iterator.cnt;
   if (this.lstFrustum[i].IsAvailable())
   {
      if (this._CalcErrorMetric(i))
      {
         var quadcode = this.lstFrustum[i].quadcode;
         var tb0 = this.globecache.RequestBlock(quadcode+"0");
         var tb1 = this.globecache.RequestBlock(quadcode+"1");
         var tb2 = this.globecache.RequestBlock(quadcode+"2");
         var tb3 = this.globecache.RequestBlock(quadcode+"3");
         
         if (tb0.IsAvailable() &&
             tb1.IsAvailable() && 
             tb2.IsAvailable() && 
             tb3.IsAvailable())
         {
            this.lstFrustum.splice(i, 1);
            this.lstFrustum.push(tb0);
            this.lstFrustum.push(tb1);
            this.lstFrustum.push(tb2);
            this.lstFrustum.push(tb3);
            return;
         }
      }
   }  
   
   this.iterator.cnt++;
}

var SURFACE_NORMAL_THRESHOLD = -0.9;
//------------------------------------------------------------------------------
GlobeRenderer.prototype._CalcErrorMetric = function(i)
{
   var min_depth = 3;
   var max_depth = this.maxlod; // max lod of dataset
   
   var bVisible = true;
   var tb = this.lstFrustum[i]; // terrainblock 

   var nDepth = tb.quadcode.length;
   
   if (nDepth>max_depth)
   {
      return false;
   }
   
   if (nDepth<min_depth)
   {
       return true;
   }     
   
   // (1) Frustum Culling
   bVisible = this.frustum.TestBox(tb.mesh.bbmin[0],tb.mesh.bbmin[1],tb.mesh.bbmin[2],
                                   tb.mesh.bbmax[0],tb.mesh.bbmax[1],tb.mesh.bbmax[2]);  
   
   if (!bVisible)
   {
      return false; // early rejection, no further calculations/tests required
   }                                
                                                                                                           
   // (2) Visibility Test ("ellipsoidal backface-culling")     
                              
   var center = tb.vTilePoints[4].Get();
   var normal = tb._vNormal.Get();
   var campos = this.cameraposition.Get();
   this.vDir[0] = campos[0] - center[0];
   this.vDir[1] = campos[1] - center[1];
   this.vDir[2] = campos[2] - center[2];
   var mag = Math.sqrt(this.vDir[0]*this.vDir[0]+this.vDir[1]*this.vDir[1]+this.vDir[2]*this.vDir[2]);
   var d = (this.vDir[0] * normal[0] + this.vDir[1] * normal[1] + this.vDir[2] * normal[2])/mag;  

   if (d<SURFACE_NORMAL_THRESHOLD)
   {
      bVisible = false;  // reject
   }
   
   if (!bVisible)
   {
      return false; // early rejection, no further calculations required
   }
   
   // (3) Calculate Error Metric
   var dist = tb.CalcDistanceTo(/*this.cameraposition*/campos);
   var dCell = tb.GetBlockSize();
   var error = this.quality * dCell / dist;
   
   return (error>1.0);
}

//------------------------------------------------------------------------------

GlobeRenderer.prototype._Optimize = function()
{
   var i=0;
   while (i<this.lstFrustum.length)
   {
      var tb = this.lstFrustum[i];
   
      var center = tb.vTilePoints[4].Get();
      var normal = tb._vNormal.Get();
      var campos = this.cameraposition.Get();
      this.vDir[0] = campos[0] - center[0];
      this.vDir[1] = campos[1] - center[1];
      this.vDir[2] = campos[2] - center[2];
      var mag = Math.sqrt(this.vDir[0]*this.vDir[0]+this.vDir[1]*this.vDir[1]+this.vDir[2]*this.vDir[2]);
      var d = (this.vDir[0] * normal[0] + this.vDir[1] * normal[1] + this.vDir[2] * normal[2])/mag;  
   
      if (d<SURFACE_NORMAL_THRESHOLD)
      {
         this.lstFrustum.splice(i, 1);  
      }
      else
      {
         i++;
      }
   }
}

//------------------------------------------------------------------------------
/**
 * @description PickGlobe: Retrieve clicked position (high precision result)
 * The result contains the following:
 *    pickresult.hit: true if there was a hit with terrain
 *    pickresult.lng: longitude at mouse position
 *    pickresult.lat: latitude at mouse position
 *    pickresult.elv: elevation at mouse position
 *    pickresult.x: geocentric cartesian x-coordinate at mouse position
 *    pickresult.y: geocentric cartesian y-coordinate at mouse position
 *    pickresult.z: geocentric cartesian z-coordinate at mouse position
 */
GlobeRenderer.prototype.PickGlobe = function(mx, my, pickresult)
{
   var pointDir = this.engine.GetDirectionMousePos(mx, my, this.matPick);           
   var candidates = new Array();
  
   for (var i=0;i<this.lstFrustum.length;i++)
   {
      var bbmin = this.lstFrustum[i].mesh.bbmin;
      var bbmax = this.lstFrustum[i].mesh.bbmax;
      
      var res = this.lstFrustum[i].mesh.aabb.HitBox(pointDir.x,pointDir.y,pointDir.z,
                                          pointDir.dirx,pointDir.diry,pointDir.dirz,
                                          bbmin[0],bbmin[1],bbmin[2],bbmax[0],bbmax[1],bbmax[2]);
                                          
      if (res)
      {
         candidates.push(this.lstFrustum[i]);
      }                                    
   }
      
   var tmin = 1e20;
   pickresult["hit"] = false;
   for (var i=0;i<candidates.length;i++)
   {
      var r = candidates[i].mesh.TestRayIntersection(pointDir.x,pointDir.y,pointDir.z,pointDir.dirx,pointDir.diry,pointDir.dirz);
      if (r)
      {
         pickresult["hit"] = true;
         if (r.t < tmin)
         {
            tmin = r.t;
         }
      }
   }
   
   if (pickresult["hit"])
   {
      pickresult["x"] = pointDir.x + tmin*pointDir.dirx;
      pickresult["y"] = pointDir.y + tmin*pointDir.diry;
      pickresult["z"] = pointDir.z + tmin*pointDir.dirz;
      
      var gc = new GeoCoord(0,0,0);
      gc.FromCartesian(pickresult["x"],pickresult["y"],pickresult["z"]);
      pickresult["lng"] = gc._wgscoords[0];
      pickresult["lat"] = gc._wgscoords[1];
      pickresult["elv"] = gc._wgscoords[2];
   }

   
 }
 
 //-----------------------------------------------------------------------------
 /**
 * @description Returns the altitude above ground [m]
 * (If under world the returned value is negative)
 * This function can be used for collision detection when implementing a navigation controller.
 * Returns NaN, if query is not possible.
 */
GlobeRenderer.prototype.AltitudeAboveGround = function()
{
   // There are basically two cases:
   //    CASE 1: the user is above the terrain: shoot a ray from the camerea position to (0,0,0)
   //            in this case the distance is cameraposition <-> hitpoint
   //    CASE 2: the user is somehow under the terrain: shoot a ray from the camera position to (0,0,0).
   //            So shoot a ray from (0,0,0) in direction of the camera position
   //            the hitpoint <-> cameraposition is now the distance UNDER the terrain (negative).
   //    DIFFERENCE CASE 1/2: This leads to an opposite sign in t because the direction is either 
   //                         (-eye, -eye, -eye) or (+eye, +eye, +eye.)
   //
   if (!this.cameraposition)
   {
      return NaN;
   }
      
   var candidates = new Array();
   var campos = this.cameraposition.Get();
   var vDirection = new vec3();
   
   // if there is no elevation layer, don't do expensive test
   if (this.elevationlayerlist.length == 0)
   {
      var g = new GeoCoord();
      g.FromCartesian(campos[0], campos[1], campos[2]);
      return g.GetElevation();
   }
   
   
   vDirection.Set(-campos[0], -campos[1], -campos[2]);
   //vDirection.Normalize(); // for precision reasons it should be normalized... to speed up this could also be
                           // multiplied with 1/((2^24)-1) but that is too much voodoo for the first version
   var dir = vDirection.Get();                        
    
 
   for (var i=0;i<this.lstFrustum.length;i++)
   {
      var bbmin = this.lstFrustum[i].mesh.bbmin;
      var bbmax = this.lstFrustum[i].mesh.bbmax;
      
      var res = this.lstFrustum[i].mesh.aabb.HitBox(campos[0],campos[1],campos[2],
                                          dir[0], dir[1], dir[2],
                                          bbmin[0],bbmin[1],bbmin[2],bbmax[0],bbmax[1],bbmax[2]);
                                          
      if (res)
      {
         candidates.push(this.lstFrustum[i]);
      }                                    
   }
   

   var tmin = 1e20;
   var hit = false;
   for (var i=0;i<candidates.length;i++)
   {
      var r = candidates[i].mesh.TestRayIntersection(campos[0],campos[1],campos[2],dir[0], dir[1], dir[2]);
      if (r)
      {
         hit = true;
         if (r.t < tmin)
         {
            tmin = r.t;
         }
      }
   }
   
   if (hit) 
   {
      var x = tmin*dir[0];
      var y = tmin*dir[1];
      var z = tmin*dir[2]; 
      var dist = Math.sqrt(x*x+y*y+z*z)*CARTESIAN_SCALE;
      
      if (tmin < 0) // we are in hell
      {
         dist = -dist;
      }
      
      this.lastalt = dist;
      
      return dist;
   }

   return this.lastalt;
   
}
 //-----------------------------------------------------------------------------
 
 
