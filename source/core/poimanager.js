/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/


goog.provide('owg.PoiManager');

goog.require('owg.CanvasTexture');
goog.require('owg.Poi');

/**
 * @typedef {{
   id         : number,
   fontString : string,  
   backgroundColor : string,
   fontColor : string,
   lineWidth : number,
   strokeStyle : string,
   fontSize : number,
   shadowOffsetX : number,
   shadowOffsetY : number,
   shadowBlur : number,
   shadowColor : string
 * }}
 */
var ogPoiTextStyle;


/** @typedef {{
 * iconWidth : number,
   iconHeight : number,
   border : number,
   backgroundColor : string,
   shadowOffsetX : number,
   shadowOffsetY : number,
   shadowBlur : number,
   shadowColor : string
 * }}
 */
var ogPoiIconStyle;


/** 
 * @class PoiManager
 * @constructor
 * 
 * @description Handles the poi-mesh creation. If a Poi-mesh already exists,
 * the mesh will be copied not new loaded.
 * 
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch
 * 
 * @param {engine3d} engine
 */
function PoiManager(engine)
{
   /** @type {engine3d} */
   this.engine = engine;
   /** @type Array.<Surface>*/
   this.poiMeshes = new Array();
   /** @type Array.<number>*/
   this.refCounts = new Array();
   /** @type CanvasTexture*/
   this.canvastexture = null;
   /** @type Array.<Surface>*/
   this.poiTextMeshes = new Array();
   /** @type Array.<number>*/
   this.refTextCounts = new Array();
}


/**
 * @description Creates a new Poi.
 * @param {string} text the poi text
 * @param {?ogPoiTextStyle=} style the text style definition object.
 * @param {string=} imgurl 
 * @param {?ogPoiIconStyle=} iconstyle the poi icon style definition.
 * @returns Poi
 */
PoiManager.prototype.CreatePoi = function(text,style,imgurl,iconstyle)
{
   var poi = new Poi(this.engine);
   
   if (style)
   {
      poi.textStyle = style;
   }
   
   poi.text = text;
   
   if (iconstyle)
   {
      poi.iconStyle = iconstyle;
   }
   
   if(imgurl)
   {
      poi.imgurl = imgurl;
      poi.iconMesh = this.CreateIconMesh(imgurl,poi.iconStyle); 
   }
   
   if(text)
   {
      poi.textMesh = this.CreateTextMesh(text, poi.textStyle);
   }
   
   return poi;
}



/**
 * @description Free memory
 * @param {Poi} poi the poi to delete.
 */
PoiManager.prototype.DestroyPoi = function(poi)
{
   if(poi.iconMesh)
   {
      this.DestroyIconMesh(poi.imgurl);
   }
   if(poi.textMesh)
   {
      this.DestroyTextMesh(poi.text,poi.textStyle);
   }
   poi = null; 
}



/**
 * @description Returns a Mesh with the specific icon as texture.
 * @param {string} url the icon url.
 * @param {ogPoiIconStyle} iconstyle 
 */
PoiManager.prototype.CreateIconMesh = function(url,iconstyle)
{
   var r = this.poiMeshes[url];
   if(r)
   {
      this.refCounts[url] = this.refCounts[url]+1;      
      var r_new = new Surface(this.engine);
      r_new.CopyFrom(r);
      r_new.meshWidth = r.meshWidth; //appended attributes, they will not copyed by mesh's copy function.
      r_new.meshHeight = r.meshHeight;
      this.poiMeshes[url] = r_new;
   }
   else
   {
      this.canvastexture = new CanvasTexture(this.engine);  
      var r_new = this.canvastexture.CreateIconMesh(url,iconstyle);
      this.refCounts[url] = 1;
      this.poiMeshes[url] = r_new;
      this.canvastexture = null;
   }  
   return r_new;
}



/**
 * @description Free memory
 * @param {string} url the icon url.
 */
PoiManager.prototype.DestroyIconMesh = function(url)
{   
   var numInstances = this.refCounts[url];
   this.refCounts[url] = numInstances-1;
   
   if(this.refCounts[url] == 0)
   {
      //remove from poi array
      this.poiMeshes[url].texture.Destroy();
      delete(this.poiMeshes[url]);
      delete(this.refCounts[url]);
   }
}




/**
 * @description Returns a Mesh with the text in specific style as texture.
 * @param {string} text the poi text.
 * @param {ogPoiTextStyle} style 
 */
PoiManager.prototype.CreateTextMesh = function(text,style)
{
   //console.log(text+style.id);
   var r = this.poiTextMeshes[text+style.id];
   if(r)
   {
      this.refTextCounts[text+style.id] = this.refTextCounts[text+style.id]+1;      
      var r_new = new Surface(this.engine);
      r_new.CopyFrom(r);
      r_new.meshWidth = r.meshWidth; //appended attributes, thy will not copyed by mesh's copy function.
      r_new.meshHeight = r.meshHeight;
      this.poiTextMeshes[text+style.id] = r_new;
   }
   else
   {
      this.canvastexture = new CanvasTexture(this.engine); 
      var r_new = this.canvastexture.CreateTextMesh(text,style);
      this.refTextCounts[text+style.id] = 1;
      this.poiTextMeshes[text+style.id] = r_new;
      this.canvastexture = null;
   }  
   return r_new;
}



/**
 * @description Free memory.
 * @param {string} text the poi text.
 * @param {ogPoiTextStyle} style 
 */
PoiManager.prototype.DestroyTextMesh = function(text,style)
{   
   var numInstances = this.refTextCounts[text+style.id];
   this.refTextCounts[text+style.id] = numInstances-1;
   
   if(this.refTextCounts[text+style.id] == 0)
   {
      //remove from poi array
      this.poiTextMeshes[text+style.id].texture.Destroy();
      delete(this.poiTextMeshes[text+style.id]);
      delete(this.refTextCounts[text+style.id]);
   }
}


/**
 * @description Changes the Poi Icon.
 * @param {Poi} poi the poi wich will be changed
 * @param {string} url text the poi text.
 * @param {ogPoiIconStyle} style 
 */
PoiManager.prototype.ChangePoiIcon = function(poi,url,style)
{ 
   poi.iconMesh = this.CreateIconMesh(url,style);
   poi.SetPosition(poi.posX,poi.posY,poi.posZ,null);
   this.DestroyIconMesh(poi.imgurl); 
   poi.imgurl = url;
}


/**
 * @description Changes the poi text.
 * @param {Poi} poi the poi wich will be changed
 * @param {string} text the poi text.
 * @param {ogPoiTextStyle} style 
 */
PoiManager.prototype.ChangePoiText = function(poi,text,style)
{
   poi.textMesh = this.CreateTextMesh(text,style);
   poi.SetPosition(poi.posX,poi.posY,poi.posZ,null);
   this.DestroyTextMesh(poi.text,style);
   poi.text = text;  
}


//------------------------------------------------------------------------------

goog.exportSymbol('PoiManager', PoiManager);
goog.exportProperty(PoiManager.prototype, 'CreatePoi',PoiManager.prototype.CreatePoi);
goog.exportProperty(PoiManager.prototype, 'DestroyPoi',PoiManager.prototype.DestroyPoi);
goog.exportProperty(PoiManager.prototype, 'ChangePoiIcon',PoiManager.prototype.ChangePoiIcon);
goog.exportProperty(PoiManager.prototype, 'ChangePoiText',PoiManager.prototype.ChangePoiText);
//------------------------------------------------------------------------------

