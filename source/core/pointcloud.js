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
    this.jsonUrl = url;
    this.http = new window.XMLHttpRequest();
    this.http.open("GET", this.jsonUrl, true);

    this.cbr = opt_callbackready;
    this.cbf = opt_callbackfailed;

    var me = this;
    this.http.onreadystatechange = function ()
    {
        _cbfpointclouddownload(me);
    };
    this.http.send();
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
/**
 * @param {Object} jsonobject
 */
PointCloud.prototype.CreateFromJSONObject = function(jsonobject)
{
    var failed = true;

    if (goog.isDef(jsonobject["Version"] && jsonobject["Version"] == "1.0"))
    {
        var bounds = jsonobject["Bounds"];
        var texture = jsonobject["Texture"];
        var offset = jsonobject["Offset"];
        var bbox = jsonobject["BoundingBox"];
        var objects = jsonobject["Objects"];

        this.offset = offset;

        // now create this.geometries[] out of "objects". if successful set failed to false
        for (var i=0;i<objects.length;i++)
        {
            var surf = new Surface(this.engine);
            var obj3d = objects[i];

            // obj3d["Vertices"] already exists
            // obj3d["VertexSemantic"] already exists

            // Set virtual camera offset:
            obj3d["Offset"] = offset;

            // Set global bounding box
            obj3d['BoundingBox'] = bbox;

            if (texture.length==0)
            {
                obj3d["DiffuseMap"] = obj3d["Texture"];  // use local texture
            }
            else
            {
                obj3d["DiffuseMap"] = texture; // use global texture
            }

            // create the 3d geometry:
            surf.CreateFromJSONObject(obj3d, null, null);
            //surf.UpdateAABB() // would create a more precise AABB, don't call it for now.

            this.geometries.push(surf);
            failed = false;
        }
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
function _cbfpointclouddownload(geometry)
{
    if (geometry.http.readyState == 4)
    {
        if (geometry.http.status == 404)
        {
            if (geometry.cbf)
            {
                geometry.cbf(geometry);
            }
        }
        else
        {
            var data = geometry.http.responseText;
            var jsonobject = goog.json.parse(data);
            geometry.CreateFromJSONObject(jsonobject);
        }
    }
}
//------------------------------------------------------------------------------
