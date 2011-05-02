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
   this.pole = false;
   this.poleMesh = null;
   this.scale = 20;
           
 }
 
 
 Poi.prototype.SetContent = function(text,style,imgurl)
 {
   canvasText = new CanvasTexture(this.engine);
   this.mesh = canvasText.GenerateTexture(text,style,imgurl); 
 }

 
 
 Poi.prototype.SetPosition = function(lat,lng,elv,signElv)
 {
     this.geoCoord = new GeoCoord(lng,lat,elv);
     var cart = new Array(3);
     this.geoCoord.ToCartesian(cart);            
     this.mesh.SetAsBillboard(cart[0],cart[1],cart[2]);  
     
     if(signElv!=null)
     {
       this.geoCoord2 = new GeoCoord(lng,lat,signElv);
       var cart2 = new Array(3);
       this.geoCoord2.ToCartesian(cart2);            
         
       this.pole = true;
       this.poleMesh = canvasText.GetPoleMesh(cart[0],cart[1],cart[2],cart2[0],cart2[1],cart2[2]);    
     }
 }
 

 
 Poi.prototype.Draw = function()
 {  
    if(this.pole)
    {
       this.poleMesh.Draw();
    }
    this.engine.gl.enable(this.engine.gl.BLEND);
    this.engine.gl.depthFunc(this.engine.gl.LEQUAL);
    this.engine.gl.blendFunc(this.engine.gl.SRC_ALPHA,this.engine.gl.ONE_MINUS_SRC_ALPHA);
      
    this.mesh.UpdateBillboardMatrix();
    
    engine.PushMatrices();
    var mmat = new mat4();
    mmat.Scale(CARTESIAN_SCALE_INV*this.scale,CARTESIAN_SCALE_INV*this.scale,1)
    this.engine.SetModelMatrix(mmat);
    this.mesh.Draw();
    
    engine.PopMatrices();
    this.engine.gl.disable(this.engine.gl.BLEND);
 }
 
 
 Poi.prototype.SetSize = function(size)
 {
    this.scale = size;
    
 }
 
 
 
 
