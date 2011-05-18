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
   
   /** @type {PoiIconStyle} */
   this.iconStyle = {
      "iconWidth" : 64,
      "iconHeight" : 64,
      "border" : 0,
      "backgroundColor" : 'rgba(0, 255, 0, 0)',
      "shadowOffsetX" : 0,
      "shadowOffsetY" : 0,
      "shadowBlur" : 0,
      "shadowColor" : 'rgba(255, 0, 0,0)'
      };

   /** @type {PoiTextStyle} */
   this.textStyle = {
      "id"         : 1,
      "fontString" : 'bold 48px Arial',  
      "backgroundColor" : 'rgba(255,255,255,0.5)',
      "fontColor" : 'rgba(255,0,0,1.0)',
      "lineWidth" : 3,
      "strokeStyle" : 'rgba(0,0,0,1.0)',
      "textAlign" : 'left', 
      "fontSize" : 48,
      "shadowOffsetX" : 2,
      "shadowOffsetY" : 2,
      "shadowBlur" : 5,
      "shadowColor" : 'rgba(0, 255, 0, 1.0)'
      };
 }
 
 
 /**
 * @description Set the poi content. If no text is desired just use "" for as text argument.
 * @param {string} text the poi text.
 * @param {PoiTextStyle=} textStyle
 * @param {string=} timgurl poi icon url.
 * @param {PoiIconStyle=} iconStyle icon style
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
     
     if(signElv!=null)
     {
       this.geoCoord2 = new GeoCoord(lng,lat,signElv);
       var cart2 = new Array(3);
       this.geoCoord2.ToCartesian(cart2);
       this.pole = true;
       this.poleMesh = this.canvasTexture.GetPoleMesh(cart[0],cart[1],cart[2],cart2[0],cart2[1],cart2[2]);
     }
 }
 

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
      this.iconMesh.Draw();
    }
    
    if(this.textMesh)
    {
      this.textMesh.Draw();
    }
    this.engine.PopMatrices();
    this.engine.gl.disable(this.engine.gl.BLEND);
 }
 
 /**
 * @description Set the poi size.
 * @param {number} size the poi size in meters, default is 20.
 */
 Poi.prototype.SetSize = function(size)
 {
   this.scale = size;
   this.SetPosition(this.lat,this.lng,this.elv,this.signElv);
 }
 
 
 
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
