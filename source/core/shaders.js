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

goog.provide('owg.ShaderManager');

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

/**
 * Create a new ShaderManager
 * @class ShaderManager
 * @param {WebGLRenderingContext} gl the webGL context.
 * 
 * @author Martin Christen martin.christen@fhnw.ch 
 * @constructor
 */
function ShaderManager(gl)
{
   /** @type {WebGLRenderingContext} */
   this.gl = gl;
   /** @type {boolean} */
   this.init = false;
   
   // P: Position-only shader:
   /** @type {WebGLProgram} */
   this.program_p = null;
   /** @type {WebGLShader} */
   this.vs_p = null;
   /** @type {WebGLShader} */
   this.fs_p = null;
   
   // PNT:
   /** @type {WebGLProgram} */
   this.program_pnt = null;
   /** @type {WebGLShader} */
   this.vs_pnt = null;
   /** @type {WebGLShader} */
   this.fs_pnt = null;
   
   // PC:
   /** @type {WebGLProgram} */
   this.program_pc = null;
   /** @type {WebGLShader} */
   this.vs_pc = null;
   /** @type {WebGLShader} */
   this.fs_pc = null;
   
   // PT:
   /** @type {WebGLProgram} */
   this.program_pt = null;
   /** @type {WebGLShader} */
   this.vs_pt = null;
   /** @type {WebGLShader} */
   this.fs_pt = null;
   
   // PNCT:
   /** @type {WebGLProgram} */
   this.program_pnct = null;
   /** @type {WebGLShader} */
   this.vs_pnct = null;
   /** @type {WebGLShader} */
   this.fs_pnct = null;  
   
   //Font
   /** @type {WebGLProgram} */
   this.program_font = null;
   /** @type {WebGLShader} */
   this.vs_font = null;
   /** @type {WebGLShader} */
   this.fs_font = null;
   
   //Poi
   /** @type WebGLProgram */
   this.program_poi = null;
   /** @type WebGLShader */
   this.vs_poi = null;
   /** @type WebGLShader */
   this.fs_poi = null;
}


/**
 *  
 * @param {mat4} modelviewprojection
 * @param {vec4} color
 */
ShaderManager.prototype.UseShader_P = function(modelviewprojection,color)
{
   if (this.vs_p && this.fs_p)
   {
      this.gl.useProgram(this.program_p);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_p, "matMVP"),false,modelviewprojection.Get());
      this.gl.uniform4fv(this.gl.getUniformLocation(this.program_p, "uColor"), color.Get());
   }   
}

/**
 *  
 * @param {mat4} modelviewprojection
 */
ShaderManager.prototype.UseShader_PNT = function(modelviewprojection)
{
   if (this.program_pnt)
   {
      this.gl.useProgram(this.program_pnt);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pnt, "matMVP"), false, modelviewprojection.Get());
      this.gl.uniform1i(this.gl.getUniformLocation(this.program_pnt, "uTexture"),0);
   }   
}

/**
 *  
 * @param {mat4} modelviewprojection
 */
ShaderManager.prototype.UseShader_PC = function(modelviewprojection)
{
   if (this.program_pc)
   {
      this.gl.useProgram(this.program_pc);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pc, "matMVP"), false, modelviewprojection.Get());
   }    
}

/**
 *  
 * @param {mat4} modelviewprojection
 */
ShaderManager.prototype.UseShader_PT = function(modelviewprojection)
{
   if (this.program_pt)
   {
      this.gl.useProgram(this.program_pt);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pt, "matMVP"), false, modelviewprojection.Get());
      this.gl.uniform1i(this.gl.getUniformLocation(this.program_pt, "uTexture"), 0);   
   }    
}

/**
 *  
 * @param {mat4} modelviewprojection
 */
ShaderManager.prototype.UseShader_PNCT = function(modelviewprojection)
{
   if (this.program_pnct)
   {
      this.gl.useProgram(this.program_pnct);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pnct, "matMVP"), false, modelviewprojection.Get());
   }    
}

/**
 *  
 * @param {mat4} modelviewprojection
 */
ShaderManager.prototype.UseShader_Font = function(modelviewprojection, fontcolor)
{
   if (this.program_font)
   {
      this.gl.useProgram(this.program_font);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_font, "matMVP"),false,modelviewprojection.Get());
      this.gl.uniform4fv(this.gl.getUniformLocation(this.program_font, "uColor"), fontcolor.Get());  
   }    
}

/** 
 * @param {mat4} modelviewprojection
 * @param {vec4} color
 */
ShaderManager.prototype.UseShader_Poi = function(modelviewprojection, color)
{
   if (this.program_poi)
   {
      this.gl.useProgram(this.program_poi);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_poi, "matMVP"),false,modelviewprojection.Get());
      this.gl.uniform4fv(this.gl.getUniformLocation(this.program_poi, "uColor"), color.Get());  
   }    
}


