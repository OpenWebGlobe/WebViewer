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

goog.provide('owg.FlyToAnimation');

//------------------------------------------------------------------------------
/** 
 * @constructor
 * @description Handles the fly-to animation
 * 
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch
 * @param {engine3d} engine
 */
function FlyToAnimation(engine)
{
   /** @type {engine3d} */
   this.engine = engine;
   /** @type {WebGLRenderingContext} */
   this.gl = engine.gl;
   /** @type {NavigationNode} */
   this.navnode = null;
   /** @type {boolean} is true as long as camera is moving*/ 
   this.isMoving = false;
   /** @type {boolean} true as soon as the bezier-curve formula is calculated */
   this.isReady = false;
   /** @type {Array} bezier point P0 */
   this.P0=[];
   /** @type {Array} bezier point P1 */
   this.P1=[];
   /** @type {Array} bezier point P2 */
   this.P2=[];
   /** @type {Array} bezier point P3 */
   this.P3=[];
   /** @type {number} time for the whole fly to animation in [ms].*/
   this.travelTime = 2000;
   /** @type{GeoCoord} */
   this.geocoor = new GeoCoord();
   /** @type {?function(engine3d)} */
   this.cbfFlyToStarted = null;
   /** @type {?function(engine3d)} */
   this.cbfInPosition = null;
}

//------------------------------------------------------------------------------
/** 
 * @description calculates a cubic-bezier curve out of the target and current position.
 * @param {number} target_lng
 * @param {number} target_lat
 * @param {number} target_elv
 */
FlyToAnimation.prototype.CalcTrajectory = function(target_lng,target_lat,target_elv)
{
   
   var start_pos = this.navnode.GetPosition();
   // Start position
   var P0_wgs84 = [start_pos.longitude,start_pos.latitude,start_pos.elevation];
   // target position
   var P3_wgs84 = [target_lng,target_lat,target_elv];
   
   
   // determine the distance between current and target position (great circle distance).
   // this distance is used for P1 and P2 of the bezier curve.
   this.distance = WGS84_a * Math.acos(Math.sin(MathUtils.Deg2Rad(P0_wgs84[1]))*Math.sin(MathUtils.Deg2Rad(P3_wgs84[1]))+Math.cos(MathUtils.Deg2Rad(P0_wgs84[1]))*Math.cos(MathUtils.Deg2Rad(P3_wgs84[1]))*Math.cos(MathUtils.Deg2Rad(P3_wgs84[0]-P0_wgs84[0])));

   // define P1 and P2 - as longer the distance as higher the camera flies.
   var P1_wgs84 = [start_pos.longitude,start_pos.latitude,start_pos.elevation + this.distance/4]; 
   var P2_wgs84 = [target_lng,target_lat,target_elv + this.distance/4];

/* 18.08.2011 - Simplyfied. Beni
  
   //transformation of all bezier points into cartesian coordinates
   this.geocoor.Set(P0_wgs84[0],P0_wgs84[1],P0_wgs84[2]);
   this.geocoor.ToCartesian(this.P0);

    
   this.geocoor.Set(P1_wgs84[0],P1_wgs84[1],P1_wgs84[2]);
   this.geocoor.ToCartesian(this.P1);
   
   this.geocoor.Set(P2_wgs84[0],P2_wgs84[1],P2_wgs84[2]);
   this.geocoor.ToCartesian(this.P2);
    
   this.geocoor.Set(P3_wgs84[0],P3_wgs84[1],P3_wgs84[2]);
   this.geocoor.ToCartesian(this.P3);
*/
   this.P0=P0_wgs84;
   this.P1=P1_wgs84;
   this.P2=P2_wgs84;
   this.P3=P3_wgs84;
   
   // bezier points are defined.
   this.isReady = true;
}


//------------------------------------------------------------------------------
/** 
 * @description Subscribes the engines OnTimer event and starts the animation
 * @param {number} target_lng
 * @param {number} target_lat
 * @param {number} target_elv
 * @param {number=} target_yaw
 * @param {number=} target_pitch
 * @param {number=} target_roll
 */
