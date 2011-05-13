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
 * @constructor
 * @description This class is used to create meshes with Canvas(2d) as textures. E.g. for POIs.
 * 
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch
 * @param {engine3d} engine
 */
function CanvasTexture(engine)
{
   /** @type {engine3d} */
   this.engine = engine;
   /** @type {WebGLRenderingContext} */
   this.gl = engine.gl;
   /** @type {boolean} */
   this.pole = false;
   /** @type {Mesh} */
   this.mesh = null;
   /** @type {Mesh} */
   this.poleMesh = null;
   /** @type {Mesh} */
   this.videoMesh = null;

}





/**
 * Generates a mesh with a canvas2d as texture. The mesh size depends on the text length and style.
 * @param {string}  text the poi text.
 * @param {string} string to set predefined style e.g. "RB","WB" or "Symbol".
 * @param {string} imgurl url for poi icon.
 * @return {Mesh}
 */
CanvasTexture.prototype.CreateTexturedMesh =  function(text,style,imgurl)
{
   this.texCanvas = document.createElement('canvas'); 
   this.ctx = this.texCanvas.getContext('2d');  
 
   //set canvas as texture
   this.tex = new Texture(this.engine);
   this.tex.texture = this.gl.createTexture();
      
   //draw canvas content
   this.text = text;
   this.SetCanvasContent(text,style,imgurl); 

   //create mesh
   this.mesh = new Mesh(engine);
   this.mesh.SetTexture(this.tex);

   var vert = new Array();
  
   vert.push(-this.meshWidth/2,this.meshHeight/2,0,0,0);
   vert.push(-this.meshWidth/2,-this.meshHeight/2,0,0,(1/this.textureHeight*this.meshHeight));
   vert.push(this.meshWidth/2,-this.meshHeight/2,0,1/this.textureWidth*this.meshWidth,(1/this.textureHeight*this.meshHeight));
   vert.push(this.meshWidth/2,this.meshHeight/2,0,(1/this.textureWidth*this.meshWidth),0);  
  
                 
   this.mesh.SetBufferFont(vert);
   this.mesh.SetIndexBuffer([0, 1, 2, 0, 2, 3],"TRIANGLES");  
   
   this.mesh.meshWidth = this.meshWidth;
   this.mesh.meshHeight = this.meshHeight;
   return this.mesh;
}


/**
 * Sets the canvas content (poi text and icon) in predefined styles.
 * @param {string} text the poi text.
 * @param {string} string to set predefined style e.g. "RB","WB" or "Symbol".
 * @param {string} imgurl url for poi icon.
 */
CanvasTexture.prototype.SetCanvasContent = function(text,style,imgurl)
{
   
    switch(style)
    {
       case "Symbol": 
                     var styleObject = 
                     {
                        fontString : 'bold 48px Arial', 
                        fontSize : 48, 
                        border : 5,
                        iconSize : 64,
                        iconTextSpace : 5,
                        backgroundColor : 'rgba(255,255,255,0)',
                        fontColor : 'rgba(255,255,255,1.0)'         
                     };
                     this.DrawToCanvas(text,styleObject,imgurl);                                         
                     break;


       case "RB":    var styleObject = 
                     {
                        fontString : 'bold 48px Arial', 
                        fontSize : 48, 
                        border : 5,
                        backgroundColor : 'rgba(255,255,255,0)',
                        fontColor : 'rgba(255,0,0,1.0)'         
                     };
                     this.DrawToCanvas(text,styleObject);
                     this.ToGPU();
                     break;
       
       case "WB":    var styleObject = 
                     {
                        fontString : 'bold 48px Arial', 
                        fontSize : 48, 
                        border : 5,
                        backgroundColor : 'rgba(255,255,255,0)',
                        fontColor : 'rgba(255,255,255,1.0)'         
                     };
                     this.DrawToCanvas(text,styleObject);
                     this.ToGPU();
                     break;
                     
       case "BB":    var styleObject = 
                     {
                        fontString : 'bold 32px SansSerif', 
                        fontSize : 32, 
                        border : 5,
                        backgroundColor : 'rgba(255,255,0,0.8)',
                        fontColor : 'rgba(255,255,255,1.0)'         
                     };
                     this.DrawToCanvas(text,styleObject);
                     this.ToGPU();
                     break;
       
       default:      var styleObject = 
                     {
                        fontString : 'bold 48px Arial', 
                        fontSize : 48, 
                        border : 5,
                        backgroundColor : 'rgba(255,255,255,0)',
                        fontColor : 'rgba(255,255,255,1.0)'         
                     };
                     this.DrawToCanvas(text,styleObject);               
                     this.ToGPU();
                     break;     
    }
}  
 
 
 
 


