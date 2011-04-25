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
 * @description Image Layer for i3d Tile Service
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function i3dElevationLayer()
{
   this.dsi = new DatasetInfo();  // dataset info
   this.server = null;
   this.layer = null;
   this.quadtree = new MercatorQuadtree();
   this.coords = new Array(4);
   
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
      
      //#fixme: MakeHierarchicalFilename must support ".json" ending!
      //var sQCH = GlobeUtils.MakeHierarchicalFilename(quadcode+this.dsi.sFileExtension);
      var sQCH = GlobeUtils.MakeHierarchicalFilename(quadcode+".jso") + "n"; 
      var sFilename = this.server + "/" + 
                      this.layer + "_JSON/" + 
                      sQCH;
                                
      // create mesh    
      var ElevationMesh = new Mesh(engine);   
      ElevationMesh.quadcode = quadcode;   // store quadcode in texture object
      ElevationMesh.layer = layer;
      ElevationMesh.cbfReady = cbfReady;   // store the ready callback in mesh object
      ElevationMesh.cbfFailed = cbfFailed; // store the failure callback in mesh object
      ElevationMesh.caller = caller;  
      ElevationMesh.loadFromJSON(sFilename, _cbElevationTileReady_intern, _cbElevationTileFailed_intern);                
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
      if (quadcode.length > this.dsi.nLevelofDetail)
      {
         return false;
      }
      
      this.quadtree.QuadKeyToMercatorCoord(quadcode, this.coords);
      
      var ulx = this.coords[0];
      var uly = this.coords[1];
      var lrx = this.coords[2];
      var lry = this.coords[3];
      
      var xmin = this.dsi.vBoundingBox[0];
      var ymax = this.dsi.vBoundingBox[1];
      var xmax = this.dsi.vBoundingBox[2];
      var ymin = this.dsi.vBoundingBox[3];  
            
      if (   lry > ymax || lry > ymax || uly < ymin || uly < ymin || 
             ulx > xmax || ulx > xmax || lrx < xmin || lrx < xmin)
      {
            return false;
      }
      
      return true;
   }
   
   //---------------------------------------------------------------------------
   
   this.Setup = function(server, layer)
   {
      this.server = server;
      this.layer = layer;
     /* Example for i3d Tile-Service.
        SRTM Data is located at http://www.openwebglobe.org/data/elv/
        
        server="http://www.openwebglobe.org/data/elv/"
        layer="SRTM"
      */
      datasetfile = server + "/" + layer + ".json";
      this.dsi.Download(datasetfile);
   }
}


//------------------------------------------------------------------------------
i3dElevationLayer.prototype = new ElevationLayer();
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
/**
* @description internal callback function for tiles
* @ignore
*/
function _cbElevationTileReady_intern(mesh)
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
function _cbElevationTileFailed_intern(mesh)
{
   mesh.cbfFailed(mesh.quadcode, mesh.caller, mesh.layer);
   mesh.cbfReady = null;
   mesh.cbfFailed = null;
   mesh.quadcode = null; 
   mesh.caller = null;
   mesh.layer = null;
}
//------------------------------------------------------------------------------




