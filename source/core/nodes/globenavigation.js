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

goog.provide('owg.GlobeNavigationNode');

goog.require('goog.events');
goog.require('goog.events.BrowserEvent.MouseButton');
goog.require('goog.events.EventType');
goog.require('goog.events.MouseWheelHandler');
goog.require('owg.GeoCoord');
goog.require('owg.mat4');
goog.require('owg.NavigationNode');
goog.require('owg.ScenegraphNode');
goog.require('owg.vec3');
goog.require('owg.Mercator');

/**
 * Navigation Node. Setup view matrix using Google Earth-style navigation
 * @author Tom Payne tom.payne@camptocamp.com
 * @author Martin Christen martin.christen@fhnw.ch
 * @constructor
 * @extends NavigationNode
 */
function GlobeNavigationNode()
{
   this.lastkey = 0;
   this.curtime = 0;
   this.matView = new mat4();
   this._bLockNavigation = false;

   this._vEye = new vec3();
   this._vEye.Set(1, 0, 0);

   this._yaw = 0;
   this._pitch = -1.570796326794896619231; // -Math.PI/2;
   this._roll = 0;

   this._longitude = 7.7744205094639103;
   this._latitude = 47.472720418012834;
   this._ellipsoidHeight = 7500000;

   this._state = GlobeNavigationNode.STATES.IDLE;
   this._inputs = 0;
   this._dragOriginMouseX = 0;
   this._dragOriginMouseY = 0;
   this._bRotationInvalid = true;
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
   this._dAccumulatedTick = 0;
   this._matGlobeRotation = new mat4();

   this._nMouseX = 0;
   this._nMouseY = 0;
   this._dx = 0;
   this._dy = 0;
   this._vR = new vec3();
   this._bDragging = false;
   this._bLClick = false;
   this._bMouseDelta = false;
   this._dSpeed = 0;
   this._lng0 = 0;
   this._lat0 = 0;

   this.geocoord = new Array(3);
   this.pos = new GeoCoord(0, 0, 0);

   this.matBody = new mat4();
   this.matTrans = new mat4();
   this.matNavigation = new mat4();
   this.matCami3d = new mat4();
   this.matView = new mat4();
   this.matR1 = new mat4();
   this.matR2 = new mat4();
   this.matCami3d.Cami3d();

   this._bQuaternionMode = false;
   this._qx = 0;
   this._qy = 0;
   this._qz = 0;
   this._qw = 1;

   this._bHit = false;
   this._bHitLng = 0;
   this._bHitLat = 0;
   this._bHitElv = 0;
   this._ab_start = {};
   this._ab_curr = {};
   this._ab_last = new mat4();
   this._ab_next = new mat4();
   this._ab_quat = new mat4();
   this._navrotation = new mat4();
   this._navtotal = new mat4();

   this.minAltitude = 50;
   this.maxAltitude = 10000000;
   // external navigation commands
   this.navigationcommand = TraversalState.NavigationCommand.IDLE;
   this.navigationparam = 0;
   this.crosshair = false;
   this.crosshairpos = [0, 0];
   this.crosshairdelay = 0; // time to show crosshair in milliseconds

   this.bElevationChanged = false;
   this.bElevationLock = false;

   //---------------------------------------------------------------------------
   this.OnChangeState = function ()
   {
      this.engine.SetViewMatrix(this.matView);
   }
   //---------------------------------------------------------------------------
   this.OnRender = function ()
   {
   }
   //---------------------------------------------------------------------------
   this.OnTraverse = function (ts)
   {
      if (this._ellipsoidHeight < 2000)
      {
         this.engine.scene.nodeCamera.near = 0.0000001;
         this.engine.scene.nodeCamera.far = 1.2;
      }
      else
      {
         this.engine.scene.nodeCamera.near = 0.00001;
         this.engine.scene.nodeCamera.far = 10;
      }

      // read possible navigation command from outside:
      this.navigationcommand = ts.navigationcommand;
      this.navigationparam = ts.navigationparam;

      ts.crosshair = this.crosshair;
      ts.crosshairpos[0] = this.crosshairpos[0];
      ts.crosshairpos[1] = this.crosshairpos[1];

      // test if navigation was locked from outside (for example GUI)
      ts.navigationtype = 1;
      if (ts.navigationlock != 0)
      {
         this._bLockNavigation = true;
      }
      else
      {
         this._bLockNavigation = false;
      }

      // update position
      if (this._state == GlobeNavigationNode.STATES.DRAGGING && !this._bLockNavigation && !this.engine.flyto.isMoving)
      {
         // Start Drag
         if (this._bLClick)
         {
            this._bLClick = false;
            this.arcellipsoid_start(this._nMouseX, this._nMouseY);
         }

         if (this._bDragging && this._bMouseDelta)
         {
            this._bMouseDelta = false;
            this.arcellipsoid_drag(this._nMouseX, this._nMouseY);
            // Drag
         }
      }

      this.pos.Set(this._longitude, this._latitude, this._ellipsoidHeight);
      this.pos.ToCartesian(this.geocoord);
      this._vEye.Set(this.geocoord[0], this.geocoord[1], this.geocoord[2]);

      this.matTrans.Translation(this.geocoord[0], this.geocoord[1], this.geocoord[2]);
      this.matNavigation.CalcNavigationFrame(this._longitude, this._latitude);
      if (this._bQuaternionMode)
      {
         this.matBody.FromQuaternionComponents(this._qx, this._qy, this._qz, this._qw);
         this.matCami3d.CamViewFrustum();
      }
      else
      {
         this.matBody.CalcBodyFrame(this._yaw, this._pitch, this._roll);

      }

      this.matR1.Multiply(this.matTrans, this.matNavigation);
      this.matR2.Multiply(this.matR1, this.matBody);
      this.matR1.Multiply(this.matR2, this.matCami3d);

      this.matView.Inverse(this.matR1);

      ts.SetCompassDirection(this._yaw);
      ts.SetPosition(this.geocoord[0], this.geocoord[1], this.geocoord[2]);
      ts.SetGeoposition(this._longitude, this._latitude, this._ellipsoidHeight);

   }
   //---------------------------------------------------------------------------
   this.OnInit = function ()
   {
      //
   }
   //---------------------------------------------------------------------------
   this.OnExit = function ()
   {
      //
   }
   //---------------------------------------------------------------------------
   this.OnRegisterEvents = function (context)
   {
      goog.events.listen(window, goog.events.EventType.KEYDOWN, this.OnKeyDown, false, this);
      goog.events.listen(window, goog.events.EventType.KEYUP, this.OnKeyUp, false, this);
      goog.events.listen(context, goog.events.EventType.MOUSEDOWN, this.OnMouseDown, false, this);
      goog.events.listen(context, goog.events.EventType.MOUSEMOVE, this.OnMouseMove, false, this);
      goog.events.listen(context, goog.events.EventType.MOUSEUP, this.OnMouseUp, false, this);
      goog.events.listen(context, goog.events.EventType.DBLCLICK, this.OnMouseDoubleClick, false, this);
      var mouseWheelHandler = new goog.events.MouseWheelHandler(context);
      goog.events.listen(mouseWheelHandler, goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.OnMouseWheel, false, this);
   }
   //---------------------------------------------------------------------------
   this._OnInputChange = function ()
   {
      // Determine the new state based on inputs
      var state = GlobeNavigationNode.STATES.IDLE;
      if ((this._inputs & GlobeNavigationNode.INPUTS.MOUSE_ALL) == GlobeNavigationNode.INPUTS.MOUSE_LEFT)
      {
         if ((this._inputs & GlobeNavigationNode.INPUTS.MODIFIER_ALL) == 0)
         {
            state = GlobeNavigationNode.STATES.DRAGGING;
         }
         else if ((this._inputs & GlobeNavigationNode.INPUTS.MODIFIER_ALL) == GlobeNavigationNode.INPUTS.MODIFIER_SHIFT)
         {
            state = GlobeNavigationNode.STATES.ROTATING;
         }
         else if ((this._inputs & GlobeNavigationNode.INPUTS.MODIFIER_ALL) == GlobeNavigationNode.INPUTS.MODIFIER_CONTROL)
         {
            state = GlobeNavigationNode.STATES.LOOKING;
         }
      }

      //------------------------------------------------------------------------
      /*if ((this._inputs & GlobeNavigationNode.INPUTS.MOUSE_ALL) == GlobeNavigationNode.INPUTS.MOUSE_MIDDLE)
       {
       state = GlobeNavigationNode.STATES.ROTATING;
       }*/
      //---------------------------------------------------------------------
      if ((this._inputs & GlobeNavigationNode.INPUTS.MOUSE_ALL) == GlobeNavigationNode.INPUTS.MOUSE_RIGHT)
      {
         state = GlobeNavigationNode.STATES.LOOKING;
      }
      //------------------------------------------------------------------------
      // If the state has changed...
      if (state != this._state)
      {
         // ...exit the old state...
         if (this._state == GlobeNavigationNode.STATES.LOOKING)
         {
            this._yaw = this._dragOriginYaw + 45 * Math.PI * this._fSpeed * (this._nMouseX - this._dragOriginMouseX) / (180 * this.engine.height);
            this._pitch = this._dragOriginPitch + 45 * Math.PI * this._fSpeed * (this._dragOriginMouseY - this._nMouseY) / (180 * this.engine.height);
         }
         /*else if (this._state == GlobeNavigationNode.STATES.ROTATING)
          {

          }*/
         // ...and enter the new
         this._state = state;
         if (this._state == GlobeNavigationNode.STATES.LOOKING)
         {
            this._dragOriginMouseX = this._nMouseX;
            this._dragOriginMouseY = this._nMouseY;
            this._dragOriginYaw = this._yaw;
            this._dragOriginPitch = this._pitch;
         }

         /*if (this._state == GlobeNavigationNode.STATES.ROTATING)
          {
          }*/
      }
      // Update according to the current state
      if (this._state == GlobeNavigationNode.STATES.LOOKING)
      {
         this._yaw = this._dragOriginYaw + 45 * Math.PI * this._fSpeed * (this._nMouseX - this._dragOriginMouseX) / (180 * this.engine.height);
         this._pitch = this._dragOriginPitch + 45 * Math.PI * this._fSpeed * (this._dragOriginMouseY - this._nMouseY) / (180 * this.engine.height);
      }
   }
   //---------------------------------------------------------------------------
   // EVENT: OnMouseWheel
   this.OnMouseWheel = function (e)
   {
      if (this._state == GlobeNavigationNode.STATES.IDLE)
      {
         if ((this._inputs & GlobeNavigationNode.INPUTS.MODIFIER_ALL) == 0)
         {
            var pickresult = {};
            var mx, my;

            // if crosshair is still displayed, zoom into there, otherwise use
            // current mouse position.
            if (this.crosshairdelay > 0)
            {
               mx = this.crosshairpos[0];
               my = this.crosshairpos[1];
            }
            else
            {
               mx = this._nMouseX;
               my = this._nMouseY;
            }

            this.engine.PickGlobe(mx, my, pickresult);
            if (pickresult["hit"])
            {
               this.crosshairpos = [mx, my];
               this.crosshairdelay = 500;
               this.pos.Set(this._longitude, this._latitude, this._ellipsoidHeight);
               this.pos.ToCartesian(this.geocoord);
               var dx = this.geocoord[0] - pickresult["x"];
               var dy = this.geocoord[1] - pickresult["y"];
               var dz = this.geocoord[2] - pickresult["z"];
               if (e.deltaY > 0)
               {
                  dx *= 0.2;
                  dy *= 0.2;
                  dz *= 0.2;
               }
               else
               {
                  dx *= -0.2;
                  dy *= -0.2;
                  dz *= -0.2;
               }
               var gc = new GeoCoord(0, 0, 0);
               gc.FromCartesian(this.geocoord[0] + dx, this.geocoord[1] + dy, this.geocoord[2] + dz);
               this._longitude = gc._wgscoords[0];
               this._latitude = gc._wgscoords[1];
               if (!this.bElevationLock)
               {
                  this._ellipsoidHeight = gc._wgscoords[2];
               }
               else
               {
                  if (gc._wgscoords[2] > this._ellipsoidHeight)
                  {
                     this._ellipsoidHeight = gc._wgscoords[2];
                  }
               }

               this.bElevationChanged = true;

               if (this._ellipsoidHeight < this.minAltitude)
               {
                  this._ellipsoidHeight = this.minAltitude;
                  this.bElevationChanged = true;
               }
               else if (this._ellipsoidHeight > this.maxAltitude)
               {
                  this._ellipsoidHeight = this.maxAltitude;
                  this.bElevationChanged = true;
               }
            }
         }
         else if ((this._inputs & GlobeNavigationNode.INPUTS.MODIFIER_ALL) == GlobeNavigationNode.INPUTS.MODIFIER_SHIFT)
         {
            this._pitch += 5 * e.deltaY * Math.PI * this._fSpeed / 180;
         }
      }

      return this._cancelEvent(e);
   }
   //---------------------------------------------------------------------------
   // EVENT: OnKeyDown
   this.OnKeyDown = function (e)
   {
      if (this._bLockNavigation || this.engine.flyto.isMoving)
      {
         return;
      }

      if (e.keyCode == 66)
      {
         this._bQuaternionMode = false;
      }

      if (e.keyCode == 16) // 'Shift'
      {
         this._inputs |= GlobeNavigationNode.INPUTS.MODIFIER_SHIFT;
         return this._cancelEvent(e);
      }
      else if (e.keyCode == 17) // 'Control'
      {
         this._inputs |= GlobeNavigationNode.INPUTS.MODIFIER_CONTROL;
         return this._cancelEvent(e);
      }
      else if (e.keyCode == 37 || e.keyCode == 65) // 'LeftArrow' or 'A'
      {
         this._inputs |= GlobeNavigationNode.INPUTS.KEY_LEFT;
         return this._cancelEvent(e);
      }
      else if (e.keyCode == 38 || e.keyCode == 87) // 'UpArrow' or 'W'
      {
         this._inputs |= GlobeNavigationNode.INPUTS.KEY_UP;
         return this._cancelEvent(e);
      }
      else if (e.keyCode == 39 || e.keyCode == 68) // 'RightArrow' or 'D'
      {
         this._inputs |= GlobeNavigationNode.INPUTS.KEY_RIGHT;
         return this._cancelEvent(e);
      }
      else if (e.keyCode == 40 || e.keyCode == 83) // 'DownArrow' or 'S'
      {
         this._inputs |= GlobeNavigationNode.INPUTS.KEY_DOWN;
         return this._cancelEvent(e);
      }
      this._OnInputChange();

      return true;
   }
   //---------------------------------------------------------------------------
   // EVENT: OnKeyUp
   this.OnKeyUp = function (e)
   {
      if (e.keyCode == 16) // 'Shift'
      {
         this._inputs &= ~GlobeNavigationNode.INPUTS.MODIFIER_SHIFT;
         return this._cancelEvent(e);
      }
      else if (e.keyCode == 17) // 'Control'
      {
         this._inputs &= ~GlobeNavigationNode.INPUTS.MODIFIER_CONTROL;
         return this._cancelEvent(e);
      }
      else if (e.keyCode == 37 || e.keyCode == 65) // 'LeftArrow' or 'A'
      {
         this._inputs &= ~GlobeNavigationNode.INPUTS.KEY_LEFT;
         return this._cancelEvent(e);
      }
      else if (e.keyCode == 38 || e.keyCode == 87) // 'UpArrow' or 'W'
      {
         this._inputs &= ~GlobeNavigationNode.INPUTS.KEY_UP;
         return this._cancelEvent(e);
      }
      else if (e.keyCode == 39 || e.keyCode == 68) // 'RightArrow' or 'D'
      {
         this._inputs &= ~GlobeNavigationNode.INPUTS.KEY_RIGHT;
         return this._cancelEvent(e);
      }
      else if (e.keyCode == 40 || e.keyCode == 83) // 'DownArrow' or 'S'
      {
         this._inputs &= ~GlobeNavigationNode.INPUTS.KEY_DOWN;
         return this._cancelEvent(e);
      }
      this._OnInputChange();

      return true;
   }
   //---------------------------------------------------------------------------
   // EVENT: Double click: fly to position
   this.OnMouseDoubleClick = function (e)
   {
      if (this._bLockNavigation || this.engine.flyto.isMoving)
      {
         return;
      }

      var pickresult = {};
      this.engine.PickGlobe(this._nMouseX, this._nMouseY, pickresult);
      if (pickresult["hit"])
      {
         this.engine.SetFlightDuration(2000);
         var targetelv = this._ellipsoidHeight;
         if (targetelv > 1000000)
         {
            targetelv = 1000000;
            this.engine.FlyTo(pickresult["lng"], pickresult["lat"], targetelv);
         }
         else if (targetelv > 250000)
         {
            targetelv = 250000;
            this.engine.FlyTo(pickresult["lng"], pickresult["lat"], targetelv);
         }
         else if (targetelv > 50000)
         {
            targetelv = 50000;
            this.engine.FlyTo(pickresult["lng"], pickresult["lat"], targetelv);
         }
         else
         {
            targetelv = pickresult["elv"] + 5000;
            this.engine.FlyTo(pickresult["lng"], pickresult["lat"], targetelv, 0, -90, 0);
         }

         this.crosshairpos = [this._nMouseX, this._nMouseY];
         this.crosshairdelay = 2500;

      }
      return this._cancelEvent(e);
   }
   //---------------------------------------------------------------------------
   // EVENT: OnMouseDown
   this.OnMouseDown = function (e)
   {
      if (this._bLockNavigation || this.engine.flyto.isMoving)
      {
         return;
      }

      this._nMouseX = e.offsetX - this.engine.context.offsetLeft;
      this._nMouseY = e.offsetY - this.engine.context.offsetTop;

      if (e.isButton(goog.events.BrowserEvent.MouseButton.LEFT))
      {
         this._inputs |= GlobeNavigationNode.INPUTS.MOUSE_LEFT;
         document.body.style.cursor = 'move';
         this._bLClick = true;
      }
      else if (e.isButton(goog.events.BrowserEvent.MouseButton.MIDDLE))
      {
         //this._inputs |= GlobeNavigationNode.INPUTS.MOUSE_MIDDLE;
         return false;
      }
      else if (e.isButton(goog.events.BrowserEvent.MouseButton.RIGHT))
      {
         this._inputs |= GlobeNavigationNode.INPUTS.MOUSE_RIGHT;
      }
      this._OnInputChange();

      return this._cancelEvent(e);
   }
   //---------------------------------------------------------------------------
   // EVENT: OnMouseUp
   this.OnMouseUp = function (e)
   {
      this._bDragging = true;
      this._nMouseX = e.offsetX - this.engine.context.offsetLeft;
      this._nMouseY = e.offsetY - this.engine.context.offsetTop;

      if (e.isButton(goog.events.BrowserEvent.MouseButton.LEFT))
      {
         this._inputs &= ~GlobeNavigationNode.INPUTS.MOUSE_LEFT;
         this._bHit = false;
         document.body.style.cursor = 'default';
         this._bLClick = false;
      }
      else if (e.isButton(goog.events.BrowserEvent.MouseButton.MIDDLE))
      {
         //this._inputs &= ~GlobeNavigationNode.INPUTS.MOUSE_MIDDLE;
         return false;
      }
      else if (e.isButton(goog.events.BrowserEvent.MouseButton.RIGHT))
      {
         this._inputs &= ~GlobeNavigationNode.INPUTS.MOUSE_RIGHT;
      }
      this._OnInputChange();

      return this._cancelEvent(e);
   }
   //---------------------------------------------------------------------------
   // EVENT: OnMouseMove
   this.OnMouseMove = function (e)
   {
      if (this._bLockNavigation || this.engine.flyto.isMoving)
      {
         return;
      }

      this._bDragging = this._state == GlobeNavigationNode.STATES.DRAGGING;

      this._bMouseDelta = true;

      this._dx = (e.offsetX - this.engine.context.offsetLeft) - this._nMouseX;
      this._dy = (e.offsetY - this.engine.context.offsetTop) - this._nMouseY;

      this._nMouseX = e.offsetX - this.engine.context.offsetLeft;
      this._nMouseY = e.offsetY - this.engine.context.offsetTop;
      this._OnInputChange();

      return this._cancelEvent(e);
   }
   //---------------------------------------------------------------------------
   // EVENT: OnTick
   this.OnTick = function (dTick)
   {
      if (this.navigationcommand == TraversalState.NavigationCommand.MOVE_DOWN)
      {
         var speed = this.navigationparam * this._ellipsoidHeight / 5000;

         if (!this.bElevationLock)
         {
            this._ellipsoidHeight -= dTick * speed;
         }
         if (this._ellipsoidHeight < this.minAltitude)
         {
            this._ellipsoidHeight = this.minAltitude;
         }
         this.bElevationChanged = true;
      }
      else if (this.navigationcommand == TraversalState.NavigationCommand.MOVE_UP)
      {
         var speed = this.navigationparam * this._ellipsoidHeight / 5000;
         this._ellipsoidHeight += dTick * speed;
         if (this._ellipsoidHeight > this.maxAltitude)
         {
            this._ellipsoidHeight = this.maxAltitude;
         }
         this.bElevationChanged = true;
      }
      else if (this.navigationcommand == TraversalState.NavigationCommand.UPDATE_YAW)
      {
         this._yaw = this.navigationparam;
      }
      else if (this.navigationcommand == TraversalState.NavigationCommand.UPDATE_YAWPITCH)
      {
         var dpitch = -Math.cos(this.navigationparam);
         var dyaw = Math.sin(this.navigationparam);

         // 25 degrees per second
         this._pitch += dTick / 5000 * dpitch;
         this._yaw += dTick / 5000 * dyaw;

         if (this._pitch < -Math.PI / 2)
         {
            this._pitch = -Math.PI / 2;
         }
         else if (this._pitch > 0)
         {
            this._pitch = 0;
         }
      }

      if (this.crosshairdelay > 0)
      {
         this.crosshair = true;
         this.crosshairdelay -= dTick;
         if (this.crosshairdelay <= 0)
         {
            this.crosshairdelay = 0;
            this.crosshair = false;
         }
      }

      /*if (this._state == GlobeNavigationNode.STATES.ROTATING)
       {

       }*/

      if (this._inputs & GlobeNavigationNode.INPUTS.KEY_ALL || this.navigationcommand == TraversalState.NavigationCommand.ROTATE_EARTH)
      {
         if ((this._inputs & GlobeNavigationNode.INPUTS.MODIFIER_ALL) == 0)
         {
            var dX = 0;
            if (this._inputs & GlobeNavigationNode.INPUTS.KEY_UP)
            {
               dX += 1;
            }
            if (this._inputs & GlobeNavigationNode.INPUTS.KEY_DOWN)
            {
               dX -= 1;
            }
            var dY = 0;
            if (this._inputs & GlobeNavigationNode.INPUTS.KEY_LEFT)
            {
               dY -= 1;
            }
            if (this._inputs & GlobeNavigationNode.INPUTS.KEY_RIGHT)
            {
               dY += 1;
            }

            var deltaYaw;
            if (this.navigationcommand == TraversalState.NavigationCommand.ROTATE_EARTH)
            {
               deltaYaw = Math.PI * this.navigationparam / 180;
            }
            else
            {
               deltaYaw = Math.atan2(dY, dX);
            }

            var p = this._ellipsoidHeight / 500000.0;
            if (p > 10)
            {
               p = 10;
            }
            else if (p < 0.001)
            {
               p = 0.001;
            }
            var deltaSurface = p * dTick / 50000;
            // navigate along geodetic line
            var lat_rad = Math.PI * this._latitude / 180; // deg2rad
            var lng_rad = Math.PI * this._longitude / 180; // deg2rad
            var sinlat = Math.sin(lat_rad);
            var coslat = Math.cos(lat_rad);
            var A1 = this._yaw + deltaYaw;
            var B1 = lat_rad;
            var L1 = lng_rad;
            var Rn = WGS84_a / Math.sqrt(1.0 - WGS84_E_SQUARED * sinlat * sinlat);
            var Rm = Rn / (1 + WGS84_E_SQUARED2 * coslat * coslat);
            var deltaB = (WGS84_a / Rm) * deltaSurface * Math.cos(A1);
            var deltaL = (WGS84_a / Rn) * deltaSurface * Math.sin(A1) / Math.cos(B1);
            var A2, B2, L2;
            B2 = deltaB + B1;
            L2 = deltaL + L1;

            this._longitude = 180 * L2 / Math.PI;
            this._latitude = 180 * B2 / Math.PI;
         }
      }

      while (this._longitude > 180)
      {
         this._longitude -= 180;
      }
      while (this._longitude < -180)
      {
         this._longitude += 180;
      }
      while (this._latitude > 90)
      {
         this._latitude -= 180;
      }
      while (this._latitude < -90)
      {
         this._latitude += 180;
      }

      if (this.bElevationChanged)
      {

         this.bElevationChanged = false;
         var elevationQuery = this.engine.GetElevationAt(this._longitude, this._latitude);
         if (elevationQuery["hasvalue"])
         {
            if ((this._ellipsoidHeight - this.minAltitude) < elevationQuery["elevation"])
            {
               this._ellipsoidHeight = elevationQuery["elevation"] + this.minAltitude;
               this.bElevationChanged = true;
            }
            this.bElevationLock = false;
         }
         else
         {
            if (this._ellipsoidHeight < 5000)
            {
               this.bElevationLock = true;
               this.bElevationChanged = true;
            }
         }
      }
   }
   //---------------------------------------------------------------------------
   this.SetOrientation = function (yaw, pitch, roll)
   {
      //this._bLockNavigation = false;
      this._bQuaternionMode = false;
      this.matCami3d.Cami3d();
      this._yaw = yaw;
      this._pitch = pitch;
      this._roll = roll;
   }
   //---------------------------------------------------------------------------
   this.SetOrientationFromQuaternion = function (qx, qy, qz, qw)
   {
      this._bQuaternionMode = true;
      this._qx = qx;
      this._qy = qy;
      this._qz = qz;
      this._qw = qw;

      var a = qx;
      qx = qy;
      qy = a;

      var test_singularity = qx * qy + qz * qw;
      if (test_singularity > 0.499) // singularity at north pole
      {
         this._yaw = 2 * Math.atan2(qx, qw);
         this._pitch = Math.PI / 2;
         this._roll = 0;
         return;
      }
      if (test_singularity < -0.499) // singularity at south pole
      {
         this._yaw = -2 * Math.atan2(qx, qw);
         this._pitch = -Math.PI / 2;
         this._roll = 0;
         return;
      }
      var qx2 = qx * qx;
      var qy2 = qy * qy;
      var qz2 = qz * qz;
      this._yaw = Math.atan2(2 * qy * qw - 2 * qx * qz, 1 - 2 * qy2 - 2 * qz2);
      this._pitch = Math.asin(2 * test_singularity);
      this._roll = Math.atan2(2 * qx * qw - 2 * qy * qz, 1 - 2 * qx2 - 2 * qz2)
   }
   //---------------------------------------------------------------------------
   this._quatmul = function (dest, left, right)
   {
      dest._values[0] = left._values[0] * right._values[0] + left._values[1] * right._values[4] + left._values[2] * right._values[8];
      dest._values[1] = left._values[0] * right._values[1] + left._values[1] * right._values[5] + left._values[2] * right._values[9];
      dest._values[2] = left._values[0] * right._values[2] + left._values[1] * right._values[6] + left._values[2] * right._values[10];
      dest._values[4] = left._values[4] * right._values[0] + left._values[5] * right._values[4] + left._values[6] * right._values[8];
      dest._values[5] = left._values[4] * right._values[1] + left._values[5] * right._values[5] + left._values[6] * right._values[9];
      dest._values[6] = left._values[4] * right._values[2] + left._values[5] * right._values[6] + left._values[6] * right._values[10];
      dest._values[8] = left._values[8] * right._values[0] + left._values[9] * right._values[4] + left._values[10] * right._values[8];
      dest._values[9] = left._values[8] * right._values[1] + left._values[9] * right._values[5] + left._values[10] * right._values[9];
      dest._values[10] = left._values[8] * right._values[2] + left._values[9] * right._values[6] + left._values[10] * right._values[10];
   }
   //---------------------------------------------------------------------------
   this.arcellipsoid_start = function (mx, my)
   {
      // store current rotation
      this._ab_last.CopyFrom(this._ab_quat);

      var pickresult = {};

      this.engine.PickEllipsoid(mx, my, pickresult, true); // PickEllipsoid
      if (pickresult["hit"])
      {
         this._ab_start.x = pickresult["x"];
         this._ab_start.y = pickresult["y"];
         this._ab_start.z = pickresult["z"];
         this._bHit = true;
      }
      else
      {
         this._bHit = false; // clicked outside ellipsoid!
      }
   }

   //---------------------------------------------------------------------------
   this.arcellipsoid_drag = function (mx, my)
   {
      if (this._bHit)
      {
         var pickresult = {};

         this.engine.PickEllipsoid(mx, my, pickresult, false);
         if (pickresult["hit"])
         {
            //console.log("PickEllipsoid: " + pickresult["lng"] +  ", " + pickresult["lat"] + ", " + pickresult["elv"]);

            this._ab_curr.x = pickresult["x"];
            this._ab_curr.y = pickresult["y"];
            this._ab_curr.z = pickresult["z"];
            this._bHit = true;

            // avoid division 0
            if (this._ab_curr.x == this._ab_start.x &&
               this._ab_curr.y == this._ab_start.y &&
               this._ab_curr.z == this._ab_start.z)
            {
               this._ab_quat.CopyFrom(this._ab_last);
               return;
            }

            var cos2a = this._ab_start.x * this._ab_curr.x +
                        this._ab_start.y * this._ab_curr.y +
                        this._ab_start.z * this._ab_curr.z;
            var sina = Math.sqrt((1.0 - cos2a) * 0.5);
            var cosa = Math.sqrt((1.0 + cos2a) * 0.5);

            var cross = {};
            cross.x = (this._ab_start.y * this._ab_curr.z - this._ab_start.z * this._ab_curr.y);
            cross.y = (this._ab_curr.x * this._ab_start.z - this._ab_start.x * this._ab_curr.z);
            cross.z = (this._ab_start.x * this._ab_curr.y - this._ab_start.y * this._ab_curr.x);

            var replen = sina / Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z);

            cross.x = cross.x * replen;
            cross.y = cross.y * replen;
            cross.z = cross.z * replen;
            this._ab_next.FromQuaternionComponents(cross.x, cross.y, cross.z, cosa);
            this._ab_quat.Multiply(this._ab_last, this._ab_next);

            // Update position
            var curgeopos = new GeoCoord(this._longitude, this._latitude, this._ellipsoidHeight);
            var result = [];
            curgeopos.ToCartesian(result);

            var v3 = new vec3(result[0], result[1], result[2]);

            var newpos = this._ab_quat.MultiplyVec3(v3);

            var geopos = new GeoCoord(0, 0, 0);
            geopos.FromCartesian(newpos._values[0], newpos._values[1], newpos._values[2]);

            this._longitude = geopos.GetLongitude();
            this._latitude = geopos.GetLatitude();
            this.bElevationChanged = true;
         }
         else
         {
            this._bHit = false; // clicked outside ellipsoid!
         }
      }
   }
   //---------------------------------------------------------------------
   // Cancel Event
   this._cancelEvent = function (evt)
   {
      evt = evt ? evt : window.event;
      if (evt.stopPropagation)
         evt.stopPropagation();
      if (evt.preventDefault)
         evt.preventDefault();
      evt.cancelBubble = true;
      evt.cancel = true;
      evt.returnValue = false;
      return false;
   }
}
goog.inherits(GlobeNavigationNode, NavigationNode);


/** @enum {number} */
GlobeNavigationNode.INPUTS = {
   MOUSE_LEFT:0x01,
   MOUSE_MIDDLE:0x02,
   MOUSE_RIGHT:0x04,
   MOUSE_ALL:0x07,
   KEY_LEFT:0x10,
   KEY_UP:0x20,
   KEY_RIGHT:0x40,
   KEY_DOWN:0x80,
   KEY_ALL:0xf0,
   MODIFIER_SHIFT:0x100,
   MODIFIER_CONTROL:0x200,
   MODIFIER_ALL:0x300
};

/** @enum {number} */
GlobeNavigationNode.STATES = {
   IDLE:0,
   DRAGGING:1,
   LOOKING:2,
   ROTATING:3,
   PANNING:4,
   PITCHING:5,
   ZOOMING:6
};
