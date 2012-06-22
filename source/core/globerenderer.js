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

goog.provide('owg.GlobeRenderer');

goog.require('goog.debug.Logger');
goog.require('owg.Texture');
goog.require('owg.GlobeCache');
goog.require('owg.MercatorQuadtree');
goog.require('owg.OSMImageLayer');
goog.require('owg.ViewFrustum');
goog.require('owg.i3dImageLayer');
goog.require('owg.owgImageLayer');
goog.require('owg.i3dElevationLayer');
goog.require('owg.owgElevationLayer');
goog.require('owg.GoogleImageLayer');
goog.require('owg.OYMImageLayer');
goog.require('owg.TMSImageLayer');
goog.require('owg.WMSImageLayer');
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
 *
 * @param {engine3d} engine
 */
function GlobeRenderer(engine)
{
   /** @type {engine3d} */
   this.engine = engine;
   /** @type {Array.<ImageLayer>} */
   this.imagelayerlist = new Array();
   /** @type {Array.<ElevationLayer>} */
   this.elevationlayerlist = new Array();
   /** @type {MercatorQuadtree} */
   this.quadtree = new MercatorQuadtree();
   /** @type {number} */
   this.cachesize = 1000;
   /** @type {GlobeCache} */
   this.globecache = null;
   /** @type {Array.<TerrainBlock>} */
   this.lstFrustum = [];
   /** @type {number} */
   this.lastalt = 0;
   /** @type {Object} */
   this.iterator = new Object();
   /** @type {number} */
   this.iterator.cnt = 0;
   /** @type {vec3} */
   this.cameraposition = null;
   /** @type {number} */
   this.maxlod = 0;
   /** @type {number} */
   this.quality = 1.0; //0.75; // quality parameter, reduce for lower quality

   // current view frustum (for view frustum culling)
   /** @type {ViewFrustum} */
   this.frustum = new ViewFrustum();

   this.vDir = new Array(3);

   /** @type {mat4} */
   this.matPick = new mat4(); // stored mvp matrix for picking

   /** @type {Surface} */
   this.northpole = new Surface(this.engine);
   /** @type {Surface} */
   this.southpole = new Surface(this.engine);
   this.northpolecolor = [8/255,24/255,58/255]; 
   this.southpolecolor = [1,1,1];

   /** @type {number} */
   this.radius = 1.0;
   
   this.rendereffect = GlobeRenderer.RenderEffect.RGB;
   /** @type {Object} */
   this.renderparam = {};
}
//------------------------------------------------------------------------------
/**
 * @description Free all memory
 */
