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

goog.provide('owg.CanvasTexture');

/** 
 * @class poi
 * @constructor
 * {@link http://www.openwebglobe.org} 
 * 
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch
 */
function CanvasTexture(engine)
{
   this.engine = engine;
   this.gl = engine.gl;
  

   
}


//returns a mesh with canvas2d as font
CanvasTexture.prototype.GenerateText =  function(text,style)
{
   this.texCanvas = document.createElement('canvas');
   document.body.appendChild(this.texCanvas);
   this.ctx = this.texCanvas.getContext('2d');     
   
   
   //set canvas as texture
   this.tex = new Texture(this.engine);
   this.tex.texture = this.gl.createTexture();
   
   
   //draw text
   this.text = text;
   this.DrawToCanvas2D(text,style);
   
   if(!this.textHeight)
   {
      this.textHeight = 80;
   }
    
    //get next power of two    
    var textWidthP2 = MathUtils.GetNextPowerOfTwo(this.textWidth);
    var textHeightP2 = MathUtils.GetNextPowerOfTwo(this.textHeight);   
     

     
   this.tex.width = textWidthP2;
   this.tex.height = textHeightP2; 

   this.mesh = new Mesh(engine);
   this.mesh.SetTexture(this.tex);

   var vert = new Array();
     
   vert.push(-textHeightP2/2,textHeightP2/2,0,0,1);
   vert.push(-textHeightP2/2,-textHeightP2/2,0,0,0);
   vert.push(textWidthP2/2,-textHeightP2/2,0,1,0);
   vert.push(textWidthP2/2,textHeightP2/2,0,1,1);
                 
   this.mesh.SetBufferFont(vert);
   this.mesh.SetIndexBuffer([0, 1, 2, 0, 2, 3],"TRIANGLES");  
   
   return this.mesh;
}





CanvasTexture.prototype.DrawToCanvas2D = function(style)
{
 
    switch(style)
    {
       case "WhiteFontBlackBorder":
       
                                    //todo: add more styles
                                    break;
       
       default:    

                  this.ctx.fillStyle = 'rgba(255,255,0,0.3)';
                  this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

                   // write white text with black border
                  this.ctx.fillStyle = 'rgba(255,255,255,1.0)';
                  this.ctx.lineWidth = 2.5;
                  this.ctx.strokeStyle = 'black';
                  this.ctx.save();
                  this.ctx.font = 'bold 80px ArialMS';
                  this.ctx.textAlign = 'left';
                  this.ctx.textBaseline = 'top';
                  var leftOffset = this.ctx.canvas.width / 2;
                  var topOffset = this.ctx.canvas.height / 2;
                  this.ctx.strokeText(this.text,0,0);
                  this.ctx.fillText(this.text,0,0);

                  var dim = this.ctx.measureText(this.text);
                  this.textWidth = Math.round(dim.width);
                  this.textHeight = Math.round(dim.height);          
                  this.ctx.restore();
                  break;     
    }
    

 
     //handle loaded canvas     
     this.gl.enable(this.gl.TEXTURE_2D);
     this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex.texture); 
     this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
     this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,engine.gl.RGBA,this.gl.UNSIGNED_BYTE, this.texCanvas);
     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
     this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);         
     this.gl.bindTexture(this.gl.TEXTURE_2D, null);
     this.tex.ready = true;
 }  
 
goog.exportSymbol('CanvasTexture', CanvasTexture);
goog.exportProperty(CanvasTexture.prototype, 'DrawToCanvas2D', CanvasTexture.prototype.DrawToCanvas2D);
goog.exportProperty(CanvasTexture.prototype, 'GenerateText', CanvasTexture.prototype.GenerateText);
