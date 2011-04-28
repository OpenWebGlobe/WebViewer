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

goog.provide('owg.AABB');

//------------------------------------------------------------------------------
/** 
 * @class aabb 
 * @description 
 * @constructor
 * 
 * {@link http://www.openwebglobe.org} 
 *
 * @author Martin Christen martin.christen@fhnw.ch  
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch 
 * @version 0.1  
 */
 
function AABB()
{
   this.tymin = 0.0;
   this.tymax = 0.0;
   this.tzmin = 0.0;
   this.tzmax = 0.0;
   this.flag = 1.0;
   
   this.result = {};
   this.result.tmin = 0.0;
   this.result.tmax = 0.0;
}


AABB.prototype.HitBox = function(x,y,z,dirx,diry,dirz,m1x,m1y,m1z,m2x,m2y,m2z)
{
   this.flag = 1.0;
   
   if(dirx >= 0.0)
   {
      this.result.tmin = (m1x - x) / dirx;
      this.result.tmax = (m2x - x) / dirx;
   }
   else
   {
      this.result.tmin = (m2x - x) / dirx;
      this.result.tmax = (m1x - x) / dirx;
   }
   
   
    if(diry >= 0.0)
   {
      this.tymin = (m1y - y) / diry;
      this.tymax = (m2y - y) / diry;
   }
   else
   {
      this.tymin = (m2y - y) / diry;
      this.tymax = (m1y - y) / diry;
   }
   
   if((this.result.tmin > this.tymax) || (this.tymin > this.result.tmax))
   {
      this.flag = -1.0;
   }
   
   if(this.tymin > this.result.tmin)
   {
      this.result.tmin = this.tymin;
   }
   
   if(this.tymax < this.result.tmax)
   {
      this.result.tmax = this.tymax;
   }
   
   if(dirz >= 0.0)
   {
      this.tzmin = (m1z - z) / dirz;
      this.tzmax = (m2z - z) / dirz;
   }
   else
   {
      this.tzmin = (m2z - z) / dirz;
      this.tzmax = (m1z - z) / dirz;
   }
   
   
   if((this.result.tmin > this.tzmax) || (this.tzmin > this.result.tmax))
   {
      this.flag = -1.0;
   }
   
   if(this.tzmin > this.result.tmin)
   {
      this.result.tmin = this.tzmin;
   }
   
   if(this.tzmax < this.result.tmax)
   {
      this.result.tmax = this.tzmax;
   }
   
   if(this.flag > 0.0)
   {
      return this.result;
   }
}

goog.exportSymbol('AABB', AABB);
goog.exportProperty(AABB.prototype, 'HitBox', AABB.prototype.HitBox);
