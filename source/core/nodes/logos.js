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

goog.provide('owg.LogosNode');

goog.require('goog.debug.ErrorHandler');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventType');
goog.require('owg.ScenegraphNode');
goog.require('owg.Texture');

//------------------------------------------------------------------------
/**
 * Logos Node. Draw logos
 * @author Martin Christen martin.christen@fhnw.ch 
 * @constructor
 */
function LogosNode()
{
      /** @type {?Node} */
      this.logo = null;
      /** @type {Texture} */
      this.compassbg = null;
      /** @type {Texture} */
      this.compassr = null;
      /** @type {number} */
      this.mx = 0;
      /** @type {number} */
      this.my = 0;
      /** @type {boolean} */
      this.btn = false;
      /** @type {number} */
      this.yaw = 0;
      /** @type {number} */
      this.longitude = 0;
      /** @type {number} */
      this.latitude = 0;
      /** @type {number} */
      this.elevation = 0;
      //------------------------------------------------------------------------
      this.OnChangeState = function()
      {
         
      }
     
      //------------------------------------------------------------------------
      this.OnRender = function()
      {
         //this.logo.Blit(this.engine.width-72, this.engine.height-72,0,0,1,1,true);
         
         if (this.btn)
         {       
            this.compassr.Blit(this.mx-64, this.my-64,0,this.yaw,1,1,true);    
            this.compassbg.Blit(this.mx-64, this.my-64,0,0,1,1,true);
         }
         
         // draw position
         var lng = this.longitude.toFixed(6);
         var lat = this.latitude.toFixed(6);
         var elv = this.elevation.toFixed(2);
         this.engine.DrawText("Current position: (" + lng+ ", " + lat + "," + elv + ")",0,0,0.5);  
         
      }
      
      //------------------------------------------------------------------------
      this.OnTraverse = function(ts)
      {
           this.yaw = ts.compassdirection*57.295779513082320876798154814105; //rad2deg
           this.longitude = ts.geoposition.longitude;
           this.latitude = ts.geoposition.latitude;
           this.elevation = ts.geoposition.elevation;
      }
      
      //------------------------------------------------------------------------
      this.OnInit = function()
      {
          //this.logo = new Texture(this.engine);
          //this.logo.LoadLogo();
          
          this.compassbg = new Texture(this.engine);
          this.compassbg.LoadCompassBackground();
          
          this.compassr = new Texture(this.engine);
          this.compassr.LoadCompassRose();
      }
      
      //------------------------------------------------------------------------
      this.OnExit = function()
      {
      
      }
      
      //------------------------------------------------------------------------
      this.OnRegisterEvents = function(context)
      {
         goog.events.listen(context, goog.events.EventType.MOUSEDOWN, this.OnMouseDown, false, this);
         goog.events.listen(context, goog.events.EventType.MOUSEUP, this.OnMouseUp, false, this);
      }
      //------------------------------------------------------------------------
      
      this.OnMouseDown = function(e)
      {
         if (e.isButton(goog.events.BrowserEvent.MouseButton.LEFT))
         {
            this.mx = e.offsetX;
            this.my = this.engine.height-e.offsetY-1;
            this.btn = true;
         }
      }
      
      this.OnMouseUp = function(e)
      {
         if (e.isButton(goog.events.BrowserEvent.MouseButton.LEFT))
         {
            this.btn = false;
         }
      }
}

LogosNode.prototype = new ScenegraphNode();

//------------------------------------------------------------------------------


