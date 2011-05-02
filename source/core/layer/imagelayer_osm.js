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
 * @description Image Layer for OpenStretMap Tile Service
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function OSMImageLayer()
{
   this.servers = null;
   this.layer = null;
   this.quadtree = new MercatorQuadtree();
   this.curserver = 0;
 
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
      var coords = new Array(4);
      var res = {};
      this.quadtree.QuadKeyToTileCoord(quadcode, res);
      
      var sFilename = this.servers[this.curserver] + "/" + 
                      res.lod + "/" + 
                      res.x + "/" + 
                      res.y + ".png"

      var ImageTexture = new Texture(engine);  
      ImageTexture.quadcode = quadcode;   // store quadcode in texture object
      ImageTexture.layer = layer;
      ImageTexture.cbfReady = cbfReady;   // store the ready callback in texture object
      ImageTexture.cbfFailed = cbfFailed; // store the failure callback in texture object
      ImageTexture.caller = caller;
      ImageTexture.loadTexture(sFilename, _cbOSMTileReady, _cbOSMTileFailed, true); 
  
 
      this.curserver++;
      if (this.curserver>=this.servers.length)
      {
         this.curserver = 0;
      }
 
   };
   //---------------------------------------------------------------------------
   this.GetMinLod = function()
   {
      return 0;
   }
   
   //---------------------------------------------------------------------------
   this.GetMaxLod = function()
   {
      return 16;
   }
   
   //---------------------------------------------------------------------------
   this.Contains = function(quadcode)
   {
      if (quadcode.length<17)
      {
         return true;
      }  
      return false;
   }
   //---------------------------------------------------------------------------
   
   this.Setup = function(serverlist)
   {
      // Please respect: http://wiki.openstreetmap.org/wiki/Tile_Usage_Policy
      
      // serverlist:
      //   ["http://a.tile.openstreetmap.org", "http://b.tile.openstreetmap.org", "http://c.tile.openstreetmap.org" ]
      //   or your own tileserver(s).
      // 
      
      this.servers = serverlist;

   }
}

OSMImageLayer.prototype = new ImageLayer();

//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
/**
* @description internal callback function for tiles
* @ignore
*/
function _cbOSMTileReady(imgTex)
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
function _cbOSMTileFailed(imgTex)
{
   imgTex.cbfFailed(imgTex.quadcode, imgTex.caller, imgTex.layer);
   imgTex.cbfReady = null;
   imgTex.cbfFailed = null;
   imgTex.quadcode = null; 
   imgTex.caller = null;
   imgTex.layer = null;
}
//------------------------------------------------------------------------------

