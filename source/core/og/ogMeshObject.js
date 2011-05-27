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

goog.provide('owg.ogMeshObject');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {ogObject} 
 * @description Mesh Object (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogMeshObject()
{
   /** @type {string} */
   this.name = "ogMeshObject";
   /** @type {number} */
   this.type = OG_OBJECT_MESH;
   this.surfaces = [];
}

//------------------------------------------------------------------------------
ogMeshObject.prototype = new ogObject();


//------------------------------------------------------------------------------
/**
* @description parse options
* @param {GeometryOptions} options
* @ignore
*/
ogMeshObject.prototype.ParseOptions = function(options)
{   
      var scene = this.parent;
      var ogsurf = _CreateObject(OG_OBJECT_SURFACE, scene, options);
      this.surfaces.push(ogsurf);
}


//------------------------------------------------------------------------------
/**
 * will be called from geometryrenderer. to discuss.
 *
 */
ogMeshObject.prototype.Draw = function()
{
   for (var i=0;i<this.surfaces.length;i++)
   {
      this.surfaces[i].Draw();
   }
}