/**
 * Draws the canvas 2d.
 * @param {string} text the poi text.
 * @param {string} styleObject style definition.
 * @param {string} imgurl url for poi icon.
 */
CanvasTexture.prototype.DrawToCanvas = function(text,styleObject,imgurl)
{           
           //Determine canvas Size 
           this.ctx.save();
              this.ctx.font = styleObject.fontString;
              this.ctx.textAlign = 'left';
              this.ctx.textBaseline = 'top';
              this.ctx.lineWidth = 2.5;
              this.ctx.strokeStyle = 'black';  
              var dim = this.ctx.measureText(this.text);
              var textWidth = Math.round(dim.width);
              var textHeight = styleObject.fontSize+styleObject.border;//iconSize+10;       
            this.ctx.restore();
           
           if(imgurl)
           {
              this.meshWidth = textWidth+styleObject.iconSize+2*styleObject.border+styleObject.iconTextSpace; //maximal width and height.          
              this.meshHeight = styleObject.iconSize+2*styleObject.border; 
            
           }
           else
           {
              this.meshWidth = textWidth+2*styleObject.border;
              this.meshHeight = styleObject.fontSize+2*styleObject.border;//parse fontstring//textHeight+5;
           }          
            
            
            //get next power of two    
            this.textureWidth = MathUtils.GetNextPowerOfTwo(this.meshWidth);
            this.textureHeight = MathUtils.GetNextPowerOfTwo(this.meshHeight);   
     
            this.tex.width = this.textureWidth;
            this.tex.height = this.textureHeight; 
            this.ctx.canvas.width = this.textureWidth; 
            this.ctx.canvas.height = this.textureHeight;
               
            
            
                     
           //draw background
           this.ctx.fillStyle = styleObject.backgroundColor;
           this.ctx.fillRect(0, 0, this.meshWidth, this.meshWidth);
           

           //shadow
           /*
           this.ctx.shadowOffsetX = 5;
           this.ctx.shadowOffsetY = 5;
           this.ctx.shadowBlur    = 4;
           this.ctx.shadowColor   = 'rgba(0, 0, 0, 0.5)';
           */
           
           //write text
           this.ctx.fillStyle = styleObject.fontColor; 
           this.ctx.font = styleObject.fontString;
           this.ctx.textAlign = 'left';
           this.ctx.textBaseline = 'top';
           this.ctx.lineWidth = 2.5;
           this.ctx.strokeStyle = 'black';
            


           if(imgurl)
           {
              //draw text             
              this.ctx.strokeText(text,styleObject.iconSize+styleObject.border+styleObject.iconTextSpace,2*styleObject.border+(styleObject.iconSize/2-styleObject.fontSize/2));
              this.ctx.fillText(text,styleObject.iconSize+styleObject.border+styleObject.iconTextSpace,2*styleObject.border+(styleObject.iconSize/2-styleObject.fontSize/2));
               
              
              //load poi icon
              var image = new Image();
              var context = this.ctx;
              var canvasTextureClass = this;
              image.onload = function() 
              {
               _cbfDrawImage(context,image,styleObject,canvasTextureClass);
              }
              image.src = imgurl;
              
           }
           else
           {
              //draw text
              this.ctx.strokeText(text,styleObject.border,2*styleObject.border);
              this.ctx.fillText(text,styleObject.border,2*styleObject.border);
           }
           
} 


/**
 * callback function for async image load.
 * @ignore 
 */
function _cbfDrawImage(context,image,styleObject,canvasTextureClass)
{
     context.drawImage(image, styleObject.border, styleObject.border, styleObject.iconSize, styleObject.iconSize);
     canvasTextureClass.ToGPU();    
     
}



/**
 * Binds the texture
 * @ignore 
 */
CanvasTexture.prototype.ToGPU = function()
{
     this.gl.enable(this.gl.TEXTURE_2D);
     this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex.texture); 
    // this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
     this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,engine.gl.RGBA,this.gl.UNSIGNED_BYTE, this.texCanvas);
     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    //this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);         
     this.gl.bindTexture(this.gl.TEXTURE_2D, null);
     this.tex.ready = true;
}


 


