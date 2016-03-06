/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
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
 * @description WMS Image Layer (Mercator Projection)
 * some wms server can't work,The reason why vmap0.tiles.osgeo.org doesn't work is:
 * that server doesn't send the header "Access-Control-Allow-Origin: *".
 * This is required for WebGL because of security issues.
 * More info here: http://forums.openwebglobe.org/viewtopic.php?f=4&t=7
 * The imagelayer_wms.js was finished debug by debug-wms.html 
 * @author Boguisław Kaczałek, boguslaw.kaczalek@opegieka.pl
 * modified by gouguijia@gmail.com
 */
function WMSImageLayer()
{
   this.server = null;
   this.layer = null;
   this.format = null;
   this.style = null;
   this.version=null;
   this.transparency = 1.0;
   this.SRS=null;
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
     var separator = "?";
     var index = this.server[0].indexOf("?");
	  
	  if (index > 0 && index < (this.server[0].length - 1)) 
	  {
		 separator = "&";		
	  }
	  
      var coords = new Array(4);
      if(this.SRS=="EPSG%3A4326")
      {
         this.quadtree.QuadKeyToWGS84(quadcode, coords);
      }
      else // EPSG:900913, ESRI:102100, ESRI:102113, EPSG:3785, EPSG:3857
      {
         this.quadtree.QuadKeyToMercator(quadcode, coords);
      }
	   var bbox = coords.join(",");

      var sFilename = this.server + 
         separator +
         "service=WMS"+
         "&request=GetMap" + 
         "&WIDTH=256" +
         "&HEIGHT=256" +
         "&TILED=TRUE" +
         "&SRS=" + this.SRS      +     // deprecated -> EPSG%3A3857
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
   
   this.Setup = function(server,layer,SRS,format,style,version,transparency)
   {   
      this.server = server;
      this.layer = layer;
      this.format = format;
      this.style = style;
      this.version = version;
      this.transparency = transparency;
      this.SRS = SRS;
      //load defaults if not provided
      if (this.format == null) {this.format = "image/png";}
      if (this.style == null) {this.style = "";}
      if (this.version == null) {this.version="1.1.1";}
      if (this.SRS==null){this.SRS="EPSG%3A900913";}
      if (this.SRS=="EPSG:900913"){this.SRS="EPSG%3A900913";}
      if (this.SRS=="ESRI:102100"){this.SRS="ESRI%3A102100";}
      if (this.SRS=="ESRI:102113"){this.SRS="ESRI%3A102113";}
      if (this.SRS=="EPSG:3785"){this.SRS="EPSG%3A3785";}
      if (this.SRS=="EPSG:3857"){this.SRS="EPSG%3A3857";}
      if (this.SRS=="EPSG:4326"){this.SRS="EPSG%3A4326";}

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

