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

goog.provide('owg.Font');

goog.require('owg.Surface');
goog.require('owg.Texture');
goog.require('owg.mat4');

/**
 * @description array with fontwidth value example: width of char 'A' = fontwidth[65];
 * @type Array.<number>
 */
var fontwidth = new Array(14,28,14,14,14,14,14,14,14,96,0,14,14,0,14,14,14,14,14,14,14,14,14,14,14,14,14,14,0,0,0,0,8,8,10,16,16,25,19,5,9,9,11,16,8,9,8,8,16,16,16,16,16,16,16,16,16,16,8,8,16,16,16,16,28,19,19,20,20,19,17,22,20,8,14,19,16,23,20,22,19,22,20,19,16,20,19,28,19,18,17,8,8,8,14,16,9,15,16,14,16,15,7,16,16,6,6,14,6,24,16,15,16,16,9,14,8,16,13,19,13,13,14,9,6,9,16,8,16,0,6,16,9,28,16,16,9,29,19,9,28,0,17,0,0,6,6,9,9,10,16,28,8,28,14,9,26,0,14,19,8,8,16,16,16,16,6,16,9,21,10,16,16,9,21,15,11,15,9,9,9,16,15,9,9,9,10,16,23,23,23,17,19,19,19,19,19,19,28,20,19,19,19,19,8,8,8,8,20,20,22,22,22,22,22,16,22,20,20,20,20,19,19,17,16,16,16,16,16,16,25,14,16,16,16,16,8,8,8,8,16,16,16,16,16,16,16,15,17,16,16,16,16,14,16,14);

//------------------------------------------------------------------------------
/** 
 * @class font
 * @constructor
 * {@link http://www.openwebglobe.org} 
 * @author Martin Christen martin.christen@fhnw.ch
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch
 */
function Font(engine)
{
   /** @type {engine3d} */
   this.engine = engine;
   /** @type {WebGLRenderingContext} */
   this.gl = engine.gl;
   
   this.GenerateFontMesh();
   
   /** @type {mat4} */
   this.model = new mat4();
   /** @type {number} */
   this.strLengthInPixel=0;
}

//------------------------------------------------------------------------------
/**
 * @description Shows the text at position x,y,
 * @param {string} text
 * @param {number} x x position of text
 * @param {number} y y position of text
 * @param {?number=} scale
 * @param {?vec4=} fontcolor
 *  
 */
Font.prototype.DrawText = function(text,x,y,scale,fontcolor)
{
      if(scale == null)
      {
         scale = 1.0;
      }

      this.engine.PushMatrices();
      this.engine.SetOrtho2D();
      
      this.engine.gl.enable(this.engine.gl.BLEND);
      //this.engine.gl.enable(this.engine.gl.ALPHA_TEST);
      //this.engine.gl.disable(this.engine.gl.DEPTH_TEST);
      this.engine.gl.depthFunc(this.engine.gl.LEQUAL);
      this.engine.gl.blendFunc(this.engine.gl.SRC_ALPHA,this.engine.gl.ONE_MINUS_SRC_ALPHA);

      
      var startX=x;
      var model = new mat4();
      
      var ccode = 0;
      var a = 0;
    
      for (var i=0; i < text.length; i++)
      {
         
         ccode = text.charCodeAt(i);
         a += (fontwidth[ccode]/2)*scale;
         model.Scale(scale,scale,1);
         model.OverwriteTranslation(x+a,y,0);
         this.engine.SetModelMatrix(model);
         this.fontmesh.Draw(true,6,ccode*12,fontcolor);
         a += (fontwidth[ccode]/2)*scale;   
      }
      
      this.engine.PopMatrices();

      this.engine.gl.disable(this.engine.gl.BLEND);
      //this.engine.gl.disable(this.engine.gl.ALPHA_TEST);
      //this.engine.gl.enable(this.engine.gl.DEPTH_TEST);
     
      this.strLengthInPixel = x-startX;
}

//------------------------------------------------------------------------------
/**
 * @description gets the length of text in pixel
 * @param {string} text
 * @return length in pixel
 */
Font.prototype.GetStringWidth = function(text)
{
     var a = 0;
     for (var i=0; i < text.length; i++)
      {        
         var ccode = text.charCodeAt(i);
         a += (fontwidth[ccode]); 
      }
      
     return a;
   
}
//------------------------------------------------------------------------------
/**
 * @description gets the height of text in pixel
 * @return {number} height in pixel (32)
 */
Font.prototype.GetStringHeight = function()
{
   return 32;
}

/**
 * @description Generates the font mesh
 * @ignore
 */
Font.prototype.GenerateFontMesh = function()
{
   var b = 0;
   var a = 0;
   this.fontmesh = new Surface(this.engine);     
   var pt = new Array();
   var index = new Array();

   for(var row=0; row < 16; row++)
   {
      for(var col=0; col < 16; col++)
      {
        var texcoor_row = row * 0.0625;
        var texcoor_col = col * 0.0625;
                
        pt.push(0, 31,  0, texcoor_col, texcoor_row+(0.001953125)); // 1/512
        pt.push(0,  0,  0, texcoor_col, (texcoor_row+0.0625));
        pt.push(31,  0,  0, (texcoor_col+0.0625), (texcoor_row+0.0625));
        pt.push( 31, 31,  0, (texcoor_col+0.0625), texcoor_row+(0.001953125));
   
        b = a * 4;
        
        index.push(b,(b+1),(b+2),(b),(b+2),(b+3));
        a++;
      }  
   } 
     
   this.fontmesh.SetBufferFont(pt);
   this.fontmesh.SetIndexBuffer(index,"TRIANGLES");
   
   
   var tex = new Texture(this.engine);
   tex.LoadFontTexture();
   this.fontmesh.SetTexture(tex); 
}

goog.exportSymbol('Font', Font);
goog.exportProperty(Font.prototype, 'DrawText', Font.prototype.DrawText);
goog.exportProperty(Font.prototype, 'GetStringHeight', Font.prototype.GetStringHeight);
goog.exportProperty(Font.prototype, 'GetStringWidth', Font.prototype.GetStringWidth);
