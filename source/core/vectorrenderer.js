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

//------------------------------------------------------------------------------
/**
 * @constructor
 * @param {engine3d} engine
 */
function VectorRenderer(engine)
{
   /** @type {engine3d} */
   this.engine = engine;

   /** @type {Array.< Array.<Surface> >} */
   this.vectorarray = [];
}
//------------------------------------------------------------------------------
/**
 * @description Render vectors
 * @param {vec3} vCameraPosition
 * @param {mat4} matModelViewProjection
 */
VectorRenderer.prototype.Render = function(vCameraPosition, matModelViewProjection)
{
   for (var i=0;i<this.vectorarray.length;i++)
   {
      this.engine.VectorRender(this.vectorarray[i],this.vectorarray[i], true);
   }

   //enable for debugging:
   /*for (var i=0;i<this.vectorarray.length;i++)
   {
      for (var j=0;j<this.vectorarray[i].length;j++)
      {
         this.vectorarray[i][j].Draw();
      }
   }*/
}
//------------------------------------------------------------------------------
/**
 * @param {Array.<Surface>} surfaces
 * @return {number}
 */
VectorRenderer.prototype.AddVector = function(surfaces)
{
   this.vectorarray.push(surfaces);
   return this.vectorarray.length-1;
}
//------------------------------------------------------------------------------
/**
 * @param {number} index
 */
VectorRenderer.prototype.RemoveVector = function(index)
{
   this.vectorarray.splice(index,1);
}
//------------------------------------------------------------------------------

