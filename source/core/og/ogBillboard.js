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

goog.provide('owg.ogBillboard');

goog.require('owg.ObjectDefs');
goog.require('owg.Billboard');
goog.require('owg.ogObject');
goog.require('goog.debug.Logger');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends ogObject
 * @description Billboard class (OpenWebGlobe object)
 * @author Benjamin Loesch, benjamin.loesch@fhnw.ch
 */
function ogBillboard()
{
   /** @type {string} */
   this.name = "ogBillboard";
   this.type = OG_OBJECT_BILLBOARD;

   this.status = OG_OBJECT_BUSY;
   this.layer = -1;
   this.hide = false;
}

//------------------------------------------------------------------------------
ogBillboard.prototype = new ogObject();

//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
/**
* @description parse options
* @param {Object} options
* @ignore
*/
ogBillboard.prototype.ParseOptions = function(options)
{
   if (options == null)
   {
      goog.debug.Logger.getLogger('owg.ogBillboard').warning("** ERROR: no options for billboard creation!");
      return;  // no options!!
   }
   
   if (this.parent == null)
   {
      goog.debug.Logger.getLogger('owg.ogBillboard').warning("** ERROR: no parent!");
      return;
   }
   
   if (this.parent.type != OG_OBJECT_SCENE)
   {
      goog.debug.Logger.getLogger('owg.ogBillboard').warning("** ERROR: parent is not scene!");
      return;
   }
   
   if (options["canvas"])
   {
      var scene = this.parent;
      var context = scene.parent;
      var engine = context.engine; // get engine!
      
      
      this.billboard = new Billboard(engine);
      this.billboard.ogId = this.id;
      this.billboard.Create(options["canvas"]);
      var pos = options["position"];
      this.billboard.SetPosition(pos[0],pos[1],pos[2]);
      var renderer = this._GetBillboardRenderer();
      renderer.AddBillboard(this.billboard);
   }
}

//------------------------------------------------------------------------------

ogBillboard.prototype._OnDestroy = function()
{
   if (this.billboard)
   {
      /*
      var scene = this.parent;
      var context = scene.parent;
      var engine = context.engine; // get engine!
      */
      var renderer = this._GetBillboardRenderer();
      renderer.RemoveBillboard(this.billboard);
      this.billboard.Destroy();
      this.status = OG_OBJECT_FAILED;
   }
}

//------------------------------------------------------------------------------
ogBillboard.prototype.Draw = function()
{
  this.billboard.Draw();
}

//------------------------------------------------------------------------------
/**
 *  @returns {BillboardRenderer} the billboard-renderer
 */
ogBillboard.prototype._GetBillboardRenderer = function()
{
   /** @type {BillboardRenderer} */
   var renderer = null;
   /** @type {ogScene} */
   var scene = /** @type ogScene */this.parent;
   /** @type {ogContext} */
   var context =  /** @type ogContext */scene.parent;
   // Get the engine
   /** @type {engine3d} */
   var engine = context.engine;
   
   // test if there is a scenegraph attached
   if (engine.scene)
   {
      if (engine.scene.nodeRenderObject)
      {
         renderer = engine.scene.nodeRenderObject.billboardrenderer;  
      }
   }
   return renderer;
}

ogBillboard.prototype.Hide = function()
{
   this.hide = true;
   this.billboard.hide = true;
   
}

ogBillboard.prototype.Show = function()
{
   this.hide = false;
   this.billboard.hide = false;
   
}

ogBillboard.prototype.UpdateBillboard = function(canvas)
{
   this.billboard.canvas = canvas;
   this.billboard.ToGPU();
   
}