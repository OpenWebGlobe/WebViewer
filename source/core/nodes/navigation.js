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
#                           martin.christen@fhnw.ch                            #
********************************************************************************
*                Read the file LICENSE for licensing information               *
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
      this._pitch = 0;
      this._roll = -1.570796326794896619231; // -pi/2
      
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
      
      this.geocoord = new Float64Array(3);
      this.pos = new GeoCoord(0,0,0);
      
      matResult = new mat4();
      matBody = new mat4();
      matTrans = new mat4();
      matNavigation = new mat4();
      matCami3d = new mat4();
      matView = new mat4();
      
      matCami3d.Cami3d();
     
      //------------------------------------------------------------------------
      this.OnChangeState = function()
      {
         this.engine.SetViewMatrix(this.matView);  
      }
      //------------------------------------------------------------------------
      this.OnRender = function()
      {
         this.engine.DrawText("Key: " + this.lastkey + " (" + this.curtime + ")",0,32);
         this.engine.DrawText("Pos: (" + this._longitude + ", " + this._latitude + "," + this._ellipsoidHeight + ")",0,134);
         this.engine.DrawText("Cart: (" + this.geocoord[0] + ", " + this.geocoord[1] + "," + this.geocoord[2] + ")",0,100);
      }
      //------------------------------------------------------------------------
      this.OnTraverse = function(ts)
      {
         this.matView.LookAt(0,0,2, 0,0,0, 0,1,0);
         
         this.pos.Set(this._longitude, this._latitude, this._ellipsoidHeight);
         this.pos.ToCartesian(this.geocoord);
         this._vEye.Set(this.geocoord[0], this.geocoord[1], this.geocoord[2]);

         matTrans.Translation(this.geocoord[0], this.geocoord[1], this.geocoord[2]);
         matNavigation.CalcNavigationFrame(this._longitude, this._latitude);
         matBody.CalcBodyFrame(this._yaw, this._pitch, this._roll);
         
         //matTrans.SetTranslation(_vEye);
      }
      //------------------------------------------------------------------------
      this.OnInit = function()
      {
          //
      }
      //------------------------------------------------------------------------
      this.OnExit = function()
      {
      
      }
      //------------------------------------------------------------------------
      this.OnRegisterEvents = function()
      {
          this.engine.eventhandler.AddKeyDownCallback(this, this.OnKeyDown);
          this.engine.eventhandler.AddTimerCallback(this, this.OnTick);
      }
      //------------------------------------------------------------------------
      
      // EVENT: OnKeyDown
      this.OnKeyDown = function(sender, key)
      {
         sender.lastkey = key;
      }
      
      //------------------------------------------------------------------------
      // EVENT: OnTick
      this.OnTick = function(sender, dt)
      {
         sender.curtime += dt; 
      }
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
