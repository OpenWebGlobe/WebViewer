/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/


goog.provide('owg.TriangleIntersector');

//------------------------------------------------------------------------------
/** 
 * @class triangleintersector Methods to calc ray and triangle intersection.
 * @constructor
 * @description 
 * 
 * {@link http://www.openwebglobe.org} 
 *
 * @author Martin Christen martin.christen@fhnw.ch  
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch 
 * @version 0.1  
 */
 
 function TriangleIntersector()
 {
    /** @type {Object} */
    this.result = {},
    this.result.t = 0.0;
    this.result.u = 0.0;
    this.result.v = 0.0;
    
    /** @type {Object} */
    this.edge1 = {};
    this.edge1.x = 0.0;
    this.edge1.y = 0.0;
    this.edge1.z = 0.0;
    
    /** @type {Object} */
    this.edge2 = {};
    this.edge2.x = 0.0;
    this.edge2.y = 0.0;
    this.edge2.z = 0.0;
    
    /** @type {Object} */
    this.tvec = {};
    this.tvec.x = 0.0;
    this.tvec.y = 0.0;
    this.tvec.z = 0.0;
    
    /** @type {Object} */
    this.pvec = {};
    this.pvec.x = 0.0;
    this.pvec.y = 0.0;
    this.pvec.z = 0.0;
    
    /** @type {Object} */
    this.qvec = {};
    this.qvec.x = 0.0;
    this.qvec.y = 0.0;
    this.qvec.z = 0.0;
    
    /** @type {number} */
    this.det = 0.0;
    /** @type {number} */
    this.invdet = 0.0;
    /** @type {number} */
    this.EPSILON = 2.2204460492503131e-016;
 }
 //-----------------------------------------------------------------------------
 /*
  * @description: IntersectTriangle test if a ray interesects a triangle. 
  *               Attention: direction vector has to be normalized before calling this.
  *               Attention II: triangle vertices have to be defined in counterclockwise direction
  * 
  *               Based on: Tomas Möller, Ben Trumbore, "Fast, Minimum Storage Ray / Triangle Intersection"
  * 
  * @param {number} origx x coordinate of ray origin
  * @param {number} origy y coordinate of ray origin
  * @param {number} origz z coordinate of ray origin
  * @param {number} dirx x coordinate of ray direction (normalized)
  * @param {number} dirx y coordinate of ray direction (normalized)
  * @param {number} dirx z coordinate of ray direction (normalized)
  * @param {number} vert0x x of the first triangle corner
  * @param {number} vert0y y of the first triangle corner
  * @param {number} vert0z z of the first triangle corner
  * @param {number} vert1z x of the second triangle corner
  * ...
  * 
  */
 TriangleIntersector.prototype.IntersectTriangle = function(origx,origy,origz,dirx,diry,dirz,vert0x,vert0y,vert0z,vert1x,vert1y,vert1z,vert2x,vert2y,vert2z)
 {
    //find vectors for two edges sharing vert0
    this.edge1.x = vert1x - vert0x;
    this.edge1.y = vert1y - vert0y;
    this.edge1.z = vert1z - vert0z;
    
    this.edge2.x = vert2x - vert0x;
    this.edge2.y = vert2y - vert0y;
    this.edge2.z = vert2z - vert0z;
    
    //begin calculating calc determinant
    //cross(dir,edge2)
    this.pvec.x = diry*this.edge2.z - dirz*this.edge2.y;
    this.pvec.y = dirz*this.edge2.x - dirx*this.edge2.z;
    this.pvec.z = dirx*this.edge2.y - diry*this.edge2.x;
    
    //if determinant is near zero, ray lies in plane of triangle
    //dot(edge1,pvec)
    this.det = this.edge1.x*this.pvec.x + this.edge1.y*this.pvec.y + this.edge1.z*this.pvec.z;
        
    //calculate the distance from vert0 to ray origin
    this.tvec.x = origx - vert0x;
    this.tvec.y = origy - vert0y;
    this.tvec.z = origz - vert0z;
    this.invdet = 1.0 / this.det;
    
    //cross(tvec,edge1); 
    this.qvec.x = this.tvec.y*this.edge1.z - this.tvec.z*this.edge1.y;
    this.qvec.y = this.tvec.z*this.edge1.x - this.tvec.x*this.edge1.z;
    this.qvec.z = this.tvec.x*this.edge1.y - this.tvec.y*this.edge1.x;
    
    if (this.det < -1)
    {
       var halt = true;
    }
    
    if (this.det > 1)
    {
       var halt2 = true;
    }
    
    if (this.det > this.EPSILON)
    {
       this.result.u = (this.tvec.x*this.pvec.x + this.tvec.y*this.pvec.y + this.tvec.z*this.pvec.z);
       if (this.result.u < 0.0 || this.result.u > this.det)
       {
          return null;
       }
       
       this.result.v = (dirx*this.qvec.x + diry*this.qvec.y + dirz*this.qvec.z);
       if (this.result.v < 0.0 || this.result.u + this.result.v > this.det)
       {
          return null;
       }
    }
    else if (this.det < -this.EPSILON)
    {
       this.result.u = (this.tvec.x*this.pvec.x + this.tvec.y*this.pvec.y + this.tvec.z*this.pvec.z);
       if (this.result.u > 0.0 || this.result.u < this.det)
       {
          return null;
       }
       this.result.v = (dirx*this.qvec.x + diry*this.qvec.y + dirz*this.qvec.z);
       if (this.result.v > 0.0 || this.result.u + this.result.v < this.det)
       {
          return null;
       }
       
    }
    else
    {
       return null; // ray parallel to plane of triangle
    }
    
    this.result.t = (this.edge2.x*this.qvec.x + this.edge2.y*this.qvec.y + this.edge2.z*this.qvec.z);
    this.result.u *= this.invdet;
    this.result.v *= this.invdet;
    this.result.t *= this.invdet;
    
    return this.result;
 }

goog.exportSymbol('TriangleIntersector', TriangleIntersector);
goog.exportProperty(TriangleIntersector.prototype, 'IntersectTriangle', TriangleIntersector.prototype.IntersectTriangle);