/**
 *  Initializes the point shader 
 *  internal use
 * 
 */
ShaderManager.prototype.InitShader_P = function()
{
   var src_vertexshader_P= "uniform mat4 matMVP;\nattribute vec3 aPosition;\n\nvoid main()\n{\n   gl_Position = matMVP * vec4(aPosition,1.0);\n}\n";
   var src_fragmentshader_P= "#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec4 uColor;\n\nvoid main()\n{\n   gl_FragColor = uColor;\n}";
   
   this.vs_p = this._createShader(this.gl.VERTEX_SHADER, src_vertexshader_P);
   this.fs_p = this._createShader(this.gl.FRAGMENT_SHADER, src_fragmentshader_P);
   
   if (this.vs_p && this.fs_p)
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
          alert("Shader Link: " + this.gl.getProgramInfoLog(this.program_p));
          return;
      }
   }
   
}

/**
 *  Initializes the point,normal, texture shader 
 *  internal use
 */
ShaderManager.prototype.InitShader_PNT = function()
{
   var src_vertexshader_PNT= "uniform mat4 matMVP;\nattribute vec3 aPosition;\nattribute vec3 aNormal;\nattribute vec2 aTexCoord;\nvarying vec3 vNormal;\nvarying vec2 vTexCoord;\n\nvoid main()\n{\n   gl_Position = matMVP * vec4(aPosition,1.0);\n   vTexCoord = aTexCoord;\n   vNormal = aNormal;\n}\n";
   var src_fragmentshader_PNT= "#ifdef GL_ES\nprecision highp float;\n#endif\n\nvarying vec3 vNormal;\nvarying vec2 vTexCoord;\nuniform sampler2D uTexture;\n\nvoid main()\n{\n   gl_FragColor = abs(vec4(vNormal.x, vNormal.y, vNormal.z, 1.0));\n}\n\n";
   
  
  
   this.vs_pnt = this._createShader(this.gl.VERTEX_SHADER, src_vertexshader_PNT);
   this.fs_pnt = this._createShader(this.gl.FRAGMENT_SHADER, src_fragmentshader_PNT);
   
   if (this.vs_pnt && this.fs_pnt)
   {
      // create program object
      this.program_pnt = this.gl.createProgram();
      
      // attach our two shaders to the program
      this.gl.attachShader(this.program_pnt, this.vs_pnt);
      this.gl.attachShader(this.program_pnt, this.fs_pnt);
      
      // setup attributes
      this.gl.bindAttribLocation(this.program_pnt, 0, "aPosition"); 
      this.gl.bindAttribLocation(this.program_pnt, 1, "aNormal");
      this.gl.bindAttribLocation(this.program_pnt, 2, "aTexCoord");
      //this.gl.bindAttribLocation(this.program_default, 3, "aColor");
      
      // linking
      this.gl.linkProgram(this.program_pnt);
      if (!this.gl.getProgramParameter(this.program_pnt, this.gl.LINK_STATUS)) 
      {
          alert(this.gl.getProgramInfoLog(this.program_pnt));
          return;
      }
   }
}

/**
 *  Initializes the point,color shader 
 *  internal use
 */
ShaderManager.prototype.InitShader_PC = function()
{
   var src_vertexshader_PC= "uniform mat4 matMVP;\nattribute vec3 aPosition;\nattribute vec4 aColor;\nvarying vec4 vColor;\n\nvoid main()\n{\n   gl_Position = matMVP * vec4(aPosition, 1.0);\n   vColor = aColor;\n}\n";
   var src_fragmentshader_PC= "#ifdef GL_ES\nprecision highp float;\n#endif\n\nvarying vec4 vColor;\n\nvoid main()\n{\n   gl_FragColor = vColor;\n}\n\n";
  
   this.vs_pc = this._createShader(this.gl.VERTEX_SHADER, src_vertexshader_PC);
   this.fs_pc = this._createShader(this.gl.FRAGMENT_SHADER, src_fragmentshader_PC);
   
   if (this.vs_pc && this.fs_pc)
   {
      // create program object
      this.program_pc = this.gl.createProgram();
      
      // attach our two shaders to the program
      this.gl.attachShader(this.program_pc, this.vs_pc);
      this.gl.attachShader(this.program_pc, this.fs_pc);
      
      // setup attributes
      this.gl.bindAttribLocation(this.program_pc, 0, "aPosition"); 
      this.gl.bindAttribLocation(this.program_pc, 1, "aColor");
      //this.gl.bindAttribLocation(this.program_pc, 2, "aTexCoord");
      //this.gl.bindAttribLocation(this.program_default, 3, "aColor");
      
      // linking
      this.gl.linkProgram(this.program_pc);
      if (!this.gl.getProgramParameter(this.program_pc, this.gl.LINK_STATUS)) 
      {
          alert(this.gl.getProgramInfoLog(this.program_pc));
          return;
      }
   }
}

