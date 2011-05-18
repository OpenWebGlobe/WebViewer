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

goog.provide('owg.ogTexture');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');
goog.require('goog.debug.Logger');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends ogObject
 * @description Texture class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogTexture()
{
   //** @type String
   this.name = "ogTexture";
   this.type = OG_OBJECT_TEXTURE;
   //** @type Texture
   this.texture = null;
   /** @type {string} */
   this.textureUrl = "";
   this.status = OG_OBJECT_BUSY;
}

//------------------------------------------------------------------------------
ogTexture.prototype = new ogObject();

//------------------------------------------------------------------------------
/**
* @description called when texture download failed
* @param {Texture} texture
* @ignore
*/
ogTexture.prototype.ogTexture_callbackfailed = function(texture)
{
   this.status = OG_OBJECT_FAILED;
   if (this.cbfFailed)
   {
      this.cbfFailed(this.id);
   }
}
//------------------------------------------------------------------------------
/**
* @description called when texture finished download/creation
* @param {Texture} texture
* @ignore
*/
ogTexture.prototype.ogTexture_callbackready = function(texture)
{
   this.status = OG_OBJECT_READY;
   if (this.cbfReady)
   {
      this.cbfReady(this.id);
   }
}
//------------------------------------------------------------------------------
/**
* @description parse options
* @param {Object} options
* @ignore
*/
ogTexture.prototype.ParseOptions = function(options)
{
   if (options == null)
   {
      goog.debug.Logger.getLogger('owg.ogTexture').warning("** ERROR: no options for texture creation!");
      return;  // no options!!
   }
   
   if (this.parent == null)
   {
      goog.debug.Logger.getLogger('owg.ogTexture').warning("** ERROR: no parent!");
      return;
   }
   
   if (this.parent.type != OG_OBJECT_SCENE)
   {
      goog.debug.Logger.getLogger('owg.ogTexture').warning("** ERROR: parent is not scene!");
      return;
   }
   
   if (options["url"])
   {
      var scene = this.parent;
      var context = scene.parent;
      var engine = context.engine; // get engine!
      
      /*this.texture = new Texture(engine);
      this.texture.textureobject = this; //wieso das?
   
      this.texture.loadTexture(options["url"], ogTexture_callbackready, ogTexture_callbackfailed, false);
      */
      var ogText = this;
      var readycbf = function(e){ogText.ogTexture_callbackready(e);};
      var failedcbf = function(e){ogText.ogTexture_callbackfailed(e);};
      this.texture = engine.texturemanager.CreateTexture(options["url"], readycbf, failedcbf, false,this);
      this.textureUrl = options["url"];
   }
}

//------------------------------------------------------------------------------

ogTexture.prototype._OnDestroy = function()
{
   if (this.texture)
   {
      /*
      this.texture.Destroy();
      */
      var scene = this.parent;
      var context = scene.parent;
      var engine = context.engine; // get engine!
      
      engine.texturemanager.DestroyTexture(this.textureUrl)
      this.texture = null;
      this.status = OG_OBJECT_FAILED;
   }
}

//------------------------------------------------------------------------------

ogTexture.prototype.Blit = function(x,y,opt_options)
{
   if (this.status == OG_OBJECT_READY)
   {
      /** @type {engine3d} */
      var engine = /** @type engine3d */this.parent.parent;
      if (this.texture)
      {
         this.texture.Blit(x, y);
      }
   }
}