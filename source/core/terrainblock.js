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

goog.provide('owg.TerrainBlock');

goog.require('owg.GeoCoord');
goog.require('owg.Mercator');
goog.require('owg.Surface');
goog.require('owg.Texture');
goog.require('owg.mat4');
goog.require('owg.vec3');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Terrainblock
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function TerrainBlock(engine, quadcode, quadtree)
{
   /** @type {engine3d} */
   this.engine = engine;
   /** @type {string} */
   this.quadcode = quadcode;
   /** @type {MercatorQuadtree} */
   this.quadtree = quadtree;
   /** @type {Texture} */
   this.texture = null;
   /** @type {boolean} */
   this.available = false;
   /** @type {Surface} */
   this.mesh = null;
   /** @type {boolean} */
   this.haselevation = true;
   /** @type {Array.<Geometry>} */
   this.geometries = [];
   /** @type {Array.<PointRenderer>} */
   this.pointclouds = [];
   
   /** @type {Array} */
   this.vOffset = []; // virtual camera offset
   this.vTilePoints = new Array(5); // corner points and mid point of tile (in cartesian coordinates)
   this.vTilePoints[0] = new vec3(); // (if a tile is loaded, this is the lower part of the bounding box!)
   this.vTilePoints[1] = new vec3();
   this.vTilePoints[2] = new vec3();
   this.vTilePoints[3] = new vec3();
   this.vTilePoints[4] = new vec3();
   
   /** @type {number} */
   this.imagelayers = 0;
   /** @type {Array.<Texture>} */
   this.images = null;
   /** @type {boolean} */
   this.bPostCreation = false;
   
   /** @type {number} */
   this.elevationlayers = 0;
   this._vNormal = new vec3();
   
   /** @type {mat4} */
   this.tmpmodel = new mat4();
   
   /** @type {number} */
   this.longitude0  = -180.0;
   /** @type {number} */
   this.latitude0   = -90.0;
   /** @type {number} */
   this.longitude1  =  180.0;
   /** @type {number} */   
   this.latitude1   =  90.0;
   
   this._CalcLocation();
   
}

/** @type {number} */
var g_activeRequests = 0;

// #fixme: this function name must be renamed, 
//         as it also handles elevation.
TerrainBlock.prototype.MergeImages = function()
{   
   if (this.imagelayers == 0 && this.elevationlayers == 0)
   {
      // All layers are downloaded -> now create a "merged image" if there are several layers!
      var cntdata = 0;
      var thelayer = 0;
      if (!goog.isNull(this.images))
      {
          for (var i=0;i<this.images.length;i++)
          {
             if (this.images[i] != null)
             {
                cntdata++;
                thelayer = i;
             }
          }
      }
      
      if (cntdata == 0)
      {
         // Case 1: No image layer and no elevation layer available!! Create "empty" tile.
         // This case shoudln't ever happen, but maybe a tile is corrupted on the server
         // or a dataset is being moved, or whatever! 
         this.texture = this.engine.nodata; // use empty texture
         if (goog.isNull(this.mesh))
         {  
            this._CreateElevationMesh(); // create empty elevation
         }
         this.mesh.SetTexture(this.texture);
         this.available = true;
         this.images = null;
         return;
      }
      else if (cntdata == 1)
      {
         // Case 2: Only one image layer is available for this Terrainblock. just take that one. 
         this.texture = this.images[thelayer];
         if (goog.isNull(this.mesh))
         {  
            this._CreateElevationMesh(); // create empty elevation
         }
         this.mesh.SetTexture(this.texture);
         this.available = true;
         this.images = null;
         return;
      }
      else
      {
         // Case 3: Merge Images
         // It is not possible to merge images, this must be done during render loop
         // so the "PostCreation" flag is set for the render loop. 
         this.bPostCreation = true;
         if (goog.isNull(this.mesh))
         {  
            this._CreateElevationMesh();  // create empty elevation
         }
         this.available = true; 
      }
   }
}

//------------------------------------------------------------------------------
/**
 * @description Request Data
 * @private
 */