/**
 *  Initializes the point,texture
 *  internal use
 */
ShaderManager.prototype.InitShader_PT = function()
{
   var src_vertexshader_PT= "uniform mat4 matMVP;\nattribute vec3 aPosition;\nattribute vec2 aTexCoord;\nvarying vec2 vTexCoord;\n\nvoid main()\n{\n   gl_Position = matMVP * vec4(aPosition,1.0);\n   vTexCoord = aTexCoord;\n}\n";
   var src_fragmentshader_PT= "#ifdef GL_ES\nprecision highp float;\n#endif\n\nvarying vec2 vTexCoord;\nuniform sampler2D uTexture;\n\nvoid main()\n{\n   gl_FragColor = texture2D(uTexture, vTexCoord);\n}\n\n";
  
   this.vs_pt = this._createShader(this.gl.VERTEX_SHADER, src_vertexshader_PT);
   this.fs_pt = this._createShader(this.gl.FRAGMENT_SHADER, src_fragmentshader_PT);
   
   if (this.vs_pt && this.fs_pt)
   {
      // create program object
      this.program_pt = this.gl.createProgram();
      
      // attach our two shaders to the program
      this.gl.attachShader(this.program_pt, this.vs_pt);
      this.gl.attachShader(this.program_pt, this.fs_pt);
      
      // setup attributes
      this.gl.bindAttribLocation(this.program_pt, 0, "aPosition"); 
      this.gl.bindAttribLocation(this.program_pt, 1, "aTexCoord");

      
      // linking
      this.gl.linkProgram(this.program_pt);
      if (!this.gl.getProgramParameter(this.program_pt, this.gl.LINK_STATUS)) 
      {
          alert(this.gl.getProgramInfoLog(this.program_pt));
          return;
      }
   }
  
} 

/**
 *  Initializes the point,normal,color,texture shader 
 *  internal use
 */
ShaderManager.prototype.InitShader_PNCT = function()
{
   var src_vertexshader_PNCT= "uniform mat4 matMVP;\nattribute vec3 aPosition;\nattribute vec3 aNormal;\nattribute vec2 aTexCoord;\nattribute vec4 aColor;\nvarying vec3 vNormal;\nvarying vec2 vTexCoord;\nvarying vec4 vColor;\n\nvoid main()\n{\n   gl_Position = gl_Position = matMVP * vec4(aPosition,1.0);\n   vTexCoord = aTexCoord;\n   vNormal = aNormal;\n   vColor = aColor;\n}\n";
   var src_fragmentshader_PNCT= "#ifdef GL_ES\nprecision highp float;\n#endif\n\nvarying vec3 vNormal;\nvarying vec2 vTexCoord;\nvarying vec4 vColor;\nuniform sampler2D uTexture;\n\nvoid main()\n{\n   gl_FragColor = vColor * texture2D(uTexture, vTexCoord);\n}\n\n";
  
   this.vs_pnct = this._createShader(this.gl.VERTEX_SHADER, src_vertexshader_PNCT);
   this.fs_pnct = this._createShader(this.gl.FRAGMENT_SHADER, src_fragmentshader_PNCT);
   
   if (this.vs_pnct && this.fs_pnct)
   {
      // create program object
      this.program_pnct = this.gl.createProgram();
      
      // attach our two shaders to the program
      this.gl.attachShader(this.program_pnct, this.vs_pnct);
      this.gl.attachShader(this.program_pnct, this.fs_pnct);
      
      // setup attributes
      this.gl.bindAttribLocation(this.program_pnct, 0, "aPosition"); 
      this.gl.bindAttribLocation(this.program_pnct, 1, "aNormal");
      this.gl.bindAttribLocation(this.program_pnct, 2, "aTexCoord");
      this.gl.bindAttribLocation(this.program_pnct, 3, "aColor");
      
      // linking
      this.gl.linkProgram(this.program_pnct);
      if (!this.gl.getProgramParameter(this.program_pnct, this.gl.LINK_STATUS)) 
      {
          alert(this.gl.getProgramInfoLog(this.program_pnct));
          return;
      }
   }
   
} 


/**
 *  Initializes the font shader
 *  internal use
 */
