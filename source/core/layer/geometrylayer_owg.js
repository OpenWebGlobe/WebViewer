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
#                              (c) 2010-2013 by                                #
#           University of Applied Sciences Northwestern Switzerland            #
#                     Institute of Geomatics Engineering                       #
#                           martin.christen@fhnw.ch                            #
********************************************************************************
*     Licensed under MIT License. Read the file LICENSE for more information   *
*******************************************************************************/

goog.provide('owg.owgGeometryLayer');

goog.require('owg.GlobeUtils');
goog.require('owg.ImageLayer');
goog.require('owg.MercatorQuadtree');
goog.require('owg.Texture');
goog.require('owg.GeometryLayer');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Image Layer for i3d Tile Service
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function owgGeometryLayer()
{
   this.layer = null;
   this.quadtree = new MercatorQuadtree();
   this.coords = new Array(4);
   this.transparency = 1.0;
   this.curserver = 0;
   this.minlod = -1;
   this.maxlod = -1;
   
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
   
   /**
   * @description Request a geometry tile  by entering a quadcode
   * the following callback functions must be specified:
   *   cbfReady(quadcode, ) : called when request successfull. Holds the quadcode and the texture object
   *   cbfFailed(quadcode) : called when request failed
   */
   this.RequestTile = function(engine, quadcode, layer, cbfReady, cbfFailed, caller)
   {
      if (!this.Ready())
      {  
         return;
      }
      
      var coords = new Array(4);
      var res = {};
      var extent;
      this.quadtree.QuadKeyToWGS84(quadcode, coords);
      extent="extent="+ coords[1]+","+coords[2]+","+coords[3]+","+coords[0];
      var sFilename = this.servers[this.curserver] + "/?" + extent + "&format=owg";

      // create mesh
      /*var GeometryMesh = new Surface(engine);
      GeometryMesh.quadcode = quadcode;   // store quadcode in texture object
      GeometryMesh.layer = layer;
      GeometryMesh.cbfReady = cbfReady;   // store the ready callback in mesh object
      GeometryMesh.cbfFailed = cbfFailed; // store the failure callback in mesh object
      GeometryMesh.caller = caller;
      GeometryMesh.loadFromJSON(sFilename, _cbGeometryTileReady_owg, _cbGeometryTileFailed_owg);
      */
      this.curserver++;
      if (this.curserver>=this.servers.length)
      {
         this.curserver = 0;
      }
      
   };
  
   //---------------------------------------------------------------------------
   this.GetMinLod = function()
   {
      return this.minlod;
   }
   
   //---------------------------------------------------------------------------
   this.GetMaxLod = function()
   {
      return this.maxlod;
   }
   //---------------------------------------------------------------------------
   
   this.Contains = function(quadcode)
   {
      if (quadcode.length > this.maxlod)
      {
         return false;
      }
      else if (quadcode.length < this.minlod)
      {
         return false;
      }

      return true;
   }
   
   //---------------------------------------------------------------------------
   
   this.Setup = function(servers, minlod, maxlod)
   {
      this.servers = servers;
      this.minlod = minlod;
      this.maxlod = maxlod;
   }
}


//------------------------------------------------------------------------------
owgGeometryLayer.prototype = new GeometryLayer();
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
/**
 * @description internal callback function for tiles
 * @ignore
 */
function _cbGeometryTileReady_owg(mesh)
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
function _cbGeometryTileFailed_owg(mesh)
{
   mesh.cbfFailed(mesh.quadcode, mesh.caller, mesh.layer);
   mesh.cbfReady = null;
   mesh.cbfFailed = null;
   mesh.quadcode = null;
   mesh.caller = null;
   mesh.layer = null;
}
//------------------------------------------------------------------------------

goog.exportSymbol('owgGeometryLayer', owgGeometryLayer);
goog.exportProperty(owgGeometryLayer.prototype, 'Failed', owgGeometryLayer.prototype.Failed);
goog.exportProperty(owgGeometryLayer.prototype, 'Ready', owgGeometryLayer.prototype.Ready);
goog.exportProperty(owgGeometryLayer.prototype, 'RequestTile', owgGeometryLayer.prototype.RequestTile);
goog.exportProperty(owgGeometryLayer.prototype, 'Setup', owgGeometryLayer.prototype.Setup);
