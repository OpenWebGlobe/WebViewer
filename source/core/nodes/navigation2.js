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

goog.provide('owg.NavigationNode2');

goog.require('owg.ScenegraphNode');
goog.require('owg.GeoCoord');
goog.require('owg.mat4');
goog.require('owg.vec3');

/**
 * Navigation Node. Setup view matrix using Google Earth-style navigation
 * @author Martin Christen martin.christen@fhnw.ch
 * @constructor
 */
function NavigationNode2()
{
      this.lastkey = 0;
      this.curtime = 0;
      this.matView = new mat4();

      this._vEye = new vec3();
      this._vEye.Set(1,0,0);

      /*this._yaw = 0;
      this._pitch = -1.570796326794896619231; // -pi/2;
      this._roll = 0;

      this._longitude = 7.7744205094639103;
      this._latitude = 47.472720418012834;
      this._ellipsoidHeight = 3000000;*/

      this._yaw = 0;
      this._pitch = -0.3;
      this._roll = 0;
      this._longitude = 7.616;
      this._latitude = 45.9088;
      this._ellipsoidHeight = 17228.45;

      this._state = NavigationNode2.STATES.IDLE;
      this._inputs = 0;
      this._dragOriginMouseX = 0;
      this._dragOriginMouseY = 0;
      this._dragOriginYaw = 0;
      this._dragOriginPitch = 0;

      this._fYawSpeed = 0;
      this._fSurfacePitchSpeed = 0;
      this._fRollSpeed = 0;
      this._fPitchSpeed = 0;
      this._fVelocityY = 0;
      this._fSurfacePitch = 0;
      this._fLastRoll = 0;
      this._fSpeed = 1.0;
      this._dFlightVelocity = 1.0;
      this._dYawVelocity = 1.0;
      this._dPitchVelocity = 1.0;
      this._dRollVelocity = 1.0;
      this._dElevationVelocity = 1.0;
      this._pitch_increase = 0;
      this._pitch_decrease = 0;
      this._roll_increase = 0;
      this._roll_decrease = 0;
      this._bRollAnim = false;
      this._MinElevation = 150.0;
      this._dAccumulatedTick = 0;

      this._nMouseX = 0;
      this._nMouseY = 0;
      this._vR = new vec3();
      this._bDragging = false;
      this._dSpeed = 0;

      this.geocoord = new Array(3);
      this.pos = new GeoCoord(0,0,0);

      this.matBody = new mat4();
      this.matTrans = new mat4();
      this.matNavigation = new mat4();
      this.matCami3d = new mat4();
      this.matView = new mat4();
      this.matR1 = new mat4();
      this.matR2 = new mat4();
      this.matCami3d.Cami3d();

      // min altitude is currently 100 m, this can be customized in future.
      this.minAltitude = 225;

      //------------------------------------------------------------------------
      this.OnChangeState = function()
      {
         this.engine.SetViewMatrix(this.matView);
      }
      //------------------------------------------------------------------------
      this.OnRender = function()
      {
      }
      //------------------------------------------------------------------------
      this.OnTraverse = function(ts)
      {
         var yaw = this._yaw;
         while (yaw > 2 * Math.PI)
         {
            yaw -= 2* Math.PI;
         }
         while (yaw < 0)
         {
            yaw += 2 * Math.PI;
         }
         var pitch = this._pitch;
         if (pitch < -Math.PI / 2)
         {
            pitch = -Math.PI / 2;
         }
         else if (pitch > Math.PI / 2)
         {
            pitch = Math.PI / 2;
         }

         //console.log('actual lng=' + this._longitude + ' lat=' + this._latitude + ' elv=' + this._ellipsoidHeight);
         this.pos.Set(this._longitude, this._latitude, this._ellipsoidHeight);
         this.pos.ToCartesian(this.geocoord);
         this._vEye.Set(this.geocoord[0], this.geocoord[1], this.geocoord[2]);

         // this can be further optimized for JS
         this.matTrans.Translation(this.geocoord[0], this.geocoord[1], this.geocoord[2]);
         this.matNavigation.CalcNavigationFrame(this._longitude, this._latitude);
         this.matBody.CalcBodyFrame(yaw, pitch, this._roll);
         this.matR1.Multiply(this.matTrans, this.matNavigation);
         this.matR2.Multiply(this.matR1, this.matBody);
         this.matR1.Multiply(this.matR2, this.matCami3d);
         this.matView.Inverse(this.matR1);


         ts.SetCompassDirection(yaw);
         ts.SetPosition(this.geocoord[0], this.geocoord[1], this.geocoord[2]);
         ts.SetGeoposition(this._longitude, this._latitude, this._ellipsoidHeight);
      }
      //------------------------------------------------------------------------
      this.OnInit = function()
      {
          //
      }
      //------------------------------------------------------------------------
      this.OnExit = function()
      {
         //
      }
      //------------------------------------------------------------------------
      this.OnRegisterEvents = function()
      {
         this.engine.eventhandler.AddKeyDownCallback(this, this.OnKeyDown);
         this.engine.eventhandler.AddKeyUpCallback(this, this.OnKeyUp);
         this.engine.eventhandler.AddMouseDownCallback(this, this.OnMouseDown);
         this.engine.eventhandler.AddMouseUpCallback(this, this.OnMouseUp);
         this.engine.eventhandler.AddMouseMoveCallback(this, this.OnMouseMove);
         this.engine.eventhandler.AddTimerCallback(this, this.OnTick);
         this.engine.eventhandler.AddMouseWheelCallback(this, this.OnMouseWheel);
      }
      //------------------------------------------------------------------------
      this._OnInputChange = function(sender)
      {
         // Determine the new state based on inputs
         var state = NavigationNode2.STATES.IDLE;
         if ((sender._inputs & NavigationNode2.INPUTS.MOUSE_ALL) == NavigationNode2.INPUTS.MOUSE_LEFT)
         {
            if ((sender._inputs & NavigationNode2.INPUTS.MODIFIER_ALL) == 0)
            {
               state = NavigationNode2.STATES.DRAGGING;
            }
            else if ((sender._inputs & NavigationNode2.INPUTS.MODIFIER_ALL) == NavigationNode2.INPUTS.MODIFIER_SHIFT)
            {
               state = NavigationNode2.STATES.ROTATING;
            }
            else if ((sender._inputs & NavigationNode2.INPUTS.MODIFIER_ALL) == NavigationNode2.INPUTS.MODIFIER_CONTROL)
            {
               state = NavigationNode2.STATES.LOOKING;
            }
         }
         // If the state has changed...
         if (state != sender._state)
         {
            // ...exit the old state...
            if (sender._state == NavigationNode2.STATES.LOOKING)
            {
               sender._yaw = sender._dragOriginYaw + 45 * Math.PI * sender._fSpeed * (sender._nMouseX - sender._dragOriginMouseX) / (180 * sender.engine.height);
               sender._pitch = sender._dragOriginPitch + 45 * Math.PI * sender._fSpeed * (sender._dragOriginMouseY - sender._nMouseY) / (180 * sender.engine.height);
            }
            // ...and enter the new
            sender._state = state;
            if (sender._state == NavigationNode2.STATES.LOOKING)
            {
               sender._dragOriginMouseX = sender._nMouseX;
               sender._dragOriginMouseY = sender._nMouseY;
               sender._dragOriginYaw = sender._yaw;
               sender._dragOriginPitch = sender._pitch;
            }
         }
         // Update according to the current state
         if (sender._state == NavigationNode2.STATES.LOOKING)
         {
            sender._yaw = sender._dragOriginYaw + 45 * Math.PI * sender._fSpeed * (sender._nMouseX - sender._dragOriginMouseX) / (180 * sender.engine.height);
            sender._pitch = sender._dragOriginPitch + 45 * Math.PI * sender._fSpeed * (sender._dragOriginMouseY - sender._nMouseY) / (180 * sender.engine.height);
         }
      }
      //------------------------------------------------------------------------
      // EVENT: OnMouseWheel
      this.OnMouseWheel = function(sender, delta)
      {
         if (sender._state == NavigationNode2.STATES.IDLE)
         {
            if ((sender._inputs & NavigationNode2.INPUTS.MODIFIER_ALL) == 0)
            {
               var pickresult = {};
               sender.engine.PickGlobe(sender._nMouseX, sender._nMouseY, pickresult);
               if (pickresult.hit)
               {
                  sender.pos.Set(sender._longitude, sender._latitude, sender._ellipsoidHeight);
                  sender.pos.ToCartesian(sender.geocoord);
                  var dx = sender.geocoord[0] - pickresult.x;
                  var dy = sender.geocoord[1] - pickresult.y;
                  var dz = sender.geocoord[2] - pickresult.z;
                  if (delta > 0)
                  {
                     dx *= 0.1;
                     dy *= 0.1;
                     dz *= 0.1;
                  }
                  else
                  {
                     dx *= -1 / 0.9 - 1;
                     dy *= -1 / 0.9 - 1;
                     dz *= -1 / 0.9 - 1;
                  }
                  var gc = new GeoCoord(0, 0, 0);
                  gc.FromCartesian(sender.geocoord[0] + dx, sender.geocoord[1] + dy, sender.geocoord[2] + dz);
                  sender._longitude = gc._wgscoords[0];
                  sender._latitude = gc._wgscoords[1];
                  sender._ellipsoidHeight = gc._wgscoords[2];
               }
            }
            else if ((sender._inputs & NavigationNode2.INPUTS.MODIFIER_ALL) == NavigationNode2.INPUTS.MODIFIER_SHIFT)
            {
               sender._pitch += 5 * delta * Math.PI * sender._fSpeed / 180;
            }
            else if ((sender._inputs & NavigationNode2.INPUTS.MODIFIER_ALL) == NavigationNode2.INPUTS.MODIFIER_CONTROL)
            {
               // FIXME rotate around center
            }
         }
      }
      //------------------------------------------------------------------------
      // EVENT: OnKeyDown
      this.OnKeyDown = function(sender, key)
      {
         if (key == 16) // 'Shift'
         {
            sender._inputs |= NavigationNode2.INPUTS.MODIFIER_SHIFT;
         }
         else if (key == 17) // 'Control'
         {
            sender._inputs |= NavigationNode2.INPUTS.MODIFIER_CONTROL;
         }
         else if (key == 37 || key == 65) // 'LeftArrow' or 'A'
         {
            sender._inputs |= NavigationNode2.INPUTS.KEY_LEFT;
         }
         else if (key == 38 || key == 87) // 'UpArrow' or 'W'
         {
            sender._inputs |= NavigationNode2.INPUTS.KEY_UP;
         }
         else if (key == 39 || key == 68) // 'RightArrow' or 'D'
         {
            sender._inputs |= NavigationNode2.INPUTS.KEY_RIGHT;
         }
         else if (key == 40 || key == 83) // 'DownArrow' or 'S'
         {
            sender._inputs |= NavigationNode2.INPUTS.KEY_DOWN;
         }
         sender._OnInputChange(sender);
      }
      //------------------------------------------------------------------------
      // EVENT: OnKeyUp
      this.OnKeyUp = function(sender, key)
      {
         if (key == 16) // 'Shift'
         {
            sender._inputs &= ~NavigationNode2.INPUTS.MODIFIER_SHIFT;
         }
         else if (key == 17) // 'Control'
         {
            sender._inputs &= ~NavigationNode2.INPUTS.MODIFIER_CONTROL;
         }
         else if (key == 37 || key == 65) // 'LeftArrow' or 'A'
         {
            sender._inputs &= ~NavigationNode2.INPUTS.KEY_LEFT;
         }
         else if (key == 38 || key == 87) // 'UpArrow' or 'W'
         {
            sender._inputs &= ~NavigationNode2.INPUTS.KEY_UP;
         }
         else if (key == 39 || key == 68) // 'RightArrow' or 'D'
         {
            sender._inputs &= ~NavigationNode2.INPUTS.KEY_RIGHT;
         }
         else if (key == 40 || key == 83) // 'DownArrow' or 'S'
         {
            sender._inputs &= ~NavigationNode2.INPUTS.KEY_DOWN;
         }
         sender._OnInputChange(sender);
      }
      //------------------------------------------------------------------------
      // EVENT: OnMouseDown
      this.OnMouseDown = function(sender, button, x, y)
      {
         sender._nMouseX = x;
         sender._nMouseY = y;
         if (button == 0)
         {
            sender._inputs |= NavigationNode2.INPUTS.MOUSE_LEFT;
         }
         else if (button == 1)
         {
            sender._inputs |= NavigationNode2.INPUTS.MOUSE_MIDDLE;
         }
         else if (button == 2)
         {
            sender._inputs |= NavigationNode2.INPUTS.MOUSE_RIGHT;
         }
         sender._OnInputChange(sender);
      }
      //------------------------------------------------------------------------
      // EVENT: OnMouseUp
      this.OnMouseUp = function(sender, button, x, y)
      {
         sender._nMouseX = x;
         sender._nMouseY = y;
         if (button === 0)
         {
            sender._inputs &= ~NavigationNode2.INPUTS.MOUSE_LEFT;
         }
         else if (button == 1)
         {
            sender._inputs &= ~NavigationNode2.INPUTS.MOUSE_MIDDLE;
         }
         else if (button == 2)
         {
            sender._inputs &= ~NavigationNode2.INPUTS.MOUSE_RIGHT;
         }
         sender._OnInputChange(sender);
      }
      //------------------------------------------------------------------------
      // EVENT: OnMouseMove
      this.OnMouseMove = function(sender, x, y)
      {
         sender._nMouseX = x;
         sender._nMouseY = y;
         sender._OnInputChange(sender);
      }
      //------------------------------------------------------------------------
      // EVENT: OnTick
      this.OnTick = function(sender, dTick)
      {
         return;
         var deltaPitch = sender._fPitchSpeed*dTick/500.0;
         var deltaRoll = sender._fRollSpeed*dTick/500.0;
         var deltaYaw = sender._fYawSpeed*dTick/500;
         var deltaH = sender._fVelocityY*dTick;
         var currentAltitudeG = 0;   // altitude over ground
         var currentAltitudeE = sender._ellipsoidHeight;   // altitude over ellipsoid
         var newAltitudeG = 0;   // new altitude over ground

         var p = (sender._ellipsoidHeight / 500000.0 ) * (sender._ellipsoidHeight / 500000.0 );
         if (p>10)
         {
            p=10;
         }
         else if (p<0.001)
         {
            p=0.001;
         }

         var deltaSurface = (p*sender._fSurfacePitchSpeed*dTick)/250;
         var bChanged = false;


         if (sender._pitch_increase>0)
         {
            var dp = 0.5*sender._dPitchVelocity*dTick/1000.0;

            sender._pitch = sender._pitch + dp;
            sender._pitch_increase -= dp;
            if (sender._pitch_increase<0)
            {
               sender._pitch = sender._pitch + sender._pitch_increase;
               sender._pitch_increase = 0;
            }

            bChanged = true;
         }

         if (sender._pitch_decrease>0)
         {
            var dp = 0.5*sender._dPitchVelocity*dTick/1000.0;

            sender._pitch = sender._pitch - dp;
            sender._pitch_decrease -= dp;
            if (sender._pitch_decrease<0)
            {
               sender._pitch = sender._pitch - sender._pitch_decrease;
               sender._pitch_decrease = 0;
            }

            bChanged = true;
         }

         if (deltaPitch)
         {
            sender._pitch += deltaPitch;
            bChanged = true;
         }

         if (deltaYaw)
         {
            sender._yaw += deltaYaw;

            if (sender._yaw>2.0*Math.PI)
            {
               sender._yaw = sender._yaw-2.0*Math.PI;
            }
            if (sender._yaw<0)
            {
               sender._yaw = 2.0*Math.PI - sender._yaw;
            }
            bChanged = true;
         }

         // Change Elevation

         //if (deltaH || deltaSurface)
         //{
            currentAltitudeG = sender.engine.AltitudeAboveGround();
            if (isNaN(currentAltitudeG))
            {
               currentAltitudeG = sender.minAltitude;
            }

            newAltitudeG = currentAltitudeG;
         //}

         if (deltaH)
         {
            var diff = 1000*deltaH*p;
            sender._ellipsoidHeight += diff;
            newAltitudeG += diff;

            // limit maximum elevation
            if (sender._ellipsoidHeight>7000000)
            {
               sender._ellipsoidHeight = 7000000;
            }
         }

         if (deltaSurface)
         {
            // navigate along geodetic line
            var lat_rad = sender._latitude*0.017453292519943295769236907684886; // deg2rad
            var lng_rad = sender._longitude*0.017453292519943295769236907684886; // deg2rad
            var sinlat = Math.sin(lat_rad);
            var coslat = Math.cos(lat_rad);
            var A1 = sender._yaw;
            var B1 = lat_rad;
            var L1 = lng_rad;
            var Rn = WGS84_a / Math.sqrt(1.0-WGS84_E_SQUARED*sinlat*sinlat);
            var Rm = Rn / (1+WGS84_E_SQUARED2*coslat*coslat);
            var deltaA = (WGS84_a / Rn) * deltaSurface * Math.sin(A1) * Math.tan(B1);
            var deltaB = (WGS84_a / Rm) * deltaSurface * Math.cos(A1);
            var deltaL = (WGS84_a / Rn) * deltaSurface * Math.sin(A1) / Math.cos(B1);
            var A2, B2, L2;
            A2 = deltaA + A1;
            B2 = deltaB + B1;
            L2 = deltaL + L1;

            sender._longitude = 57.295779513082320876798154814105*L2; // rad2deg
            sender._latitude = 57.295779513082320876798154814105*B2; // rad2deg
            sender._yaw = A2;


            while (sender._longitude>180) {sender._longitude -=180;}
            while (sender._longitude<-180) { sender._longitude +=180; }
            while (sender._latitude>90) { sender._latitude-=180;}
            while (sender._latitude<-90) { sender._latitude+=180;}

            bChanged = true;
         }


         // new altitude over ground is lower than min value
         // this means we managed to get underground and have to fix it
         //if (deltaH || deltaSurface)
         //{
            if (newAltitudeG < sender.minAltitude)
            {
               var cor = sender.minAltitude - newAltitudeG;
               sender._ellipsoidHeight += cor;
            }
         //}


      }
      //------------------------------------------------------------------------
}

