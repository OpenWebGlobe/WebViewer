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
 * @description Holds information about a dataset (image, elevation, poi, ...)
 * This is only required for an i3D Tile Service
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function DatasetInfo()
{
   this.bReady = false;            // true if dataset info is ready
   this.bFailed = false;           // true if download failed
   
   this.sLayerName = null;         // Layer Name (string)
   this.sLayerCopyright = null;    // Layer Copyright String
   this.nSRS = null;               // Spatial Reference System: 3395 or 3785
   this.vBoundingBox = null;       // Bounding Box: ulx uly lrx lry
   this.nLevelofDetail = null;     // Level of Detail
   this.nImageWidth = null;        // for image datasets: original image width
   this.nImageHeight = null;       // for image datasets: original image width
   this.nTileSize = null;          // for image datasets: size of a tile (in pixel)
   this.vTileLayout = null;        // Tile Dimension: x y
   this.sTileFormat = null;        // mime type of data, for example "image/png"
   this.vBounds = null;            // Zoom, TileX0, TileY0, TileX1, TileY1
   this.vCenterCoord = null;       // Dataset Center coord in WGS84
   this.sFileExtension = "";      // file extension.   
}

//------------------------------------------------------------------------------
/**
 * @description Holds information about a dataset (image, elevation, poi, ...)
 * @param url The URL where of the dataset info (JSON)
 */
DatasetInfo.prototype.Download = function(url)
{
   if(url == null) 
   {
      alert("invalid url");
      return;
   }  
  
   this.http=new XMLHttpRequest();
   this.http.open("GET",url,true);
   var me=this;
   this.http.onreadystatechange = function(){_cbfdsidownload(me);};
   this.http.send(); 
}

//------------------------------------------------------------------------------

_cbfdsidownload = function(dsi)
{
   if (dsi.http.readyState==4)
   {
      if (dsi.http.status==200)
      {
         var data=dsi.http.responseText;      
         var obj=JSON.parse(data);
      
         dsi.sLayerName = obj.layer;         
         dsi.sLayerCopyright = obj.copyright;    
         dsi.nSRS = obj.srs;               
         dsi.vBoundingBox = obj.boundingbox;       
         dsi.nLevelofDetail = obj.levelofdetail;     
         dsi.nImageWidth = obj.imagewidth;        
         dsi.nImageHeight = obj.imageheight;       
         dsi.nTileSize = obj.tilesize;          
         dsi.vTileLayout = obj.tilelayout;        
         dsi.sTileFormat = obj.tileformat;        
         dsi.vBounds = obj.bounds;            
         dsi.vCenterCoord = obj.center;
         
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
         
         console.log("Datasetinfo: " + dsi.sLayerName + "(" + dsi.sTileFormat + ")" + dsi.sLayerCopyright);
         
         dsi.bReady = true;     
      }
      else
      {
         console.log("DATASET DOWNLOAD FAILED");
         dsi.bFailed = true;
      }
   }
}