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

goog.provide('owg.DatasetInfo');

goog.require('goog.debug.Logger');
goog.require('goog.json');

/**
 * @typedef {{
 *     boundingbox: Array.<number>,
 *     bounds: Array.<number>,
 *     center: Array.<number>,
 *     copyright: string,
 *     imageheight:number,
 *     imagewidth: number,
 *     layer: string,
 *     levelofdetail: number,
 *     srs: number,
 *     tileformat: string,
 *     tilelayout: Array.<number>,
 *     tilesize: number
 * }}
 */
var DatasetInfoJSON;

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Holds information about a dataset (image, elevation, poi, ...)
 * This is only required for an i3D Tile Service
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function DatasetInfo()
{
   /** @type boolean */
   this.bReady = false;            // true if dataset info is ready
   /** @type boolean */
   this.bFailed = false;           // true if download failed
   
   /** @type null|string */
   this.sLayerName = null;         // Layer Name (string)
   /** @type null|string */
   this.sLayerCopyright = null;    // Layer Copyright String
   /** @type null|string */
   this.nSRS = null;               // Spatial Reference System: 3395 or 3785
   /** @type Array.<number>|null */
   this.vBoundingBox = null;       // Bounding Box: ulx uly lrx lry
   /** @type null|number */
   this.nLevelofDetail = null;     // Level of Detail
   /** @type null|number */
   this.nImageWidth = null;        // for image datasets: original image width
   /** @type null|number */
   this.nImageHeight = null;       // for image datasets: original image width
   /** @type null|number */
   this.nTileSize = null;          // for image datasets: size of a tile (in pixel)
   /** @type Array.<number> */
   this.vTileLayout = null;        // Tile Dimension: x y
   /** @type null|string */
   this.sTileFormat = null;        // mime type of data, for example "image/png"
   /** @type Array.<number> */
   this.vBounds = null;            // Zoom, TileX0, TileY0, TileX1, TileY1
   /** @type Array.<number> */
   this.vCenterCoord = null;       // Dataset Center coord in WGS84
   /** @type string */
   this.sFileExtension = "";      // file extension.   
}

//------------------------------------------------------------------------------

/**
 * @param {DatasetInfo} dsi
 */
function _cbfdsidownload(dsi)
{
   if (dsi.http.readyState==4)
   {
      if (dsi.http.status==200)
      {
         var data=dsi.http.responseText;      
         var obj=/** @type {DatasetInfoJSON} */ goog.json.parse(data);
      
         dsi.sLayerName = obj['layer'];
         dsi.sLayerCopyright = obj['copyright'];
         dsi.nSRS = obj['srs'];
         dsi.vBoundingBox = obj['boundingbox'];
         dsi.nLevelofDetail = obj['levelofdetail'];
         dsi.nImageWidth = obj['imagewidth'];
         dsi.nImageHeight = obj['imageheight'];
         dsi.nTileSize = obj['tilesize'];
         dsi.vTileLayout = obj['tilelayout'];
         dsi.sTileFormat = obj['tileformat'];
         dsi.vBounds = obj['bounds'];
         dsi.vCenterCoord = obj['center'];
         
         if (dsi.sTileFormat == "image/png")
         {
            dsi.sFileExtension = ".png";
         }  
         else if (dsi.sTileFormat == "image/jpg")
         {
            dsi.sFileExtension = ".jpg"; 
         }
         else if (dsi.sTileFormat == "elevation/json")
         {
            dsi.sFileExtension = ".json"; 
         }
         
         goog.debug.Logger.getLogger('owg.Datasetinfo').info("Datasetinfo: " + dsi.sLayerName + "(" + dsi.sTileFormat + ")" + dsi.sLayerCopyright);
         
         dsi.bReady = true;     
      }
      else
      {
         goog.debug.Logger.getLogger('owg.Datasetinfo').warning("DATASET DOWNLOAD FAILED");
         dsi.bFailed = true;
      }
   }
}

//------------------------------------------------------------------------------
/**
 * @description Holds information about a dataset (image, elevation, poi, ...)
 * @param {string} url The URL where of the dataset info (JSON)
 */
DatasetInfo.prototype.Download = function(url)
{
   this.http=new XMLHttpRequest();
   this.http.open("GET",url,true);
   var me=this;
   this.http.onreadystatechange = function(){_cbfdsidownload(me);};
   this.http.send(); 
}

goog.exportSymbol('DatasetInfo', DatasetInfo);
goog.exportProperty(DatasetInfo.prototype, 'Download', DatasetInfo.prototype.Download);
