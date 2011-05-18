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


goog.provide('owg.TextureManager');
goog.require('owg.Texture');


/** 
 * @class TextureManager
 * @constructor
 * {@link http://www.openwebglobe.org} 
 * 
 * @description Handles the Texture creation.
 * 
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch
 * 
 * @param {engine3d} engine
 */
function TextureManager(engine)
{
   /** @type {engine3d} */
   this.engine = engine;
   /** @type Array.<Texture>*/
   this.textures = new Array();
   /** @type Array.<number>*/
   this.refCounts = new Array();
   /** @type CanvasTexture*/
}
goog.exportSymbol('TextureManager', TextureManager);


/**
 * @description Returns a Mesh with the specific icon as texture.
 * @param {string} url the texture url.
 * @param {function(Texture)=} ogTexture_callbackready
 * @param {function(Texture)=} ogTexture_callbackfailed
 * @param {boolean=} flip
 */
TextureManager.prototype.CreateTexture = function(url,ogTexture_callbackready,ogTexture_callbackfailed,flip)
{
   var origTex = this.textures[url];
   if(origTex)
   {
      this.refCounts[url] = this.refCounts[url]+1;      
      //tex = origTex;
      ogTexture_callbackready(origTex);
   }
   else
   {
      origTex = new Texture(this.engine);
      origTex.loadTexture(url,ogTexture_callbackready, ogTexture_callbackfailed, flip);
      this.refCounts[url] = 1;
      this.textures[url] = origTex;
      
   }  
   return origTex;
}
goog.exportProperty(TextureManager.prototype, 'CreateTexture',TextureManager.prototype.CreateTexture);



/**
 * @description Free memory
 * @param {string} url the texture url.
 */
TextureManager.prototype.DestroyTexture = function(url)
{   
   var numInstances = this.refCounts[url];
   this.refCounts[url] = numInstances-1;
   
   if(this.refCounts[url] == 0)
   {
      //remove from textures array
      this.textures[url].Destroy();
      delete(this.textures[url]);
      delete(this.refCounts[url]);
   }
}
goog.exportProperty(TextureManager.prototype, 'DestroyTexture',TextureManager.prototype.DestroyTexture);











