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

goog.provide('owg.ogWorld');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description World class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogWorld()
{
   this.name = "ogWorld";
   this.type = OG_OBJECT_WORLD;
}


//------------------------------------------------------------------------------
ogWorld.prototype = new ogObject();

//------------------------------------------------------------------------------
ogWorld.prototype.ParseOptions = function(options)
{
   if (options == null)
   {
      goog.debug.Logger.getLogger('owg.ogTexture').warning("** ERROR: no options for texture creation!");
      return;  // no options!!
   }

   if (options["scenetype"])
   {
      
      /** @type ogContext */
      var context = this.parent.parent;
      /** @type engine3d */
      var engine = context.engine;
      
      if (options["scenetype"] == OG_SCENE_3D_ELLIPSOID_WGS84)
      {
         engine.SetWorldType(1);
         engine.CreateScene();
         if (engine.scene)
         {
            engine.scene.world = this;
         }
      }
      else if (options["scenetype"] == OG_SCENE_3D_FLAT_CARTESIAN)
      {
         engine.SetWorldType(2);
         engine.CreateScene();
         if (engine.scene)
         {
            engine.scene.world = this;
         }
      }
      else if (options["scenetype"] == OG_SCENE_2D_SCREEN)
      {
         engine.SetWorldType(3);
         engine.CreateScene();
         if (engine.scene)
         {
            engine.scene.world = this;
         }
      }
      else if (options["scenetype"] == OG_SCENE_CUSTOM)
      {
         engine.SetWorldType(0);
         engine.CreateScene();
         if (engine.scene)
         {
            engine.scene.world = this;
         }
      }
      
   }
}