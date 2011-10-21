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
      /** @type {Texture} */
      this.texMoveWheel = null;
      /** @type {Texture} */
      this.texMoveWheel_marker = null;
      /** @type {Texture} */
      this.texYawPitchWheel = null;
      /** @type {Texture} */
      this.texYawPitchAdjust = null;
      /** @type {Texture} */
      this.texMinus = null;
      /** @type {Texture} */
      this.texMinusOver = null;
      /** @type {Texture} */
      this.texMinusClicked = null;
      /** @type {Texture} */
      this.texPlus = null;
      /** @type {Texture} */
      this.texPlusOver = null;
      /** @type {Texture} */
      this.texPlusClicked = null;
      /** @type {Texture} */
      this.texSlider = null;
      /** @type {Texture} */
      this.texSliderOver = null;
      /** @type {Texture} */
      this.texSliderClicked = null;
      /** @type {Texture} */
      this.texSliderRail = null;
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
      /** @type {number} */
      this.navigationtype = -1;
      /** @type {number} */
      this.mouseX = 0;
      /** @type {number} */
      this.mouseY = 0;
      /** @type {number} */
      this.navigationState = 0;
      
      /** @type {number} */
      this.guiOffsetX = 0;
      /** @type {number} */
      this.guiOffsetY = 48;
      /** @type {number} */
      this.moveangle = 0;
      /** @type {number} */
      this.ypdiff = 0;
      /** @type {number} */
      this.ypangle = 0;
      /** @type {number} */
      this.ypstartangle = 0;
      /** @type {number} */
      this.startyaw = 0;
      
      /** @type {number} */
      this.sliderYPos = 0;
      
      //------------------------------------------------------------------------
      this.OnChangeState = function()
      {
         
      }
      //------------------------------------------------------------------------
      this._adjustAngle = function(angle)
      {
         while (angle>360)
         {
            angle-=360;
         }
         while (angle<0)
         {
            angle+=360;
         }
         
         return angle;
      }
      //------------------------------------------------------------------------
      this.OnRender = function()
      {
         if (this.navigationtype == 0) // flight navigation, draw compass
         {
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
         else if (this.navigationtype == 1) // globe navigation
         {
            var xpos = this.engine.width-1-64-this.guiOffsetX;
            var ypos = this.engine.height-1-this.guiOffsetY; 
            
            // wheel 1: pitch + yaw
            if (this.navigationState == 10)
            {
               this.texYawPitchAdjust.Blit(xpos-64, ypos-64, 0, this._adjustAngle(this.ypdiff + this.startyaw ), 1, 1, true);
            }
            else
            {
               this.texYawPitchAdjust.Blit(xpos-64, ypos-64, 0, this._adjustAngle(this.ypdiff + this.startyaw ), 1, 1, true);    
            }
            
            this.texYawPitchWheel.Blit(xpos-32, ypos-32, 0, 0, 1, 1, true);
            
            // wheel 2: move
            ypos = this.engine.height-1-82-this.guiOffsetY;
            if (this.navigationState == 7)
            {

                this.texMoveWheel.Blit(xpos-32, ypos-32, 0, 0, 1, 1, true);
                this.texMoveWheel_marker.Blit(xpos-32, ypos-32, 0, this.moveangle, 1, 1, true, true, 0.5);
            }
            else if (this.navigationState == 8)
            {
                this.texMoveWheel.Blit(xpos-32, ypos-32, 0, 0, 1, 1, true);
                this.texMoveWheel_marker.Blit(xpos-32, ypos-32, 0, this.moveangle, 1, 1, true, true, 0.5);
            }
            else
            {
                this.texMoveWheel.Blit(xpos-32, ypos-32, 0, 0, 1, 1, true);      
            }
             
           
             
            ypos = this.engine.height-1-82-128-this.guiOffsetY;
            this.texSliderRail.Blit(xpos-8, ypos-64, 0, 0, 1, 1, true);
             
            // PLUS-SYMBOL
            ypos = this.engine.height-1-82-64-this.guiOffsetY;
            if (this.navigationState == 1) // plus mouse over
            {
               this.texPlusOver.Blit(xpos-16,ypos-16, 0, 0, 1, 1, true);   
            }
            else if (this.navigationState == 2) // plus clicked
            {
                this.texPlusClicked.Blit(xpos-16, ypos-16, 0, 0, 1, 1, true);   
            }
            else // plus not selected
            {
               this.texPlus.Blit(xpos-16, ypos-16, 0, 0, 1, 1, true);
            }
            
            // MINUS SYMBOL
            ypos = this.engine.height-1-82-128-64-this.guiOffsetY;
            if (this.navigationState == 3) // minus mouse over
            {
               this.texMinusOver.Blit(xpos-16, ypos-16, 0, 0, 1, 1, true);
            }
            else if (this.navigationState == 4) // minus clicked
            {
               this.texMinusClicked.Blit(xpos-16, ypos-16, 0, 0, 1, 1, true);     
            }
            else // minus not selected
            {
               this.texMinus.Blit(xpos-16, ypos-16, 0, 0, 1, 1, true);
            }
            // SLIDER
            ypos = this.engine.height-1-82-128-this.sliderYPos-this.guiOffsetY;
            
            
            if (this.navigationState == 5) // slider mouse over
            {
               this.texSliderOver.Blit(xpos-16, ypos-16, 0, 0, 1, 1, true);
            }
            else if (this.navigationState == 6) // slider clicked
            {
               this.texSliderClicked.Blit(xpos-16, ypos-16, 0, 0, 1, 1, true);   
            }
            else
            {
               this.texSlider.Blit(xpos-16, ypos-16, 0, 0, 1, 1, true);
            }
            
            /*ypos = this.engine.height-1-72-128-64-64-this.guiOffsetY;
            this.compassr.Blit(xpos-32, ypos-32,0,this.yaw,0.5,0.5,true);    
            this.compassbg.Blit(xpos-32, ypos-32,0,0,0.5,0.5,true);*/
         }
         
         
      }
      //------------------------------------------------------------------------
      this.OnTraverse = function(ts)
      {
           this.navigationtype = ts.navigationtype;
           this.yaw = ts.compassdirection*57.295779513082320876798154814105; //rad2deg
           this.longitude = ts.geoposition.longitude;
           this.latitude = ts.geoposition.latitude;
           this.elevation = ts.geoposition.elevation;
           
           if (this.navigationState != 10)
           {
              // update yaw from navigation if GUI is inactive
              this.startyaw = this.yaw;
              this.ypdiff = 0;
           }
           
           if (this.navigationState == 2)
           {
              ts.navigationcommand = TraversalState.NavigationCommand.MOVE_DOWN;
              ts.navigationparam = 1;
           }
           else if (this.navigationState == 4)
           {
              ts.navigationcommand = TraversalState.NavigationCommand.MOVE_UP;
              ts.navigationparam = 1;
           }
           else if (this.navigationState == 6)
           {
              if (this.sliderYPos>0)
              {
                ts.navigationcommand = TraversalState.NavigationCommand.MOVE_UP;
                ts.navigationparam = Math.sqrt(this.sliderYPos) / 4;   
              }
              else if (this.sliderYPos<0)
              {
                ts.navigationparam = Math.sqrt(-this.sliderYPos) / 4;
                ts.navigationcommand = TraversalState.NavigationCommand.MOVE_DOWN;
              }
           }
           else if (this.navigationState == 8)
           {
                ts.navigationcommand = TraversalState.NavigationCommand.ROTATE_EARTH;
                ts.navigationparam = this.moveangle;
           }
           else if (this.navigationState == 10)
           {
                ts.navigationcommand = TraversalState.NavigationCommand.UPDATE_YAW;
                ts.navigationparam = this.startyaw + this.ypdiff;
                ts.navigationparam = this._adjustAngle(ts.navigationparam);
                ts.navigationparam *= Math.PI/180;
           }
           else
           {
              ts.navigationcommand = TraversalState.NavigationCommand.IDLE;
           }
           
           if (this.navigationState == 0)
           {
               ts.navigationlock = 0;
           }
           else
           {
               ts.navigationlock = 1;
           }
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
          
          this.texMoveWheel = new Texture(this.engine);
          this.texMoveWheel.loadTexture(owg.ARTWORK_PATH + "globenavigation/MoveWheel.png");
          
          this.texYawPitchWheel = new Texture(this.engine);
          this.texYawPitchWheel.loadTexture(owg.ARTWORK_PATH + "globenavigation/YawPitchWheel.png");
          
          this.texYawPitchAdjust = new Texture(this.engine);
          this.texYawPitchAdjust.loadTexture(owg.ARTWORK_PATH + "globenavigation/yaw_pitch_adjust.png");
          
          this.texMoveWheel_marker = new Texture(this.engine);
          this.texMoveWheel_marker.loadTexture(owg.ARTWORK_PATH + "globenavigation/movewheel_marker.png");
          
          this.texMinus = new Texture(this.engine);
          this.texMinus.loadTexture(owg.ARTWORK_PATH + "globenavigation/minus.png");
      
          this.texMinusOver = new Texture(this.engine);
          this.texMinusOver.loadTexture(owg.ARTWORK_PATH + "globenavigation/minus_over.png");
          
          this.texMinusClicked = new Texture(this.engine);
          this.texMinusClicked.loadTexture(owg.ARTWORK_PATH + "globenavigation/minus_clicked.png");
          
          this.texPlus = new Texture(this.engine);
          this.texPlus.loadTexture(owg.ARTWORK_PATH + "globenavigation/plus.png");
          
          this.texPlusOver = new Texture(this.engine);
          this.texPlusOver.loadTexture(owg.ARTWORK_PATH + "globenavigation/plus_over.png");
          
          this.texPlusClicked = new Texture(this.engine);
          this.texPlusClicked.loadTexture(owg.ARTWORK_PATH + "globenavigation/plus_clicked.png");
          
          this.texSlider = new Texture(this.engine);
          this.texSlider.loadTexture(owg.ARTWORK_PATH + "globenavigation/slider.png");
          
          this.texSliderOver = new Texture(this.engine);
          this.texSliderOver.loadTexture(owg.ARTWORK_PATH + "globenavigation/slider_over.png");
          
          this.texSliderClicked = new Texture(this.engine);
          this.texSliderClicked.loadTexture(owg.ARTWORK_PATH + "globenavigation/slider_clicked.png");
          
          this.texSliderRail = new Texture(this.engine);
          this.texSliderRail.loadTexture(owg.ARTWORK_PATH + "globenavigation/slider_rail.png");
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
         goog.events.listen(context, goog.events.EventType.MOUSEMOVE, this.OnMouseMove, false, this);
      }
      //------------------------------------------------------------------------
      this.OnMouseDown = function(e)
      {
         if (e.isButton(goog.events.BrowserEvent.MouseButton.LEFT))
         {
            var xcorr = e.offsetX-this.engine.context.offsetLeft;
            var ycorr = e.offsetY-this.engine.context.offsetTop;
            this.mx = xcorr;
            this.my = this.engine.height-(ycorr)-1;
            
            
            this.mouseX = xcorr;
            this.mouseY = this.engine.height-(ycorr)-1;
            this.btn = true;
            
            if (this.navigationtype == 1)
            {
               this.HandleGUI(this.mouseX, this.mouseY, 0, 0);
            }
         }
      }
      //------------------------------------------------------------------------
      this.OnMouseUp = function(e)
      {
         if (e.isButton(goog.events.BrowserEvent.MouseButton.LEFT))
         {
            var xcorr = e.offsetX-this.engine.context.offsetLeft;
            var ycorr = e.offsetY-this.engine.context.offsetTop;
            this.mouseX = xcorr;
            this.mouseY = this.engine.height-(ycorr)-1;
            this.btn = false;
            
            if (this.navigationtype == 1)
            {
               this.HandleGUI(this.mouseX, this.mouseY,0, 0);
            }
            
            this.sliderYPos = 0;
         }
      }
      //------------------------------------------------------------------------
      this.OnMouseMove = function(e)
      {

         var xcorr = e.offsetX-this.engine.context.offsetLeft;
         var ycorr = e.offsetY-this.engine.context.offsetTop;

         var dx = xcorr - this.mouseX;
         var dy = this.engine.height-(ycorr)-1 - this.mouseY;   
         this.mouseX = xcorr;
         this.mouseY = this.engine.height-(ycorr)-1;
         
         if (this.navigationtype == 1)
         {
            this.HandleGUI(this.mouseX, this.mouseY, dx, dy);
         }

         
      }
      //------------------------------------------------------------------------
      this.HandleGUI = function(mouseX, mouseY, dx, dy)
      {
         // in future, the layout of the GUI could be stored in a JSON file
         // but for now, this is hardcoded.
         var plus_x0 = (this.engine.width-1-64-this.guiOffsetX)-8;
         var plus_y1 = (this.engine.height-1-82-64-this.guiOffsetY)+8;
         var plus_x1 = plus_x0 + 16;
         var plus_y0 = plus_y1 - 16;
         
         //console.log("mouseX: "+mouseX+" mouseY: "+mouseY+"    this.engine.width: "+this.engine.width+"    this.engine.height: "+this.engine.height);
         var minus_x0 = this.engine.width-1-64-this.guiOffsetX-8;
         var minus_y1 = this.engine.height-1-82-128-64-this.guiOffsetY+8;
         var minus_x1 = minus_x0 + 16;
         var minus_y0 = minus_y1 - 16;
         
         var slider_x0 = this.engine.width-1-64-this.guiOffsetX-8;
         var slider_y1 = this.engine.height-1-82-128-this.sliderYPos-this.guiOffsetY+8;
         var slider_x1 = slider_x0 + 16;
         var slider_y0 = slider_y1 - 16;
         
         var movewheel_x0 = this.engine.width-1-64-this.guiOffsetX-8;
         var movewheel_y0 = this.engine.height-1-82-this.guiOffsetY+8;
         var movewheel_radius = 27;
         
         var ypwheel_x0 = this.engine.width-1-64-this.guiOffsetX;
         var ypwheel_y0 = this.engine.height-1-this.guiOffsetY;
         var ypwheel_radius = 41;
         var ypwheel_radius_min = 27;
         
         
         // move slider
         if (this.btn && this.navigationState == 6)
         {
            this.sliderYPos -= dy;
            if (this.sliderYPos<-40)
            {
               this.sliderYPos = -40;
            }
            else if (this.sliderYPos>40)
            {
               this.sliderYPos = 40;
            }
            return;
         }
         
         if (this.btn && this.navigationState == 8)
         {
            // calculate rotation
            var ddx = this.mouseX-movewheel_x0;
            var ddy = this.mouseY-movewheel_y0;
            this.moveangle = 180*Math.atan2(Math.abs(ddy), ddx)/Math.PI;
            if (ddy<0)
            {
              this.moveangle = 360-this.moveangle;
            }
            this.moveangle += 90;
            return;
         }
         
         if (this.btn && this.navigationState == 10)
         {
            // calculate rotation
            var ddx = this.mouseX-ypwheel_x0;
            var ddy = this.mouseY-ypwheel_y0;
            this.ypangle = 180*Math.atan2(Math.abs(ddy), ddx)/Math.PI;
            if (ddy<0)
            {
              this.ypangle = 360-this.ypangle;
            }
            this.ypangle -= 90;
            
            this.ypangle = this._adjustAngle(this.ypangle);
            this.ypdiff = this._adjustAngle(this.ypangle-this.ypstartangle);
            return;
         }
      
         this.navigationState = 0;
         
         if (this.mouseX > plus_x0 &&
             this.mouseY > plus_y0 &&
             this.mouseX < plus_x1 &&
             this.mouseY < plus_y1)
         {
            
            if (this.btn)
            {
               this.navigationState = 2; // plus pressed
            }
            else
            {
               this.navigationState = 1; // inside plus      
            }
         }
         
         if (this.mouseX > minus_x0 &&
             this.mouseY > minus_y0 &&
             this.mouseX < minus_x1 &&
             this.mouseY < minus_y1)
         {
            
            if (this.btn)
            {
               this.navigationState = 4; // minus pressed
            }
            else
            {
               this.navigationState = 3; // inside minus      
            }
         }
         
         if (this.mouseX > slider_x0 &&
             this.mouseY > slider_y0 &&
             this.mouseX < slider_x1 &&
             this.mouseY < slider_y1)
         {
            if (this.btn)
            {   
               this.navigationState = 6; // slider pressed
            }
            else
            {
               this.navigationState = 5; // inside slider      
            }
         }
         
         
         if (Math.abs(this.mouseX-movewheel_x0)<=movewheel_radius &&
             Math.abs(this.mouseY-movewheel_y0)<=movewheel_radius)
         {
            if (this.btn)
            {   
               this.navigationState = 8; // movewheel pressed  
            }
            else
            {
               this.navigationState = 7; // inside movewheel
               // calculate rotation
               var ddx = this.mouseX-movewheel_x0;
               var ddy = this.mouseY-movewheel_y0;
               this.moveangle = 180*Math.atan2(Math.abs(ddy), ddx)/Math.PI;
               if (ddy<0)
               {
                  this.moveangle = 360-this.moveangle;
               }
               this.moveangle += 90;
            }   
         }
         else
         {
            // reset angle
            this.moveangle = 0; 
         }
         
         /*if (Math.abs(this.mouseX-ypwheel_x0)<=ypwheel_radius &&
             Math.abs(this.mouseY-ypwheel_y0)<=ypwheel_radius_min)
         {
            // inside dial button
            if (this.btn) console.log("inside");
         }*/
         if (Math.abs(this.mouseX-ypwheel_x0)<=ypwheel_radius &&
             Math.abs(this.mouseY-ypwheel_y0)<=ypwheel_radius)
         {
            
            if (this.btn)
            {   
               this.navigationState = 10; // yaw pitch wheel pressed
               var ddx = this.mouseX-ypwheel_x0;
               var ddy = this.mouseY-ypwheel_y0;
               this.ypangle = 180*Math.atan2(Math.abs(ddy), ddx)/Math.PI;
               if (ddy<0)
               {
                  this.ypangle = 360-this.ypangle;
               }
               this.ypangle -= 90;
               this.ypangle = this._adjustAngle(this.ypangle);
               this.ypdiff = this._adjustAngle(this.ypangle-this.ypstartangle);
               
               this.startyaw = this.yaw; // store current yaw to enable update
            }
            else
            {
               this.navigationState = 9; // inside yaw pitch wheel
               // calculate rotation
               var ddx = this.mouseX-ypwheel_x0;
               var ddy = this.mouseY-ypwheel_y0;
               this.ypstartangle = 180*Math.atan2(Math.abs(ddy), ddx)/Math.PI;
               if (ddy<0)
               {
                  this.ypstartangle = 360-this.ypstartangle;
               }
               this.ypstartangle -= 90;
               this.ypstartangle -= this.ypdiff;
               
               // make sure angle is in range [0,360]
               this.ypstartangle = this._adjustAngle(this.ypstartangle);
            }   
         }

      }
      //------------------------------------------------------------------------
}

LogosNode.prototype = new ScenegraphNode();

//------------------------------------------------------------------------------


