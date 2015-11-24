/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/

goog.provide('owg.ogVectorLayer');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');
goog.require('owg.ogScene');
goog.require('owg.ogGeometry');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Vector Layer class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogVectorLayer()
{
   /** @type {string} */
   this.name = "ogVectorLayer";
   /** @type {number} */
   this.type = OG_OBJECT_VECTORLAYER;
   /** @type {boolean} */
   this.hide = false;  // true if poi layer is hidden
   /** @type {Array.<ogVector>} */
   this.vectorarray = [];   // array of "ogVectors"

   /** @type {string} */
   this.layername = "";
}
//------------------------------------------------------------------------------
ogVectorLayer.prototype = new ogObject();
//------------------------------------------------------------------------------


/**
 * @description Parse Options
 * @param {Object} options
 */
ogVectorLayer.prototype.ParseOptions = function(options)
{
   if(options["name"])
   {
      this.layername = options["name"];
   }
}
//------------------------------------------------------------------------------
/**
 * @description Add vector to vector Layer
 * @param {Object} options
 * @return {ogVector}
 */
ogVectorLayer.prototype.CreateVector = function(options)
{
   var vector = _CreateObject(OG_OBJECT_VECTOR,this.parent.parent,options);
   this.vectorarray.push(vector);
   vector.vectorlayer = this;
   return vector;
}
//------------------------------------------------------------------------------
/**
 *  @description removes the vector and frees its memory.
 *  @param {ogVector} vector the vector
 */
ogVectorLayer.prototype.RemoveVector = function(vector)
{
   for(var i= 0; i < this.vectorarray.length; i++)
   {
      if(this.vectorarray[i] == vector)
      {
         this.vectorarray[i].UnregisterObject();
         this.vectorarray.splice(i,1);
      }
   }
}
//------------------------------------------------------------------------------
/**
 * @description Called when object is destroyed. Never call manually.
 * @ignore
 */
ogVectorLayer.prototype._OnDestroy = function()
{
   this.RemoveVectorLayer();
}

//------------------------------------------------------------------------------
/**
 * @description hide the vector layer
 */
ogVectorLayer.prototype.Hide = function()
{
   this.hide = true;
   for(var i= 0; i < this.vectorarray.length; i++)
   {
      this.vectorarray[i].Hide();
   }

}

//------------------------------------------------------------------------------
/**
 * @description show the previously hidden vector layer
 */
ogVectorLayer.prototype.Show = function()
{
   this.hide = false;
   for(var i= 0; i < this.vectorarray.length; i++)
   {
      this.vectorarray[i].Show();
   }
}

//------------------------------------------------------------------------------
/**
 *  @description removes all geometries from the layer
 */
ogVectorLayer.prototype.RemoveVectorLayer = function()
{
   for(var i= 0; i < this.vectorarray.length; i++)
   {
      for(var j=i;j<this.vectorarray.length;j++){
         this.vectorarray[i].indexInRendererArray -= 1;
      }
      this.vectorarray[i].UnregisterObject();
   }

}

//------------------------------------------------------------------------------
/**
 *  @description adds a vector to the layer
 */
ogVectorLayer.prototype.AddVector = function(geometry)
{
   this.vectorarray.push(geometry);
   geometry.layerID = this.id;
}

//------------------------------------------------------------------------------
/**
 *  @description adds a vector to the layer
 */
ogVectorLayer.prototype.RemoveVector = function(geometry)
{
   for(var i= 0; i < this.vectorarray.length; i++)
   {
      if(this.vectorarray[i] == geometry)
      {
         for(var j=i+1;j<this.vectorarray.length;j++){
            this.vectorarray[j].indexInRendererArray -= 1;
         }
         this.vectorarray[i].UnregisterObject();
         this.vectorarray.splice(i,1);
      }
   }
}

