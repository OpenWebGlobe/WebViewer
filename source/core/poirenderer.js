/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/


goog.provide('owg.PoiRenderer');

//------------------------------------------------------------------------------
/** 
 * @class PoiRenderer
 * @constructor
 * 
 * @author Martin Christen martin.christen@fhnw.ch
 * 
 * @param {engine3d} engine
 */
function PoiRenderer(engine)
{
   /** @type {engine3d} */
   this.engine = engine;
   
   /** @type {Array.<Poi>} */
   this.poiarray = [];
   
   /** @type {ViewFrustum} */
   this.frustum = new ViewFrustum();
}

//------------------------------------------------------------------------------
/**
 * @description Render visible Poi
 * @param {vec3} vCameraPosition
 * @param {mat4} matModelViewProjection
 */
PoiRenderer.prototype.Render = function(vCameraPosition, matModelViewProjection)
{
   var x = vCameraPosition.Get()[0]; //ToDo: Expensive implementation !
   var y = vCameraPosition.Get()[1];
   var z = vCameraPosition.Get()[2];
   var dx = 0;
   var dy = 0;
   var dz = 0;
   var disLimit = 0;
   
   // frustum culling 
   this.frustum.Update(matModelViewProjection);
   
   for (var i=0;i<this.poiarray.length;i++)
   {
      var poi = this.poiarray[i];
      if(!poi.hide)
      {
         
         //check if poi is in viewfrustum
         if(!this.frustum.TestBox(poi.posX,poi.posY,poi.posZ,poi.posX+0.001,poi.posY+0.001,poi.posZ+0.001)) //something wrong here...
         {
          //  return;   
         }

         
         
         //check if poi is in viewdistance
         dx = (poi.posX-x);
         dy = (poi.posY-y);
         dz = (poi.posZ-z);
         var dis_squared = dx*dx + dy*dy + dz*dz;
         
         var disLimitMin = poi.visibilityDistanceMin*poi.visibilityDistanceMin;
         var disLimitMax = poi.visibilityDistanceMax*poi.visibilityDistanceMax; 
         if(disLimitMax > dis_squared && disLimitMin < dis_squared)
         {
           poi.Draw();
         }   
      }
      
      
      
   }
   
}

//------------------------------------------------------------------------------
/**
 * @description add poi to scene
 * @param {Poi} poi
 */
PoiRenderer.prototype.AddPoi = function(poi)
{
   this.poiarray.push(poi);
}
//------------------------------------------------------------------------------
/**
 * @description remove poi from scene
 * @param {Poi} poi
 */
PoiRenderer.prototype.RemovePoi = function(poi)
{
   for (var i=0;i<this.poiarray.length;i++)
   {
      if (this.poiarray[i] == poi)
      {
         this.poiarray.splice(i, 1);
         return;
      }
   }
}
//------------------------------------------------------------------------------
/**
 * @description returns the picked Poi id.
 * @param {number} mx mouse x coordinate
 * @param {number} my mouse y coordinate
 * @returns {?Poi}
 */
PoiRenderer.prototype.PickPOI = function(mx,my)
{
   for (var i=0;i<this.poiarray.length;i++)
   {
      if(this.poiarray[i].Pick(mx,my))
      {
       return this.poiarray[i];  
      }
      
   }
   
   return null;
}


