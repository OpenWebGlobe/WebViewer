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
.......This engine is based on Algos3D Engine created by Martin Christen........
................................................................................

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
// Initialize the shader manager with gl context
//
// Every Vertex Semantic has its shader:
//
//    P: Position only.
//    PNT: Position, Normal, Texcoord
//    PC:  Position, Color
//    PT:  Position, Texcoord
//    PNCT: Position, Normal, Color, Texcoord
//
//------------------------------------------------------------------------------

function ShaderManager(gl)
{
   this.gl = gl;
   this.init = false;
   
   // Position-only shader:
   this.program_p = null;
   this.vs_p = null;
   this.fs_p;
}

//------------------------------------------------------------------------------

//ShaderManager.prototype.UseShader_P = function(mat4 modelviewprojection, vec4 color)
//{
//}

//------------------------------------------------------------------------------

ShaderManager.prototype.InitShader_P = function()
{
   var vertexShaderSource = "          attribute vec3 aPosition;\n          varying vec3 vNormal;\n          varying vec2 vTexCoord;\n          void main()\n          {\n              gl_Position = vec4(aPosition, 1.0);\n              vTexCoord = aTexCoord;\n              vNormal = aNormal;\n          }\n";
   var fragmentShaderSource = "          #ifdef GL_ES\n          precision highp float;\n          #endif\n          varying vec3 vNormal;\n          varying vec2 vTexCoord;\n          uniform sampler2D uTexture;\n          void main()\n           {\n              gl_FragColor = texture2D(uTexture, vTexCoord);\n}\n";
  
   this.vs_p = this._createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
   this.fs_p = this._createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
   
   if (this.vs_default && this.fs_default)
   {
      // create program object
      this.program_p = this.gl.createProgram();
      
      // attach our two shaders to the program
      this.gl.attachShader(this.program_p, this.vs_p);
      this.gl.attachShader(this.program_p, this.fs_p);
      
      // setup attributes
      this.gl.bindAttribLocation(this.program_p, 0, "aPosition");
      //this.gl.bindAttribLocation(this.program_default, 1, "aNormal");
      //this.gl.bindAttribLocation(this.program_default, 2, "aTexCoord");
      //this.gl.bindAttribLocation(this.program_default, 3, "aColor");
      
      // linking
      this.gl.linkProgram(this.program_p);
      if (!this.gl.getProgramParameter(this.program_p, this.gl.LINK_STATUS)) 
      {
          alert(this.gl.getProgramInfoLog(this.program_p));
          return;
      }
   }
}

//------------------------------------------------------------------------------

ShaderManager.prototype.InitShader_PNT = function()
{
}

//------------------------------------------------------------------------------

ShaderManager.prototype.InitShader_PC = function()
{
}

//------------------------------------------------------------------------------

ShaderManager.prototype.InitShader_PT = function()
{
  
} 

//------------------------------------------------------------------------------

ShaderManager.prototype.InitShader_PNCT = function()
{
   
} 

//------------------------------------------------------------------------------

ShaderManager.prototype.InitShaders = function()
{
   this.init = true;
   // compile and link all shaders
   InitShader_P();
   InitShader_PNT();
   InitShader_PC();
   InitShader_PT();
   InitShader_PNCT();
} 

//------------------------------------------------------------------------------

ShaderManager.prototype._createShader = function(shaderType, shaderSource) 
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


