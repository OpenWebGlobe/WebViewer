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
#                           martin.christen@fhnw.ch                            #
********************************************************************************

This file is part of the OpenWebGlobe SDK

GPL LICENSE

i3D OpenWebGlobe SDK is free software: you can redistribute it and/or modify  it
under the  terms of  the GNU  General Public  License as  published by  the Free
Software Foundation, either version  2 of the License,  or (at your option)  any
later version.

i3D OpenWebGlobe  SDK is  distributed in  the hope  that it  will be useful, but
WITHOUT ANY WARRANTY;  without even the  implied warranty of  MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See  the GNU General Public License for  more
details.

You should have received a copy of the GNU General Public License along with i3D
OpenWebGlobe SDK.  If not, see <http://www.gnu.org/licenses/>.

As a special  exception to the  GPL, any HTML  file which merely  makes function
calls to  this code,  and for  that purpose  includes it  by reference, shall be
deemed a separate work for copyright law purposes. If you modify this code,  you
may extend this exception to your version of the code, but you are not obligated
to do so. If you do not wish to do so, delete this exception statement from your
version.

Commercial License

OEMs (Original  Equipment Manufacturers),  ISVs (Independent  Software Vendors),
VARs (Value Added Resellers) and other distributors that combine and  distribute
commercially licensed  software with  i3D OpenWebGlobe  SDK and  do not  wish to
distribute the source code for the commercially licensed software under  version
2 of the  GNU General Public  License (the "GPL")  must enter into  a commercial
license agreement with the Institute of Geomatics Engineering at the  University
of Applied Sciences Northwestern Switzerland (FHNW).
*******************************************************************************/


/*
 * @description array with fontwidth value example: width of char 'A' = fontwidth[65];
 */
var fontwidth = new Array(14,28,14,14,14,14,14,14,14,96,0,14,14,0,14,14,14,14,14,14,14,14,14,14,14,14,14,14,0,0,0,0,8,8,10,16,16,25,19,5,9,9,11,16,8,9,8,8,16,16,16,16,16,16,16,16,16,16,8,8,16,16,16,16,28,19,19,20,20,19,17,22,20,8,14,19,16,23,20,22,19,22,20,19,16,20,19,28,19,18,17,8,8,8,14,16,9,15,16,14,16,15,7,16,16,6,6,14,6,24,16,15,16,16,9,14,8,16,13,19,13,13,14,9,6,9,16,8,16,0,6,16,9,28,16,16,9,29,19,9,28,0,17,0,0,6,6,9,9,10,16,28,8,28,14,9,26,0,14,19,8,8,16,16,16,16,6,16,9,21,10,16,16,9,21,15,11,15,9,9,9,16,15,9,9,9,10,16,23,23,23,17,19,19,19,19,19,19,28,20,19,19,19,19,8,8,8,8,20,20,22,22,22,22,22,16,22,20,20,20,20,19,19,17,16,16,16,16,16,16,25,14,16,16,16,16,8,8,8,8,16,16,16,16,16,16,16,15,17,16,16,16,16,14,16,14);

//------------------------------------------------------------------------------
/** 
 * @class font
 * {@link http://www.openwebglobe.org} 
 * @author Martin Christen martin.christen@fhnw.ch
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch
 */
function Font(engine)
{
   this.engine = engine;
   this.gl = engine.gl;
   this.GenerateFontMesh();
      
   this.model = new mat4();
   this.strLengthInPixel=0;
}

//------------------------------------------------------------------------------
/**
 * @description Shows the text at position x,y,
 * @param {x} x x position of text
 * @param {y} y y position of text
 */
Font.prototype.DrawText = function(text,x,y,scale)
{
      if(scale == null)
      {
         var scale = 1.0;
      }

      this.engine.PushMatrices();
      this.engine.SetOrtho2D();
      
      this.engine.gl.enable(this.engine.gl.BLEND);
      this.engine.gl.enable(this.engine.gl.ALPHA_TEST);
      //this.engine.gl.disable(this.engine.gl.DEPTH_TEST);
      this.engine.gl.disable(this.engine.gl.DEPTH_TEST);
      this.engine.gl.depthFunc(this.engine.gl.LEQUAL);
      this.engine.gl.blendFunc(this.engine.gl.SRC_ALPHA,this.engine.gl.ONE);

      
      var startX=x;
      var model = new mat4();
      
      var ccode = 0;
      var a = 0;
    
      for (var i=0; i < text.length; i++)
      {
         
         ccode = text.charCodeAt(i);
         a += (fontwidth[ccode]/2)*scale;
         model.Scale(scale,scale,1);
         model.OverwriteTranslation(model,x+a,y,0)
         this.engine.SetModelMatrix(model)
         this.fontmesh.Draw(true,6,ccode*12);
         a += (fontwidth[ccode]/2)*scale;   
      }
      
      engine.PopMatrices();

      this.engine.gl.disable(this.engine.gl.BLEND);
      //this.engine.gl.enable(this.engine.gl.DEPTH_TEST);
     
      this.strLengthInPixel = x-startX;
}

//------------------------------------------------------------------------------
/**
 * @description gets the length of text in pixel
 * @param {x} x x position of text
 * @param {y} y y position of text
 * @return length in pixel
 */
Font.prototype.GetStringWidth = function()
{
   return this.strLengthInPixel;
   
}
//------------------------------------------------------------------------------
/**
 * @description gets the height of text in pixel
 * @return height in pixel (32)
 */
Font.prototype.GetStringHeight = function()
{
   return 32;
   
}


Font.prototype.GenerateFontMesh = function()
{
   var b = 0;
   var a = 0;
   this.fontmesh = new Mesh(engine);     
   var pt = new Array();
   var index = new Array();

   for(var row=0; row < 16; row++)
   {
      for(var col=0; col < 16; col++)
      {
        texcoor_row = row * 1/16;
        texcoor_col = col * 1/16;
                
        pt.push(0, 31,  0, texcoor_col, texcoor_row+(1/512));
        pt.push(0,  0,  0, texcoor_col, (texcoor_row+1/16)); 
        pt.push(31,  0,  0, (texcoor_col+1/16), (texcoor_row+1/16));
        pt.push( 31, 31,  0, (texcoor_col+1/16), texcoor_row+(1/512));
   
        b = a * 4;
        
        index.push(b,(b+1),(b+2),(b),(b+2),(b+3));
        a++;
      }  
   } 
     
   this.fontmesh.SetBufferFont(pt);
   this.fontmesh.SetIndexBuffer(index,"TRIANGLES");
   
   
   var tex = new texture(this.engine);
   tex.LoadFontTexture();
   this.fontmesh.SetTexture(tex); 
}








