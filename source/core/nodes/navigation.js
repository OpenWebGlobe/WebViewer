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

/**
 * Navigation Node. Setup view matrix using a navigation
 * @author Martin Christen martin.christen@fhnw.ch 
 * @constructor
 */
function NavigationNode()
{
      this.lastkey = 0;
      this.curtime = 0;
      this.matView = new mat4();
      
      this._vEye = new vec3();
      this._vEye.Set(1,0,0);
      
      this._yaw = 0;
      this._pitch = -1.570796326794896619231; // -pi/2;
      this._roll = 0;
      
      this._longitude = 7.7744205094639103;
      this._latitude = 47.472720418012834;
      this._ellipsoidHeight = 3000000;
      
      this._fYawSpeed = 0;
      this._fSurfacePitchSpeed = 0;
      this._fRollSpeed = 0;
      this._fPitchSpeed = 0;
      this._fVelocityY = 0;
      this._bMatRotChanged = false;
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
      this._angle = 0.001;
      this._dist = -0.4;
      this._bPositionChanged = false;
      this._dAccumulatedTick = 0;
      
      this._nMouseX = 0;
      this._nMouseY = 0;
      this._btn = false;
      this._vR = new vec3();
      this._ptDragOriginX = 0;
      this._ptDragOriginY = 0;
      this._bDragging = false;
      
      this.geocoord = new Float64Array(3);
      this.pos = new GeoCoord(0,0,0);
      
      this.matBody = new mat4();
      this.matTrans = new mat4();
      this.matNavigation = new mat4();
      this.matCami3d = new mat4();
      this.matView = new mat4();
      this.matR1 = new mat4();
      this.matR2 = new mat4();
      this.matCami3d.Cami3d();
     
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
         this.pos.Set(this._longitude, this._latitude, this._ellipsoidHeight);
         this.pos.ToCartesian(this.geocoord);
         this._vEye.Set(this.geocoord[0], this.geocoord[1], this.geocoord[2]);
         
         // this can be further optimized for JS
         this.matTrans.Translation(this.geocoord[0], this.geocoord[1], this.geocoord[2]);
         this.matNavigation.CalcNavigationFrame(this._longitude, this._latitude);
         this.matBody.CalcBodyFrame(this._yaw, this._pitch, this._roll);
         this.matR1.Multiply(this.matTrans, this.matNavigation);
         this.matR2.Multiply(this.matR1, this.matBody);
         this.matR1.Multiply(this.matR2, this.matCami3d);
         this.matView.Inverse(this.matR1);
         
         
         ts.SetCompassDirection(this._yaw);
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
      // EVENT: OnMouseWheel
      this.OnMouseWheel = function(sender, delta)
      {
         if (delta>0)
         {
            if (sender._pitch_decrease > 0)
            {
               sender._pitch_decrease = 0;
               sender._pitch_increase = 0;
            }
            else
            {
               sender._pitch_increase += 0.05;
            }
         }
         else
         {
            if (sender._pitch_increase > 0)
            {
               sender._pitch_increase = 0;
               sender._pitch_decrease = 0;
            }
            else
            {
               sender._pitch_decrease += 0.05;
            }
         }
      }
      //------------------------------------------------------------------------
      // EVENT: OnKeyDown
      this.OnKeyDown = function(sender, key)
      {
         if (key == 81) // 'Q'
         {
            sender._fVelocityY = sender._fSpeed*sender._dElevationVelocity;
         }
         else if (key == 65) // 'A'
         {
            sender._fVelocityY = -sender._fSpeed*sender._dElevationVelocity;
         }
         else if (key == 83) // 'S'
         {
            sender._fPitchSpeed = 0.5*sender._dPitchVelocity;
         }
         else if (key == 88) // 'X'
         {
            sender._fPitchSpeed = -0.5*sender._dPitchVelocity;  
         }
         
         sender.lastkey = key;
         sender._bPositionChanged = true;
      }
      //------------------------------------------------------------------------
      // EVENT: OnKeyUp
      this.OnKeyUp = function(sender, key)
      {
         if (key == 81) // 'Q'
         {
            sender._fVelocityY = 0;
         }
         else if (key == 65) // 'A'
         {
            sender._fVelocityY = 0;
         }
         else if (key == 83) // 'S'
         {
            sender._fPitchSpeed = 0;
         }
         else if (key == 88) // 'X'
         {
            sender._fPitchSpeed = 0;  
         }
         
         sender.lastkey = 0;
         sender._bPositionChanged = true;
      }
      //------------------------------------------------------------------------
      // EVENT: OnMouseDown
      this.OnMouseDown = function(sender, button, x, y)
      {
         if (button == 0)
         {
            sender._dSpeed = 0.0;
            sender._vR.Set(0,0,0);
            sender._ptDragOriginX = x;
            sender._ptDragOriginY = y;
            sender._bDragging = true;
            sender._btn = true;
         }
         
         sender._nMouseX = x;
         sender._nMouseY = y;
         sender._bPositionChanged = true;
      }
      //------------------------------------------------------------------------
      // EVENT: OnMouseUp
      this.OnMouseUp = function(sender, button, x, y)
      {
         if (button == 0)
         {
            sender._btn = false;
            sender._bDragging = false;
         }
         
         sender._nMouseX = x;
         sender._nMouseY = y;
         sender._dSpeed = 0.0;
         sender._fSurfacePitchSpeed = 0;
         sender._fYawSpeed = 0;
      }
      //------------------------------------------------------------------------
      // EVENT: OnMouseMove
      this.OnMouseMove = function(sender, x, y)
      {
         sender._nMouseX = x;
         sender._nMouseY = y;
         
         if (sender._bDragging)
         {
            var dX = (sender._ptDragOriginX-x)/sender.engine.width;
            var dY = (sender._ptDragOriginY-y)/sender.engine.height;
            dX *= dX;
            dY *= dY;
            sender._dSpeed = Math.sqrt(dX + dY);
   
            var mx = sender._ptDragOriginX;
            var my = sender.engine.height-1-sender._ptDragOriginY;
   
            var cx = x;
            var cy = sender.engine.height-1 - y;
   
            sender._vR.Set(cx - mx, cy - my, 0);
            sender._vR.Normalize();
            
            var vrx = sender._vR.Get()[0];
            var vry = sender._vR.Get()[1];
            var sgnX = 0, sgnY = 0;
            if (vrx>0){ sgnX = 1;}
            else if (vrx<0){ sgnX =-1; }
            if (vry>0) { sgnY = 1;}
            else if (vry<0){ sgnY =-1; }
               
            sender._fSurfacePitchSpeed = sender._fSpeed*sender._dFlightVelocity*dY*sgnY;
            sender._fYawSpeed = sender._dYawVelocity*dX*sgnX;
         }
         
      }
      //------------------------------------------------------------------------
      // EVENT: OnTick
      this.OnTick = function(sender, dTick)
      {
         var deltaPitch = sender._fPitchSpeed*dTick/500.0;
         var deltaRoll = sender._fRollSpeed*dTick/500.0;
         var deltaYaw = sender._fYawSpeed*dTick/500;
         var deltaH = sender._fVelocityY*dTick;
         
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
         if (deltaH)
         {
            sender._ellipsoidHeight += 1000*deltaH*p;

            //limit ellipsoid height (TEMPORARY, because we have no collision atm)
            if (sender._ellipsoidHeight<=1000)
            {
                sender._ellipsoidHeight = 10;
            }
            
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
         
      }
      //------------------------------------------------------------------------
}

NavigationNode.prototype = new Node();

//------------------------------------------------------------------------------

NavigationNode.prototype.SetPosition = function(lng, lat, elv)
{
   this._longitude = lng;
   this._latitude = lat;
   this._ellipsoidHeight = elv;
}
   
//------------------------------------------------------------------------------

NavigationNode.prototype.GetPosition = function()
{
   return {longitude: this._longitude, latitude: this._latitude, elevation: this._ellipsoidHeight};
}
   
//------------------------------------------------------------------------------

NavigationNode.prototype.SetOrientation = function(yaw, pitch, roll)
{
   this._yaw = yaw;
   this._pitch = pitch;
   this._roll = roll;
}
   
//------------------------------------------------------------------------------

NavigationNode.prototype.GetOrientation = function()
{
   return {yaw: this._yaw, pitch: this._pitch, roll: this._roll};
}

//------------------------------------------------------------------------------

NavigationNode.prototype.SetNavigationSpeed = function(fspeed)
{
   this._fSpeed = fspeed;
}

//------------------------------------------------------------------------------
