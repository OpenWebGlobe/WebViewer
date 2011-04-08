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
This file is part of i3D OpenWebGlobe SDK.

Copyright (c) 2011 FHNW (Institute of Geomatics Engineering)

Permission is hereby granted, free of charge, to any person obtaining a copy  of
this software and  associated documentation files  (the "Software"), to  deal in
the Software  without restriction,  including without  limitation the  rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do  so,
subject to the following conditions:

The above copyright notice and this  permission notice shall be included in  all
copies or substantial portions of the Software.

THE SOFTWARE  IS PROVIDED  "AS IS",  WITHOUT WARRANTY  OF ANY  KIND, EXPRESS  OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE AUTHORS  OR
COPYRIGHT HOLDERS BE LIABLE FOR  ANY CLAIM, DAMAGES OR OTHER  LIABILITY, WHETHER
IN  AN  ACTION OF  CONTRACT,  TORT OR  OTHERWISE,  ARISING FROM,  OUT  OF OR  IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*******************************************************************************/


/** 
 * @fileoverview material.js
 * @class Texture handling class.
 * 
 * {@link http://www.openwebglobe.org} 
 * 
 * @version 0.1  
 */
function material(engine)
{
   this.engine = engine;
   this.gl = engine.gl;
   this.texture = null;
} 

/** 
 * Loads the Texture image.
 * @extends material
 * 
 * {@link http://www.openwebglobe.org} 
 * 
 * @version 0.1  
 */
material.prototype.loadTexture = function(url) 
{
   // preparations
   this.texture = this.gl.createTexture();
   var texture=this.texture;
   var curgl = this.gl;
   this.texture.image = new Image();
   this.texture.image.onload = function() { _cbHandleLoadedTexture(curgl, texture); }
   this.texture.image.src = url;
   /*texture.image.onerror = function() 
      {
      alert("error while loading image '"+filename+"'.");
   }*/

   return this.texture;
}

/** 
 * Internal callback function
 * 
 */
function _cbHandleLoadedTexture(gl, texture) 
{
   gl.bindTexture(gl.TEXTURE_2D, texture);
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
   gl.bindTexture(gl.TEXTURE_2D, null);
}

/** 
 * Texture Binding, must be called before mesh.draw() called.
 * @extends material
 * 
 */
material.prototype.UseTexture = function()
{
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    
}

/** 
 * Unbinds the texture
 * @extends material
 * 
 */
material.prototype.DisableTexture = function()
{   
   gl.bindTexture(gl.TEXTURE_2D, null);
}







