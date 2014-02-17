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

goog.provide('owg.PointCloud');
goog.require('owg.Surface');
goog.require('owg.DataView');


//------------------------------------------------------------------------------
/**
 * @constructor
 * @description PointCloud Manager
 * @author Martin Christen, martin.christen@fhnw.ch
 * @param {engine3d} engine
 */
function PointCloud(engine)
{
    /** @type {engine3d} */
    this.engine = engine;

    /** @type {Array.<Surface>} */
    this.geometries = [];

    /** @type {Array.<number>} */
    this.offset = [];

    /** @type {string} */
    this.type = "tile";

    /** @type {string} */
    this.jsonUrl = "";

    this.cbr = null;
    this.cbf = null;

    /** @type {mat4} */
    this.tmpmodel = new mat4();
}
//------------------------------------------------------------------------------
/**
 * @description Loads a geometry from URL
 * @param {string} url
 * @param {function(PointCloud)=} opt_callbackready optional function called when pointcloud finished download
 * @param {function(PointCloud)=} opt_callbackfailed optional function called when pointcloud failed download

 */
PointCloud.prototype.Load = function(url, opt_callbackready, opt_callbackfailed)
{
    var me = this;
    var _transferComplete = function(e) { _cbfpointclouddownload(me, e.target.response); };
    var _transferFailed = function(e) { _cbfpointcloudfailed(me); };

    // XMLHttpRequest for binary data:
    var oReq = new window.XMLHttpRequest();
    oReq.addEventListener("load", _transferComplete, false);
    oReq.addEventListener("error", _transferFailed, false);

    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";
    oReq.send(null);


}
//------------------------------------------------------------------------------
/**
 * @description Renders a geometry
 */
PointCloud.prototype.Render = function()
{
    this.tmpmodel.CopyFrom(this.engine.matModel);

    // virtual camera offset:
    this.tmpmodel._values[12] += this.offset[0];
    this.tmpmodel._values[13] += this.offset[1];
    this.tmpmodel._values[14] += this.offset[2];

    this.engine.PushMatrices();
    this.engine.SetModelMatrix(this.tmpmodel);

    for (var i=0;i<this.geometries.length;i++)
    {
        this.geometries[i].Draw();
    }

    this.engine.PopMatrices();

}
//------------------------------------------------------------------------------
PointCloud.prototype.CreateFromBinary = function(buffer)
{
    var failed = true;

    var dv = new jDataView(buffer, 0, buffer.length, true);
    var majorversion = dv.getChar().charCodeAt(0);
    var minorversion = dv.getChar().charCodeAt(0);

    if (majorversion == 1 && minorversion == 0)
    {

        var offset = [0,0,0];
        offset[0] = dv.getFloat64();
        offset[1] = dv.getFloat64();
        offset[2] = dv.getFloat64();
        var format = dv.getChar().charCodeAt(0);
        if (format == 0) { format = 'pc'; } else {format = 'p';}
        var numpoints = dv.getInt32();

        var points = [];
        var colors = [];
        var elementsperpoint;

        if (format=='pc')
        {
            elementsperpoint = 7;

            points = new Float32Array(numpoints*3);
            colors = new Uint8Array(numpoints*4);

            for (var i=0;i<numpoints;i++)
            {
                points[3*i+0] = dv.getFloat32();
                points[3*i+1] = dv.getFloat32();
                points[3*i+2] = dv.getFloat32();
                colors[4*i+0] = dv.getChar().charCodeAt(0);
                colors[4*i+1] = dv.getChar().charCodeAt(0);
                colors[4*i+2] = dv.getChar().charCodeAt(0);
                colors[4*i+3] = dv.getChar().charCodeAt(0);
            }

        }
        else
        {
            //console.log("ERROR: Vertex format not supported...")
        }

        /*console.log("majorversion: " + majorversion + "<br>");
        console.log("minorversion: " + minorversion + "<br>");
        console.log("offsetx: " + offset[0] + "<br>");
        console.log("offsetx: " + offset[1] + "<br>");
        console.log("offsetx: " + offset[2] + "<br>");
        console.log("point semantic: " + format + "<br>");
        console.log("num points: " + numpoints + "<br>");*/

        for (var i=0;i<points.length/3;i++)
        {
            //console.log("" + points[i*3+0] + ", " + points[i*3+1] + ", " + points[i*3+2] + "<br/>" );
        }

        for (var i=0;i<colors.length/4;i++)
        {
            //console.log("" + colors[i*4+0] + ", " + colors[i*4+1] + ", " + colors[i*4+2] + ", " + colors[i*4+2] + "<br/>" );
        }
    }
    else
    {
        //console.log("ERROR: point cloud format not supported!");
    }




    if (failed)
    {
        if (this.cbf)
        {
            this.cbf(this);
        }
    }
    else
    {
        if (this.cbr)
        {
            this.cbr(this);
        }
    }
}

//------------------------------------------------------------------------------
/**
 * @description download callback
 * @ignore
 */
function _cbfpointclouddownload(pc, arraybuffer)
{
    var bytebuffer = new Uint8Array(arraybuffer); // currently required for browser compability...
    pc.CreateFromBinary(bytebuffer);
}
//------------------------------------------------------------------------------
/**
 * @description failed callback
 * @ignore
 */
function _cbfpointcloudfailed(pc)
{
    if (pc.cbf)
    {
        pc.cbf(pc);
    }
}
//------------------------------------------------------------------------------