TerrainBlock.prototype._AsyncRequestData = function(imagelayerlist, elevationlayerlist, geometrylayerlist, pointcloudlayerlist)
{
   if (this.quadcode.length < 3)
   {
      _cbfOnImageTileFailed(this.quadcode, this, -1);
      return;
   }

   var caller = this;
   
   // Part 1: Image Layer Tile Request
   if (imagelayerlist.length>0)
   {
      this.imagelayers = imagelayerlist.length;
      this.images = new Array(this.imagelayers);
      
      // Go through all image layers and request tiles.
      // #fixme This needs further optimization (no alpha-channel existance test)
      // maybe implementing a border strategy or using "preprocessed octoblocks"
      for (var i=0;i<imagelayerlist.length;i++)
      {
         this.images[i] = null;
         var lod = this.quadcode.length;
         /** @type {boolean} */
         var inlod = (lod <= imagelayerlist[i].usermaxlod || imagelayerlist[i].usermaxlod == -1) && (lod >= imagelayerlist[i].userminlod || imagelayerlist[i].userminlod == -1);
         if (imagelayerlist[i].Contains(this.quadcode) && inlod)
         {
            imagelayerlist[i].RequestTile(this.engine, this.quadcode, i, _cbfOnImageTileReady, _cbfOnImageTileFailed, caller);
            g_activeRequests++;
         }
         else
         {
            _cbfOnImageTileFailed(this.quadcode, this, i);
         }
      }
   }
   
   // Part 2: Elevation Layer tile request
   if (elevationlayerlist && elevationlayerlist.length>0)
   {  
      // It only makes sense to load elevation from a higher lod. 
      // Lower LOD elevation data is usually not visible and not worth downloading.
      if (this.quadcode.length>8)
      {
         // make sure this tile exists in dataset!
         if (elevationlayerlist[0].Contains(this.quadcode))
         { 
            // in this first version, only one elevation layer is supported!
            // this will be implemented at a later stage. #fixme
            this.elevationlayers = 1;
            elevationlayerlist[0].RequestTile(this.engine, this.quadcode, 0, _cbfOnElevationTileReady, _cbfOnElevationTileFailed, caller);
            g_activeRequests++;
         }
      
      }
   }

   // Part 3: Geometry Layer tile request
    if (geometrylayerlist && geometrylayerlist.length>0)
    {
        for (var i=0;i<geometrylayerlist.length;i++)
        {
            if (geometrylayerlist[i].Contains(this.quadcode))
            {
                geometrylayerlist[i].RequestTile(this.engine, this.quadcode, i, _cbfOnGeometryTileReady, _cbfOnGeometryTileFailed, caller);
                g_activeRequests++;
            }
        }
    }

    // Part 4: Point Cloud Layer tile request
    if (pointcloudlayerlist && pointcloudlayerlist.length>0)
    {
        for (var i=0;i<pointcloudlayerlist.length;i++)
        {
            if (pointcloudlayerlist[i].Contains(this.quadcode))
            {
                pointcloudlayerlist[i].RequestTile(this.engine, this.quadcode, i, _cbfOnPointCloudTileReady, _cbfOnPointCloudTileFailed, caller);
                g_activeRequests++;
            }
        }
    }

}
//------------------------------------------------------------------------------
/**
 * @description Callback when image data is ready
 * @private
 */
function _cbfOnImageTileReady(quadcode, ImageObject, layer)
{
   var terrainblock = ImageObject.caller;
   terrainblock.images[layer] = ImageObject;
   terrainblock.imagelayers = terrainblock.imagelayers - 1;
   terrainblock.MergeImages();

   g_activeRequests--;
}
//------------------------------------------------------------------------------       
/**
 * @description Callback when image data failed
 * @private
 */
function _cbfOnImageTileFailed(quadcode, terrainblock, layer)
{
   if (layer>=0)
   {
      terrainblock.images[layer] = null;
      terrainblock.imagelayers = terrainblock.imagelayers - 1;

   }
   else
   {
      terrainblock.images = null;
      terrainblock.imagelayers = 0;
   }

   terrainblock.MergeImages();
   g_activeRequests--;
}
//------------------------------------------------------------------------------
/**
 * @description Callback when elevation data is ready
 * @private
 */
