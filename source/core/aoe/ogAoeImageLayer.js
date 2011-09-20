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

goog.provide('owg.ogAoeImageLayer');
goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');
goog.require('owg.ogScene');
goog.require('owg.ogAoeImage');


//------------------------------------------------------------------------------
/**
 * @constructor
 * @description AoeImage Layer class (OpenWebGlobe object)
 * @author Feng Lei, fenglei@aoe.ac.cn
 */
function ogAoeImageLayer()
{
   /** @type {string} */
   this.name = "ogAoeImageLayer";
   /** @type {number} */
   this.type = OG_OBJECT_AOEIMAGELAYER;
   /** @type {boolean} */
   this.hide = false;  // true if aoeimage layer is hidden
   /** @type {Array.<ogAoeImage>} */
   this.imagearray = [];   // array of "ogAoeImages"
   
   /** @type {string} */
   this.layername = "";
}
//------------------------------------------------------------------------------
ogAoeImageLayer.prototype = new ogObject();
//------------------------------------------------------------------------------


/**
 * @description Parse Options
 * @param {Object} options
 */
ogAoeImageLayer.prototype.ParseOptions = function(options)
{
   if(options["name"])
   {
      this.layername = options["name"];
   }
}

//------------------------------------------------------------------------------
/**
 * @description Called when object is destroyed. Never call manually.
 * @ignore
 */
ogAoeImageLayer.prototype._OnDestroy = function()
{
   this.RemoveAoeImageLayer();
}

//------------------------------------------------------------------------------
/**
 * @description hide the aoe image layer
 */
ogAoeImageLayer.prototype.Hide = function()
{
   this.hide = true;
   for(var i= 0; i < this.imagearray.length; i++)
   {
      this.imagearray[i].Hide();
   }

}

//------------------------------------------------------------------------------
/**
 * @description show the previously hidden aoeimage layer
 */
ogAoeImageLayer.prototype.Show = function()
{
   this.hide = false;
   for(var i= 0; i < this.imagearray.length; i++)
   {
      this.imagearray[i].Show();
   }
}

//------------------------------------------------------------------------------
/**
 *  @description removes all aoeimages from the layer
 */
ogAoeImageLayer.prototype.RemoveAoeImageLayer = function()
{
   for(var i= 0; i < this.imagearray.length; i++)
   {
      for(var j=i;j<this.imagearray.length;j++){
         this.imagearray[i].indexInRendererArray -= 1;
      }
      this.imagearray[i].UnregisterObject();
   }
   
}

//------------------------------------------------------------------------------
/**
 *  @description adds an aoeimage to the layer
 */
ogAoeImageLayer.prototype.AddAoeImage = function(aoeimage)
{
   this.imagearray.push(aoeimage);
   aoeimage.layerID = this.id;
}

//------------------------------------------------------------------------------
/**
 *  @description adds an aoeimage to the layer
 */
ogAoeImageLayer.prototype.RemoveAoeImage = function(aoeimage)
{
   for(var i= 0; i < this.imagearray.length; i++)
   {
      if(this.imagearray[i] == aoeimage)
      {
         for(var j=i+1;j<this.imagearray.length;j++){
            this.imagearray[j].indexInRendererArray -= 1;
         }
         this.imagearray[i].UnregisterObject();
         this.imagearray.splice(i,1);
      }
   }
}

