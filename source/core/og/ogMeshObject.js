/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/


goog.provide('owg.ogMeshObject');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {ogObject} 
 * @description Mesh Object (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 * @author Benjamin Loesch, benjamin.loesch@fhnw.ch
 */
function ogMeshObject()
{
   /** @type {string} */
   this.name = "ogMeshObject";
   /** @type {number} */
   this.type = OG_OBJECT_MESH;
   /** @type {Array.<{ogSurface}>} */
   this.surfaces_og = [];
   /** @type {Array.<Surface>} */
   this.surfaces = [];
}

//------------------------------------------------------------------------------
ogMeshObject.prototype = new ogObject();


//------------------------------------------------------------------------------
/**
* @description parse options
* @param {GeometryOptions} options
* @ignore
*/
ogMeshObject.prototype.ParseOptions = function(options)
{
      this.options = options;
      if(this.options["jsonobject"])
      {
         var surfacearray = this.options["jsonobject"];
         for(var i=0; i<surfacearray.length; i++)
         {
            this.options["jsonobject"] = surfacearray[i];
            var ogsurf = _CreateObject(OG_OBJECT_SURFACE, this, this.options);
            this.surfaces_og.push(ogsurf);
            this.surfaces.push(ogsurf.GetSurface());
         }
      } 
}

//------------------------------------------------------------------------------
/**
 * @description Called when object is destroyed. Never call manually.
 * @ignore
 */
ogMeshObject.prototype._OnDestroy = function()
{
   for(var i=0; i<this.surfaces_og.length;i++)
   {
      var og_surf = /**@type {ogSurface} */this.surfaces_og[i];
      og_surf.UnregisterObject();
   }
   this.surfaces_og = null;
   this.surfaces = null;
}

//------------------------------------------------------------------------------
/**
 * @description gets the an array of all contained surfaces -> not ogSurfaces!
 * 
 */
ogMeshObject.prototype.GetSurfaceArray = function()
{   
      return this.surfaces;     
}


//------------------------------------------------------------------------------
/**
* @description gets the number of meshes
* @returns {number}
*/
ogMeshObject.prototype.GetSurfaceAt = function(index)
{
   return this.surfaces_og[index].id;
}

/**
 * @description hides the mesh
 * 
 */
ogMeshObject.prototype.Hide = function()
{
   for(var k=0; k<this.surfaces_og.length;k++)
   {
      /** @type {ogSurface} */
      var surf = /** @type {ogSurface} */this.surfaces_og[k];
      surf.Hide();
   }   
}

/**
 * @description changes the highlight color
 * @ignore
 * 
 */
ogMeshObject.prototype.SetHighlightColor = function(r,g,b,a)
{
   for(var k=0; k<this.surfaces_og.length;k++)
   {
      /** @type {ogSurface} */
      var surf = /** @type {ogSurface} */this.surfaces_og[k];
      surf.SetHighlightColor(r,g,b,a);
   }   
}


//------------------------------------------------------------------------------
/**
 * @description Sets the postion of the whole geometry
 * @param {number} lng
 * @param {number} lat
 * @param {number} elv
 * @param  {number=} yaw
 * @param  {number=} pitch
 * @param  {number=} roll
 */
ogMeshObject.prototype.SetPositionWGS84 = function(lng,lat,elv, yaw, pitch, roll)
{
   for(var k=0; k<this.surfaces_og.length;k++)
   {
      /** @type {ogSurface} */
      var surf = /** @type {ogSurface} */this.surfaces_og[k];
      surf.SetPositionWGS84(lng,lat,elv, yaw, pitch, roll);
   }   
}

//------------------------------------------------------------------------------
/**
 * @description Sets the postion of the whole geometry
 * @param {number} lng
 * @param {number} lat
 * @param {number} elv
 * @param {Array.<{number}>} quat quaternion paramters qx,qy,qz,qw
 */
ogMeshObject.prototype.SetPositionWGS84Quat = function(lng,lat,elv, quat)
{
   for(var k=0; k<this.surfaces_og.length;k++)
   {
      /** @type {ogSurface} */
      var surf = /** @type {ogSurface} */this.surfaces_og[k];
      surf.SetPositionWGS84Quat(lng,lat,elv,quat);
   }   
}


//------------------------------------------------------------------------------
/**
 * @description Sets the scale
 * @param {number} scalex the scale-x factor
 * @param {number} scaley the scale-y factor
 * @param {number} scalez the scale-z factor
 */
ogMeshObject.prototype.SetScale = function(scalex,scaley,scalez)
{
   for(var k=0; k<this.surfaces_og.length;k++)
   {
      /** @type {ogSurface} */
      var surf = /** @type {ogSurface} */this.surfaces_og[k];
      surf.SetScale(scalex,scaley,scalez);
   }
}

//------------------------------------------------------------------------------
/**
 * @description Sets the orientation
 * @param {number} yaw
 * @param {number} pitch
 * @param {number} roll
 */
ogMeshObject.prototype.SetOrientation = function(yaw,pitch,roll)
{
   for(var k=0; k<this.surfaces_og.length;k++)
   {
      /** @type {ogSurface} */
      var surf = /** @type {ogSurface} */this.surfaces_og[k];
      surf.SetOrientation(yaw,pitch,roll);
   }
}

//------------------------------------------------------------------------------
/**
 * @description shows the mesh
 * 
 */
ogMeshObject.prototype.Show = function()
{
   for(var k=0; k<this.surfaces_og.length;k++)
   {
      /** @type {ogSurface} */
      var surf = /** @type {ogSurface} */this.surfaces_og[k];
      surf.Show();
   } 
}

