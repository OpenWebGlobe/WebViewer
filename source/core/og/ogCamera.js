/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/



goog.provide('owg.ogCamera');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');
goog.require('owg.MathUtils');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {ogObject} 
 * @description Camera class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogCamera()
{
   /** @type {string} */
   this.name = "ogCamera";
   /** @type {number} */
   this.type = OG_OBJECT_CAMERA;
   
   /** @type {number} */
   this.lng = 0;
   /** @type {number} */
   this.lat = 0;
   /** @type {number} */
   this.elv = 0;
   /** @type {number} */
   this.yaw = 0;
   /** @type {number} */
   this.pitch = 0;
   /** @type {number} */
   this.roll = 0;
   
}

//------------------------------------------------------------------------------
ogCamera.prototype = new ogObject();


//------------------------------------------------------------------------------
/**
 * @description destroys the camera object and frees all memory.
 * 
 */
ogCamera.prototype._OnDestroy = function()
{

   this.lng = 0;
   this.lat = 0;
   this.elv = 0;
   this.yaw = 0;
   this.pitch = 0;
   this.roll = 0;
}


//------------------------------------------------------------------------------
/**
 * @description sets the camera at the specific position
 * @param lng
 * @param lat
 * @param elv
 */
ogCamera.prototype.SetPosition = function(lng,lat,elv)
{
   this.lng = lng;
   this.lat = lat;
   this.elv = elv;
   
   if(this.parent.activecamera == this)
   {
      var navnode = this._GetNavigationNode();
      navnode.SetPosition(lng,lat,elv);
   }


}

//------------------------------------------------------------------------------
/**
 * @description gets the camera position
 */
ogCamera.prototype.GetPosition = function()
{
   var pos = {};
   pos["longitude"] = this.lng;
   pos["latitude"] = this.lat;
   pos["elevation"] = this.elv;
   return pos;
   //return {"longitude":this.lng,"latitude":this.lat,"elevation":this.elv};
}

//------------------------------------------------------------------------------
/**
 * @description gets the camera orientation
 */
ogCamera.prototype.SetOrientation = function(yaw,pitch,roll)
{
   this.yaw = yaw;
   this.pitch = pitch;
   this.roll = roll;
   
   if(this == this.parent.activecamera)
   {
      var navnode = this._GetNavigationNode();
      navnode.SetOrientation(MathUtils.Deg2Rad(yaw),MathUtils.Deg2Rad(pitch),MathUtils.Deg2Rad(roll));
   }

}

//------------------------------------------------------------------------------
/**
 * @description gets the camera orientation
 */
ogCamera.prototype.GetOrientation = function()
{
   var ori = {};
   ori["yaw"] = this.yaw;
   ori["pitch"] = this.pitch;
   ori["roll"] = this.roll;
   return ori;
   //return {"yaw":this.yaw,"pitch":this.pitch,"roll":this.roll};
}
//------------------------------------------------------------------------------
/**
 * @description sets the camera orientation using a quaternion
 */
ogCamera.prototype.SetOrientationFromQuaternion = function(x,y,z,w)
{
    if(this == this.parent.activecamera)
   {
      var navnode = this._GetNavigationNode();
      navnode.SetOrientationFromQuaternion(x,y,z,w);
   }
}
//------------------------------------------------------------------------------
ogCamera.prototype._GetNavigationNode = function()
{
   /** @type {NavigationNode} */
   var navigationNode = null;
   /** @type {ogScene} */
   var scene = /** @type ogScene */this.parent;
   /** @type {ogContext} */
   var context =  /** @type ogContext */scene.parent;
   // Get the engine
   /** @type {engine3d} */
   var engine = context.engine;
   
   // test if there is a scenegraph attached
   if (engine.scene)
   {
      if (engine.scene.nodeNavigation)
      {
         navigationNode = engine.scene.nodeNavigation;
      }
   }
   return navigationNode;
}
//------------------------------------------------------------------------------

ogCamera.prototype.GetFieldOfView = function()
{
   /** @type {ogScene} */
   var scene = /** @type ogScene */this.parent;
   /** @type {ogContext} */
   var context =  /** @type ogContext */scene.parent;
   // Get the engine
   /** @type {engine3d} */
   var engine = context.engine;

   return engine.scene.nodeCamera.GetFovY();
}

//------------------------------------------------------------------------------

ogCamera.prototype.UpdateNavigationNode = function()
{
   var navnode = this._GetNavigationNode();
   navnode.SetPosition(this.lng,this.lat,this.elv);
   navnode.SetOrientation(MathUtils.Deg2Rad(this.yaw),MathUtils.Deg2Rad(this.pitch),MathUtils.Deg2Rad(this.roll));
   navnode.ogcam = this;
   
}


ogCamera.prototype.SetCurrentPositionAsCameraPosition = function()
{
   var navnode = this._GetNavigationNode();
   var pos = navnode.GetPosition();
   var ori = navnode.GetOrientation();
   
   this.lng = pos.longitude;
   this.lat = pos.latitude;
   this.elv = pos.elevation;
   this.yaw = MathUtils.Rad2Deg(ori.yaw);
   this.pitch = MathUtils.Rad2Deg(ori.pitch);
   this.roll = MathUtils.Rad2Deg(ori.roll);
}



