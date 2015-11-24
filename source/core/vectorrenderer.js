/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
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
      var tmpmodel = new mat4();
      tmpmodel.CopyFrom(this.engine.matModel);
      tmpmodel._values[12] += this.vectorarray[i].vOffset[0];
      tmpmodel._values[13] += this.vectorarray[i].vOffset[1];
      tmpmodel._values[14] += this.vectorarray[i].vOffset[2];
      this.engine.PushMatrices();
      this.engine.SetModelMatrix(tmpmodel);
      this.engine.VectorRender(this.vectorarray[i],this.vectorarray[i], true);
      this.engine.PopMatrices();
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

