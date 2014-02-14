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

goog.provide('owg.ogPointCloudLayer');
goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');
goog.require('owg.ogScene');
goog.require('owg.ogGeometry');


//------------------------------------------------------------------------------
/**
 * @constructor
 * @description POI Layer class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 * @author Benjamin Loesch, benjamin.loesch@fhnw.ch
 */
function ogPointCloudLayer()
{
    /** @type {string} */
    this.name = "ogPointCloudLayer";
    /** @type {number} */
    this.type = OG_OBJECT_POINTCLOUDLAYER;
    /** @type {boolean} */
    this.hide = false;  // true if poi layer is hidden
    /** @type {Array.<ogGeometry>} */
    this.geometryarray = [];   // array of "ogGeometries"
    /** @type {string} */
    this.layername = "";
}
//------------------------------------------------------------------------------
ogPointCloudLayer.prototype = new ogObject();
//------------------------------------------------------------------------------


/**
 * @description Parse Options
 * @param {Object} options
 */
ogPointCloudLayer.prototype.ParseOptions = function(options)
{
    this.AddPointCloudLayer(options);
}

//------------------------------------------------------------------------------
/**
 * @description Called when object is destroyed. Never call manually.
 * @ignore
 */
ogPointCloudLayer.prototype._OnDestroy = function()
{
    this.RemovePointCloudLayer();
}

//------------------------------------------------------------------------------
/**
 * @description hide the poi layer
 */
ogPointCloudLayer.prototype.Hide = function()
{
    this.hide = true;
    for(var i= 0; i < this.geometryarray.length; i++)
    {
        this.geometryarray[i].Hide();
    }

}

//------------------------------------------------------------------------------
/**
 * @description show the previously hidden poi layer
 */
ogPointCloudLayer.prototype.Show = function()
{
    this.hide = false;
    for(var i= 0; i < this.geometryarray.length; i++)
    {
        this.geometryarray[i].Show();
    }
}

//------------------------------------------------------------------------------
/**
 *  @description removes all geometries from the layer
 */
ogPointCloudLayer.prototype.RemovePointCloudLayer = function()
{
    for(var i= 0; i < this.geometryarray.length; i++)
    {
        for(var j=i;j<this.geometryarray.length;j++){
            this.geometryarray[i].indexInRendererArray -= 1;
        }
        this.geometryarray[i].UnregisterObject();
    }

}

//------------------------------------------------------------------------------
/**
 *  @description adds a geometry to the layer
 */
ogPointCloudLayer.prototype.AddGeometry = function(geometry)
{
    this.geometryarray.push(geometry);
    geometry.layerID = this.id;
}

//------------------------------------------------------------------------------
/**
 *  @description adds a geometry to the layer
 */
ogPointCloudLayer.prototype.RemoveGeometry = function(geometry)
{
    for(var i= 0; i < this.geometryarray.length; i++)
    {
        if(this.geometryarray[i] == geometry)
        {
            for(var j=i+1;j<this.geometryarray.length;j++){
                this.geometryarray[j].indexInRendererArray -= 1;
            }
            this.geometryarray[i].UnregisterObject();
            this.geometryarray.splice(i,1);
        }
    }
}

//------------------------------------------------------------------------------
/**
 * @description Get the current globe renderer or null if there is none
 * @ignore
 * @returns {GlobeRenderer}
 */
ogPointCloudLayer.prototype.GetGlobeRenderer = function()
{
    /** @type {GlobeRenderer} */
    var renderer = null;

    //parent of ogGeometryLayer is ogWorld
    /** @type {ogWorld} */
    var world = /** @type ogWorld */this.parent;

    // parent of world is scene

    var scene = /** @type ogScene */world.parent;

    // parent of scene is context
    /** @type {ogContext} */
    var context = /** @type ogContext */scene.parent;

    // Get the engine
    /** @type {engine3d} */
    var engine = context.engine;

    // test if there is a scenegraph attached
    if (engine.scene)
    {
        if (engine.scene.nodeRenderObject)
        {
            renderer = engine.scene.nodeRenderObject.globerenderer;
        }
    }
    return renderer;
}
//------------------------------------------------------------------------------
/**
 * @description Add a geometry layer to the world
 */
ogPointCloudLayer.prototype.AddPointCloudLayer = function(options)
{
    /** @type {GlobeRenderer} */
    var renderer = this.GetGlobeRenderer();
    if (renderer)
    {
        // #TODO
        //this.layerindex = renderer.AddPointCloudLayer(options);
    }
}
//------------------------------------------------------------------------------
/**
 * @description Remove image layer
 */
ogPointCloudLayer.prototype.RemovePointCloudLayer = function()
{
    /** @type {GlobeRenderer} */
    var renderer = this.GetGlobeRenderer();
    if (renderer && this.layerindex != -1)
    {
        // #TODO
        //renderer.RemovePointCloudLayer(this.layerindex);
    }
}

