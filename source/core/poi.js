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

goog.provide('owg.Poi');

goog.require('goog.debug.Logger');
goog.require('owg.CanvasTexture');
goog.require('owg.Font');
goog.require('owg.GeoCoord');
goog.require('owg.Mesh');
goog.require('owg.Texture');

/** 
* @class poi
* @constructor
* 
* @description A "Point Of Interest" Class.
* 
* @author Benjamin Loesch benjamin.loesch@fhnw.ch
* 
* @param {engine3d} engine
*/
function Poi(engine)
{
  /** @type {engine3d} */
  this.engine = engine;
  /** @type {WebGLRenderingContext} */
  this.gl = engine.gl;
  /** @type {number} */
  this.lat = 0.0;
  /** @type {number} */
  this.lng = 0.0;
  /** @type {number} */
  this.elv = 0.0;
  /** @type {number} */
  this.signElv = 0.0;
  /** @type {boolean} */
  this.pole = false;
  /** @type {Mesh} */
  this.poleMesh = null;
  /** @type {Mesh} */
  this.iconMesh = null;
  /** @type {Mesh} */
  this.textMesh = null;
  /** @type {number} */
  this.scale = 20;
  /** @type {string} */
  this.imgurl = "";
  /** @type {string} */
  this.text = "";
  /** @type {CanvasTexture} */
  this.canvasTexture = new CanvasTexture(engine);
  /** @type {number} */
  this.poiWidth = 0;
  /** @type {number} */
  this.poiHeight = 0;
  /** @type {number} */
  this.poleR = 1;
  /** @type {number} */
  this.poleG = 1;
  /** @type {number} */
  this.poleB = 0;
  /** @type {number} */
  this.poleA = 1;
  /** @type {number} */ //the cartesian x position
  this.posX;
  /** @type {number} */ //the cartesian x position
  this.posY;
  /** @type {number} */ //the cartesian x position
  this.posZ;
   /** @type {number} */ //the cartesian visibility distance.
  this.visibilityDistance = Infinity; //
  
  this.poiActiveColor = new vec4(1,1,1,1);
  
  /** @type {ogPoiIconStyle} */
  this.iconStyle = {
     "iconWidth" : 64,
     "iconHeight" : 64,
     "border" : 0,
     "backgroundColor" : 'rgba(255, 255, 255, 0)',
     "shadowOffsetX" : 0,
     "shadowOffsetY" : 0,
     "shadowBlur" : 0,
     "shadowColor" : 'rgba(0, 0, 0, 0)'
     };

  /** @type {ogPoiTextStyle} */
  this.textStyle = {
     "id"         : 1,
     "fontString" : '48px bold Arial',  
     "backgroundColor" : 'rgba(0,0,0,0)',
     "fontColor" : 'rgba(255,255,255,1.0)',
     "lineWidth" : 8,
     "strokeStyle" : 'rgba(0,0,0,1.0)', 
     "fontSize" : 48,
     "shadowOffsetX" : 0,
     "shadowOffsetY" : 0,
     "shadowBlur" : 0,
     "shadowColor" : 'rgba(0, 0, 0, 1.0)'
     };

}
//------------------------------------------------------------------------------
/**
* @description Set the poi content. If no text is desired just use "" as text argument.
* @param {string} text the poi text.
* @param {ogPoiTextStyle=} textStyle
* @param {string=} timgurl poi icon url.
* @param {ogPoiIconStyle=} iconStyle icon style
*/ 
Poi.prototype.SetContent = function(text,textStyle,timgurl,iconStyle)
{
  if (timgurl)
  {
     this.imgurl = timgurl;
  }
  else
  {
     this.imgurl = "";
  }
 
  if (textStyle)
  {
   this.textStyle = textStyle;
  }
  this.text = text;
 
 if (iconStyle)
 {
     this.iconStyle = iconStyle;
 }
 
 if(timgurl)
 {
   this.iconMesh = this.canvasTexture.CreateIconMesh(this.imgurl,this.iconStyle); 
 }
 this.canvasTexture = new CanvasTexture(this.engine);
 if(text)
 {
   this.textMesh = this.canvasTexture.CreateTextMesh(text,this.textStyle);
 }
}
//------------------------------------------------------------------------------
/**
* @description Set the Poi postion in wgs84 coordinates.
* @param {number} lat the latitude value
* @param {number} lng the longitude value
* @param {number} elv the elevation value
* @param {number} signElv the elevation of poi text -> if this is set, the poi gets a pole from elv to signElv.
*/ 
Poi.prototype.SetPosition = function(lat,lng,elv,signElv)
{
     this.lat = lat;
     this.lng = lng;
     this.elv = elv;
     this.signElv = signElv;
     
    //calc poi width
    if(this.iconMesh && this.textMesh)
    {
     this.poiWidth = this.iconMesh.meshWidth + this.textMesh.meshWidth;
     this.poiHeight = this.iconMesh.meshHeight;
    }
    else if (this.iconMesh)
    {
     this.poiWidth = this.iconMesh.meshWidth;
     this.poiHeight = this.iconMesh.meshHeight;
    }
    else if (this.textMesh)
    {
     this.poiWidth = this.textMesh.meshWidth;
     this.poiHeight = this.textMesh.meshHeight;
    }
    
    
    this.geoCoord = new GeoCoord(lng,lat,elv);
    var cart = new Array(3);
    this.geoCoord.ToCartesian(cart);
    if(this.iconMesh)
    {
     this.iconMesh.SetAsBillboard(cart[0],cart[1],cart[2],-((this.iconMesh.meshWidth/2)+(this.poiWidth/2-this.iconMesh.meshWidth))*CARTESIAN_SCALE_INV*this.scale,(this.poiHeight/2)*CARTESIAN_SCALE_INV*this.scale,0);
    }
    if(this.textMesh)
    {
     this.textMesh.SetAsBillboard(cart[0],cart[1],cart[2],((this.textMesh.meshWidth/2)+(this.poiWidth/2-this.textMesh.meshWidth))*CARTESIAN_SCALE_INV*this.scale,(this.poiHeight/2)*CARTESIAN_SCALE_INV*this.scale,0);  
    }
    this.posX = cart[0];
    this.posY = cart[1];
    this.posZ = cart[2];
    
    if(signElv!=null)
    {
      this.geoCoord2 = new GeoCoord(lng,lat,signElv);
      var cart2 = new Array(3);
      this.geoCoord2.ToCartesian(cart2);
      this.pole = true;
      this.poleMesh = this.canvasTexture.GetPoleMesh(cart[0],cart[1],cart[2],cart2[0],cart2[1],cart2[2],this.poleR,this.poleG,this.poleB,this.poleA);
    }
}
//------------------------------------------------------------------------------
/**
*@description sets the flagpole color
*@param {Array.<number>} color
*
*/
Poi.prototype.SetFlagpoleColor = function(color)
{
   this.poleR = color[0];
   this.poleG = color[1];
   this.poleB = color[2];
   this.poleA = color[3];
}
//------------------------------------------------------------------------------
/**
*@description sets the flagpole color
*@param {Array.<number>} color
*
*/
Poi.prototype.SetVisibilityDistance = function(dist)
{
   this.visibilityDistance = dist * CARTESIAN_SCALE_INV;
}