function _cbfOnElevationTileReady(quadcode, mesh, layer)
{
   var terrainblock = mesh.caller;
   terrainblock.mesh = mesh;
   terrainblock.mesh.lod = terrainblock.quadcode.length;
   terrainblock.vOffset = mesh.offset;

   terrainblock.vTilePoints[0].Set(mesh.bbmin[0], mesh.bbmin[1], mesh.bbmin[2]);
   terrainblock.vTilePoints[1].Set(mesh.bbmax[0], mesh.bbmin[1], mesh.bbmin[2]);
   terrainblock.vTilePoints[2].Set(mesh.bbmax[0], mesh.bbmax[1], mesh.bbmin[2]);
   terrainblock.vTilePoints[3].Set(mesh.bbmin[0], mesh.bbmax[1], mesh.bbmin[2]);
   terrainblock.vTilePoints[4].Set(0.5*(mesh.bbmax[0]-mesh.bbmin[0]), 0.5*(mesh.bbmax[1]-mesh.bbmin[1]),0.5*(mesh.bbmax[2]-mesh.bbmin[2]));

   terrainblock.elevationlayers = terrainblock.elevationlayers - 1;
   terrainblock.MergeImages();

   g_activeRequests--;
}
//------------------------------------------------------------------------------
/**
 * @description Callback when data failed
 * @private
 */
function _cbfOnElevationTileFailed(quadcode, terrainblock, layer)
{
   terrainblock.mesh = null;
   terrainblock.elevationlayers = terrainblock.elevationlayers - 1;
   terrainblock.MergeImages();
   g_activeRequests--;
}
//------------------------------------------------------------------------------
/**
 * @description Callback when elevation data is ready
 * @private
 */
function _cbfOnGeometryTileReady(quadcode, geometry, layer)
{
   var terrainblock = geometry.caller;

   terrainblock.geometries[layer] = geometry;


   g_activeRequests--;
}
//------------------------------------------------------------------------------
/**
 * @description Callback when data failed
 * @private
 */
function _cbfOnGeometryTileFailed(quadcode, terrainblock, layer)
{
   // currently don't do anything if geometry tile download/creation fails.

   g_activeRequests--;
}
//------------------------------------------------------------------------------
/**
 * @description Callback when elevation data is ready
 * @private
 */
function _cbfOnPointCloudTileReady(quadcode, pc, layer)
{
    console.log("_cbfOnPointCloudTileReady (index: " + layer + ")");

    var terrainblock = pc.caller;
    terrainblock.pointclouds[layer] = pc;

    g_activeRequests--;
}
//------------------------------------------------------------------------------
/**
 * @description Callback when data failed
 * @private
 */
function _cbfOnPointCloudTileFailed(quadcode, terrainblock, layer)
{
    // currently don't do anything if point cloud tile download/creation fails.

    g_activeRequests--;
}

//------------------------------------------------------------------------------
/**
 * @description Destroy Terrainblock and free all memory, especially GPU mem.
 */
TerrainBlock.prototype.Destroy = function()
{
   if (this.texture)
   {
      this.texture.Destroy();
   }
   
   if (this.mesh)
   {
      this.mesh.Destroy();
   }
}

//------------------------------------------------------------------------------
/**
 * @description returns true if terrain block is available (can be rendered).
 * TerrainBlock is an asynchronous object and some data may not be available yet.
 */