NavigationNode2.prototype = new ScenegraphNode();


/** @enum {number} */
NavigationNode2.INPUTS = {
   MOUSE_LEFT: 0x01,
   MOUSE_MIDDLE: 0x02,
   MOUSE_RIGHT: 0x04,
   MOUSE_ALL: 0x07,
   KEY_LEFT: 0x10,
   KEY_UP: 0x20,
   KEY_RIGHT: 0x40,
   KEY_DOWN: 0x80,
   KEY_ALL: 0xf0,
   MODIFIER_SHIFT: 0x100,
   MODIFIER_CONTROL: 0x200,
   MODIFIER_ALL: 0x300
};

/** @enum {number} */
NavigationNode2.STATES = {
   IDLE: 0,
   DRAGGING: 1,
   LOOKING: 2,
   ROTATING: 3,
   PANNING: 4,
   PITCHING: 5,
   ZOOMING: 6
};

//------------------------------------------------------------------------------

NavigationNode2.prototype.SetPosition = function(lng, lat, elv)
{
   this._longitude = lng;
   this._latitude = lat;
   this._ellipsoidHeight = elv;
}

//------------------------------------------------------------------------------

NavigationNode2.prototype.GetPosition = function()
{
   return {longitude: this._longitude, latitude: this._latitude, elevation: this._ellipsoidHeight};
}

//------------------------------------------------------------------------------

NavigationNode2.prototype.SetOrientation = function(yaw, pitch, roll)
{
   this._yaw = yaw;
   this._pitch = pitch;
   this._roll = roll;
}

//------------------------------------------------------------------------------

NavigationNode2.prototype.GetOrientation = function()
{
   return {yaw: this._yaw, pitch: this._pitch, roll: this._roll};
}

//------------------------------------------------------------------------------

NavigationNode2.prototype.SetNavigationSpeed = function(fspeed)
{
   this._fSpeed = fspeed;
}

//------------------------------------------------------------------------------

/**
 * @private
 */
NavigationNode2.GetState = function(sender) {
};

//------------------------------------------------------------------------------
