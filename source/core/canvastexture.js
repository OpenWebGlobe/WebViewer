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
   /** @type number*/
   this.meshWidth = 0;
   /** @type number*/
   this.meshHeight = 0;
   

}



/**
 * @description Generates a mesh with a canvas2d as texture. The mesh size depends on the text length and style.
 * @param {string} text the poi text.
 * @param {PoiTextStyle} style POI text style
 * @return {Mesh}
 */
CanvasTexture.prototype.CreateTextMesh =  function(text,style)
{
   
   this.texCanvas = document.createElement('canvas'); 
   this.ctx = this.texCanvas.getContext('2d');  
   
   //set canvas as texture
   this.tex = new Texture(this.engine);
   this.tex.texture = this.gl.createTexture();
      
   //draw canvas content
   this.text = text;
   this.DrawToCanvas(text,style); 

   //create mesh
   this.mesh = new Mesh(this.engine);
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
 * @description Generates a mesh with a canvas2d as texture. The mesh size depends on the text length and style.
 * @param {string} url the icon
 * @param {PoiIconStyle} iconstyle 
 * @return {Mesh}
 */
CanvasTexture.prototype.CreateIconMesh =  function(url,iconstyle)
{

   this.texCanvas = document.createElement('canvas'); 
   this.ctx = this.texCanvas.getContext('2d');
   
   //set canvas as texture
   this.tex = new Texture(this.engine);
   this.tex.texture = this.gl.createTexture();
      
   //draw canvas content
   this.DrawIconToCanvas(url,iconstyle); 

   //create mesh
   this.mesh = new Mesh(this.engine);
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
 * Draws the canvas 2d.
 * @param {string} text the poi text.
 * @param {Object} styleObject style definition.
 */
CanvasTexture.prototype.DrawToCanvas = function(text,styleObject)
{           
           //Determine canvas Size 
           this.ctx.save();
              this.ctx.font = styleObject.fontString;
              this.ctx.textAlign = styleObject.textAlign;
              this.ctx.textBaseline = 'top';
              this.ctx.lineWidth = styleObject.lineWidth;
              this.ctx.strokeStyle = styleObject.strokeStyle; 
              var dim = this.ctx.measureText(this.text);
              var textWidth = Math.round(dim.width);
              var textHeight = styleObject.fontSize+styleObject.border;   
            this.ctx.restore();


            this.meshWidth = textWidth+2*parseInt(styleObject.lineWidth, 10)+Math.abs(styleObject.shadowOffsetX)+Math.abs(styleObject.shadowOffsetY)+styleObject.shadowBlur;
            this.meshHeight = parseInt(styleObject.fontSize, 10)+2*parseInt(styleObject.lineWidth, 10)+Math.abs(styleObject.shadowOffsetY)+styleObject.shadowBlur;      
            
            
            //get next power of two    
            this.textureWidth = MathUtils.GetNextPowerOfTwo(this.meshWidth);
            this.textureHeight = MathUtils.GetNextPowerOfTwo(this.meshHeight);   
     
            this.tex.width = this.textureWidth;
            this.tex.height = this.textureHeight; 
            this.ctx.canvas.width = this.textureWidth; 
            this.ctx.canvas.height = this.textureHeight;

                     
           //draw background
           this.ctx.fillStyle = styleObject.backgroundColor;
           this.ctx.fillRect(0, 0, this.meshWidth, this.meshHeight);
           

           //shadow
           this.ctx.shadowOffsetX = styleObject.shadowOffsetX;
           this.ctx.shadowOffsetY = styleObject.shadowOffsetY;
           this.ctx.shadowBlur    = styleObject.shadowBlur;
           this.ctx.shadowColor   = styleObject.shadowColor;

           
           //write text
           this.ctx.fillStyle = styleObject.fontColor; 
           this.ctx.font = styleObject.fontString;
           this.ctx.textAlign = styleObject.textAlign;
           this.ctx.textBaseline = 'middle';
           this.ctx.lineWidth = styleObject.lineWidth;
           this.ctx.strokeStyle = styleObject.strokeStyle;
            

            //draw text
            this.ctx.strokeText(text,styleObject.lineWidth,this.meshHeight/2);
            this.ctx.fillText(text,styleObject.lineWidth,this.meshHeight/2);

           this.ToGPU();          
}





/**
 * Draws the canvas 2d.
 * @param {string} imgurl url for poi icon.
 * @param {PoiIconStyle} iconstyle style definition for icon.
 */
CanvasTexture.prototype.DrawIconToCanvas = function(imgurl,iconstyle)
{           
 
      this.meshWidth = iconstyle.iconWidth+2*iconstyle.border+Math.abs(iconstyle.shadowOffsetX)+Math.abs(iconstyle.shadowOffsetY)+iconstyle.shadowBlur;           
      this.meshHeight = iconstyle.iconHeight+2*iconstyle.border+Math.abs(iconstyle.shadowOffsetX)+Math.abs(iconstyle.shadowOffsetY)+iconstyle.shadowBlur; 
            

      //get next power of two    
      this.textureWidth = MathUtils.GetNextPowerOfTwo(this.meshWidth);
      this.textureHeight = MathUtils.GetNextPowerOfTwo(this.meshHeight);   
     
      this.tex.width = this.textureWidth;
      this.tex.height = this.textureHeight; 
      this.ctx.canvas.width = this.textureWidth; 
      this.ctx.canvas.height = this.textureHeight;
               
            

      //draw background
      this.ctx.fillStyle = iconstyle.backgroundColor;
      this.ctx.fillRect(0, 0, this.meshWidth, this.meshHeight);
           

      //shadow
          
      this.ctx.shadowOffsetX = iconstyle.shadowOffsetX;
      this.ctx.shadowOffsetY = iconstyle.shadowOffsetY;
      this.ctx.shadowBlur    = iconstyle.shadowBlur;
      this.ctx.shadowColor   = iconstyle.shadowColor;
      
          
              
      //load poi icon
      var image = new Image();
      var context = this.ctx;
      var canvasTextureClass = this;
      image.onload = function() 
      {
         canvasTextureClass._cbfDrawImage(context,image,iconstyle,canvasTextureClass);
      }
      image.src = imgurl;       
}




/**
 * callback function for async image load.
 * @ignore 
 */
CanvasTexture.prototype._cbfDrawImage = function(context,image,styleObject,canvasTextureClass)
{
     this.ctx.drawImage(image, styleObject.border, styleObject.border, styleObject.iconWidth, styleObject.iconHeight);
     this.ToGPU();
     
}



/**
 * Binds the texture
 * @ignore 
 */
CanvasTexture.prototype.ToGPU = function()
{
     this.gl.enable(this.gl.TEXTURE_2D);
     this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex.texture); 
     this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 0);
     this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.engine.gl.RGBA,this.gl.UNSIGNED_BYTE, this.texCanvas);
     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
   //  this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);         
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
   this.poleMesh = new Mesh(this.engine);

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
      this.mesh.Destroy();
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



//goog.exportSymbol('CanvasTexture', CanvasTexture);
//goog.exportProperty(CanvasTexture.prototype, 'SetCanvasContent', CanvasTexture.prototype.SetCanvasContent);
//goog.exportProperty(CanvasTexture.prototype, 'DrawToCanvas2D', CanvasTexture.prototype.DrawToCanvas2D);
//goog.exportProperty(CanvasTexture.prototype, 'GenerateText', CanvasTexture.prototype.GenerateText);
