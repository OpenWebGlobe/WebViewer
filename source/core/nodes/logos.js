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
goog.require('owg.vec4');

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
      /** @type {Texture} */
      this.texCrosshair = null;
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
      this.navigationState = LogosNode.GUISTATE.IDLE;
      
      /** @type {number} */
      this.guiOffsetX = 0;
      /** @type {number} */
      this.guiOffsetY = 48;
      /** @type {number} */
      this.moveangle = 0;
      /** @type {number} */
      this.moveanglenav = 0;
      /** @type {number} */
      this.ypwheelangle = 0;
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
      /** @type {boolean} */
      this.bDrawCrosshair = false;
      /** @type {number} */
      this.crosshairx = 0;
      /** @type {number} */
      this.crosshairy = 0;
      /** @type {vec4} */
      this.highlightcolor = new vec4(0.7,0.9,1,1);
      
      
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
            
            if (this.bDrawCrosshair)
            {
               this.texCrosshair.Blit(this.crosshairx-24, this.crosshairy-8,0, 0, 1, 1, true, true, 0.75);
            }
            
            var xpos = this.engine.width-1-64-this.guiOffsetX;
            var ypos = this.engine.height-1-this.guiOffsetY; 
            
            // wheel 1: pitch + yaw
            if (this.navigationState == LogosNode.GUISTATE.YAWPITCHDIAL_CLICKED)
            {
               this.texYawPitchAdjust.Blit(xpos-64, ypos-64, 0, this._adjustAngle(this.ypdiff + this.startyaw ), 1, 1, true, false, 1.0, this.highlightcolor);
            }
            else if (this.navigationState == LogosNode.GUISTATE.YAWPITCHDIAL_OVER)
            {
               this.texYawPitchAdjust.Blit(xpos-64, ypos-64, 0, this._adjustAngle(this.ypdiff + this.startyaw ), 1, 1, true, false, 1.0, this.highlightcolor);    
            }
            else
            {
                this.texYawPitchAdjust.Blit(xpos-64, ypos-64, 0, this._adjustAngle(this.ypdiff + this.startyaw ), 1, 1, true);  
            }
            
            if (this.navigationState == LogosNode.GUISTATE.YAWPITCHWHEEL_CLICKED)
            {
                this.texYawPitchWheel.Blit(xpos-32, ypos-32, 0, 0, 1, 1, true);
                this.texMoveWheel_marker.Blit(xpos-32, ypos-32, 0, this.ypwheelangle, 1, 1, true, true, 0.5);

            }
            else if  (this.navigationState == LogosNode.GUISTATE.YAWPITCHWHEEL_OVER)
            {
                  this.texYawPitchWheel.Blit(xpos-32, ypos-32, 0, 0, 1, 1, true);
                  this.texMoveWheel_marker.Blit(xpos-32, ypos-32, 0, this.ypwheelangle, 1, 1, true, true, 0.5);
            }
            else
            {
               this.texYawPitchWheel.Blit(xpos-32, ypos-32, 0, 0, 1, 1, true);
            }
            
            // wheel 2: move
            ypos = this.engine.height-1-82-this.guiOffsetY;
            if (this.navigationState == LogosNode.GUISTATE.MOVEWHEEL_OVER)
            {

                this.texMoveWheel.Blit(xpos-32, ypos-32, 0, 0, 1, 1, true);
                this.texMoveWheel_marker.Blit(xpos-32, ypos-32, 0, this.moveangle, 1, 1, true, true, 0.5);
            }
            else if (this.navigationState == LogosNode.GUISTATE.MOVEWHEEL_CLICKED)
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
            if (this.navigationState == LogosNode.GUISTATE.PLUSBUTTON_OVER) // plus mouse over
            {
               this.texPlusOver.Blit(xpos-16,ypos-16, 0, 0, 1, 1, true);   
            }
            else if (this.navigationState == LogosNode.GUISTATE.PLUSBUTTON_CLICKED) // plus clicked
            {
                this.texPlusClicked.Blit(xpos-16, ypos-16, 0, 0, 1, 1, true);   
            }
            else // plus not selected
            {
               this.texPlus.Blit(xpos-16, ypos-16, 0, 0, 1, 1, true);
            }
            
            // MINUS SYMBOL
            ypos = this.engine.height-1-82-128-64-this.guiOffsetY;
            if (this.navigationState == LogosNode.GUISTATE.MINUSBUTTON_OVER) // minus mouse over
            {
               this.texMinusOver.Blit(xpos-16, ypos-16, 0, 0, 1, 1, true);
            }
            else if (this.navigationState == LogosNode.GUISTATE.MINUSBUTTON_CLICKED) // minus clicked
            {
               this.texMinusClicked.Blit(xpos-16, ypos-16, 0, 0, 1, 1, true);     
            }
            else // minus not selected
            {
               this.texMinus.Blit(xpos-16, ypos-16, 0, 0, 1, 1, true);
            }
            // SLIDER
            ypos = this.engine.height-1-82-128-this.sliderYPos-this.guiOffsetY;
            
            
            if (this.navigationState == LogosNode.GUISTATE.SLIDERBUTTON_OVER) // slider mouse over
            {
               this.texSliderOver.Blit(xpos-16, ypos-16, 0, 0, 1, 1, true);
            }
            else if (this.navigationState == LogosNode.GUISTATE.SLIDERBUTTON_CLICKED) // slider clicked
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
           
           if (this.navigationState != LogosNode.GUISTATE.YAWPITCHDIAL_CLICKED)
           {
              // update yaw from navigation if GUI is inactive
              this.startyaw = this.yaw;
              this.ypdiff = 0;
           }
           
           if (this.navigationState == LogosNode.GUISTATE.PLUSBUTTON_CLICKED)
           {
              ts.navigationcommand = TraversalState.NavigationCommand.MOVE_DOWN;
              ts.navigationparam = 1;
           }
           else if (this.navigationState == LogosNode.GUISTATE.MINUSBUTTON_CLICKED)
           {
              ts.navigationcommand = TraversalState.NavigationCommand.MOVE_UP;
              ts.navigationparam = 1;
           }
           else if (this.navigationState == LogosNode.GUISTATE.SLIDERBUTTON_CLICKED)
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
           else if (this.navigationState == LogosNode.GUISTATE.MOVEWHEEL_CLICKED)
           {
                ts.navigationcommand = TraversalState.NavigationCommand.ROTATE_EARTH;
                ts.navigationparam = this.moveanglenav;
           }
           else if (this.navigationState == LogosNode.GUISTATE.YAWPITCHDIAL_CLICKED)
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
           
           if (this.navigationState == LogosNode.GUISTATE.IDLE)
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
      
          this.texCrosshair = new Texture(this.engine);
          this.texCrosshair.loadTexture(owg.ARTWORK_PATH + "globenavigation/crosshair.png");
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
            this.bDrawCrosshair = false;
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
         
         var movewheel_x0 = this.engine.width-1-64-this.guiOffsetX;
         var movewheel_y0 = this.engine.height-1-82-this.guiOffsetY;
         var movewheel_radius = 27;
         var mwx2 = Math.abs(this.mouseX-movewheel_x0); mwx2*=mwx2;
         var mwy2 = Math.abs(this.mouseY-movewheel_y0); mwy2*=mwy2;
         
         var ypwheel_x0 = this.engine.width-1-64-this.guiOffsetX;
         var ypwheel_y0 = this.engine.height-1-this.guiOffsetY;
         var ypwheel_radius2 = 40*40;
         var ypwheel_radius_min2 = 25*25;
         
         var ypx2 = Math.abs(this.mouseX-ypwheel_x0); ypx2 *= ypx2;
         var ypy2 = Math.abs(this.mouseY-ypwheel_y0); ypy2 *= ypy2;
         
         // move slider
         if (this.btn && this.navigationState == LogosNode.GUISTATE.SLIDERBUTTON_CLICKED)
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
         
         if (this.btn && this.navigationState == LogosNode.GUISTATE.MOVEWHEEL_CLICKED)
         {
            // calculate rotation
            var ddx = this.mouseX-movewheel_x0;
            var ddy = this.mouseY-movewheel_y0;
            this.moveangle = 180*Math.atan2(Math.abs(ddy), ddx)/Math.PI;
            this.moveanglenav = this.moveangle;
            if (ddy<0)
            {
              this.moveangle = 360-this.moveangle;
            }
            else
            {
               this.moveanglenav = 360-this.moveanglenav;   
            }
            this.moveangle += 90;
            this.moveanglenav += 90;
            
            this.moveangle = this._adjustAngle(this.moveangle);
            this.moveanglenav = this._adjustAngle(this.moveanglenav);
            
            return;
         }
         
         if (this.btn && this.navigationState == LogosNode.GUISTATE.YAWPITCHDIAL_CLICKED)
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
         
         if (this.btn && this.navigationState == LogosNode.GUISTATE.YAWPITCHWHEEL_CLICKED)
         {
            var ddx = this.mouseX-ypwheel_x0;
            var ddy = this.mouseY-ypwheel_y0;
            this.ypwheelangle = 180*Math.atan2(Math.abs(ddy), ddx)/Math.PI;
            if (ddy<0)
            {
               this.ypwheelangle = 360-this.ypwheelangle;
            }
            
            this.ypwheelangle += 90;
            this.ypwheelangle = this._adjustAngle(this.ypwheelangle);
         }
      
         this.navigationState = 0;
         
         if (this.mouseX > plus_x0 &&
             this.mouseY > plus_y0 &&
             this.mouseX < plus_x1 &&
             this.mouseY < plus_y1)
         {
            
            if (this.btn)
            {
               this.navigationState = LogosNode.GUISTATE.PLUSBUTTON_CLICKED; // plus pressed
            }
            else
            {
               this.navigationState = LogosNode.GUISTATE.PLUSBUTTON_OVER; // inside plus      
            }
         }
         
         if (this.mouseX > minus_x0 &&
             this.mouseY > minus_y0 &&
             this.mouseX < minus_x1 &&
             this.mouseY < minus_y1)
         {
            
            if (this.btn)
            {
               this.navigationState = LogosNode.GUISTATE.MINUSBUTTON_CLICKED; // minus pressed
            }
            else
            {
               this.navigationState = LogosNode.GUISTATE.MINUSBUTTON_OVER; // inside minus      
            }
         }
         
         if (this.mouseX > slider_x0 &&
             this.mouseY > slider_y0 &&
             this.mouseX < slider_x1 &&
             this.mouseY < slider_y1)
         {
            if (this.btn)
            {   
               this.navigationState = LogosNode.GUISTATE.SLIDERBUTTON_CLICKED; // slider pressed
            }
            else
            {
               this.navigationState = LogosNode.GUISTATE.SLIDERBUTTON_OVER; // inside slider      
            }
         }
         
         
         if (mwx2 + mwy2<=movewheel_radius*movewheel_radius)
         {
            if (this.btn)
            {   
               this.navigationState = LogosNode.GUISTATE.MOVEWHEEL_CLICKED; // movewheel pressed  
            }
            else
            {
               this.navigationState = LogosNode.GUISTATE.MOVEWHEEL_OVER; // inside movewheel
               // calculate rotation
                var ddx = this.mouseX-movewheel_x0;
               var ddy = this.mouseY-movewheel_y0;
               this.moveangle = 180*Math.atan2(Math.abs(ddy), ddx)/Math.PI;
               this.moveanglenav = this.moveangle;
               if (ddy<0)
               {
                  this.moveangle = 360-this.moveangle;
               }
               else
               {
                  this.moveanglenav = 360-this.moveanglenav;   
               }
               this.moveangle += 90;
               this.moveanglenav += 90;
            
               this.moveangle = this._adjustAngle(this.moveangle);
               this.moveanglenav = this._adjustAngle(this.moveanglenav);
            }   
         }
         else
         {
            // reset angle
            this.moveangle = 0; 
         }
         
         if (ypx2 + ypy2<=ypwheel_radius_min2)
         {
            // inside yp button
            if (this.btn)
            {
                  this.navigationState = LogosNode.GUISTATE.YAWPITCHWHEEL_CLICKED;
                  var ddx = this.mouseX-ypwheel_x0;
                  var ddy = this.mouseY-ypwheel_y0;
                  this.ypwheelangle = 180*Math.atan2(Math.abs(ddy), ddx)/Math.PI;
                  if (ddy<0)
                  {
                     this.ypwheelangle = 360-this.ypwheelangle;
                  }
               
                  this.ypwheelangle += 90;
                  this.ypwheelangle = this._adjustAngle(this.ypwheelangle);
                  
            }
            else
            {
                  this.navigationState = LogosNode.GUISTATE.YAWPITCHWHEEL_OVER;
                  var ddx = this.mouseX-ypwheel_x0;
                  var ddy = this.mouseY-ypwheel_y0;
                  this.ypwheelangle = 180*Math.atan2(Math.abs(ddy), ddx)/Math.PI;
                  if (ddy<0)
                  {
                     this.ypwheelangle = 360-this.ypwheelangle;
                  }
               
                  this.ypwheelangle += 90;
                  this.ypwheelangle = this._adjustAngle(this.ypwheelangle);
            }
         }
         else if (ypx2 + ypy2<=ypwheel_radius2)
         {
            
            if (this.btn)
            {   
               this.navigationState = LogosNode.GUISTATE.YAWPITCHDIAL_CLICKED; // yaw pitch dial pressed
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
               this.navigationState = LogosNode.GUISTATE.YAWPITCHDIAL_OVER; // inside yaw pitch dial
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

/** @enum {number} */
LogosNode.GUISTATE = {
   IDLE: 0,
   PLUSBUTTON_OVER: 1,
   PLUSBUTTON_CLICKED: 2,
   MINUSBUTTON_OVER: 3,
   MINUSBUTTON_CLICKED: 4,
   SLIDERBUTTON_OVER: 5,
   SLIDERBUTTON_CLICKED: 6,
   MOVEWHEEL_OVER: 7,
   MOVEWHEEL_CLICKED: 8,
   YAWPITCHDIAL_OVER: 9,
   YAWPITCHDIAL_CLICKED: 10,
   YAWPITCHWHEEL_OVER: 11,
   YAWPITCHWHEEL_CLICKED: 12
};


//------------------------------------------------------------------------------
LogosNode.prototype = new ScenegraphNode();

//------------------------------------------------------------------------------