GlobeRenderer.prototype.Destroy = function()
{
   if (this.globecache)
   {
      this.globecache.Destroy();  // free memory of old cache, especally GPU memory!
      this.globecache = null;
   }

   if (this.northpole)
   {
      this.northpole.Destroy();
      this.northpole = null;
   }

   if (this.southpole)
   {
      this.southpole.Destroy();
      this.southpole = null;
   }
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
 *             tms for TMS tile layout
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

   if (goog.isDef(options["service"]))
   {
      // i3d tile layout (deprecated)
      if (options["service"] == "i3d")
      {
         // i3d tile service
         if (goog.isDef(options["url"]) && goog.isDef(options["layer"]))
         {
            if (options["url"].length>0)
            {
               /** @type {string} */
               var url = options["url"][0];
               /** @type {string} */
               var layer = options["layer"];

               // Create i3d layer:
               var imgLayer = new i3dImageLayer();
               if (goog.isDef(options["minlod"]))
               {
                  imgLayer.userminlod = options["minlod"];
               }
               if (goog.isDef(options["maxlod"]))
               {
                  imgLayer.usermaxlod = options["maxlod"];
               }
               imgLayer.Setup(url, layer, options["transparency"]);
               index = this.imagelayerlist.length;
               this.imagelayerlist.push(imgLayer);
               this._UpdateLayers();
            }
         }
      }
      // OpenStreetMap tile layout
      else if (options["service"] == "osm")
      {
         if (goog.isDef(options["url"]) && options["url"].length>0)
         {
            var imgLayer = new OSMImageLayer();
            if (goog.isDef(options["minlod"]))
            {
               imgLayer.userminlod = options["minlod"];
            }
            if (goog.isDef(options["maxlod"]))
            {
               imgLayer.usermaxlod = options["maxlod"];
            }
            imgLayer.Setup(options["url"]);
            index = this.imagelayerlist.length;
            this.imagelayerlist.push(imgLayer);
            this._UpdateLayers();
         }
      }
      // TMS service
      else if (options["service"] == "tms")
      {
         if (goog.isDef(options["url"]) && options["url"].length>0)
         {
            var imgLayer = new TMSImageLayer();
            if (goog.isDef(options["minlod"]))
            {
               imgLayer.userminlod = options["minlod"];
            }
            if (goog.isDef(options["maxlod"]))
            {
               imgLayer.usermaxlod = options["maxlod"];
            }
            imgLayer.Setup(options["url"]);
            index = this.imagelayerlist.length;
            this.imagelayerlist.push(imgLayer);
            this._UpdateLayers();
         }
      }
      // TMS service
      else if (options["service"] == "wms")
      {
         if (goog.isDef(options["url"]) && options["url"].length>0
            && goog.isDef(options["layer"]) && options["layer"].length>0)
         {
            var imgLayer = new WMSImageLayer();
            if (goog.isDef(options["format"]))
            {imgLayer.format = options["format"];} 
            if (goog.isDef(options["style"]))
            {imgLayer.style = options["style"];}
            if (goog.isDef(options["version"]))
            {imgLayer.version = options["version"];}
            imgLayer.Setup(options["url"],options["layer"],options["format"],options["style"],options["version"],options["transparency"]);
            index = this.imagelayerlist.length;
            this.imagelayerlist.push(imgLayer);
            this._UpdateLayers();
         }
      }
      // OpenWebGlobe tile layout
      else if (options["service"] == "owg")
      {
         if (goog.isDef(options["url"]) && options["url"].length>0)
         {
            var layer = options["layer"];
            var imgLayer = new owgImageLayer();
            if (goog.isDef(options["minlod"]))
            {
               imgLayer.userminlod = options["minlod"];
            }
            if (goog.isDef(options["maxlod"]))
            {
               imgLayer.usermaxlod = options["maxlod"];
            }
            imgLayer.Setup(options["url"], layer, options["transparency"]);
            index = this.imagelayerlist.length;
            this.imagelayerlist.push(imgLayer);
            this._UpdateLayers();
         }
      }
      // Google tile layout
      else if (options["service"] == "goo")
      {
         if (goog.isDef(options["url"]) && options["url"].length>0)
         {
            var imgLayer = new GoogleImageLayer();
            if (goog.isDef(options["minlod"]))
            {
               imgLayer.userminlod = options["minlod"];
            }
            if (goog.isDef(options["maxlod"]))
            {
               imgLayer.usermaxlod = options["maxlod"];
            }
            imgLayer.Setup(options["url"]);
            index = this.imagelayerlist.length;
            this.imagelayerlist.push(imgLayer);
            this._UpdateLayers();
         }
      }
      else if (options["service"] == "oym")
      {
         if (goog.isDef(options["url"]) && options["url"].length>0)
         {
            var imgLayer = new OYMImageLayer();
            if (goog.isDef(options["minlod"]))
            {
               imgLayer.userminlod = options["minlod"];
            }
            if (goog.isDef(options["maxlod"]))
            {
               imgLayer.usermaxlod = options["maxlod"];
            }
            imgLayer.Setup(options["url"]);
            index = this.imagelayerlist.length;
            this.imagelayerlist.push(imgLayer);
            this._UpdateLayers();
         }
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
   else if (options["service"] == "owg")
   {
      // OpenWebGlobe elevation tile service
      if (options["url"] && options["layer"])
      {
         if (options["url"].length>0)
         {
            var servers = options["url"];
            var layer = options["layer"];
             
            // Create OpenWebGlobe Elevation layer:
            var elvLayer = new owgElevationLayer();
            elvLayer.Setup(servers, layer);
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
 * @param {vec3} vCameraPosition
 * @param {mat4} matModelViewProjection
 */
GlobeRenderer.prototype.Render = function(vCameraPosition, matModelViewProjection)
{
   this.globecache.StartFrame();

   /** @type {WebGLRenderingContext} */
   var gl = this.engine.gl;

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
      this.lstFrustum[i].Render(false);
   }

   var northTiles=[];
   var southTiles=[];
   for (var i=0;i<this.lstFrustum.length;i++)
   {
      var qcode = this.lstFrustum[i].quadcode;
   
      //iterate trough all chars
      var nstype = 0;
      var c = qcode.charAt(0);
      if(c=='0' || c =='1'){nstype = 1}; //nstype 1 = north; nstype = 0->tile is somewhere in the middle.
      if(c=='2' || c =='3'){nstype = 2}; //nstype 2 = south
      {
         for(var j=1;j<qcode.length;j++)
         {
            c=qcode.charAt(j);
            
            if((c=='0' || c =='1') && nstype == '2')
            {
               nstype = 0;
               break;
            }
            if((c=='2' || c =='3') && nstype == '1')
            {
               nstype = 0;
               break;
            }  
         }
      }
      if(nstype == 1)
      {
         northTiles.push(this.lstFrustum[i]);
      }
      if(nstype == 2)
      {
         southTiles.push(this.lstFrustum[i]);
      }
   }
   if(northTiles.length>3)
   {
     this._GenerateNorthPole(northTiles); 
   }
   if(southTiles.length>3)
   {
     this._GenerateSouthPole(southTiles); 
   }

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
   /** @type {number} */
   var i = this.iterator.cnt;
   
   if (this.lstFrustum[i].quadcode.length == this.maxlod)
   {
      this.iterator.cnt++;
      return;
   }

   if (this.lstFrustum[i].IsAvailable())
   {
      if (this._CalcErrorMetric(i))
      {
         var quadcode = this.lstFrustum[i].quadcode;
         /** @type {TerrainBlock} */
         var tb0 = this.globecache.RequestBlock(quadcode+"0");
         /** @type {TerrainBlock} */
         var tb1 = this.globecache.RequestBlock(quadcode+"1");
         /** @type {TerrainBlock} */
         var tb2 = this.globecache.RequestBlock(quadcode+"2");
         /** @type {TerrainBlock} */
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

var SURFACE_NORMAL_THRESHOLD = 0.4;
//------------------------------------------------------------------------------
GlobeRenderer.prototype._CalcErrorMetric = function(i)
{
   /** @type {number} */
   var min_depth = 3;
   /** @type {number} */
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
   // normalize vDir:
   var mag = Math.sqrt(this.vDir[0]*this.vDir[0]+this.vDir[1]*this.vDir[1]+this.vDir[2]*this.vDir[2]);
   if (mag > 0)
   {
      this.vDir[0] = this.vDir[0] / mag;
      this.vDir[1] = this.vDir[1] / mag;
      this.vDir[2] = this.vDir[2] / mag;
   }
   
   var d = (this.vDir[0] * normal[0] + this.vDir[1] * normal[1] + this.vDir[2] * normal[2]);  
   
   if (d>SURFACE_NORMAL_THRESHOLD)
   {
      bVisible = false;  // reject
   }
   
   if (!bVisible)
   {
      return false; // early rejection, no further calculations required
   }
   
   // (3) Calculate Error Metric
   var dist = tb.CalcDistanceTo(campos);
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
   
      if (d>=SURFACE_NORMAL_THRESHOLD)
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
   var pointDir = this.engine.GetDirectionMousePos(mx, my, this.matPick, true);           
   var candidates = new Array();
   var meshmode = 0;
  
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
   pickresult["numhits"] = candidates.length;
   
   for (var i=0;i<candidates.length;i++)
   {
      var r = candidates[i].mesh.TestRayIntersection(pointDir.x,pointDir.y,pointDir.z,pointDir.dirx,pointDir.diry,pointDir.dirz);
      if (r)
      {
         if (r.t < tmin)
         {
            pickresult["hit"] = true;
            tmin = r.t;

            if (!candidates[i].haselevation)
            {
               meshmode = 1;
            }
            else
            {
               meshmode = 0;
            }
         }
      }
   }
   
   pickresult["tmin"] = tmin;
   
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

      if (meshmode == 1)
      {
         pickresult["elv"] = 0;
      }
   }
 }
//-----------------------------------------------------------------------------
/**
 * @description PickEllipsoid: Retrieve clicked position (low precision result without elevation)
 * The result contains the following:
 *    pickresult["hit"]: true if there was a hit with terrain
 *    pickresult["lng"]: longitude at mouse position
 *    pickresult["lat"]: latitude at mouse position
 *    pickresult["elv"]: elevation at mouse position (always 0)
 *    pickresult["x"]: geocentric cartesian x-coordinate at mouse position
 *    pickresult["y"]: geocentric cartesian y-coordinate at mouse position
 *    pickresult["z"]: geocentric cartesian z-coordinate at mouse position
 */
GlobeRenderer.prototype.PickEllipsoid = function(mx, my, pickresult, initialize)
{
   if (initialize)
   {
      var pickresult2 = {};
      this.PickGlobe(mx, my, pickresult2);
      if (pickresult2["hit"])
      {
         this.radius = Math.sqrt(pickresult2["x"]*pickresult2["x"] +
                  pickresult2["y"]*pickresult2["y"] +
                  pickresult2["z"]*pickresult2["z"]);

      }
      else
      {
         return;
      }
   }
   
   var pck = this.engine.GetDirectionMousePos(mx, my, this.matPick, true);           
   var candidates = new Array();
   pickresult["hit"] = false;
   
   var eyex = pck.x;
   var eyey = pck.y;
   var eyez = pck.z;
   var mmx = pck.dirx;
   var mmy = pck.diry;
   var mmz = pck.dirz;
   
   var zoom2 = eyex*eyex + eyey*eyey + eyez*eyez;
   var zoom = Math.sqrt(zoom2);

   var a = mmx*mmx + mmy*mmy + mmz*mmz;
   var b = eyex*mmx + eyey*mmy + eyez*mmz;

   var root = (b*b) - a*(zoom2 - this.radius*this.radius);
   
   if(root <= 0)
   {
       return;
   }
   else
   {
      var t = (0.0 - b - Math.sqrt(root)) / a;
      
     
      var px = eyex + mmx * t;
      var py = eyey + mmy * t;
      var pz = eyez + mmz * t;
      var rl = 1/Math.sqrt(px*px + py*py + pz*pz);
      
      pickresult["hit"] = true;
      pickresult["x"] = px*rl;
      pickresult["y"] = py*rl;
      pickresult["z"] = pz*rl;
   }
   
   var gc = new GeoCoord(0,0,0);
   gc.FromCartesian(pickresult["x"],pickresult["y"],pickresult["z"]);
   pickresult["lng"] = gc._wgscoords[0];
   pickresult["lat"] = gc._wgscoords[1];
   pickresult["elv"] = gc._wgscoords[2]; // should be around 0

 }
 
 //-----------------------------------------------------------------------------
 /**
 * @description Returns the elevation at specified position.
 * @param {number} lng
 * @param {number} lat
 * @return {Object}
 *   return["hasvalue"] true, if there is a valid value
 *   return["elevation"] : elevation at specified position
 *   return["lod"] : level of detail at position 
 */
GlobeRenderer.prototype.GetElevationAt = function(lng, lat)
{
   var result = {};
   result["hasvalue"] = false;
   result["elevation"] = 0;
   result["lod"] = -1;
   
   var pos0 = [0,0,0];
   var pos1 = [0,0,0];
   var gc = new GeoCoord(lng,lat,0);
   gc.ToCartesian(pos1);
   gc.Set(lng, lat, -1);
   gc.ToCartesian(pos0);
   
   var x,y,z;
   x = pos0[0];
   y = pos0[1];
   z = pos0[2];
   var dirx = pos1[0] - pos0[0];
   var diry = pos1[1] - pos0[1];
   var dirz = pos1[2] - pos0[2];
   var len = Math.sqrt(dirx*dirx+diry*diry+dirz*dirz);
   dirx = dirx / len;
   diry = diry / len;
   dirz = dirz / len;
   
   var candidates = new Array();
  
   for (var i=0;i<this.lstFrustum.length;i++)
   {
      var bbmin = this.lstFrustum[i].mesh.bbmin;
      var bbmax = this.lstFrustum[i].mesh.bbmax;
      
      var res = this.lstFrustum[i].mesh.aabb.HitBox(x,y,z,
                                          dirx,diry,dirz,
                                          bbmin[0],bbmin[1],bbmin[2],bbmax[0],bbmax[1],bbmax[2]);
                                          
      if (res)
      {
         candidates.push(this.lstFrustum[i]);
      }                                    
   }
      
   var tmin = 1e20;
   
   for (var i=0;i<candidates.length;i++)
   {
      var r = candidates[i].mesh.TestRayIntersection(x,y,z,dirx,diry,dirz);
      if (r)
      {
         if (r.t < tmin)
         {
            result["hasvalue"] = true;
            result["lod"] = candidates[i].mesh.lod;
            tmin = r.t;
         }
      }
   }
   
   if (result["hasvalue"])
   {
      result["x"] = x + tmin*dirx;
      result["y"] = y + tmin*diry;
      result["z"] = z + tmin*dirz;
      
      var gc2 = new GeoCoord(0,0,0);
      gc2.FromCartesian(result["x"],result["y"],result["z"]);
      result["lng"] = gc2._wgscoords[0];
      result["lat"] = gc2._wgscoords[1];
      result["elevation"] = gc2._wgscoords[2];
   }
   
   return result;
}
 
 //-----------------------------------------------------------------------------
/**
 *@description Generate and draw the northpole.
 *
 */
GlobeRenderer.prototype._GenerateNorthPole = function(northTiles)
{
      
      // 1. sort the tiles according to its quadcode.
      // 1a. get the length of the longest quadcode.
      var maxqlength = 0;
      for(var i=0;i<northTiles.length;i++)
      {
         if(northTiles[i].quadcode.length>maxqlength)
         {
            maxqlength = northTiles[i].quadcode.length;
         }
      }
      
      // 1b. padding up with zeros.
      for(var i=0;i<northTiles.length;i++)
      {
         northTiles[i].new_quadcode = northTiles[i].quadcode;
        while(northTiles[i].new_quadcode.length<maxqlength)
        {
            northTiles[i].new_quadcode += '0';
        }
      }   
      
      // the order function. the quadcode is used as a binary value and then converted
      // to integer. These integers will be sorted.
      var tileorder = function(tile_a,tile_b)
         {
            var a=parseInt(tile_a.new_quadcode,2);
            var b=parseInt(tile_b.new_quadcode,2);
            return a-b;   
         };
      northTiles.sort(tileorder);
      
      
      //the north pole coordiantes
      var npole = [0,0,0.75778401756096095573436686210235] //[0,0,WGS84_b*CARTESIAN_SCALE_INV]        
      
      
      // fill up the vertices array
      var vertices=[npole[0],npole[1],npole[2],this.northpolecolor[0],this.northpolecolor[1],this.northpolecolor[2],1];
      var indices=[];
      
      
      // fill up the vetrices array with the upper boundary vertiex data of tile.
      for(var i=0;i<northTiles.length;i++)
      {
         var j = 2;
         while(northTiles[i].mesh.vertexbufferdata[j]==0) //test if the z value is == 0
         {
            vertices.push(northTiles[i].vOffset[0]+northTiles[i].mesh.vertexbufferdata[j-2]);
            vertices.push(northTiles[i].vOffset[1]+northTiles[i].mesh.vertexbufferdata[j-1]);
            vertices.push(northTiles[i].vOffset[2]+northTiles[i].mesh.vertexbufferdata[j])
            vertices.push(this.northpolecolor[0]);
            vertices.push(this.northpolecolor[1]);
            vertices.push(this.northpolecolor[2]);
            vertices.push(1);
            j += 5; 
         }
      }
      
      // fill up the indices buffer.
      for(var l=0;l<(vertices.length/7)-2;l++)
      {
         indices.push(l);
      }
      indices.push(1);
      indices.push(2);
      indices.push(3);
        
      this.northpole.Destroy();
      this.northpole = new Surface(this.engine);
      
      var northpole = {
                        "VertexSemantic"  :  "pc",
                        "Vertices" : vertices,
                        "IndexSemantic"  :  "TRIANGLEFAN",
                        "Indices"  : indices
                     }
      
      this.northpole.CreateFromJSONObject(northpole,null,null);
      this.northpole.Draw();
}
//------------------------------------------------------------------------------
/**
 *@description Generate and draw the southpole.
 *
 */
GlobeRenderer.prototype._GenerateSouthPole = function(southTiles)
{
      
      // 1. sort the tiles according to its quadcode.
      // 1a. get the length of the longest quadcode.
      var maxqlength = 0;
      for(var i=0;i<southTiles.length;i++)
      {
         if(southTiles[i].quadcode.length>maxqlength)
         {
            maxqlength = southTiles[i].quadcode.length;
         }
      }
      
      // 1b. padding up with zeros.
      for(var i=0;i<southTiles.length;i++)
      {
        southTiles[i].new_quadcode = southTiles[i].quadcode;
        southTiles[i].new_quadcode = southTiles[i].new_quadcode.replace(/2/g,"0");
        southTiles[i].new_quadcode = southTiles[i].new_quadcode.replace(/3/g,"1");
        while(southTiles[i].new_quadcode.length<maxqlength)
        {
            southTiles[i].new_quadcode += '0';
        }
      }   
      
      // the order function. the quadcode is used as a binary value and then converted
      // to integer. These integers will be sorted.
      var tileorder = function(tile_a,tile_b)
         {
            var a = parseInt(tile_a.new_quadcode,2);
            var b = parseInt(tile_b.new_quadcode,2);
            return b-a;   
         };
      southTiles.sort(tileorder);
      
      
      //the north pole coordiantes
      var spole = [0,0,-0.75778401756096095573436686210235] //[0,0,WGS84_b*CARTESIAN_SCALE_INV]        
      
      
      // fill up the vertices array
      var vertices=[spole[0],spole[1],spole[2],this.southpolecolor[0],this.southpolecolor[1],this.southpolecolor[2],1];
      var indices=[];
      
      // fill up the vetrices array with the upper boundary vertiex data of tile.
      for(var i=0;i<southTiles.length;i++)
      {
         var j = southTiles[i].mesh.vertexbufferdata.length;
         j-=1;
         while(southTiles[i].mesh.vertexbufferdata[j]==0) //test if the texture coordinate value is == 0
         {
            vertices.push(southTiles[i].vOffset[0]+southTiles[i].mesh.vertexbufferdata[j-4]);
            vertices.push(southTiles[i].vOffset[1]+southTiles[i].mesh.vertexbufferdata[j-3]);
            vertices.push(southTiles[i].vOffset[2]+southTiles[i].mesh.vertexbufferdata[j-2])
            vertices.push(this.southpolecolor[0]);
            vertices.push(this.southpolecolor[1]);
            vertices.push(this.southpolecolor[2]);
            vertices.push(1);
            j -= 5;
         }
      }
      
      // fill up the indices buffer.
      for(var l=0;l<(vertices.length/7)-2;l++)
      {
         indices.push(l);
      }
      indices.push(1);
        
      this.southpole.Destroy();
      this.southpole = new Surface(this.engine);
      
      var southpole = {
                        "VertexSemantic"  :  "pc",
                        "Vertices" : vertices,
                        "IndexSemantic"  :  "TRIANGLEFAN",
                        "Indices"  : indices
                     }
      
      this.southpole.CreateFromJSONObject(southpole,null,null);
      this.southpole.Draw();
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
         if (r.t < tmin)
         {
            hit = true;
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
 /**
 * @description Set Render Effect
 * @param {number} rendereffect
 */
GlobeRenderer.prototype.SetRenderEffect = function(rendereffect)
{
   this.rendereffect = rendereffect;
}
//------------------------------------------------------------------------------
 /**
 * @description Set Render param for special effect
 * @param {Object=} param
 */
GlobeRenderer.prototype.SetRenderParam = function(param)
{
   if (param !=null)
   {
      this.renderparam = param;
   }
   else
   {
      this.renderparam = {};
   }
}
//-----------------------------------------------------------------------------
/**
* @description Get Render Effect
* @return {number}
*/
GlobeRenderer.prototype.GetRenderEffect = function()
{
   return this.rendereffect;
}
//------------------------------------------------------------------------------
 /**
 * @description Get Render param for special effect
 * @return {Object} param
 */
GlobeRenderer.prototype.GetRenderParam = function()
{
   return this.renderparam;
}
//------------------------------------------------------ƒ------------------------
// Render Effects, special shaders for terrain
//
/** @enum {number} */
GlobeRenderer.RenderEffect =
{
   RGB: 0,           // render globe using normal shader
   CHROMADEPTH: 1    // render globe using chroma depth elevation
};
//------------------------------------------------------------------------------

