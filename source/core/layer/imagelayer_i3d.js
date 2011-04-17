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
function i3dImageLayer()
{
   this.dsi = new DatasetInfo();  // dataset info
   this.server = null;
   this.layer = null;
   
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
   this.RequestTile = function(engine, quadcode, cbfReady, cbfFailed)
   {
      if (!this.Ready())
      {  
         return;
      }
      
      var sQCH = GlobeUtils.MakeHierarchicalFilename(quadcode+this.dsi.sFileExtension);
      var sFilename = this.server + "/" + 
                      this.layer + "/" + 
                      sQCH;
                      
      var ImageTexture = new Texture(engine);  
      ImageTexture.quadcode = quadcode;   // store quadcode in texture object
      ImageTexture.cbfReady = cbfReady;   // store the ready callback in texture object
      ImageTexture.cbfFailed = cbfFailed; // store the failure callback in texture object
      ImageTexture.loadTexture(sFilename, _cbTileReady, _cbTileFailed); 
      
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
         return this.dsi.nLevelofDetail;
      }
      else
      {
         return 0;
      }
   }
   //---------------------------------------------------------------------------
   
   this.Setup = function(server, layer)
   {
      this.server = server;
      this.layer = layer;
     /* Example for i3d Tile-Service.
        World500 Data is located at http://www.openwebglobe.org/data/img/
        
        server="http://www.openwebglobe.org/data/img/"
        layer="World500"
      */
      datasetfile = server + "/" + layer + ".json";
      this.dsi.Download(datasetfile);
   }
}


//------------------------------------------------------------------------------
i3dImageLayer.prototype = new ImageLayer();
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
/**
* @description internal callback function for tiles
* @ignore
*/
function _cbTileReady(imgTex)
{
   imgTex.cbfReady(imgTex.quadcode, imgTex);
   imgTex.cbfReady = null;
   imgTex.cbfFailed = null;
   imgTex.quadcode = null;
}
//------------------------------------------------------------------------------
/**
 * @description internal callback function for tiles
 * @ignore
 */
function _cbTileFailed(imgTex)
{
   imgTex.cbfFailed(imgTex.quadcode);
   imgTex.cbfReady = null;
   imgTex.cbfFailed = null;
   imgTex.quadcode = null; 
}
//------------------------------------------------------------------------------