ShaderManager.prototype.InitShader_Font = function()
{
   var src_vertexshader_Font= "uniform mat4 matMVP;\nattribute vec3 aPosition;\nattribute vec2 aTexCoord;\nvarying vec2 vTexCoord;\n\nvoid main()\n{\n   gl_Position = matMVP * vec4(aPosition,1.0);\n   vTexCoord = aTexCoord;\n}\n";
   var src_fragmentshader_Font= "#ifdef GL_ES\nprecision highp float;\n#endif\n\nvarying vec2 vTexCoord;\nuniform sampler2D uTexture;\n\n\nuniform vec4 uColor;\nvoid main()\n{\n   gl_FragColor = uColor*texture2D(uTexture, vTexCoord);\n}\n\n";
 
   this.vs_font = this._createShader(this.gl.VERTEX_SHADER, src_vertexshader_Font);
   this.fs_font = this._createShader(this.gl.FRAGMENT_SHADER, src_fragmentshader_Font);
   
   if (this.vs_font && this.fs_font)
   {
      // create program object
      this.program_font = this.gl.createProgram();
      
      // attach our two shaders to the program
      this.gl.attachShader(this.program_font, this.vs_font);
      this.gl.attachShader(this.program_font, this.fs_font);
      
      // setup attributes
      this.gl.bindAttribLocation(this.program_font, 0, "aPosition"); 
      this.gl.bindAttribLocation(this.program_font, 1, "aTexCoord");
      
      // linking
      this.gl.linkProgram(this.program_font);
      if (!this.gl.getProgramParameter(this.program_font, this.gl.LINK_STATUS)) 
      {
          alert("font shader: "+this.gl.getProgramInfoLog(this.program_font));
          return;
      }
   }
}


/**
 *  Initializes the font shader
 *  internal use
 */
ShaderManager.prototype.InitShader_Poi = function()
{
   var src_vertexshader_poi= "uniform mat4 matMVP;\nattribute vec3 aPosition;\nattribute vec2 aTexCoord;\nvarying vec2 vTexCoord;\n\nvoid main()\n{\n   gl_Position = matMVP * vec4(aPosition,1.0);\n   vTexCoord = aTexCoord;\n}\n";
   var src_fragmentshader_poi= "#ifdef GL_ES\nprecision highp float;\n#endif\n\nvarying vec2 vTexCoord;\nuniform sampler2D uTexture;\n\n\nuniform vec4 uColor;\nvoid main()\n{\n   if(texture2D(uTexture, vTexCoord)[3]<0.1){discard;}\n gl_FragColor = uColor*texture2D(uTexture, vTexCoord);\n}\n\n";
 
   this.vs_poi = this._createShader(this.gl.VERTEX_SHADER, src_vertexshader_poi);
   this.fs_poi = this._createShader(this.gl.FRAGMENT_SHADER, src_fragmentshader_poi);
   
   if (this.vs_poi && this.fs_poi)
   {
      // create program object
      this.program_poi = this.gl.createProgram();
      
      // attach our two shaders to the program
      this.gl.attachShader(this.program_poi, this.vs_poi);
      this.gl.attachShader(this.program_poi, this.fs_poi);
      
      // setup attributes
      this.gl.bindAttribLocation(this.program_poi, 0, "aPosition"); 
      this.gl.bindAttribLocation(this.program_poi, 1, "aTexCoord");
      
      // linking
      this.gl.linkProgram(this.program_poi);
      if (!this.gl.getProgramParameter(this.program_poi, this.gl.LINK_STATUS)) 
      {
          alert("poi shader: "+this.gl.getProgramInfoLog(this.program_poi));
          return;
      }
   }
}



/**
 *  Initializes all shaders. 
 * 
 */
ShaderManager.prototype.InitShaders = function()
{
   this.init = true;
   // compile and link all shaders
   this.InitShader_P();
   this.InitShader_PNT();
   this.InitShader_PC();
   this.InitShader_PT();
   this.InitShader_PNCT();
   this.InitShader_Font();
   this.InitShader_Poi();
} 

/**
 *  internal use.
 */
ShaderManager.prototype._createShader = function(shaderType, shaderSource) 
{
   var shader = this.gl.createShader(shaderType);
   if (!shader) { return null; }    
   this.gl.shaderSource(shader, shaderSource);
   this.gl.compileShader(shader);

   if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) 
   {
      if (shaderType == this.gl.VERTEX_SHADER)
      {
         alert("Vertex Shader " + this.gl.getShaderInfoLog(shader));
      }
      else if (shaderType == this.gl.FRAGMENT_SHADER)
      {
         alert("Fragment Shader " + this.gl.getShaderInfoLog(shader));
      }
      else
      {
         alert("Unknown Shader " + this.gl.getShaderInfoLog(shader));
      }
      return null;
   }    

   return shader;
}

//------------------------------------------------------------------------------


