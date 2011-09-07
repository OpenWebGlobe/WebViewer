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

goog.provide('owg.owgElevationLayer');

goog.require('owg.DatasetInfo');
goog.require('owg.ElevationLayer');
goog.require('owg.GlobeUtils');
goog.require('owg.MercatorQuadtree');
goog.require('owg.Surface');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Image Layer for OpenWebGlobe Tile Service
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function owgElevationLayer()
{
   this.dsi = new DatasetInfo();  // dataset info
   /** @type {?string} */
   this.server = null;
   /** @type {?string} */
   this.layer = null;
   this.quadtree = new MercatorQuadtree();
   this.coords = new Array(4);
   this.curserver = 0;
   
   //---------------------------------------------------------------------------
   this.Ready = function()
   {
      return this.dsi.bReady;
   }
   //---------------------------------------------------------------------------
   this.Failed = function()
   {
      return this.dsi.bFailed;
   }
   //---------------------------------------------------------------------------
   
   /**
   * @description Request an elevation tile (in i3d tile format) by entering a quadcode
   * the following callback functions must be specified:
   *   cbfReady(quadcode, Texture) : called when request successfull. Holds the quadcode and the texture object
   *   cbfFailed(quadcode) : called when request failed
   */
   this.RequestTile = function(engine, quadcode, layer, cbfReady, cbfFailed, caller)
   {
      if (!this.Ready())
      {  
         return;
      }
      
      var coords = new Array(4);
      var res = {};
      this.quadtree.QuadKeyToTileCoord(quadcode, res);
      
      // filename of owg-elevation tile service
      var sFilename = this.servers[this.curserver] + "/" + this.layer + "/tiles/" +
                      res.lod + "/" + 
                      res.x + "/" + 
                      res.y + ".json"
                                
      // create mesh    
      var ElevationMesh = new Surface(engine);   
      ElevationMesh.quadcode = quadcode;   // store quadcode in texture object
      ElevationMesh.layer = layer;
      ElevationMesh.cbfReady = cbfReady;   // store the ready callback in mesh object
      ElevationMesh.cbfFailed = cbfFailed; // store the failure callback in mesh object
      ElevationMesh.caller = caller;  
      ElevationMesh.loadFromJSON(sFilename, _cbElevationTileReady_owg, _cbElevationTileFailed_owg);
   
      this.curserver++;
      if (this.curserver>=this.servers.length)
      {
         this.curserver = 0;
      }
      
   };
  
   //---------------------------------------------------------------------------
   this.GetMinLod = function()
   {
      return 0;   // all i3d layers have min lod 0
   }
   
   //---------------------------------------------------------------------------
   this.GetMaxLod = function()
   {
      if (this.dsi.nLevelofDetail)
      {
         return this.dsi.nLevelofDetail-1;
      }
      else
      {
         return 0;
      }
   }
   //---------------------------------------------------------------------------
   
   this.Contains = function(quadcode)
   {
      if (quadcode.length > this.dsi.nLevelofDetail-1)
      {
         return false;
      }
      
      var quadcode0 = quadcode;
      var quadcode1 = quadcode;
      
      for (var i=0;i<this.dsi.nLevelofDetail-quadcode.length;i++)
      {
         quadcode0 += '0';
         quadcode1 += '3';
      }
      var result = {};
      this.quadtree.QuadKeyToTileCoord(quadcode0, result);
      var x0 = result.x;
      var y0 = result.y;
      this.quadtree.QuadKeyToTileCoord(quadcode1, result);
      var x1 = result.x;
      var y1 = result.y;
      
      var xmin = this.dsi.vBoundingBox[0];
      var ymin = this.dsi.vBoundingBox[1];
      var xmax = this.dsi.vBoundingBox[2];
      var ymax = this.dsi.vBoundingBox[3];
      
      return !(x0 > xmax || x1 < xmin || y0 > ymax || y1 < ymin);
   }
   
   //---------------------------------------------------------------------------
   
   this.Setup = function(servers, layer)
   {
      this.servers = servers;
      this.layer = layer;

      var datasetfile = servers[0] + "/" + layer + "/layersettings.json";
      this.dsi.Download(datasetfile);
   }
}


//------------------------------------------------------------------------------
owgElevationLayer.prototype = new ElevationLayer();
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
/**
* @description internal callback function for tiles
* @ignore
*/
function _cbElevationTileReady_owg(mesh)
{
   mesh.cbfReady(mesh.quadcode, mesh, mesh.layer);
   mesh.cbfReady = null;
   mesh.cbfFailed = null;
   mesh.quadcode = null;
   mesh.caller = null;
   mesh.layer = null;
}
//------------------------------------------------------------------------------
/**
 * @description internal callback function for tiles
 * @ignore
 */
function _cbElevationTileFailed_owg(mesh)
{
   mesh.cbfFailed(mesh.quadcode, mesh.caller, mesh.layer);
   mesh.cbfReady = null;
   mesh.cbfFailed = null;
   mesh.quadcode = null; 
   mesh.caller = null;
   mesh.layer = null;
}
//------------------------------------------------------------------------------




