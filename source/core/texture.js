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


//------------------------------------------------------------------------------
/** 
 * @class texture
 * {@link http://www.openwebglobe.org} 
 * @author Martin Christen martin.christen@fhnw.ch 
 */
function texture(engine)
{
   this.engine = engine;   // pointer to the engine
   this.gl = engine.gl;    // pointer to the gl
   this.texture = null;    // the texture
   this.ready = false;     // is true when texture is ready to use
   this.failed = false;    // is true when texture creation / download failed
} 

//------------------------------------------------------------------------------
/** 
 * Loads the Texture image.
 * @extends texture
 * 
 */
texture.prototype.loadTexture = function(url) 
{
   // preparations
   this.texture = this.gl.createTexture();
   var texture=this.texture;
   var curgl = this.gl;
   var thismat = this;
   this.texture.image = new Image();
   this.texture.image.onload = function() 
      {  
         _cbHandleLoadedTexture(curgl, texture); 
         thismat.ready = true; 
      }
   this.texture.image.src = url;
   this.texture.image.onerror = function() { failed = true; }
   return this.texture;
}

//------------------------------------------------------------------------------
/** 
 * @description Create WebGL texture object once it is available
 * @ignore
 */
function _cbHandleLoadedTexture(gl, textureobject) 
{
   // Create texture:
   gl.bindTexture(gl.TEXTURE_2D, textureobject);
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureobject.image);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
   gl.bindTexture(gl.TEXTURE_2D, null);
   
}

//------------------------------------------------------------------------------
/** 
 * Texture Binding, must be called before mesh.draw() called.
 * @extends texture
 * 
 */
texture.prototype.Enable = function()
{
   if (this.ready)
   {
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
   }
}

//------------------------------------------------------------------------------
/** 
 * Unbinds the texture
 * @extends texture
 * 
 */
texture.prototype.Disable = function()
{  
   if (this.ready)
   { 
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
   }
}

//------------------------------------------------------------------------------
/** 
 * Blit Texture: Draw texture on screen
 * @extends texture
 * 
 */
texture.prototype.Blit = function(x,y,z,angle,scalex,scaley,blend) 
{
   engine.PushMatrices();
   engine.SetOrtho2D();
   
   // draw  (w = this.texture.image.width and h = this.texture.image.height)
   
   engine.PopMatrices();
}

//------------------------------------------------------------------------------







