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
// Global Variables
//------------------------------------------------------------------------------
var vbo;                // vertexbuffer object
var ibo;                // indexbuffer object

//------------------------------------------------------------------------------
// STANDARD FONT
// This font texture has a size of 512x512 and contains 16x16s characters
var fonttexture;        
// width for each character in font
var fontwidth = new Array(0,14,28,14,14,14,14,14,14,14,96,0,14,14,0,14,14,14,14,14,14,14,14,14,14,14,14,14,14,0,0,0,0,8,8,10,16,16,25,19,5,9,9,11,16,8,9,8,8,16,16,16,16,16,16,16,16,16,16,8,8,16,16,16,16,28,19,19,20,20,19,17,22,20,8,14,19,16,23,20,22,19,22,20,19,16,20,19,28,19,18,17,8,8,8,14,16,9,15,16,14,16,15,7,16,16,6,6,14,6,24,16,15,16,16,9,14,8,16,13,19,13,13,14,9,6,9,16,8,16,0,6,16,9,28,16,16,9,29,19,9,28,0,17,0,0,6,6,9,9,10,16,28,8,28,14,9,26,0,14,19,8,8,16,16,16,16,6,16,9,21,10,16,16,9,21,15,11,15,9,9,9,16,15,9,9,9,10,16,23,23,23,17,19,19,19,19,19,19,28,20,19,19,19,19,8,8,8,8,20,20,22,22,22,22,22,16,22,20,20,20,20,19,19,17,16,16,16,16,16,16,25,14,16,16,16,16,8,8,8,8,16,16,16,16,16,16,16,15,17,16,16,16,16,14,16,14);
var charwidth = 512 / 16;
var charheight = 512 / 16;
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
var dtEnd, dtStart = new Date();
var _g_vInstances    = new Array();    // array of all current instances
var _g_nInstanceCnt  = 0;              // total number of engine instances
var _gcbfKeyDown     = null;           // global key down event
var _gcbfKeyUp       = null;           // global key up event
//------------------------------------------------------------------------------
function engine3d()
{
	// Callbacks:
	this.cbfInit = null;
	this.cbfTimer = null;
	this.cbfRender = null;
	this.cbfMouseClicked = null;
	this.cbfMouseReleased = null;
	this.cbfMouseMoved = null;
	this.cbfKeyPressed = null;
	this.cbfKeyReleased = null;
	this.cbfResize = null;
	// flags
	this.init = false;
	this.canvasid = "";
	this.context = null;
	// width / height
	this.width = 0;
	this.height = 0;
	
	this.bFullscreen = false;

    this.gl = null;          // opengl context
	this.context = null;
	
	this.shadermanager = null;
	
	this.vs_default = null; // default vertex shader
	this.fs_default = null; // default fragment shader
	this.program_default = null; // default shader program
	
	// engine instance voodoo for timer event
	_g_vInstances[_g_nInstanceCnt] = this;
   _g_nInstanceCnt++;
}


//------------------------------------------------------------------------------
engine3d.prototype._resize = function(w,h)
{
   this.width = w;
   this.height = h;
   // called on resize...
   if (this.cbfResize)
   {
      this.cbfResize(w, h);
   }
}

//------------------------------------------------------------------------------

engine3d.prototype.SetInitCallback = function(f)
{
   this.cbfInit = f;
}

//------------------------------------------------------------------------------

engine3d.prototype.SetTimerCallback = function(f)
{
   this.cbfTimer = f;
}
//------------------------------------------------------------------------------

engine3d.prototype.SetRenderCallback = function(f)
{
   this.cbfRender = f;
}

//------------------------------------------------------------------------------

engine3d.prototype.SetMouseDownCallback = function(f)
{
   this.cbfMouseDown = f;
}

//------------------------------------------------------------------------------

engine3d.prototype.SetMouseUpCallback = function(f)
{
   this.cbfMouseUp = f;
}

//------------------------------------------------------------------------------

engine3d.prototype.SetMouseMoveCallback = function(f)
{
   this.cbfMouseMove = f;
}

//------------------------------------------------------------------------------

engine3d.prototype.SetResizeCallback = function(f)
{
   this.cbfResize = f;
}

//------------------------------------------------------------------------------

engine3d.prototype.SetKeyDownCallback = function(f)
{
   _gcbfKeyDown = f;
}

//------------------------------------------------------------------------------

engine3d.prototype.SetKeyUpCallback = function(f)
{
   _gcbfKeyUp = f;
}

//------------------------------------------------------------------------------

_fncKeyDown = function(evt)
{
	if (_gcbfKeyDown)
	{
		_gcbfKeyDown(evt.keyCode); 
	}
	return;
}

