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
 #                              (c) 2010-2014 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/

goog.provide('owg.owgPointCloudLayer');

goog.require('owg.GlobeUtils');
goog.require('owg.ImageLayer');
goog.require('owg.MercatorQuadtree');
goog.require('owg.Texture');
goog.require('owg.PointCloudLayer');
goog.require('owg.Geometry');


//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Point Cloud Layer for owg Tile Service
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function owgPointCloudLayer()
{
    this.layer = null;
    this.quadtree = new MercatorQuadtree();
    this.coords = new Array(4);
    this.transparency = 1.0;
    this.curserver = 0;
    this.minlod = -1;
    this.maxlod = -1;
    this.maxpts = 40000;

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
     *   cbfReady(quadcode, ) : called when request successfull. Holds the quadcode and the point cloud object
     *   cbfFailed(quadcode) : called when request failed
     */
    this.RequestTile = function(engine, quadcode, index, cbfReady, cbfFailed, caller)
    {
        if (!this.Ready())
        {
            return;
        }

        // Example Request:
        // http://myserver.com/myscript.php?src=16&lon0=7.583253&lat0=47.566965&lon1=7.58459&lat1=47.567558&pts=40000
        var coords = new Array(4);
        var res = {};
        var extent;
        this.quadtree.QuadKeyToWGS84(quadcode, coords);
        extent="&lon0="+ coords[1]+"&lat0="+coords[2]+"&lon1="+coords[3]+"&lat1="+coords[0];
        var sFilename = this.servers[this.curserver] + "?" + "layer=" + this.layer + extent + "&points=" + this.maxpts;

        // create geometry
        var PointCloudBlock = new PointCloud(engine);
        PointCloudBlock.quadcode = quadcode;   // store quadcode in texture object
        PointCloudBlock.layer = index;
        PointCloudBlock.cbfReady = cbfReady;   // store the ready callback in mesh object
        PointCloudBlock.cbfFailed = cbfFailed; // store the failure callback in mesh object
        PointCloudBlock.caller = caller;
        PointCloudBlock.Load(sFilename, _cbPointCloudTileReady_owg, _cbPointCloudTileFailed_owg);

        // handle multiple tile servers
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

    this.Setup = function(servers, layer, minlod, maxlod)
    {
        this.servers = servers;
        this.layer = layer;
        this.minlod = minlod;
        this.maxlod = maxlod;
    }
}


//------------------------------------------------------------------------------
owgPointCloudLayer.prototype = new PointCloudLayer();
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
/**
 * @description internal callback function for tiles
 * @ignore
 */
function _cbPointCloudTileReady_owg(pc)
{
    pc.cbfReady(pc.quadcode, pc, pc.layer);
    pc.cbfReady = null;
    pc.cbfFailed = null;
    pc.quadcode = null;
    pc.caller = null;
    pc.layer = null;
}
//------------------------------------------------------------------------------
/**
 * @description internal callback function for tiles
 * @ignore
 */
function _cbPointCloudTileFailed_owg(pc)
{
    pc.cbfFailed(pc.quadcode, pc.caller, pc.layer);
    pc.cbfReady = null;
    pc.cbfFailed = null;
    pc.quadcode = null;
    pc.caller = null;
    pc.layer = null;
}
//------------------------------------------------------------------------------

goog.exportSymbol('owgPointCloudLayer', owgPointCloudLayer);
goog.exportProperty(owgPointCloudLayer.prototype, 'Failed', owgPointCloudLayer.prototype.Failed);
goog.exportProperty(owgPointCloudLayer.prototype, 'Ready', owgPointCloudLayer.prototype.Ready);
goog.exportProperty(owgPointCloudLayer.prototype, 'RequestTile', owgPointCloudLayer.prototype.RequestTile);
goog.exportProperty(owgPointCloudLayer.prototype, 'Setup', owgPointCloudLayer.prototype.Setup);