//------------------------------------------------------------------------------
/**
* @description Draws the poi.
*/ 
Poi.prototype.Draw = function()
{
  
   this.engine.gl.enable(this.engine.gl.BLEND);
   this.engine.gl.depthFunc(this.engine.gl.LEQUAL);
   this.engine.gl.blendFunc(this.engine.gl.SRC_ALPHA,this.engine.gl.ONE_MINUS_SRC_ALPHA);
 
   if(this.pole)
   {
      this.poleMesh.Draw();
   }
   if(this.iconMesh)
   {
     this.iconMesh.UpdateBillboardMatrix();
   }
   if(this.textMesh)
   {
     this.textMesh.UpdateBillboardMatrix();
   }
   
   this.engine.PushMatrices();
   var mmat = new mat4();
   mmat.Scale(CARTESIAN_SCALE_INV*this.scale,CARTESIAN_SCALE_INV*this.scale,1)
   this.engine.SetModelMatrix(mmat);
   
   if(this.iconMesh)
   {
      this.iconMesh.Draw(false,0,0,null,this.poiActiveColor);
   }
   if(this.textMesh)
   {
     this.textMesh.Draw(false,0,0,null,this.poiActiveColor);
   }
   this.engine.PopMatrices();
   this.engine.gl.disable(this.engine.gl.BLEND);
}
//------------------------------------------------------------------------------
/**
* @description Set the poi size.
* @param {number} size the poi size in meters, default is 20.
*/
Poi.prototype.SetSize = function(size)
{
  this.scale = size;
  this.SetPosition(this.lat,this.lng,this.elv,this.signElv);
}
//------------------------------------------------------------------------------
/**
* @description Checks if this poi is picked.
* @param {number} mx mouse x position
* @param {number} my mouse y position
* @returns {boolean} true if poi is picked otherwise false;
*/
Poi.prototype.Pick = function(mx,my)
{
   var hiticon = false;
   var hittext = false;
   
   if(this.iconMesh)
   {
      var ray = this.engine.GetDirectionMousePos(mx,my,this.engine.matModelViewProjection);
      hiticon = this.iconMesh.TestRayIntersection(ray.x,ray.y,ray.z,ray.dirx,ray.diry,ray.dirz);
   }
   if(this.textMesh)
   {
      var ray = this.engine.GetDirectionMousePos(mx,my,this.engine.matModelViewProjection);
      hittext = this.textMesh.TestRayIntersection(ray.x,ray.y,ray.z,ray.dirx,ray.diry,ray.dirz);
   }

   return hiticon || hittext;
}
//------------------------------------------------------------------------------
/**
* @description Destroy the poi
*/
Poi.prototype.Destroy = function()
{  
  this.canvasTexture = null;
  this.lat = 0;
  this.lng = 0;
  this.elv = 0;

  if(this.iconMesh)
  {
     this.iconMesh.Destroy();
  }
  if(this.textMesh)
  {
     this.textMesh.Destroy();
  }
  if(this.poleMesh)
  {
     this.poleMesh.Destroy();
  }
  
  this.pole = false;
  this.poleMesh = null;
  this.scale = 0;
  
}


goog.exportSymbol('Poi', Poi); 
goog.exportProperty(Poi.prototype, 'Draw', Poi.prototype.Draw);
goog.exportProperty(Poi.prototype, 'SetContent', Poi.prototype.SetContent);
goog.exportProperty(Poi.prototype, 'SetPosition', Poi.prototype.SetPosition);
goog.exportProperty(Poi.prototype, 'SetSize', Poi.prototype.SetSize);
goog.exportProperty(Poi.prototype, 'Destroy', Poi.prototype.Destroy);
