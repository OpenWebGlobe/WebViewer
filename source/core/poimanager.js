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

/** 
 * @class PoiManager
 * {@link http://www.openwebglobe.org} 
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
   this.engine = engine;
   /** @type Array.<Mesh>*/
   this.poiMeshes = new Array();
   /** @type Array.<number>*/
   this.refCounts = new Array();
   /** @type CanvasTexture*/
   this.canvastexture = null;
   /** @type Array.<Mesh>*/
   this.poiTextMeshes = new Array();
   /** @type Array.<number>*/
   this.refTextCounts = new Array();
}


PoiManager.prototype.CreatePoi = function(text,style,imgurl,iconstyle)
{
   var poi = new Poi(this.engine);
   
   poi.imgurl = imgurl;
   poi.style = style;
   poi.text = text;
   
  
  if(imgurl)
  {
   poi.iconMesh = this.CreateIconMesh(imgurl,iconstyle); 
  }
  if(text)
  {
   poi.textMesh = this.CreateTextMesh(text,style);
  }
  
  return poi;
}




PoiManager.prototype.DestroyPoi = function(poi)
{
   if(poi.iconMesh)
   {
      this.DestroyIconMesh(poi.imgurl);
   }
   if(poi.textMesh)
   {
      this.DestroyTextMesh(poi.text,poi.style);
   }
   poi = null; 
}


/**
 * @description Returns a Mesh with the specific icon as texture.
 * @param {url} url the icon url.
 */
PoiManager.prototype.CreateIconMesh = function(url,iconstyle)
{
   var r = this.poiMeshes[url];
   if(r)
   {
      this.refCounts[url] = this.refCounts[url]+1;      
      var r_new = new Mesh(this.engine);
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
 * @param {url} url the icon url.
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
 * @param {string} style the style e.g. "RB", "WB"...
 */
PoiManager.prototype.CreateTextMesh = function(text,style)
{
   console.log(text+style.id);
   var r = this.poiTextMeshes[text+style.id];
   if(r)
   {
      this.refTextCounts[text+style] = this.refTextCounts[text+style.id]+1;      
      var r_new = new Mesh(this.engine);
      r_new.CopyFrom(r);
      r_new.meshWidth = r.meshWidth; //appended attributes, thy will not copyed by mesh's copy function.
      r_new.meshHeight = r.meshHeight;
      this.poiTextMeshes[text+style.id] = r_new;
   }
   else
   {
      this.canvastexture = new CanvasTexture(this.engine); //why is this needed?
      var r_new = this.canvastexture.CreateTextMesh(text,style);
      this.refTextCounts[text+style.id] = 1;
      this.poiTextMeshes[text+style.id] = r_new;
      this.canvastexture = null;
   }  
   return r_new;
}



/**
 * @description Free memory.
 *  @param {string} text the poi text.
 * @param {string} style the style e.g. "RB", "WB"...
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











