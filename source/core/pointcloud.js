/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/

goog.provide('owg.PointCloud');
goog.require('owg.PointRenderer');
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

    /** @type {Array.<number>} */
    this.offset = [];

    /** @type {PointRenderer} */
    this.pointrenderer = null;

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

    this.cbr = opt_callbackready;
    this.cbf = opt_callbackfailed;

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
 * @description Renders a point cloud tile
 */
PointCloud.prototype.Render = function()
{
    if (this.pointrenderer)
    {
        this.tmpmodel.CopyFrom(this.engine.matModel);

        // virtual camera offset:
        this.tmpmodel._values[12] += this.offset[0];
        this.tmpmodel._values[13] += this.offset[1];
        this.tmpmodel._values[14] += this.offset[2];

        this.engine.PushMatrices();
        this.engine.SetModelMatrix(this.tmpmodel);

        this.pointrenderer.Draw();

        this.engine.PopMatrices();
    }

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
        this.offset = [0,0,0];
        this.offset[0] = dv.getFloat64();
        this.offset[1] = dv.getFloat64();
        this.offset[2] = dv.getFloat64();
        var format = dv.getChar().charCodeAt(0);
        if (format == 0) { format = 'pc'; } else {format = 'p';}
        var numpoints = dv.getInt32();

        var vertices = [];

        if (format=='pc' && numpoints > 0)
        {
            vertices = new Float32Array(numpoints*7);

            for (var i=0;i<numpoints;i++)
            {
                vertices[7*i+0] = dv.getFloat32();
                vertices[7*i+1] = dv.getFloat32();
                vertices[7*i+2] = dv.getFloat32();
                vertices[7*i+3] = dv.getChar().charCodeAt(0) / 255.0;
                vertices[7*i+4] = dv.getChar().charCodeAt(0) / 255.0;
                vertices[7*i+5] = dv.getChar().charCodeAt(0) / 255.0;
                vertices[7*i+6] = dv.getChar().charCodeAt(0) / 255.0;
            }


            this.pointrenderer = new PointRenderer(this.engine);
            this.pointrenderer.SetPoints('pc', vertices);

            failed = false;

        }
        /*else if (numpoints == 0)
        {
            console.log("pointcloud is empty!!")
        }*/


    }
    /*else
    {
        // this version is not supported...
    }*/


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