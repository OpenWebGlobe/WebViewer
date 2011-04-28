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
 
 function Poi(text,lat,lng,elv,engine)
 {
    this.engine = engine;
    this.gl = engine.gl;
    this.lat = lat;
    this.lng = lng;
    this.elv = elv;
    this.text = text;
    this.font = new Font(this.engine);
    
    
    this.texture = new Texture(this.engine,true,128,128);
    
    this.mesh = new Mesh(engine);
    this.mesh.SetTexture(this.texture);
    
    this.poiLength = this.font.GetStringWidth(this.text);
    this.poiHeight = 31;
    console.log(this.poiLength);
    

    var vert = new Array();
    vert.push(0,CARTESIAN_SCALE_INV*100*this.poiLength,0,0,1);
    vert.push(0,0,0,0,0);
    vert.push(CARTESIAN_SCALE_INV*100*this.poiLength,0,0,1,0);
    vert.push(CARTESIAN_SCALE_INV*100*this.poiLength,CARTESIAN_SCALE_INV*100*this.poiLength,0,1,1);
            
            
    this.mesh.SetBufferPT(vert);
    this.mesh.SetIndexBuffer([0, 1, 2, 0, 2, 3],"TRIANGLES");         
            
    this.geoCoord = new GeoCoord(lng,lat,elv);
    var cart = new Array(3);
    this.geoCoord.ToCartesian(cart);           
    this.mesh.SetAsBillboard(cart[0],cart[1],cart[2]);
    
    this.fontcolor = new vec4();
    this.fontcolor.Set(1,0,0,1);


 }
 
 
 Poi.prototype.Draw = function()
 {
    this.mesh.UpdateBillboardMatrix();
    this.texture.EnableRenderToTexture();
    this.font.DrawText(this.text,0,0,1,this.fontcolor);
    this.texture.DisableRenderToTexture();

    this.mesh.Draw();
 }
 
 
 
 
