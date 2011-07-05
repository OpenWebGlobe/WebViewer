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

goog.provide('owg.BillboardRenderer');

//------------------------------------------------------------------------------
/** 
 * @class BillboardRenderer
 * @constructor
 * 
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch
 * 
 * @param {engine3d} engine
 */
function BillboardRenderer(engine)
{
   /** @type {engine3d} */
   this.engine = engine;
   
   /** @type {Array.<Billboard>} */
   this.billboardarray = [];
}

//------------------------------------------------------------------------------
/**
 * @description Render visible Billboard
 * @param {vec3} vCameraPosition
 * @param {mat4} matModelViewProjection
 */
BillboardRenderer.prototype.Render = function(vCameraPosition, matModelViewProjection)
{
   for (var i=0;i<this.billboardarray.length;i++)
   {
      var billboard = this.billboardarray[i];
      if(!billboard.hide)
      {
            billboard.Draw();
      }
   }  
}

//------------------------------------------------------------------------------
/**
 * @description add billboard to scene
 * @param {Billboard} billboard
 */
BillboardRenderer.prototype.AddBillboard = function(billboard)
{
   this.billboardarray.push(billboard);
}
//------------------------------------------------------------------------------
/**
 * @description remove billboard from scene
 * @param {Billboard} billboard
 */
BillboardRenderer.prototype.RemoveBillboard = function(billboard)
{
   for (var i=0;i<this.billboardarray.length;i++)
   {
      if (this.billboardarray[i] == billboard)
      {
         this.billboardarray.splice(i, 1);
         return;
      }
   }
}
//------------------------------------------------------------------------------
/**
 * @description returns the picked Billboard id.
 * @param {number} mx mouse x coordinate
 * @param {number} my mouse y coordinate
 * @returns {?Object}
 */
BillboardRenderer.prototype.PickBillboard = function(mx,my)
{
   for (var i=0;i<this.billboardarray.length;i++)
   {
      var pickresult = this.billboardarray[i].Pick(mx,my);
      if(pickresult)
      {
       return pickresult;
      }
      
   }
   
   return null;
}


