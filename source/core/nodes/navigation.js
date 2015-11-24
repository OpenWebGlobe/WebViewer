/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/


goog.provide('owg.NavigationNode');

goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.MouseWheelHandler');
goog.require('owg.ScenegraphNode');
goog.require('owg.GeoCoord');
goog.require('owg.mat4');
goog.require('owg.vec3');

/**
 * Navigation Node. Setup view matrix using a navigation
 * @author Martin Christen martin.christen@fhnw.ch 
 * @constructor
 */
function NavigationNode()
{
      /** @type {number} */
      this.lastkey = 0;
      /** @type {number} */
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
      
      /** @type {number} */
      this._yaw = 0;
      /** @type {number} */
      this._pitch = -0.03;
      /** @type {number} */
      this._roll = 0;
      /** @type {number} */
      this._longitude = 7.616000;
      /** @type {number} */
      this._latitude = 45.908800;
      /** @type {number} */
      this._ellipsoidHeight = 17000.0;
      
      /** @type {number} */
      this._fYawSpeed = 0;
      /** @type {number} */
      this._fSurfacePitchSpeed = 0;
      /** @type {number} */
      this._fRollSpeed = 0;
      /** @type {number} */
      this._fPitchSpeed = 0;
      /** @type {number} */
      this._fVelocityY = 0;
      /** @type {boolean} */
      this._bMatRotChanged = false;
      /** @type {number} */
      this._fSurfacePitch = 0;
      /** @type {number} */
      this._fLastRoll = 0;
      /** @type {number} */
      this._fSpeed = 1.0;
      /** @type {number} */
      this._dFlightVelocity = 1.0;
      /** @type {number} */
      this._dYawVelocity = 1.0;
      /** @type {number} */
      this._dPitchVelocity = 1.0;
      /** @type {number} */
      this._dRollVelocity = 1.0;
      /** @type {number} */
      this._dElevationVelocity = 1.0;
      /** @type {number} */
      this._pitch_increase = 0;
      /** @type {number} */
      this._pitch_decrease = 0;
      /** @type {number} */
      this._roll_increase = 0;
      /** @type {number} */
      this._roll_decrease = 0;
      /** @type {boolean} */
      this._bRollAnim = false;
      /** @type {number} */
      this._angle = 0.001;
      /** @type {number} */
      this._dist = -0.4;
      /** @type {boolean} */
      this._bPositionChanged = false;
      /** @type {number} */
      this._dAccumulatedTick = 0;
      
      /** @type {number} */
      this._nMouseX = 0;
      /** @type {number} */
      this._nMouseY = 0;
      /** @type {boolean} */
      this._btn = false;
      
      this._vR = new vec3();
      /** @type {number} */
      this._ptDragOriginX = 0;
      /** @type {number} */
      this._ptDragOriginY = 0;
      /** @type {boolean} */
      this._bDragging = false;
      /** @type {boolean} */
      this._bExternalLock =  false;
      
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
      
      // min altitude is currently 100 m, this can be changed soon...
      /** @type {number} */
      this.minAltitude = 100;
      
      /** @type {ogCamera} */
      this.ogcam = null;

      /** @type {number} */
      this.evtKeyDown = 0;
      /** @type {number} */
      this.evtKeyUp = 0;
      /** @type {number} */
      this.evtMouseDown = 0;
      /** @type {number} */
      this.evtMouseMove = 0;
      /** @type {number} */
      this.evtMouseUp = 0;
      /** @type {number} */
      this.evtMouseDoubleClick = 0;
      /** @type {number} */
      this.evtMouseWheel = 0;

      //------------------------------------------------------------------------
      /**
       * @param {boolean} b true if lock, false if unlock
       */
      this.LockNavigation = function(b)
      {
         this._bExternalLock = b;
      }
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
         ts.navigationtype = 0;
         
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
//         console.log(this._yaw);
         ts.SetPosition(this.geocoord[0], this.geocoord[1], this.geocoord[2]);
         ts.SetGeoposition(this._longitude, this._latitude, this._ellipsoidHeight);
         
         if(this.ogcam)
         {
            this.ogcam.lng = this._longitude;
            this.ogcam.lat = this._latitude;
            this.ogcam.elv = this._ellipsoidHeight;
            this.ogcam.pitch = this._pitch*57.295779513082320876798154814105;
            this.ogcam.yaw = this._yaw*57.295779513082320876798154814105;
            this.ogcam.roll = this._roll*57.295779513082320876798154814105;
//            console.log("this.ogcam.yaw: "+this.ogcam.yaw);
         }
         
        
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
      this.OnUnregisterEvents = function ()
      {
         goog.events.unlistenByKey(this.evtKeyDown);
         goog.events.unlistenByKey(this.evtKeyUp);
         goog.events.unlistenByKey(this.evtMouseDown);
         goog.events.unlistenByKey(this.evtMouseMove);
         goog.events.unlistenByKey(this.evtMouseUp);
         goog.events.unlistenByKey(this.evtMouseDoubleClick);
         goog.events.unlistenByKey(this.evtMouseWheel);
      }
      //------------------------------------------------------------------------
      this.OnRegisterEvents = function(context)
      {
         this.evtKeyDown = goog.events.listen(window, goog.events.EventType.KEYDOWN, this.OnKeyDown, false, this);
         this.evtKeyUp = goog.events.listen(window, goog.events.EventType.KEYUP, this.OnKeyUp, false, this);
         this.evtMouseDown = goog.events.listen(context, goog.events.EventType.MOUSEDOWN, this.OnMouseDown, false, this);
         this.evtMouseUp = goog.events.listen(context, goog.events.EventType.MOUSEUP, this.OnMouseUp, false, this);
         this.evtMouseMove = goog.events.listen(context, goog.events.EventType.MOUSEMOVE, this.OnMouseMove, false, this);
         var mouseWheelHandler = new goog.events.MouseWheelHandler(context);
         this.evtMouseWheel = goog.events.listen(mouseWheelHandler, goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.OnMouseWheel, false, this);
      }
      //------------------------------------------------------------------------
      // EVENT: OnMouseWheel
      this.OnMouseWheel = function(e)
      {
         if (e.deltaY>0)
         {
            if (this._pitch_decrease > 0)
            {
               this._pitch_decrease = 0;
               this._pitch_increase = 0;
            }
            else
            {
               this._pitch_increase += 0.05;
            }
         }
         else
         {
            if (this._pitch_increase > 0)
            {
               this._pitch_increase = 0;
               this._pitch_decrease = 0;
            }
            else
            {
               this._pitch_decrease += 0.05;
            }
         }
      }
      //------------------------------------------------------------------------
      // EVENT: OnKeyDown
      this.OnKeyDown = function(e)
      {
         if (e.keyCode == 81) // 'Q'
         {
            this._fVelocityY = this._fSpeed*this._dElevationVelocity;
         }
         else if (e.keyCode == 65) // 'A'
         {
            this._fVelocityY = -this._fSpeed*this._dElevationVelocity;
         }
         else if (e.keyCode == 83) // 'S'
         {
            this._fPitchSpeed = 0.5*this._dPitchVelocity;
         }
         else if (e.keyCode == 88) // 'X'
         {
            this._fPitchSpeed = -0.5*this._dPitchVelocity;
         }

         this.lastkey = e.keyCode;
      }
      //------------------------------------------------------------------------
      // EVENT: OnKeyUp
      this.OnKeyUp = function(e)
      {
         if (e.keyCode == 81) // 'Q'
         {
            this._fVelocityY = 0;
         }
         else if (e.keyCode == 65) // 'A'
         {
            this._fVelocityY = 0;
         }
         else if (e.keyCode == 83) // 'S'
         {
            this._fPitchSpeed = 0;
         }
         else if (e.keyCode == 88) // 'X'
         {
            this._fPitchSpeed = 0;
         }

         this.lastkey = 0;
      }
      //------------------------------------------------------------------------
      // EVENT: OnMouseDown
      this.OnMouseDown = function(e)
      {
         if (e.isButton(goog.events.BrowserEvent.MouseButton.LEFT))
         {
            this._dSpeed = 0.0;
            this._vR.Set(0,0,0);
            this._ptDragOriginX = e.offsetX;
            this._ptDragOriginY = e.offsetY;
            this._bDragging = true;
            this._btn = true;
         }

         this._nMouseX = e.offsetX;
         this._nMouseY = e.offsetY;

         if (e.isButton(goog.events.BrowserEvent.MouseButton.MIDDLE))
         {
            return false;
         }
         
      }
      //------------------------------------------------------------------------
      // EVENT: OnMouseUp
      this.OnMouseUp = function(e)
      {
         if (e.isButton(goog.events.BrowserEvent.MouseButton.LEFT))
         {
            this._btn = false;
            this._bDragging = false;
         }

         this._nMouseX = e.offsetX;
         this._nMouseY = e.offsetY;
         this._dSpeed = 0.0;
         this._fSurfacePitchSpeed = 0;
         this._fYawSpeed = 0;

         if (e.isButton(goog.events.BrowserEvent.MouseButton.MIDDLE))
         {
            return false;
         }
      }
      //------------------------------------------------------------------------
      // EVENT: OnMouseMove
      this.OnMouseMove = function(e)
      {
         this._nMouseX = e.offsetX;
         this._nMouseY = e.offsetY;

         if (this._bDragging)
         {
            var dX = (this._ptDragOriginX-e.offsetX)/this.engine.width;
            var dY = (this._ptDragOriginY-e.offsetY)/this.engine.height;
            dX *= dX;
            dY *= dY;
            this._dSpeed = Math.sqrt(dX + dY);

            var mx = this._ptDragOriginX;
            var my = this.engine.height-1-this._ptDragOriginY;

            var cx = e.offsetX;
            var cy = this.engine.height-1 - e.offsetY;

            this._vR.Set(cx - mx, cy - my, 0);
            this._vR.Normalize();

            var vrx = this._vR.Get()[0];
            var vry = this._vR.Get()[1];
            var sgnX = 0, sgnY = 0;
            if (vrx>0){ sgnX = 1;}
            else if (vrx<0){ sgnX =-1; }
            if (vry>0) { sgnY = 1;}
            else if (vry<0){ sgnY =-1; }

            this._fSurfacePitchSpeed = this._fSpeed*this._dFlightVelocity*dY*sgnY;
            this._fYawSpeed = this._dYawVelocity*dX*sgnX;
         }

      }
      //------------------------------------------------------------------------
      // EVENT: OnTick
      this.OnTick = function(dTick)
      {
         var deltaPitch = this._fPitchSpeed*dTick/500.0;
         var deltaRoll = this._fRollSpeed*dTick/500.0;
         var deltaYaw = this._fYawSpeed*dTick/500;
         var deltaH = this._fVelocityY*dTick;
         var currentAltitudeG = 0;   // altitude over ground
         var currentAltitudeE = this._ellipsoidHeight;   // altitude over ellipsoid
         var newAltitudeG = 0;   // new altitude over ground
         
         var p = (this._ellipsoidHeight / 500000.0 ) * (this._ellipsoidHeight / 500000.0 );
         if (p>10) 
         {
            p=10;
         }
         else if (p<0.001)
         {  
            p=0.001;
         }
         
         var deltaSurface = (p*this._fSurfacePitchSpeed*dTick)/250;
         
         if (this._pitch_increase>0)
         {
            var dp = 0.5*this._dPitchVelocity*dTick/1000.0;
      
            this._pitch = this._pitch + dp;
            this._pitch_increase -= dp;
            if (this._pitch_increase<0)
            {
               this._pitch = this._pitch + this._pitch_increase;
               this._pitch_increase = 0;
            }
      
            this._bPositionChanged = true;
         }
      
         if (this._pitch_decrease>0)
         {
            var dp = 0.5*this._dPitchVelocity*dTick/1000.0;
      
            this._pitch = this._pitch - dp;
            this._pitch_decrease -= dp;
            if (this._pitch_decrease<0)
            {
               this._pitch = this._pitch - this._pitch_decrease;
               this._pitch_decrease = 0;
            }
      
            this._bPositionChanged = true;
         }
         
         if (deltaPitch)
         {
            this._pitch += deltaPitch;
            this._bPositionChanged = true;
         }
         
         if (deltaYaw)
         {
            this._yaw += deltaYaw;

            if (this._yaw>2.0*Math.PI)
            {
               this._yaw = this._yaw-2.0*Math.PI;
            }
            if (this._yaw<0)
            {
               this._yaw = 2.0*Math.PI - this._yaw;
            }
            this._bPositionChanged = true;
         }
         
         // Change Elevation
         
         if (this._bPositionChanged)
         {
            currentAltitudeG = this.engine.AltitudeAboveGround();
            if (isNaN(currentAltitudeG))
            {
               currentAltitudeG = this.minAltitude;
            }
            
            newAltitudeG = currentAltitudeG;
         }
         
         if (deltaH)
         {
            var diff = 1000*deltaH*p;
            this._ellipsoidHeight += diff;
            newAltitudeG += diff;
                        
            // limit maximum elevation
            if (this._ellipsoidHeight>7000000)
            { 
               this._ellipsoidHeight = 7000000;
            }
         }
         
         if (deltaSurface)
         {
            // navigate along geodetic line
            var lat_rad = this._latitude*0.017453292519943295769236907684886; // deg2rad
            var lng_rad = this._longitude*0.017453292519943295769236907684886; // deg2rad
            var sinlat = Math.sin(lat_rad);
            var coslat = Math.cos(lat_rad);
            var A1 = this._yaw;
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
        
            this._longitude = 57.295779513082320876798154814105*L2; // rad2deg
            this._latitude = 57.295779513082320876798154814105*B2; // rad2deg
            this._yaw = A2;
            
            /*var result = {};
            MathUtils.DirectGeodeticProblem(this._longitude*0.017453292519943295769236907684886,
                                            this._latitude*0.017453292519943295769236907684886,
                                            deltaSurface*CARTESIAN_SCALE, this._yaw, result);
            
            this._longitude = 180*result["lng1"]/Math.PI;
            this._latitude = 180*result["lat1"]/Math.PI;
            //this._yaw = result["azi1"];*/            
            
            
            while (this._longitude>180) {this._longitude -=360;}
            while (this._longitude<-180) { this._longitude +=360; }
            while (this._latitude>90) { this._latitude =  180 - this._latitude;}
            while (this._latitude<-90) { this._latitude = - 180 - this._latitude;}
            
            this._bPositionChanged = true;
         }
         
         
         

         // new altitude over ground is lower than min value
         // this means we managed to get underground and have to fix it
         //if (deltaH || deltaSurface)
         //{
            if (newAltitudeG < this.minAltitude && this._bPositionChanged) 
            {
               var cor = this.minAltitude - newAltitudeG;
               this._ellipsoidHeight += cor;             
            }
         //}
         
          //update the ogCamera Object wich is currently active...
         if(this.ogcam)
         {
            this.ogcam.lng = this._longitude;
            this.ogcam.lat = this._latitude;
            this.ogcam.elv = this._ellipsoidHeight;
            this.ogcam.pitch = this._pitch*57.295779513082320876798154814105;  
            this.ogcam.yaw = this._yaw*57.295779513082320876798154814105;
            this.ogcam.roll = this._roll*57.295779513082320876798154814105;
         }
         
        
      
      }
      //------------------------------------------------------------------------
}

NavigationNode.prototype = new ScenegraphNode();

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
NavigationNode.prototype.SetOrientationFromQuaternion = function(x, y, z, w)
{
   var xx = x;
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
