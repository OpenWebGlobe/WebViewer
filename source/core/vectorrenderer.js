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
 #                              (c) 2010-2012 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/

goog.provide('owg.VectorRenderer');

goog.require('owg.Surface');
goog.require('owg.engine3d');
goog.require('owg.GeoCoord');

/**
 *
 * @param {engine3d} engine
 */
function VectorRenderer(engine)
{
   /** @type {engine3d} */
   this.engine = engine;


}
//------------------------------------------------------------------------------
/**
 * @description Create Polygon from a list of WGS84 points
 * @param {Array.< Array.<number> >} points_wgs84
 */
VectorRenderer.prototype.FromPolygon = function(points_wgs84)
{

}
//------------------------------------------------------------------------------
/**
 * @description Create Polygon from a list of WGS84 points
 * @param {Array.< Array.<number> >} points_wgs84
 */
VectorRenderer.prototype.FromPolyLine = function (points_wgs84)
{

}
//------------------------------------------------------------------------------
