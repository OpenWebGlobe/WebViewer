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

goog.provide('owg.GeometryRenderer');
goog.require('owg.ogGeometry');

//------------------------------------------------------------------------------
/** 
 * @class GeometryRenderer
 * @constructor
 * 
 * @author Martin Christen martin.christen@fhnw.ch
 * 
 * @param {engine3d} engine
 */
function GeometryRenderer(engine)
{
   /** @type {engine3d} */
   this.engine = engine;
   
   /** @type {Array.<Array.<Surface>>} */  
   this.geometryarray = [];
   
   /** @type {ViewFrustum} */
   this.frustum = new ViewFrustum();

}

//------------------------------------------------------------------------------
/**
 * @description Render visible Geometry
 * @param {vec3} vCameraPosition
 * @param {mat4} matModelViewProjection
 */
GeometryRenderer.prototype.Render = function(vCameraPosition, matModelViewProjection)
{
   // frustum culling etc.
   this.frustum.Update(matModelViewProjection);
    
    
   for (var i=0;i<this.geometryarray.length;i++)
   {
      if(this.geometryarray[i] instanceof PointSprite)
      {
         /** @type {PointSprite}*/
         var pointsprite = /** @type {PointSprite}*/this.geometryarray[i];
         pointsprite.Draw();
      }
      else
      {
         var meshes = this.geometryarray[i];
         for(var j=0;j<meshes.length;j++)
         {
            var surfaces = meshes[j];
            for(var k=0; k<surfaces.length;k++)
            {
               var surface = surfaces[k];
               if(!surface.hide)
               {
                  if(!this.frustum.TestBox(surface.bbmin[0],surface.bbmin[1],surface.bbmin[2],surface.bbmax[0],surface.bbmax[1],surface.bbmax[2]))
                  {
                     return;   
                  }
                  else
                  {
                  surface.Draw();  
                  }
               }
            } 
         }
      }
   }
   
}

//------------------------------------------------------------------------------
/**
 * @description add Geometry to scene
 * @param {Array.<Array.<Surface>>} geometry
 * @returns index
 */
GeometryRenderer.prototype.AddGeometry = function(geometry)
{
   this.geometryarray.push(geometry);
   return this.geometryarray.length-1;
   // todo: calculate bounding box in "mesh.js"-class
}

//------------------------------------------------------------------------------
/**
 * @description Removes the geomatry at specified index.
 * @param {number} index
 */
GeometryRenderer.prototype.RemoveGeometry = function(index)
{
   this.geometryarray.splice(index,1);
}



//------------------------------------------------------------------------------
/**
 * @description returns the picked surface id.
 * @param {number} mx mouse x coordinate
 * @param {number} my mouse y coordinate
 * @returns {number} the surface_id
 */
GeometryRenderer.prototype.PickSurface = function(mx,my)
{
   var ray = this.engine.GetDirectionMousePos(mx,my,this.engine.matModelViewProjection);
   var t = 10000;
   var nearestSurface = null;
    
   for (var i=0;i<this.geometryarray.length;i++)
   {
      var meshes = this.geometryarray[i];
      for(var j=0;j<meshes.length;j++)
      {
         var surfaces = meshes[j];
         for(var k=0; k<surfaces.length;k++)
         {
            var surface = surfaces[k];
            if(!surface.hide)
            {
               var result_bb = surface.TestBoundingBoxIntersection(ray.x,ray.y,ray.z,ray.dirx,ray.diry,ray.dirz);
               var result = surface.TestRayIntersection(ray.x,ray.y,ray.z,ray.dirx,ray.diry,ray.dirz);
               
               if(result)
               {
                  if(result.t < t)
                  {
                     t = result.t;
                     nearestSurface = surface;
                  }   
               }
            }
         } 
      }
   }
   
   if(nearestSurface)
   {
      return nearestSurface.ogid;
   }
   return -1;
}