//------------------------------------------------------------------------------

_fncKeyUp = function(evt)
{
	if (_gcbfKeyUp)
	{
		_gcbfKeyUp(evt.keyCode);
	}
	return;
}

//------------------------------------------------------------------------------

_fncMouseUp = function(evt)
{
   for (var i=0;i<_g_vInstances.length;i++)
   {
      if (evt.currentTarget == _g_vInstances[i].context.canvas)
      {
         if (_g_vInstances[i].cbfMouseUp)
         {
            _g_vInstances[i].cbfMouseUp(evt.button, evt.clientX, evt.clientY); // call mouse up callback function
         }
         return;
      }
   }
}
//------------------------------------------------------------------------------

_fncMouseDown = function(evt)
{
   for (var i=0;i<_g_vInstances.length;i++)
   {
      if (evt.currentTarget == _g_vInstances[i].context.canvas)
      {
         if (_g_vInstances[i].cbfMouseDown)
         {
            _g_vInstances[i].cbfMouseDown(evt.button, evt.clientX, evt.clientY); // call mouse down callback function
         }
         return;
      }
   }
}
//------------------------------------------------------------------------------

_fncMouseMove = function(evt)
{
   for (var i=0;i<_g_vInstances.length;i++)
   {
      if (evt.currentTarget == _g_vInstances[i].context.canvas)
      {
         if (_g_vInstances[i].cbfMouseMove)
         {
            _g_vInstances[i].cbfMouseMove(evt.clientX, evt.clientY); // call mouse up callback function
         }
         return;
      }
   }
}

//------------------------------------------------------------------------------

_fncResize = function(evt)
{
   for (var i=0;i<_g_vInstances.length;i++)
   {
      if (_g_vInstances[i].bFullscreen)
      {
         _g_vInstances[i].context.width = window.innerWidth-20;
         _g_vInstances[i].context.height = window.innerHeight-20;
      }
      
      _g_vInstances[i]._resize(_g_vInstances[i].context.width, _g_vInstances[i].context.height);
   }
}

//------------------------------------------------------------------------------

engine3d.prototype.CreateDefaultShaders = function()
{
   var vertexShaderSource = "          attribute vec3 aPosition;\n          attribute vec3 aNormal;\n          attribute vec2 aTexCoord;\n          varying vec3 vNormal;\n          varying vec2 vTexCoord;\n          void main()\n          {\n              gl_Position = vec4(aPosition, 1.0);\n              vTexCoord = aTexCoord;\n              vNormal = aNormal;\n          }\n";
   var fragmentShaderSource = "          #ifdef GL_ES\n          precision highp float;\n          #endif\n          varying vec3 vNormal;\n          varying vec2 vTexCoord;\n          uniform sampler2D uTexture;\n          void main()\n           {\n              gl_FragColor = texture2D(uTexture, vTexCoord);\n}\n";
  
   this.vs_default = this._createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
   this.fs_default = this._createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
   
   if (this.vs_default && this.fs_default)
   {
      // create program object
	   this.program_default = this.gl.createProgram();
	   
	   // attach our two shaders to the program
	   this.gl.attachShader(this.program_default, this.vs_default);
	   this.gl.attachShader(this.program_default, this.fs_default);
	   
	   // setup attributes
	   this.gl.bindAttribLocation(this.program_default, 0, "aPosition");
	   this.gl.bindAttribLocation(this.program_default, 1, "aNormal");
	   this.gl.bindAttribLocation(this.program_default, 2, "aTexCoord");
	   
	   // linking
	   this.gl.linkProgram(this.program_default);
	   if (!this.gl.getProgramParameter(this.program_default, this.gl.LINK_STATUS)) 
	   {
	       alert(this.gl.getProgramInfoLog(this.program_default));
	       return;
	   }
   }
}

//------------------------------------------------------------------------------

engine3d.prototype.UseShaderDefault = function()
{
	if (this.vs_default && this.fs_default)
	{
		this.gl.useProgram(this.program_default);
      this.gl.uniform1i(this.gl.getUniformLocation(this.program_default, "uTexture"), 0);
	}
}

//------------------------------------------------------------------------------