TerrainBlock.prototype.IsAvailable = function()
{
   return this.available;
}
//------------------------------------------------------------------------------
/**
* @description Calculate visible pixel size
*/
TerrainBlock.prototype.GetPixelSize = function(matMVP, nWidth, nHeight)
{
   var dx = -1e20;
   var dy = -1e20;
   
   var v0 = matMVP.MultiplyVec3(this.vTilePoints[0]);
   var v1 = matMVP.MultiplyVec3(this.vTilePoints[1]);
   var v2 = matMVP.MultiplyVec3(this.vTilePoints[2]);
   var v3 = matMVP.MultiplyVec3(this.vTilePoints[3]);


   dx= Math.max(dx, Math.abs(v0.Get()[0] / 2.0 - v1.Get()[0] / 2.0) * nWidth);
   dy= Math.max(dy, Math.abs(v0.Get()[1] / 2.0 - v1.Get()[1] / 2.0) * nHeight);
   
   dx= Math.max(dx, Math.abs(v1.Get()[0] / 2.0 - v2.Get()[0] / 2.0) * nWidth);
   dy= Math.max(dy, Math.abs(v1.Get()[1] / 2.0 - v2.Get()[1] / 2.0) * nHeight);

   dx= Math.max(dx, Math.abs(v2.Get()[0] / 2.0 - v3.Get()[0] / 2.0) * nWidth);
   dy= Math.max(dy, Math.abs(v2.Get()[1] / 2.0 - v3.Get()[1] / 2.0) * nHeight);

   dx= Math.max(dx, Math.abs(v3.Get()[0] / 2.0 - v0.Get()[0] / 2.0) * nWidth);
   dy= Math.max(dy, Math.abs(v3.Get()[1] / 2.0 - v0.Get()[1] / 2.0) * nHeight);
  
   var texturesize = 256; // #fixme
   return Math.max(dx,dy) / texturesize;
}
//------------------------------------------------------------------------------
/**
* @description Calculate size of a block (cell size)
*/
TerrainBlock.prototype.GetBlockSize = function()
{
   // This is an approximate block size
   var v = this.vTilePoints[0].Copy();
   v.Sub(this.vTilePoints[1]);
   return v.Length();
}
//------------------------------------------------------------------------------
/**
* @description Calc exact distance to another point
* @param {Array.<number>} vWhere The position to measure to
*/
TerrainBlock.prototype.CalcDistanceTo = function(vWhere)
{
   // Calculating the distance to the terrain block is done the following way:
   // go through all points in the mesh object and calculate the distance
   // this is not the closest distance to the surface, but it is much faster 
   // to calculate and sufficient for applications like error metric calculation. 
   
   var vPos = [0,0,0];
   var curdist = 0;
   var len = 1e20;
   var numpts = this.mesh.vertexbufferdata.length / this.mesh.vertexLength;
   for (var i=0;i<numpts;i++)
   {
   	 	vPos[0] = vWhere[0] - (this.mesh.vertexbufferdata[5*i] + this.vOffset[0]);
   	 	vPos[1] = vWhere[1] - (this.mesh.vertexbufferdata[5*i+1] + this.vOffset[1]);
   	 	vPos[2] = vWhere[2] - (this.mesh.vertexbufferdata[5*i+2] + this.vOffset[2]);
   	 	
   	 	curdist = vPos[0]*vPos[0] + vPos[1]*vPos[1] + vPos[2]*vPos[2];
         
         if (curdist < len)
         {
            len = curdist;
         }
   }
   
   return Math.sqrt(len);
   
}

