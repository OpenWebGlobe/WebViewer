/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/


goog.provide('owg.AoeImageRenderer');
goog.require('owg.ogAoeImage');

//------------------------------------------------------------------------------
/** 
 * @class AoeImageRenderer
 * @constructor
 * 
 * @author feng lei, fenglei@aoe.ac.cn
 * 
 * @param {engine3d} engine
 */
function AoeImageRenderer(engine)
{
   /** @type {engine3d} */
   this.engine = engine;
   
   /** @type {Array.<ogAoeImage>} */  
   this.aoeimagearray = [];
   

}

//------------------------------------------------------------------------------
/**
 * @description Render visible AoeImage
 * @param {vec3} vCameraPosition
 * @param {mat4} matModelViewProjection
 */
AoeImageRenderer.prototype.Render = function(vCameraPosition, matModelViewProjection)
{
   // todo: frustum culling etc.
   for (var i=0;i<this.aoeimagearray.length;i++)
   {
      var aoeimage = this.aoeimagearray[i];
      aoeimage.Render();
   }
}

//------------------------------------------------------------------------------
/**
 * @description add AoeImage to scene
 * @param {ogAoeImage} aoeimage
 * @returns index
 */
AoeImageRenderer.prototype.AddAoeImage = function(aoeimage)
{
   this.aoeimagearray.push(aoeimage);
   return this.aoeimagearray.length-1;
}

//------------------------------------------------------------------------------
/**
 * @description Removes the geomatry at specified index.
 * @param {number} index
 */
AoeImageRenderer.prototype.RemoveAoeImage = function(index)
{
   this.aoeimagearray.splice(index,1);
}



