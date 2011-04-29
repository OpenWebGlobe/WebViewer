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
 * {@link http://www.openwebglobe.org} 
 * 
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch
 */
 
 function Poi(engine)
 {
   this.engine = engine;
   this.gl = engine.gl;
   this.lat = 0.0;
   this.lng = 0.0;
   this.elv = 0.0;

   canvasText = new CanvasTexture(this.engine);
   this.mesh = canvasText.GenerateText("Bern","def")              
 }
 

 
 
 Poi.prototype.SetPosition = function(lat,lng,elv)
 {
    
     this.geoCoord = new GeoCoord(lng,lat,elv);
     var cart = new Array(3);
     this.geoCoord.ToCartesian(cart);       
     
         
     this.mesh.SetAsBillboard(cart[0],cart[1],cart[2]);  
 }
 

 
 Poi.prototype.Draw = function()
 {
    this.engine.gl.enable(this.engine.gl.BLEND);
    this.engine.gl.depthFunc(this.engine.gl.LEQUAL);
    this.engine.gl.blendFunc(this.engine.gl.SRC_ALPHA,this.engine.gl.ONE_MINUS_SRC_ALPHA);
      
    this.mesh.UpdateBillboardMatrix();
    
    engine.PushMatrices();
    var mmat = new mat4();
    mmat.Scale(CARTESIAN_SCALE_INV,CARTESIAN_SCALE_INV,1)
    this.engine.SetModelMatrix(mmat);
    this.mesh.Draw();
    engine.PopMatrices();
    this.engine.gl.disable(this.engine.gl.BLEND);
 }
 
goog.exportSymbol('Poi', Poi); 
goog.exportProperty(Poi.prototype, 'Draw', Poi.prototype.Draw);
goog.exportProperty(Poi.prototype, 'SetPosition', Poi.prototype.SetPosition);