//------------------------------------------------------------------------------
/**
* @description Create Empty Elevation Mesh (no data available)
* @ignore
*/
TerrainBlock.prototype._CreateElevationMesh = function()
{
   /** @type {Array.<number>} */
   var coords = new Array(4);
   /** @type {Array.<number>} */
   var xy_coord = new Array(2);
   /** @type {Array.<number>} */
   var xyz_cart = new Array(3);
   this.quadtree.QuadKeyToMercatorCoord(this.quadcode, coords);

   /** @type {number} */
   var x0 = coords[0];
   /** @type {number} */
   var y0 = coords[1];
   /** @type {number} */
   var x1 = coords[2];
   /** @type {number} */
   var y1 = coords[3];
   /** @type {number} */
   var gridsize;
   /** @type {number} */
   var curtainheight;
   
   this.haselevation = false;

   this.mesh = new Surface(this.engine);
   this.mesh.lod = this.quadcode.length;

   if (this.quadcode.length<3)
   {
      gridsize = 2;
      curtainheight = 100000;
   }
   else if (this.quadcode.length<6)
   {
      gridsize = 9;
      curtainheight = 100000;
   }
   else
   {
      gridsize = 5;
      curtainheight = 1000;
   }

   // bounding box:
   var bbminx = 1e20;
   var bbminy = 1e20;
   var bbminz = 1e20;
   var bbmaxx = -1e20;
   var bbmaxy = -1e20;
   var bbmaxz = -1e20;


   /** @type {Array.<number>} */
   var interleavedbuffer = new Array();
   /** @type {Array.<number>} */
   var indexbuffer = new Array();

   /** @type {number} */
   var dH = (y1-y0)/(gridsize-1); // for x positions
   /** @type {number} */
   var dW = (x1-x0)/(gridsize-1); // for y positions
   /** @type {number} */
   var fdX = 1.0 / (gridsize-1);

   // VERTICES

   var x_coord, y_coord;
   var x_cart, y_cart, z_cart;
   /** @type {GeoCoord} */
   var g = new GeoCoord();

   for (var y=0;y<gridsize;y++)
   {
      for (var x=0;x<gridsize;x++)
      {
         x_coord = x0 + x*dW;
         y_coord = y0 + y*dH;

         // Calculate 3D Position:
         Mercator.MercatorToWGS84(x_coord, y_coord, xy_coord);
         g.Set(xy_coord[0], xy_coord[1], 0.0);
         g.ToCartesian(xyz_cart);
         x_cart = xyz_cart[0];
         y_cart = xyz_cart[1];
         z_cart = xyz_cart[2];

         /*bbminx = Math.min(bbminx, x_cart);
         bbminy = Math.min(bbminy, y_cart);
         bbminz = Math.min(bbminz, z_cart);
         bbmaxx = Math.max(bbmaxx, x_cart);
         bbmaxy = Math.max(bbmaxy, y_cart);
         bbmaxz = Math.max(bbmaxz, z_cart);*/

         if (x==0 && y==0)
         {
            this.vOffset = [x_cart, y_cart, z_cart];
         }

         if (x==0 && y==0)
         {
            this.vTilePoints[0].Set(x_cart, y_cart, z_cart); 
         }
         else if (x==gridsize-1 && y==0)
         {
            this.vTilePoints[1].Set(x_cart, y_cart, z_cart); 
         }
         else if (x==gridsize-1 && y==gridsize-1)
         {
            this.vTilePoints[2].Set(x_cart, y_cart, z_cart); 
         }
         else if (x==0 && y==gridsize-1)
         {
            this.vTilePoints[3].Set(x_cart, y_cart, z_cart); 
         }
         else if (x==(gridsize-1)/2 && y==(gridsize-1)/2)
         {
            this.vTilePoints[4].Set(x_cart, y_cart, z_cart); 
         }

         // push position
         interleavedbuffer.push(x_cart - this.vOffset[0]);
         interleavedbuffer.push(y_cart - this.vOffset[1]);
         interleavedbuffer.push(z_cart - this.vOffset[2]);
         // push texcoord
         interleavedbuffer.push(x*fdX);
         interleavedbuffer.push(1-y*fdX);
      }
   }
   // add curtain vertices

   var elevation;
   var x,y;

   // (1) Corners:

   // NW-corner:
   x=0; y=gridsize-1;
   x_coord = x0 + x*dW;
   y_coord = y0 + y*dH;
   elevation = -curtainheight;
   Mercator.MercatorToWGS84(x_coord, y_coord, xy_coord); g.Set(xy_coord[0], xy_coord[1], elevation); g.ToCartesian(xyz_cart);
   x_cart = xyz_cart[0]; y_cart = xyz_cart[1]; z_cart = xyz_cart[2];
   // push position
   interleavedbuffer.push(x_cart - this.vOffset[0]);
   interleavedbuffer.push(y_cart - this.vOffset[1]);
   interleavedbuffer.push(z_cart - this.vOffset[2]);
   // push texcoord
   interleavedbuffer.push(x*fdX);
   interleavedbuffer.push(1-y*fdX);
   // SW-corner:
   x=0; y=0;
   x_coord = x0 + x*dW;
   y_coord = y0 + y*dH;
   elevation = -curtainheight;
   Mercator.MercatorToWGS84(x_coord, y_coord, xy_coord); g.Set(xy_coord[0], xy_coord[1], elevation); g.ToCartesian(xyz_cart);
   x_cart = xyz_cart[0]; y_cart = xyz_cart[1]; z_cart = xyz_cart[2];
   // push position
   interleavedbuffer.push(x_cart - this.vOffset[0]);
   interleavedbuffer.push(y_cart - this.vOffset[1]);
   interleavedbuffer.push(z_cart - this.vOffset[2]);
   // push texcoord
   interleavedbuffer.push(x*fdX);
   interleavedbuffer.push(1-y*fdX);
   // SE-corner:
   x=gridsize-1; y=0;
   x_coord = x0 + x*dW;
   y_coord = y0 + y*dH;
   elevation = -curtainheight;
   Mercator.MercatorToWGS84(x_coord, y_coord, xy_coord); g.Set(xy_coord[0], xy_coord[1], elevation); g.ToCartesian(xyz_cart);
   x_cart = xyz_cart[0]; y_cart = xyz_cart[1]; z_cart = xyz_cart[2];
   // push position
   interleavedbuffer.push(x_cart - this.vOffset[0]);
   interleavedbuffer.push(y_cart - this.vOffset[1]);
   interleavedbuffer.push(z_cart - this.vOffset[2]);
   // push texcoord
   interleavedbuffer.push(x*fdX);
   interleavedbuffer.push(1-y*fdX);
   // NE-corner:
   x=gridsize-1; y=gridsize-1;
   x_coord = x0 + x*dW;
   y_coord = y0 + y*dH;
   elevation = -curtainheight;
   Mercator.MercatorToWGS84(x_coord, y_coord, xy_coord); g.Set(xy_coord[0], xy_coord[1], elevation); g.ToCartesian(xyz_cart);
   x_cart = xyz_cart[0]; y_cart = xyz_cart[1]; z_cart = xyz_cart[2];
   // push position
   interleavedbuffer.push(x_cart - this.vOffset[0]);
   interleavedbuffer.push(y_cart - this.vOffset[1]);
   interleavedbuffer.push(z_cart - this.vOffset[2]);
   // push texcoord
   interleavedbuffer.push(x*fdX);
   interleavedbuffer.push(1-y*fdX);

   // (2) Remaining Points
   // vertices for west-border
   for (var i=1;i<gridsize-1;i++)
   {
      x = 0;
      y = gridsize-1-i;
      x_coord = x0 + x*dW;
      y_coord = y0 + y*dH;
      elevation = -curtainheight;
      Mercator.MercatorToWGS84(x_coord, y_coord, xy_coord); g.Set(xy_coord[0], xy_coord[1], elevation); g.ToCartesian(xyz_cart);
      x_cart = xyz_cart[0]; y_cart = xyz_cart[1]; z_cart = xyz_cart[2];
      // push position
      interleavedbuffer.push(x_cart - this.vOffset[0]);
      interleavedbuffer.push(y_cart - this.vOffset[1]);
      interleavedbuffer.push(z_cart - this.vOffset[2]);
      // push texcoord
      interleavedbuffer.push(x*fdX);
      interleavedbuffer.push(1-y*fdX);
   }

   // vertices for south-border
   for (var i=1;i<gridsize-1;i++)
   {
      x = i;
      y = 0;
      x_coord = x0 + x*dW;
      y_coord = y0 + y*dH;
      elevation = -curtainheight;
      Mercator.MercatorToWGS84(x_coord, y_coord, xy_coord); g.Set(xy_coord[0], xy_coord[1], elevation); g.ToCartesian(xyz_cart);
      x_cart = xyz_cart[0]; y_cart = xyz_cart[1]; z_cart = xyz_cart[2];
      // push position
      interleavedbuffer.push(x_cart - this.vOffset[0]);
      interleavedbuffer.push(y_cart - this.vOffset[1]);
      interleavedbuffer.push(z_cart - this.vOffset[2]);
      // push texcoord
      interleavedbuffer.push(x*fdX);
      interleavedbuffer.push(1-y*fdX);
   }

   // vertices for east-border
   for (var i=1;i<gridsize-1;i++)
   {
      x = gridsize-1;
      y = i;
      x_coord = x0 + x*dW;
      y_coord = y0 + y*dH;
      elevation = -curtainheight;
      Mercator.MercatorToWGS84(x_coord, y_coord, xy_coord); g.Set(xy_coord[0], xy_coord[1], elevation); g.ToCartesian(xyz_cart);
      x_cart = xyz_cart[0]; y_cart = xyz_cart[1]; z_cart = xyz_cart[2];
      // push position
      interleavedbuffer.push(x_cart - this.vOffset[0]);
      interleavedbuffer.push(y_cart - this.vOffset[1]);
      interleavedbuffer.push(z_cart - this.vOffset[2]);
      // push texcoord
      interleavedbuffer.push(x*fdX);
      interleavedbuffer.push(1-y*fdX);
   }

   // vertices for north-border
   for (var i=1;i<gridsize-1;i++)
   {
      x = gridsize-1-i;
      y = gridsize-1;
      x_coord = x0 + x*dW;
      y_coord = y0 + y*dH;
      elevation = -curtainheight;
      Mercator.MercatorToWGS84(x_coord, y_coord, xy_coord); g.Set(xy_coord[0], xy_coord[1], elevation); g.ToCartesian(xyz_cart);
      x_cart = xyz_cart[0]; y_cart = xyz_cart[1]; z_cart = xyz_cart[2];
      // push position
      interleavedbuffer.push(x_cart - this.vOffset[0]);
      interleavedbuffer.push(y_cart - this.vOffset[1]);
      interleavedbuffer.push(z_cart - this.vOffset[2]);
      // push texcoord
      interleavedbuffer.push(x*fdX);
      interleavedbuffer.push(1-y*fdX);
   }

   // INDICES
   for (var j=0;j<gridsize-1;j++)
   {
      for (var i=0;i<gridsize-1;i++)
      {
         /*  d    c
             +-- -+
             |  / |    Triangles: acd, abc
             |/   |
             +----+
             a    b
         */
         var a,b,c,d;

         a = i+j*gridsize;
         b = a+1;
         d = a+gridsize;
         c = d+1;

         indexbuffer.push(a);
         indexbuffer.push(c);
         indexbuffer.push(d);

         indexbuffer.push(a);
         indexbuffer.push(b);
         indexbuffer.push(c);

      }
   }

   // create indices for curtain
   var NW = gridsize*gridsize;
   var SW = NW+1;
   var SE = NW+2;
   var NE = NW+3;

   for (var i=0;i<gridsize-1;i++)
   {
      var s,t,v,u;
      s = (gridsize-i-1)*gridsize;
      t = (gridsize-i-2)*gridsize;
      if (i==0) { u = NW; } else { u=gridsize*gridsize+3+i; }
      if (i==gridsize-2) { v = SW;} else { v=gridsize*gridsize+4+i; }

      indexbuffer.push(s);
      indexbuffer.push(t);
      indexbuffer.push(v);
      indexbuffer.push(s);
      indexbuffer.push(v);
      indexbuffer.push(u);
   }


   // bottom curtain
   for (var i=0;i<gridsize-1;i++)
   {
      var s,t,v,u;
      s = i;
      t = i+1;
      if (i==0) { v = SW; } else { v=gridsize*gridsize+gridsize+1+i; }
      if (i==gridsize-2) { u = SE;} else { u=gridsize*gridsize+gridsize+2+i; }

      indexbuffer.push(t);
      indexbuffer.push(s);
      indexbuffer.push(v);
      indexbuffer.push(t);
      indexbuffer.push(v);
      indexbuffer.push(u);
   }

   // right curtain
   for (var i=0;i<gridsize-1;i++)
   {
      var s,t,v,u;
      s = (i+1)*gridsize-1;
      t = (i+2)*gridsize-1;
      if (i==0) { u = SE; } else { u=gridsize*gridsize+2*gridsize-1+i; }
      if (i==gridsize-2) { v = NE;} else { v=gridsize*gridsize+2*gridsize+i; }

      indexbuffer.push(t);
      indexbuffer.push(s);
      indexbuffer.push(u);
      indexbuffer.push(t);
      indexbuffer.push(u);
      indexbuffer.push(v);
   }

   // top cutrain
   for (var i=0;i<gridsize-1;i++)
   {
      var s,t,v,u;
      s = gridsize*gridsize-1-i;
      t = s-1;
      if (i==0) { u = NE; } else { u=gridsize*gridsize+3*gridsize-3+i; }
      if (i==gridsize-2) { v = NW;} else { v=gridsize*gridsize+3*gridsize-2+i; }

      indexbuffer.push(t);
      indexbuffer.push(s);
      indexbuffer.push(u);
      indexbuffer.push(t);
      indexbuffer.push(u);
      indexbuffer.push(v);
   }


   // Fill Mesh
   this.mesh.SetBufferPT(interleavedbuffer);
   this.mesh.SetIndexBuffer(indexbuffer, "TRIANGLES");
   this.mesh.SetTexture(this.texture);
   this.mesh.offset = this.vOffset;
   this.mesh.UpdateAABB();
   
}

