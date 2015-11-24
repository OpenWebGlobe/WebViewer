/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/


goog.provide('owg.TMSImageLayer');

goog.require('owg.GlobeUtils');
goog.require('owg.OSMImageLayer');
goog.require('owg.MercatorQuadtree');
goog.require('owg.Texture');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Image Layer for Tile Map Service
 * @author Feng Lei, fenglei@aoe.ac.cn
 */
function TMSImageLayer()
{
   this.transparency = 1.0;
   
   //---------------------------------------------------------------------------
   this.RequestTile = function(engine, quadcode, layer, cbfReady, cbfFailed, caller)
   {
      var coords = new Array(4);
      var res = {};
      this.quadtree.QuadKeyToTileCoord(quadcode, res);
      res.y = Math.pow(2, res.lod)- 1 - res.y;
      var sFilename = this.servers[this.curserver] + "/" + 
                      res.lod + "/" + 
                      res.x + "/" + 
                      res.y + ".png";
      
                      
                  

      var ImageTexture = new Texture(engine);  
      ImageTexture.quadcode = quadcode;   // store quadcode in texture object
      ImageTexture.layer = layer;
      ImageTexture.cbfReady = cbfReady;   // store the ready callback in texture object
      ImageTexture.cbfFailed = cbfFailed; // store the failure callback in texture object
      ImageTexture.caller = caller;
      ImageTexture.transparency = this.transparency;
      ImageTexture.loadTexture(sFilename, _cbOSMTileReady, _cbOSMTileFailed, true); 
       
 
   };
   
}

TMSImageLayer.prototype = new OSMImageLayer();

//------------------------------------------------------------------------------


