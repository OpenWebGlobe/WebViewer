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

goog.provide('owg.owgImageLayer');

goog.require('owg.DatasetInfo');
goog.require('owg.GlobeUtils');
goog.require('owg.ImageLayer');
goog.require('owg.MercatorQuadtree');
goog.require('owg.Texture');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Image Layer for i3d Tile Service
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function owgImageLayer()
{
   this.dsi = new DatasetInfo();  // dataset info
   this.layer = null;
   this.quadtree = new MercatorQuadtree();
   this.coords = new Array(4);
   this.transparency = 1.0;
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
   * @description Request an image tile (in i3d tile format) by entering a quadcode
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
      
      var sFilename = this.servers[this.curserver] + "/" + this.layer + "/tiles/" +
                      res.lod + "/" + 
                      res.x + "/" + 
                      res.y + this.dsi.sFileExtension;
                                
      var ImageTexture = new Texture(engine);  
      ImageTexture.quadcode = quadcode;   // store quadcode in texture object
      ImageTexture.layer = layer;
      ImageTexture.cbfReady = cbfReady;   // store the ready callback in texture object
      ImageTexture.cbfFailed = cbfFailed; // store the failure callback in texture object
      ImageTexture.caller = caller;
      ImageTexture.transparency = this.transparency;
      ImageTexture.loadTexture(sFilename, _cbTileReadyowg, _cbTileFailedowg, true);
      
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
   
   this.Setup = function(servers, layer, transparency)
   {
      if (transparency == null)
      {
         this.transparency = 1;
      }
      else
      {
         this.transparency = transparency;
      }
      this.servers = servers;
      this.layer = layer;
     /* Example for i3d Tile-Service.
        World500 Data is located at http://www.openwebglobe.org/data/img/
        
        server="http://www.openwebglobe.org/data/img/"
        layer="World500"
      */
      var datasetfile = servers[0] + "/" + layer + "/layersettings.json";
      this.dsi.Download(datasetfile);
   }
}


//------------------------------------------------------------------------------
owgImageLayer.prototype = new ImageLayer();
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
/**
* @description internal callback function for tiles
* @ignore
*/
function _cbTileReadyowg(imgTex)
{
   imgTex.cbfReady(imgTex.quadcode, imgTex, imgTex.layer);
   imgTex.cbfReady = null;
   imgTex.cbfFailed = null;
   imgTex.quadcode = null;
   imgTex.caller = null;
   imgTex.layer = null;
}
//------------------------------------------------------------------------------
/**
 * @description internal callback function for tiles
 * @ignore
 */
function _cbTileFailedowg(imgTex)
{
   imgTex.cbfFailed(imgTex.quadcode, imgTex.caller, imgTex.layer);
   imgTex.cbfReady = null;
   imgTex.cbfFailed = null;
   imgTex.quadcode = null; 
   imgTex.caller = null;
   imgTex.layer = null;
}
//------------------------------------------------------------------------------

goog.exportSymbol('owgImageLayer', owgImageLayer);
goog.exportProperty(owgImageLayer.prototype, 'Failed', owgImageLayer.prototype.Failed);
goog.exportProperty(owgImageLayer.prototype, 'Ready', owgImageLayer.prototype.Ready);
goog.exportProperty(owgImageLayer.prototype, 'RequestTile', owgImageLayer.prototype.RequestTile);
goog.exportProperty(owgImageLayer.prototype, 'Setup', owgImageLayer.prototype.Setup);