FlyToAnimation.prototype.StartFlyTo = function(target_lng,target_lat,target_elv,target_yaw,target_pitch,target_roll)
{
   this.navnode = this.engine.scene.nodeNavigation;
   var ori = this.navnode.GetOrientation();
   this.start_yaw = ori.yaw;
   this.start_pitch = ori.pitch;
   this.start_roll = ori.roll;
   
   
   if((target_yaw!=null) && (target_pitch!=null) && (target_roll!=null))
   {
      this.target_yaw = MathUtils.Deg2Rad(target_yaw);
      this.target_pitch = MathUtils.Deg2Rad(target_pitch);
      this.target_roll = MathUtils.Deg2Rad(target_roll); 
   }
   else //take the current orientation
   {
      this.target_yaw = this.start_yaw;
      this.target_pitch = this.start_pitch;
      this.target_roll = this.start_roll; 
   }
   
   this.delta_yaw = this.target_yaw - this.start_yaw;
   if(Math.abs(this.delta_yaw)>Math.PI)
   {
      if(this.delta_yaw>0)
      {
         this.delta_yaw=this.delta_yaw-(2*Math.PI);
      }
      else
      {
         this.delta_yaw=this.delta_yaw+(2*Math.PI);
      }
      
   }
   
   
   this.delta_pitch = this.target_pitch - this.start_pitch;
   if(Math.abs(this.delta_pitch)>Math.PI)
   {
      if(this.delta_pitch>0)
      {
         this.delta_pitch=this.delta_pitch-(2*Math.PI);
      }
      else
      {
         this.delta_pitch=this.delta_pitch+(2*Math.PI);
      }
      
   }
   
   this.delta_roll = this.target_roll - this.start_roll; 
   if(Math.abs(this.delta_roll)>Math.PI)
   {
      if(this.delta_roll>0)
      {
         this.delta_roll=this.delta_roll-(2*Math.PI);
      }
      else
      {
         this.delta_roll=this.delta_roll+(2*Math.PI);
      }
      
   }

   this.CalcTrajectory(target_lng,target_lat,target_elv);
   
   if(this.cbfFlyToStarted)
   {
      this.cbfFlyToStarted(this.engine);
   }
   
   //subscribe onTimer event.
   var flyto=this;
   var flyToMoveCbf = function(event){flyto.Move(event);}; //event handling voodoo...
   this.engine.SetTimerCallback(flyToMoveCbf);
   
   this.t = 0;
   this.movingTime = 0;
   this.isMoving = true;
}



//------------------------------------------------------------------------------
/**
 * @description this method will be called on every onTimer event.
 * @param {number} delta_t
 */
FlyToAnimation.prototype.Move = function(delta_t) //on tick callback function
{
   if(this.isReady) // trajectory calculated.
   {
      this.movingTime += delta_t; 
      var xs = this.movingTime / this.travelTime;
      
      this.t = 0.5*Math.sin(Math.PI*xs-Math.PI/2)+0.5;
      if(xs > 1)
      {
         this.t=1; //to get sure camera moves to target
        
         this.StopFlyTo();
      }

      
      var x = Math.pow((1-this.t),3)*this.P0[0] + 3*this.t*Math.pow((1-this.t),2)*this.P1[0] + 3*this.t*this.t*(1-this.t)*this.P2[0] + Math.pow(this.t,3)*this.P3[0];
      var y = Math.pow((1-this.t),3)*this.P0[1] + 3*this.t*Math.pow((1-this.t),2)*this.P1[1] + 3*this.t*this.t*(1-this.t)*this.P2[1] + Math.pow(this.t,3)*this.P3[1];
      var z = Math.pow((1-this.t),3)*this.P0[2] + 3*this.t*Math.pow((1-this.t),2)*this.P1[2] + 3*this.t*this.t*(1-this.t)*this.P2[2] + Math.pow(this.t,3)*this.P3[2];
         
      this.geocoor.FromCartesian(x,y,z);
     // this.navnode.SetPosition(this.geocoor.GetLongitude(),this.geocoor.GetLatitude(),this.geocoor.GetElevation());/* 18.08.2011 - Simplyfied. Beni
      this.navnode.SetPosition(x,y,z);

      this.navnode.SetOrientation(this.start_yaw+this.t*this.delta_yaw,this.start_pitch+this.t*this.delta_pitch,this.start_roll+this.t*this.delta_roll);

   
      if(this.t == 1)
      { 
         this.StopFlyTo();
      }
   }
   //console.log(this.t);
}