//------------------------------------------------------------------------------
/**
 * @description Render a terrain block.
 * @param {boolean} nomaterial set to true for rendering without material
 * @param {boolean} hideelvonpt if true, don't render elevation if there is a point cloud tile
 */
TerrainBlock.prototype.Render = function(nomaterial, hideelvonpt)
{
   if (this.quadcode.length < 3)
      return;

   if (nomaterial)
   {
      this.tmpmodel.CopyFrom(this.engine.matModel);

      // virtual camera offset:
      this.tmpmodel._values[12] += this.vOffset[0];
      this.tmpmodel._values[13] += this.vOffset[1];
      this.tmpmodel._values[14] += this.vOffset[2];
      this.engine.PushMatrices();
      this.engine.SetModelMatrix(this.tmpmodel);
      this.mesh.DrawSolid();

      this.engine.PopMatrices();
   }
   else
   {
      if (this.bPostCreation)
      {
         this.bPostCreation = false;
         this.texture = new Texture(this.engine, true, 256, 256);

         this.engine.PushRenderTarget(this.texture);

         for (var i=0;i<this.images.length;i++)
         {
            if (this.images[i] != null)
            {
               if (this.images[i].transparency < 1.0)
               {
                  this.images[i].Blit(0,0,0, 0,1,1,true, true, this.images[i].transparency);
               }
               else
               {
                  this.images[i].Blit(0,0,0, 0,1,1,true, true, 1.0);
               }
            }
         }

         this.engine.PopRenderTarget();

         for (var i=0;i<this.images.length;i++)
         {
            if (this.images[i] != null)
            {
               this.images[i].Destroy();
            }
         }

         this.images = null;
         this.mesh.SetTexture(this.texture);
      }

      //------------------------------------------------------------------------

      this.tmpmodel.CopyFrom(this.engine.matModel);

      // virtual camera offset:
      this.tmpmodel._values[12] += this.vOffset[0];
      this.tmpmodel._values[13] += this.vOffset[1];
      this.tmpmodel._values[14] += this.vOffset[2];

      this.engine.PushMatrices();
      this.engine.SetModelMatrix(this.tmpmodel);

      if (this.engine.scene.nodeRenderObject.globerenderer.GetRenderEffect() == GlobeRenderer.RenderEffect.RGB)
      {
         this.mesh.mode = "pt";
      }
      else if (this.engine.scene.nodeRenderObject.globerenderer.GetRenderEffect() == GlobeRenderer.RenderEffect.CHROMADEPTH)
      {
         this.mesh.mode = "pt_chroma";
      }

      if (!(this.pointclouds.length > 0 && hideelvonpt))
      {
        this.mesh.Draw();
      }

      this.engine.PopMatrices();

      // render all streamed geometries
      for (var i=0;i<this.geometries.length;i++)
      {
         this.geometries[i].Render();
      }

      // render all streamed point clouds
      for (var i=0;i<this.pointclouds.length;i++)
      {
         this.pointclouds[i].Render();
      }
   }
   
}
//------------------------------------------------------------------------------
/**
 * @description Calc normal at current position
 */