/**
 * Returns a mesh for the poi-pole.
 * @param {number} x x cartesian pole start coordinate
 * @param {number} y y cartesian pole start coordinate
 * @param {number} z z cartesian pole start coordinate
 * @param {number} x2 x2 cartesian pole end coordinate
 * @param {number} y2 y2 cartesian pole end coordinate
 * @param {number} z2 z2 cartesian pole end coordinate
 * @return {Mesh}
 */ 
CanvasTexture.prototype.GetPoleMesh = function(x,y,z,x2,y2,z2)
{
   this.poleMesh = new Mesh(engine);

   var vert = new Array();

     
   vert.push(x,y,z,1,1,0,1);
   vert.push(x2,y2,z2,1,1,0,1);
                 
   this.poleMesh.SetBufferPC(vert);
   this.poleMesh.SetIndexBuffer([0,1],"LINES");  
   
   return this.poleMesh;

}



//------------------------------------------------------------------------------
/**
 * @description Free all memory, especially the GPU buffers.
 * @ignore
 */
CanvasTexture.prototype.Destroy = function()
{
   if(this.mesh)
   {
      mesh.Destroy();
      this.mesh = null;
   }
   
   if(this.poleMesh)
   {
      this.poleMesh.Destroy();
      this.poleMesh = null;
   }
   
   if(this.videoMesh)
   {
      this.videoMesh.Destroy();
      this.videoMesh = null;
   }
   
   if(this.tex)
   {
      this.tex.Destroy();
      this.tex = null;
   }
   
   if(this.texCanvas)
   {
      document.removeChild(this.texCanvas);
      this.texCanvas = null; 
   }
   
}


/* Video POIs not supported...      
function _cbHandleLoadedVideo(gl,canvasTex)
{
   gl.enable(gl.TEXTURE_2D);
   gl.bindTexture(gl.TEXTURE_2D, canvasTex.tex.texture); 
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,gl.RGB,gl.UNSIGNED_BYTE, canvasTex.videoElement);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);         
   gl.bindTexture(gl.TEXTURE_2D, null);
   canvasTex.tex.ready = true;
  
   canvasTex.mesh.SetTexture(canvasTex.tex);
}





CanvasTexture.prototype.GenerateVideoPoi = function(url)
{   
   this.videoElement = document.createElement('video'); 
   this.videoElement.style.display = 'none';
   document.body.appendChild(this.videoElement);
   
   //set canvas as texture
   this.tex = new Texture(this.engine);
   this.tex.texture = this.gl.createTexture();
   
   var curgl = this.gl;
   var canvasTex = this;
   
   this.videoElement.addEventListener("loadeddata", function()
   {
      console.log("Video loaded...");
      _cbHandleLoadedVideo(curgl,canvasTex);
   },true);
   
   
  // this.videoElement.addEventListener("canplaythrough", this.videoElement.play(), true);
   
   this.videoElement.src=url;
   
    this.videoElement.onerror = function()
   {
      console.log("***FAILED VIDEO DOWNLOADING: " + url);
   }

   this.tex.width = 640;
   this.tex.height = 480; 

   this.mesh = new Mesh(engine);
   this.mesh.SetTexture(this.tex);

   var vert = new Array();
     
   vert.push(-this.tex.width/2,this.tex.height/2,0,0,1);
   vert.push(-this.tex.width/2,-this.tex.height/2,0,0,0);
   vert.push(this.tex.width/2,-this.tex.height/2,0,1,0);
   vert.push(this.tex.width/2,this.tex.height/2,0,1,1);
                 
   this.mesh.SetBufferFont(vert);
   this.mesh.SetIndexBuffer([0, 1, 2, 0, 2, 3],"TRIANGLES");  
   
  return this.mesh;  
}

*/



goog.exportSymbol('CanvasTexture', CanvasTexture);
goog.exportProperty(CanvasTexture.prototype, 'SetCanvasContent', CanvasTexture.prototype.SetCanvasContent);
goog.exportProperty(CanvasTexture.prototype, 'DrawToCanvas2D', CanvasTexture.prototype.DrawToCanvas2D);
goog.exportProperty(CanvasTexture.prototype, 'GenerateText', CanvasTexture.prototype.GenerateText);
