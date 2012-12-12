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

goog.provide('owg.WMTSImageLayer');

goog.require('owg.GlobeUtils');
goog.require('owg.OSMImageLayer');
goog.require('owg.MercatorQuadtree');
goog.require('owg.Texture');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Image Layer for (global) WMTS Service
 * @author Rostislav Nétek
 */
function WMTSImageLayer()
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
   this.RequestTile = function(engine, quadcode,  layer, cbfReady, cbfFailed, caller)
   {

       var res = {};

       this.quadtree.QuadKeyToTileCoord(quadcode, res);

       // res.y = Math.pow(2, res.lod)- 1 - res.y;


      // example: http://maps.opengeo.org/geowebcache/service/wmts/?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=openstreetmap&STYLE=default&TILEMATRIXSET=EPSG%3A900913&TILEMATRIX=EPSG%3A900913:0&TILEROW=0&TILECOL=0&FORMAT=image%2Fpng

       var sFilename = this.server + 
               "?SERVICE=WMTS" +
			   "&REQUEST=GetTile" +
			   "&VERSION=1.0.0" +
			   "&LAYER=" + this.layer +
			   "&STYLE=default" +
			   "&TILEMATRIXSET=EPSG:900913" +
			   "&TILEMATRIX=EPSG%3A900913:" + res.lod +
			   "&TILEROW=" + res.y +
			   "&TILECOL=" + res.x +
			   "&FORMAT=image%2Fpng" ;
                  

      var ImageTexture = new Texture(engine);  
       ImageTexture.quadcode = quadcode;   // store quadcode in texture object
      ImageTexture.layer = layer;
      ImageTexture.cbfReady = cbfReady;   // store the ready callback in texture object
      ImageTexture.cbfFailed = cbfFailed; // store the failure callback in texture object
      ImageTexture.caller = caller;
      ImageTexture.transparency = this.transparency;
	  ImageTexture.loadTexture(sFilename, _cbWMTSTileReady, _cbWMTSTileFailed, true); 
       
 
   };
    //---------------------------------------------------------------------------
    this.GetMinLod = function()
    {
        return 0;
    }

    //---------------------------------------------------------------------------
    this.GetMaxLod = function()
    {
        return 19;
    }

    //---------------------------------------------------------------------------
    this.Contains = function(quadcode)
    {
        return true;
        /*var coords = new Array(4);
      this.quadtree.QuadKeyToWGS84(quadcode, coords);

        if (coords[0]>=11.082166373399 & coords[2]<=20.502862286818
            & coords[1]>=47.164615828422 & coords[3]<=51.874963785131)

        {
            return true;
        }
        return false;*/
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
        if (this.version == null) {this.version="1.0.0";}
        if (this.SRS==null){this.SRS="EPSG%3A900913";}
        if (this.SRS=="EPSG:900913"){this.SRS="EPSG%3A900913";}
        if (this.SRS=="ESRI:102100"){this.SRS="ESRI%3A102100";}
        if (this.SRS=="ESRI:102113"){this.SRS="ESRI%3A102113";}
        if (this.SRS=="EPSG:3785"){this.SRS="EPSG%3A3785";}
        if (this.SRS=="EPSG:3857"){this.SRS="EPSG%3A3857";}
        if (this.SRS=="EPSG:4326"){this.SRS="EPSG%3A4326";}

    }
   
}
WMTSImageLayer.prototype = new ImageLayer();


//------------------------------------------------------------------------------
/**
 * @description internal callback function for tiles
 * @ignore
 */
function _cbWMTSTileReady(imgTex)
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
function _cbWMTSTileFailed(imgTex)
{
    imgTex.cbfFailed(imgTex.quadcode, imgTex.caller, imgTex.layer);
    imgTex.cbfReady = null;
    imgTex.cbfFailed = null;
    imgTex.quadcode = null;
    imgTex.caller = null;
    imgTex.layer = null;
}
//------------------------------------------------------------------------------
