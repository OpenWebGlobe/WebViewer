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
   this.sLayerName = "";               // Layer Name (string)
   this.sLayerCopyright = "";          // Layer Copyright String
   this.nSRS;                          // Spatial Reference System: 3395 or 3785
   this.vBoundingBox = new Array(4);   // Bounding Box: ulx uly lrx lry
   this.nLevelofDetail = 0;            // Level of Detail
   this.nImageWidth;                   // for image datasets: original image width
   this.nImageHeight;                  // for image datasets: original image width
   this.nTileSize;                     // for image datasets: size of a tile (in pixel)
   this.vTileLayout = new Array(2);    // Tile Dimension: x y
   this.sTileFormat;                   // mime type of data, for example "image/png"
   this.vBounds = new Array(5);        // Zoom, TileX0, TileY0, TileX1, TileY1
   this.vCenterCoord = new Array(2);   // Dataset Center coord in WGS84
}

//------------------------------------------------------------------------------
/**
 * @description Holds information about a dataset (image, elevation, poi, ...)
 * @param url The URL where of the dataset info (JSON)
 */
DatasetInfo.prototype.Download(url)
{
   
}

//------------------------------------------------------------------------------
