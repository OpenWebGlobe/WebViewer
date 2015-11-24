/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/


goog.provide('owg.ogBillboardLayer');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');
goog.require('owg.ogScene');
goog.require('owg.ogBillboard');


//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Billboard Layer class (OpenWebGlobe object)
 * @author Benjamin Loesch, benjamin.loesch@fhnw.ch
 */
function ogBillboardLayer()
{
   /** @type {string} */
   this.name = "ogBillboardLayer";
   /** @type {number} */
   this.type = OG_OBJECT_BILLBOARDLAYER;
   /** @type {boolean} */
   this.hide = false;  // true if billboard layer is hidden
   /** @type {Array.<ogBillboard>} */
   this.billboardarray = [];   // array of "Billboards"
   /** @type {string} */
   this.layername = "";
}
//------------------------------------------------------------------------------
ogBillboardLayer.prototype = new ogObject();
//------------------------------------------------------------------------------


/**
 * @description Parse Options
 * @param {Object} options
 */
ogBillboardLayer.prototype.ParseOptions = function(options)
{
   if(options["name"] )
   {
      this.layername = options.name ;
   }
}
//------------------------------------------------------------------------------
/**
 * @description Called when object is destroyed. Never call manually.
 * @ignore
 */
ogBillboardLayer.prototype._OnDestroy = function()
{
   for(var i= 0; i < this.billboardarray.length; i++)
   {
      this.billboardarray[i].UnregisterObject();
   }
}
//------------------------------------------------------------------------------
/**
 * @description hide the billboard layer
 */
ogBillboardLayer.prototype.Hide = function()
{
   this.hide = true;
   for(var i= 0; i < this.billboardarray.length; i++)
   {
      this.billboardarray[i].Hide();
   }
}
//------------------------------------------------------------------------------
/**
 * @description show the previously hidden billboard layer
 */
ogBillboardLayer.prototype.Show = function()
{
   this.hide = false;
   for(var i= 0; i < this.billboardarray.length; i++)
   {
      this.billboardarray[i].Show();
   }
}

//------------------------------------------------------------------------------
/**
 *  @description removes the billboard and frees its memory.
 *  @param {ogBillboard} billboard the billboard
 */
ogBillboardLayer.prototype.RemoveBillboard = function(billboard)
{
   for(var i= 0; i < this.billboardarray.length; i++)
   {
      if(this.billboardarray[i] == billboard)
      {
         this.billboardarray[i].UnregisterObject();
         this.billboardarray.splice(i,1);
      }
      
   }
}

//------------------------------------------------------------------------------
/**
 *  @description adds the billboard to the layer
 *  @param {ogBillboard} billboard the billboard
 */
ogBillboardLayer.prototype.AddBillboard = function(billboard)
{
   this.billboardarray.push(billboard);
}