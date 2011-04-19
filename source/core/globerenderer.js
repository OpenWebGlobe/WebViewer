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

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Rendering the virtual globe...
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function GlobeRenderer(engine)
{
   this.engine = engine;
   this.imagelayerlist = new Array();
   this.quadtree = new MercatorQuadtree();
   this.cachesize = 1000;
   this.globecache = null;
   this.lstFrustum = [];
   
   this.iterator = new Object();
   this.iterator.cnt = 0;
   this.cameraposition = null;
   this.maxlod = 0;
   
   this.quality = 1.0; // quality parameter, reduce for lower quality
}

//------------------------------------------------------------------------------
/**
 * @description Add an image layer
 * Option is a Javascript Object with the following keys:
 *    url: ARRAY of urls (it it always an array, even if there is only 1 url)
 *    layer: name of layer
 *    service: i3d for i3d tile layout (default)
 *             osm for OpenStreetMap tile layout
 *    
 *  Example:
 *    var o = 
 *    {
 *        url     : ["http://www.openwebglobe.org/data/img"],
 *        layer   : "World500",
 *        service : "i3d"
 *    }; 
 * 
 *    globerenderer.AddImageLayer(o);
 *  
 */
GlobeRenderer.prototype.AddImageLayer = function(options)
{
    if (options.service)
    {
       if (options.service == "i3d")
       {
          // i3d tile service
          if (options.url && options.layer)
          {
             if (options.url.length>0)
             {
                var url = options.url[0];
                var layer = options.layer;
                
                // Create i3d layer:
                var imgLayer = new i3dImageLayer();
                imgLayer.Setup(url, layer);
                this.imagelayerlist.push(imgLayer);
                this._UpdateLayers();
             }
          }
       }
       else if (options.service == "osm")
       {
          // #todo: support OSM Service
       }
    }
}

//------------------------------------------------------------------------------
/**
 * @description update layers, this is called when layers change.
 * @ignore
 */
GlobeRenderer.prototype._UpdateLayers = function()
{
   console.log("Updating Layers");
   
   // update layers by creating a new globe cache: The old cache will be deleted
   var cachesize = 1000;
   if (this.globecache)
   {
      this.globecache.Destroy();  // free memory of old cache, especally GPU memory!
      this.globecache = null;
   }
   this.globecache = new GlobeCache(this.engine, this.imagelayerlist, null, this.quadtree, this.cachesize);
}

//------------------------------------------------------------------------------
/**
 * @description Render function
 */
GlobeRenderer.prototype.Render = function(vCameraPosition)
{
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
   
   // todo: frustum culling and Normal Test
   //bVisible = this._FrustumTest(tb.GetBoundingBox());
   //bVisible = bVisible && this._SurfaceNormalTest(tb);
   
   if (!bVisible)
   {
      return false; // early rejection, no further calculations required
   }
   
   // virtual globe error metric
   var dist = tb.CalcDistanceTo(this.cameraposition);
   //var dDelta = tb.GetPixelSize(this.engine.matModelViewProjection, this.engine.width, this.engine.height);
   var dCell = tb.GetBlockSize();
   
   var error = this.quality * dCell / dist;
   return (error>1.0);
}

//------------------------------------------------------------------------------

GlobeRenderer.prototype._Optimize = function()
{
   
}
//------------------------------------------------------------------------------
/**
 * @description Key Event for debugging purposes.
 * @ignore
 */
GlobeRenderer.prototype.OnKey = function(key)
{
   if (key == 66)
   {
      console.log("-------------------------");
      console.log("Frustum size: " + this.lstFrustum.length);
      for (var i=0;i<this.lstFrustum.length;i++)
      {
         console.log(this.lstFrustum[i].quadcode);
      }
      console.log("-------------------------");
   }
}