//------------------------------------------------------------------------------
/** 
 * @description stops the fly-to animation and clears the OnTick event callback.
 */
FlyToAnimation.prototype.StopFlyTo = function()
{
   this.engine.SetTimerCallback(null);
   this.isMoving = false;
   
   if(this.cbfInPosition)
   {
      this.cbfInPosition(this.engine);
   }
}


//------------------------------------------------------------------------------
/**
 * @description camera will be moved to a LookAt Position camera orientation remains the same.
 * @param {number} target_lng
 * @param {number} target_lat
 * @param {number} target_elv
 * @param {number} distance
 * @param {number=} opt_yaw
 * @param {number=} opt_pitch
 * @param {number=} opt_roll
 */
FlyToAnimation.prototype.FlyToLookAtPosition = function(target_lng,target_lat,target_elv,distance,opt_yaw,opt_pitch,opt_roll)
{
   
   this.navnode = this.engine.scene.nodeNavigation;
   distance = distance * CARTESIAN_SCALE_INV;  

   // Get the target position and convert it to cartesian coordinates
   var geocord = new GeoCoord(target_lng,target_lat,target_elv); //target cartesian
   var tc = [];
   geocord.ToCartesian(tc);
   
   //set up a navigation frame system with origin at target position
   var navframe = new mat4();
   navframe.CalcNavigationFrame(target_lng,target_lat);
   
   var trans = new mat4();
   trans.Translation(tc[0],tc[1],tc[2]);
   
   var navigationMatrix = new mat4();
   navigationMatrix.Multiply(trans,navframe);

 
   // calc the target camera position in navigation frame coordinates
   var ori = {};
   if((opt_yaw!=null) && (opt_pitch!=null) && (opt_roll!=null))
   {
      ori.yaw = MathUtils.Deg2Rad(opt_yaw);
      ori.pitch = MathUtils.Deg2Rad(opt_pitch);
      ori.roll = MathUtils.Deg2Rad(opt_roll);
   }
   else
   {
      ori = this.navnode.GetOrientation();
   }
   var pitch = ori.pitch-Math.PI/2;
   var x = distance * Math.sin(pitch) * Math.cos(ori.yaw);
   var y = distance * Math.sin(pitch) * Math.sin(ori.yaw);
   var z = distance * Math.cos(pitch);
   
   // transform the navigation frame coordinates into wgs84
   var vec = new vec3(x,y,z);
   var camPositionInECEF = navigationMatrix.MultiplyVec3(vec);
   var v = camPositionInECEF.Get();
   geocord.FromCartesian(v[0],v[1],v[2]);
   
   var lat = geocord.GetLatitude();
   var lng = geocord.GetLongitude();
   var elv = geocord.GetElevation();
   
   // to prevent that the camera goes underground, but there is still a problem
   // in mountains. 
   if(elv > target_elv) 
   {
      // start the animation.
      this.StartFlyTo(lng,lat,elv,opt_yaw,opt_pitch,opt_roll);
   }
   else
   {
      // start the animation.
      this.StartFlyTo(lng,lat,-elv,ori.yaw,-MathUtils.Rad2Deg(ori.pitch),ori.roll);
   }  
}

//------------------------------------------------------------------------------
/** 
 * @description set the duration of the flyto animation.
 * @param {number} timespan duration in [ms]
 */
FlyToAnimation.prototype.SetFlightDuration = function(timespan)
{
   this.travelTime = timespan;
}


//------------------------------------------------------------------------------
/** 
 * @description set the callback function which will be called when target pos is reached.
 */
FlyToAnimation.prototype.SetInPositionCallback = function(f)
{
   this.cbfInPosition = f;
}

//------------------------------------------------------------------------------
/** 
 * @description set the callback function which will be called when the animation starts
 */
FlyToAnimation.prototype.SetFlyToStartedCallback = function(f)
{
   this.cbfFlyToStarted = f;
}








