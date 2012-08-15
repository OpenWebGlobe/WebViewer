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

goog.provide('owg.ogSurface');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');

//------------------------------------------------------------------------------
/**
 * @typedef {{
 *     url     : string,
 *     longitude   : number,
 *     latitude : number,
 *     elevation : number
 * }}
 */
var SurfaceOptions;

//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {ogObject} 
 * @description Surface class (OpenWebGlobe object)
 * @author Benjamin Loesch, benjamin.loesch@fhnw.ch
 */
function ogSurface()
{
   this.name = "ogSurface";
   this.type = OG_OBJECT_SURFACE;
   this.meshReady = false;
   this.textureReady = false;
   this.longitude = 0.0;
   this.latitude = 0.0;
   this.elevation = 0.0;
   this.status = OG_OBJECT_BUSY;
   
   /** @type {Surface} */ 
   this.surface = null;

   /** @type {number}*/
   this.longitude = 0;
   /** @type {number}*/
   this.latitude = 0;
   /** @type {number}*/
   this.elevation = 0;

}
//------------------------------------------------------------------------------
ogSurface.prototype = new ogObject();

//------------------------------------------------------------------------------
/**
* @description called when json download failed
* @param {ogSurface} surface
* @ignore
*/
ogSurface.prototype.ogSurface_callbackfailed = function(surface)
{
   
   this.status = OG_OBJECT_FAILED;
   if (this.cbfFailed)
   {
      this.cbfFailed(this.id);
   }
}
//------------------------------------------------------------------------------
/**
* @description called when surface finished download/creation
* @param {ogSurface} surface
* @ignore
*/
ogSurface.prototype.ogSurface_callbackready = function(surface)
{
   if(this.longitude != 0.0 && this.latitude != 0.0)
   {
      this.SetPositionWGS84(this.longitude,this.latitude, this.elevation);
   }
   this.status = OG_OBJECT_READY;

   if (this.cbfReady)
   {
      this.cbfReady(this.id);
   }
}
//------------------------------------------------------------------------------
/**
* @description set position of the surface
* @param {number} lng
* @param {number} lat
* @param {number} elv
* @param  {number=} yaw
* @param  {number=} pitch
* @param  {number=} roll
*/
ogSurface.prototype.SetPositionWGS84 = function(lng, lat, elv, yaw, pitch, roll)
{
   this.longitude = lng;
   this.latitude = lat;
   this.elevation = elv;


   this.surface.SetAsNavigationFrame(lng,lat,elv,yaw,pitch,roll);
}
//------------------------------------------------------------------------------
/**
* @description set position of the surface
* @param {number} lng
* @param {number} lat
* @param {number} elv
* @param {Array.<{number}>} quat quaternion paramters qx,qy,qz,qw
*/
ogSurface.prototype.SetPositionWGS84Quat = function(lng, lat, elv, quat)
{
   this.longitude = lng;
   this.latitude = lat;
   this.elevation = elv;
   this.surface.SetAsNavigationFrameQuat(lng,lat,elv,quat);
}

//------------------------------------------------------------------------------
/**
 * @description set orientation of the surface
 * @param {number} yaw
 * @param {number} pitch
 * @param {number} roll
 */
ogSurface.prototype.SetOrientation = function(yaw,pitch,roll)
{
   this.surface.SetOrientation(yaw,pitch,roll);
}
//------------------------------------------------------------------------------
/**
 * @description sets the scale
 * @param {number} scalex the scale-x factor
 * @param {number} scaley the scale-y factor
 * @param {number} scalez the scale-z factor
 */
ogSurface.prototype.SetScale= function(scalex,scaley,scalez)
{
   this.surface.SetScale(scalex,scaley,scalez);
}


//------------------------------------------------------------------------------
/**
* @description parse options
* @param {SurfaceOptions} options
* @ignore
*/
ogSurface.prototype.ParseOptions = function(options)
{
   if (options == null)
   {
      goog.debug.Logger.getLogger('owg.ogTexture').warning("** ERROR: no options for surface creation!");
      return;  // no options!!
   }
   
   if (this.parent == null)
   {
      goog.debug.Logger.getLogger('owg.ogTexture').warning("** ERROR: no parent!");
      return;
   }
   
   if (this.parent.type != OG_OBJECT_MESH)
   {
      goog.debug.Logger.getLogger('owg.ogTexture').warning("** ERROR: parent is not scene!");
      return;
   }
   if(options["jsonobject"])
   {
      var mesh = this.parent;
      var geometry = mesh.parent;
      var scene = geometry.parent;
      var context = scene.parent;
      var engine = context.engine; // get engine!
     
      this.surface = new Surface(engine);
      this.surface.hide = false; //appended property.
      this.surface.ogid = this.id; //appended property.

     
      var ogSurface = this;
      var readycbf = function(e){ogSurface.ogSurface_callbackready(e);};
      var failedcbf = function(e){ogSurface.ogSurface_callbackfailed(e);};
      this.surface.CreateFromJSONObject(options["jsonobject"],readycbf,failedcbf);
      this.jsonUrl = options["url"];
    
      if(options["jsonobject"]["VisibilityDistance"])
      {
         this.surface.visibilityDistance = options["jsonobject"]["VisibilityDistance"]*CARTESIAN_SCALE_INV;
      }else
      {
         this.surface.visibilityDistance = 50000*CARTESIAN_SCALE_INV; //default value for visibility.
      }
   }   

   this.longitude = options["jsonobject"]["Center"][0];
   this.latitude = options["jsonobject"]["Center"][1];
   this.elevation = options["jsonobject"]["Center"][2];

   
}
//------------------------------------------------------------------------------
/**
* @description todo
* @ignore
*/
ogSurface.prototype.GetSurface = function()
{
   return this.surface; 
}

//------------------------------------------------------------------------------
/**
* @description Free all memory
* @ignore
*/
ogSurface.prototype._OnDestroy = function()
{
   if (this.surface)
   {
      this.surface.Destroy();
      this.surface = null;
      this.status = OG_OBJECT_FAILED;
   }
}

//------------------------------------------------------------------------------
/**
* @description Show the surface
* @ignore
*/
ogSurface.prototype.Show = function()
{
   if (this.surface)
   {
      this.surface.hide = false;
   }
}


//------------------------------------------------------------------------------
/**
* @description hide the surface
* @ignore
*/
ogSurface.prototype.Hide = function()
{
   if (this.surface)
   {
      this.surface.hide = true;
   }
}


//------------------------------------------------------------------------------
/**
* @description hide the surface
* @ignore
*/
ogSurface.prototype.SetHighlightColor = function(r,g,b,a)
{
   if (this.surface)
   {
      this.surface.SetHighlightColor(r,g,b,a);
   }
}