engine3d.prototype.InitEngine = function(canvasid, bFullscreen) 
{ 
   var canvas = document.getElementById(canvasid);
   this.context = canvas;
   
   if (bFullscreen)
   {
         canvas.width = window.innerWidth-20;
         canvas.height = window.innerHeight-20;
         this.bFullscreen = true;
   }
  
   var names = [ "webgl", "experimental-webgl", "moz-webgl", "webkit-3d" ];
   for (var i=0; names.length>i; i++) 
   {
      try 
      { 
         this.gl = canvas.getContext(names[i]);
         if (this.gl) 
         { 
            break; 
         }
      } 
      catch (e) 
      {
      }
   }
   if (!this.gl) 
   {
      alert("Can't find webgl context. It seems your browser is not compatible! For example, you can get the latest Firefoxor Chrome");
      return;
   }
   
   // Call OnResize(canvas.width, canvas.height)
   this._resize(this.context.width, this.context.height);
   
   // basic settings
   this.gl.clearColor(0, 0, 0, 1);
   this.gl.enable(this.gl.DEPTH_TEST);
   
   this.gl.frontFace(this.gl.CCW);
   this.gl.cullFace(this.gl.FRONT_AND_BACK);
   
   // Create Default Shaders
   //this.CreateDefaultShaders();
   //this.UseShaderDefault();
   
   //Init Shaders
   this.shadermanager = new ShaderManager(this.gl);
   this.shadermanager.InitShaders();
   
   // call init callback 
   this.cbfInit();
   
   canvas.addEventListener("mousedown", _fncMouseDown, false);
   canvas.addEventListener("mouseup", _fncMouseUp, false);
   canvas.addEventListener("mousemove", _fncMouseMove, false);
   window.addEventListener("resize", _fncResize, false);
   window.addEventListener("keydown", _fncKeyDown, false);
   window.addEventListener("keyup", _fncKeyUp, false);
   
   
   // draw scene every 30 milliseconds
   dtStart = new Date(); // setup main timer...
   setInterval(fncTimer, 30);
  
}

//------------------------------------------------------------------------------

rotation = 0;

function fncTimer()
{
   dtEnd = new Date();
   var nMSeconds = dtEnd.valueOf() - dtStart.valueOf();
   dtStart = dtEnd;

   for (var i=0;i<_g_vInstances.length;i++)
   {

		//---------------------------------------------------------------------
		if (_g_vInstances[i].cbfTimer)
      {
         _g_vInstances[i].cbfTimer(nMSeconds);
      }
	  
      _g_vInstances[i].gl.activeTexture(_g_vInstances[i].gl.TEXTURE0);
      _g_vInstances[i].gl.bindTexture(_g_vInstances[i].gl.TEXTURE_2D, fonttexture);
      
      
      
      // draw callback:
      if (_g_vInstances[i].cbfRender)
      {
         _g_vInstances[i].cbfRender(); // call  draw callback function
      }
   }
}

//------------------------------------------------------------------------------

engine3d.prototype.SetClearColor = function(r,g,b,a)
{
   if (r>=0 && r<=1 && g>=0 && g<=1 && b>=0 && b<=1 && a>=0 && a<=1)
   {
      this.gl.clearColor(r, g, b, a);
   }
}

//------------------------------------------------------------------------------

engine3d.prototype._getShaderSource = function(id) 
{
   var script = document.getElementById(id);
   if (!script) { return null; }

   var source = "";
   var child = script.firstChild;
   while (child) 
   {
      // node is a "textnode" ?
      if (child.nodeType == 3) 
      {
         source += child.textContent;
      }
      child = child.nextSibling;
   }
   return source;
}

//------------------------------------------------------------------------------

engine3d.prototype._createShader = function(shaderType, shaderSource) 
{
   var shader = this.gl.createShader(shaderType);
   if (!shader) { return null; }    
   this.gl.shaderSource(shader, shaderSource);
   this.gl.compileShader(shader);

   if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) 
   {
      alert(this.gl.getShaderInfoLog(shader));
      return null;
   }    

   return shader;
}

//------------------------------------------------------------------------------

function _handleLoadedTexture(gl, texture) 
{
   gl.bindTexture(gl.TEXTURE_2D, texture);
   //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
   gl.bindTexture(gl.TEXTURE_2D, null);
}

//------------------------------------------------------------------------------

engine3d.prototype.loadTexture = function(filename) 
{
   // preparations
   var texture = this.gl.createTexture();
   var curgl = this.gl;
   texture.image = new Image();
   texture.image.onload = function() { _handleLoadedTexture(curgl, texture); }
   texture.image.src = filename;
   /*texture.image.onerror = function() 
      {
      alert("error while loading image '"+filename+"'.");
   }*/

   return texture;
}

//------------------------------------------------------------------------------
// a default font texture is embedded. This way the engine doesn't need a special
// artwork directory.
engine3d.prototype._loadFontTexture = function() 
{
   var texture = this.gl.createTexture();
   var curgl = this.gl;
   texture.image = new Image();
   texture.image.onload = function() { _handleLoadedTexture(curgl, texture); }
   texture.image.src = "data:image/png;base64,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";

   return texture; 
}




