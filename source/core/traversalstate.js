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

goog.provide('owg.TraversalState');

goog.require('owg.mat4');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description This class is used to store the traversal state of the scene graph
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function TraversalState()
{
   this.MatrixStackView = new Array();
   this.MatrixStackModel = new Array();
   this.MatrixStackProjection = new Array();
   
   this.camera = new Object();
   /** @type {number} */
   this.camera.x = 0;
   /** @type {number} */
   this.camera.y = 0;
   /** @type {number} */
   this.camera.z = 0;
   
   this.geoposition = new Object();
   this.geoposition.longitude = 0;
   this.geoposition.latitude = 0;
   this.geoposition.elevation = 0;
   
   // Navigation Type: -1: not set, 0: flight mode, 1: globe mode
   /** @type {number} */
   this.navigationtype = -1;
   /** @type {number} */
   this.navigationlock = 0;
   /** @type {number} */
   this.navigationcommand = TraversalState.NavigationCommand.IDLE;
   /** @type {number} */
   this.navigationparam = 0;
}
//------------------------------------------------------------------------------
/** @enum {number} */
TraversalState.NavigationCommand =
{
   IDLE: 0,
   MOVE_DOWN: 1,
   MOVE_UP: 2,
   ROTATE_EARTH: 3,
   UPDATE_YAW: 4,
   UPDATE_YAWPITCH: 5 // encoded: sin(a): yaw increase and -cos(a): pitch increase
};
//------------------------------------------------------------------------------
/**
 * @description Push a new view matrix to stack
 * @param {mat4} matrix view matrix
 */
TraversalState.prototype.PushView = function(matrix)
{
   var newmat = new mat4();
   newmat.CopyFrom(matrix);
   this.MatrixStackView.push(newmat);
}
//------------------------------------------------------------------------------
/**
 * @description Pop view matrix from stack and return it
 */
TraversalState.prototype.PopView = function()
{
   return this.MatrixStackView.pop();
}
//------------------------------------------------------------------------------
/**
 * @description Push a new model matrix to stack
 * @param {mat4} matrix model matrix
 */
TraversalState.prototype.PushModel = function(matrix)
{
   var newmat = new mat4();
   newmat.CopyFrom(matrix);
   this.MatrixStackModel.push(newmat);
}
//------------------------------------------------------------------------------
/**
 * @description Pop model matrix from stack and return it
 */
TraversalState.prototype.PopModel = function()
{
   return this.MatrixStackModel.pop();
}
//------------------------------------------------------------------------------
/**
 * @description Push a new projection matrix to stack
 * @param {mat4} matrix model matrix
 */
TraversalState.prototype.PushProjection = function(matrix)
{
   var newmat = new mat4();
   newmat.CopyFrom(matrix);
   this.MatrixStackProjection.push(newmat);
}
//------------------------------------------------------------------------------
/**
 * @description Pop projection matrix from stack and return it
 */
TraversalState.prototype.PopProjection = function()
{
   return this.MatrixStackProjection.pop();
}
//------------------------------------------------------------------------------
/**
 * @description Return current view matrix from stack and return it
 * @param {mat4} matrix the current view matrix
 */
TraversalState.prototype.GetViewMatrix = function(matrix)
{
   var l = this.MatrixStackView.length;
   if (l>0)
   {
      matrix.CopyFrom(this.MatrixStackView[l-1]);
   }
}
//------------------------------------------------------------------------------
/**
 * @description Return current model matrix from stack and return it
 * @param {mat4} matrix the current model matrix
 */
TraversalState.prototype.GetModelMatrix = function(matrix)
{
   var l = this.MatrixStackModel.length;
   matrix.CopyFrom(this.MatrixStackModel[l-1]);
}
//------------------------------------------------------------------------------
/**
 * @description Return current projection matrix from stack and return it
 * @param {mat4} matrix the current projection matrix
 */
TraversalState.prototype.GetProjectionMatrix = function(matrix)
{
   var l = this.MatrixStackProjection.length;
   matrix = this.MatrixStackProjection[l-1];
}
//------------------------------------------------------------------------------
/**
 * @description Overwrite the current projection matrix
 * @param {mat4} matrix the projection matrix to overwrite
 */
TraversalState.prototype.OverwriteProjectionMatrix = function(matrix)
{
   var l = this.MatrixStackProjection.length;
   this.MatrixStackProjection[l-1].CopyFrom(matrix);
}
//------------------------------------------------------------------------------
/**
 * @description Overwrite the current model matrix
 * @param {mat4} matrix the model matrix to overwrite
 */
TraversalState.prototype.OverwriteModelMatrix = function(matrix)
{
   var l = this.MatrixStackModel.length;
   this.MatrixStackModel[l-1].CopyFrom(matrix);
}
//------------------------------------------------------------------------------
/**
 * @description Overwrite the current view matrix
 * @param {mat4} matrix the view matrix to overwrite
 */
TraversalState.prototype.OverwriteViewMatrix = function(matrix)
{
   var l = this.MatrixStackView.length;
   this.MatrixStackView[l-1].CopyFrom(matrix);
}
//------------------------------------------------------------------------------
/**
 * @description Set direction for the compass
 * @param {number} compdir the direction of the compass (RAD)
 */
TraversalState.prototype.SetCompassDirection = function(compdir)
{
   this.compassdirection = compdir;
}
//------------------------------------------------------------------------------
/**
 * @description Set current position
 * @param {number} x x-component of current camera position
 * @param {number} y y-component of current camera position
 * @param {number} z z-component of current camera position
 */
TraversalState.prototype.SetPosition = function(x,y,z)
{
   this.camera.x = x;
   this.camera.y = y;
   this.camera.z = z;
}
//------------------------------------------------------------------------------
/**
 * @description Retrieve current camera position
 * return value is a JavaScript Object and components can be 
 * accessed with ret.x, ret.y, ret.z
 */
TraversalState.prototype.GetPosition = function()
{
   return this.camera;
}
//------------------------------------------------------------------------------
/**
 * @description Set current position in lat/lng/elv
 */
TraversalState.prototype.SetGeoposition = function(longitude, latitude, elevation)
{
   this.geoposition.longitude = longitude;
   this.geoposition.latitude = latitude;
   this.geoposition.elevation = elevation;
}
