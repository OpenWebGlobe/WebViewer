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

goog.provide('owg.WMSImageLayer');

goog.require('owg.GlobeUtils');
goog.require('owg.ImageLayer');
goog.require('owg.MercatorQuadtree');
goog.require('owg.Texture');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description WMS Image Layer (WMS Server must support EPSG:900913)
 * @author Boguisław Kaczałek, boguslaw.kaczalek@opegieka.pl
 */
function WMSImageLayer()
{
   this.server = null;
   this.layer = null;
   this.format = null;
   this.style = null;
   this.version=null;
   this.transparency = 1.0;
   this.quadtree = new MercatorQuadtree();
 
   //---------------------------------------------------------------------------
   this.Ready = function()
   {
      return true;
   }
   //---------------------------------------------------------------------------
   this.Failed = function()
   {
      return false;
   }
   //---------------------------------------------------------------------------
   this.RequestTile = function(engine, quadcode, layer, cbfReady, cbfFailed, caller)
   {
      if (this.server.indexOf("?", this.server.length - 1) == -1){
          this.server+="?";
      }
      var coords = new Array(4);
      this.quadtree.QuadKeyToMercator(quadcode, coords);
      var bbox= coords[0]+","+coords[1]+","+coords[2]+","+coords[3];
      var sFilename = this.server + 
               "service=WMS"+
               "&request=GetMap" + 
               "&WIDTH=256" +
               "&HEIGHT=256" +
               "&TILED=TRUE" +
               "&SRS=EPSG%3A900913" +
               "&LAYERS=" + this.layer +
               "&STYLES=" + this.style +
               "&FORMAT="+ this.format +
               "&VERSION=" + this.version +
               "&BBOX=" + bbox;

      var ImageTexture = new Texture(engine);  
      ImageTexture.quadcode = quadcode;   // store quadcode in texture object
      ImageTexture.layer = layer;
      ImageTexture.cbfReady = cbfReady;   // store the ready callback in texture object
      ImageTexture.cbfFailed = cbfFailed; // store the failure callback in texture object
      ImageTexture.caller = caller;
      if (this.format=="image/png") {
          ImageTexture.transparency = this.transparency;
      }
      ImageTexture.loadTexture(sFilename, _cbWMSTileReady, _cbWMSTileFailed, true);
   };
   //---------------------------------------------------------------------------
   this.GetMinLod = function()
   {
      return 0;
   }
   
   //---------------------------------------------------------------------------
   this.GetMaxLod = function()
   {
      return 30;
   }
   //---------------------------------------------------------------------------
   this.Contains = function(quadcode)
   {
      if (quadcode.length<31)
      {
         return true;
      }  
      return false;
   }
   //---------------------------------------------------------------------------
   this.Setup = function(server,layer,format,style,version,transparency)
   {   
   this.server = server;
   this.layer = layer;
   this.format = format;
   this.style = style;
   this.version = version;
   this.transparency = transparency;
      //load defaults if not provided
   if (this.format == null) {this.format = "image/png"};
   if (this.style == null) {this.style = ""};
   if (this.version == null) {this.version="1.1.1"};
   if (this.transparency == null) {this.transparency="1.0"};
   }
}

WMSImageLayer.prototype = new ImageLayer();

//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
/**
* @description internal callback function for tiles
* @ignore
*/
function _cbWMSTileReady(imgTex)
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
function _cbWMSTileFailed(imgTex)
{
   imgTex.cbfFailed(imgTex.quadcode, imgTex.caller, imgTex.layer);
   imgTex.cbfReady = null;
   imgTex.cbfFailed = null;
   imgTex.quadcode = null; 
   imgTex.caller = null;
   imgTex.layer = null;
}
//------------------------------------------------------------------------------