TerrainBlock.prototype._CalcLocation = function()
{
   var crd = new Array(4);
   var wgs = new Array(2);
   this.quadtree.QuadKeyToMercatorCoord(this.quadcode, crd);
   
   var point0 = new Array(3);
   var point1 = new Array(3);
   var point2 = new Array(3);
   
   var xg, yg;
   var gc = new GeoCoord();
   
   //---- Calc First Point -----
   xg = crd[0]; yg= crd[1];
   Mercator.MercatorToWGS84(xg, yg, wgs);
   var lng = wgs[0];
   var lat = wgs[1];
   this.longitude0 = lng;
   this.latitude1  = lat;
   gc.Set(lng, lat, 0);
   gc.ToCartesian(point0);
   //---- Calc Second Point -----
   xg = crd[2]; yg= crd[1];
   Mercator.MercatorToWGS84(xg, yg, wgs);
   lng = wgs[0];
   lat = wgs[1];
   gc.Set(lng, lat, 0);
   gc.ToCartesian(point1);
   //---- Calc Third Point -----
   xg = crd[2]; yg= crd[3];
   Mercator.MercatorToWGS84(xg, yg, wgs);
   lng = wgs[0];
   lat = wgs[1];
   this.longitude1 = lng;
   this.latitude0  = lat;
   gc.Set(lng, lat, 0);
   gc.ToCartesian(point2);
   
   var u = new vec3();
   var v = new vec3();
   
   u.Set(point1[0]-point0[0], point1[1]-point0[1], point1[2]-point0[2]);
   v.Set(point2[0]-point0[0], point2[1]-point0[1], point2[2]-point0[2]);
   
   Cross(this._vNormal, u,v);
   this._vNormal.Normalize();  
}
