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
      this.sliderYPos = 0;
      
      //------------------------------------------------------------------------
      this.OnChangeState = function()
      {
         
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
            var xpos = this.engine.width-1-64;
            var ypos = this.engine.height-1-72;
             
            this.texMoveWheel.Blit(xpos-32, ypos-32, 0, 0, 1, 1, true);
             
            ypos = this.engine.height-1-72-128;
            this.texSliderRail.Blit(xpos-8, ypos-64, 0, 0, 1, 1, true);
             
            // PLUS-SYMBOL
            ypos = this.engine.height-1-72-64;
            if (this.navigationState == 1) // plus mouse over
            {
               this.texPlusOver.Blit(xpos-16, ypos-16, 0, 0, 1, 1, true);   
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
            ypos = this.engine.height-1-72-128-64;
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
            ypos = this.engine.height-1-72-128-this.sliderYPos;
            
            
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
            this.mx = e.offsetX;
            this.my = this.engine.height-e.offsetY-1;
            
            
            this.mouseX = e.offsetX;
            this.mouseY = this.engine.height-e.offsetY-1;
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
            this.mouseX = e.offsetX;
            this.mouseY = this.engine.height-e.offsetY-1;
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
         var dx = e.offsetX - this.mouseX;
         var dy = this.engine.height-e.offsetY-1 - this.mouseY;   
         this.mouseX = e.offsetX;
         this.mouseY = this.engine.height-e.offsetY-1;
         
         if (this.navigationtype == 1)
         {
            this.HandleGUI(this.mouseX, this.mouseY, dx, dy);
         }

         
      }
      //------------------------------------------------------------------------
      this.HandleGUI = function(mouseX, mouseY, dx, dy)
      {
            
         var plus_x0 = this.engine.width-1-64;
         var plus_y1 = this.engine.height-1-72-64;
         var plus_x1 = plus_x0 + 16;
         var plus_y0 = plus_y1 - 16;
         
         var minus_x0 = this.engine.width-1-64;
         var minus_y1 = this.engine.height-1-72-128-64;
         var minus_x1 = minus_x0 + 16;
         var minus_y0 = minus_y1 - 16;
         
         var slider_x0 = this.engine.width-1-64;
         var slider_y1 = this.engine.height-1-72-128-this.sliderYPos;
         var slider_x1 = slider_x0 + 16;
         var slider_y0 = slider_y1 - 16;
      
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
               // move slider

               this.sliderYPos -= dy;
               if (this.sliderYPos<-40)
               {
                    this.sliderYPos = -40;
               }
               else if (this.sliderYPos>40)
               {
                    this.sliderYPos = 40;
               }
               this.navigationState = 6; // slider pressed
            }
            else
            {
               this.navigationState = 5; // inside slider      
            }
         }
         
         
      }
      //------------------------------------------------------------------------
}

LogosNode.prototype = new ScenegraphNode();

//------------------------------------------------------------------------------


