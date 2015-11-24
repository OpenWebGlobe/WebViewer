/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
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
//    PNC: Position, Normal, Color
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

   // PNT:
   /** @type {WebGLProgram} */
   this.program_pnc = null;
   /** @type {WebGLShader} */
   this.vs_pnc = null;
   /** @type {WebGLShader} */
   this.fs_pnc = null;
   
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
   
   //Point for PointClouds
   /** @type WebGLProgram */
   this.program_point = null;
   /** @type WebGLShader */
   this.vs_point = null;
   /** @type WebGLShader */
   this.fs_point = null;
   
   // Special Effects for Globe rendering
   /** @type WebGLProgram */
   this.program_pt_chroma = null;
   /** @type WebGLShader */
   this.vs_pt_chroma = null;
   /** @type WebGLShader */
   this.fs_pt_chroma = null;

   // PT for Anaglph Stereo
   /** @type {WebGLProgram} */
   this.program_pt_stereo = null;
   /** @type {WebGLShader} */
   this.vs_pt_stereo = null;
   /** @type {WebGLShader} */
   this.fs_pt_stereo = null;
}

//------------------------------------------------------------------------------
/**
 *  
 * @param {mat4} modelviewprojection
 * @param {vec4} color
 */
ShaderManager.prototype.UseShader_P = function(modelviewprojection,color)
{
   if (this.program_p)
   {
      this.gl.useProgram(this.program_p);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_p, "matMVP"),false,modelviewprojection.ToFloat32Array());
      this.gl.uniform4fv(this.gl.getUniformLocation(this.program_p, "uColor"), color.ToFloat32Array());
   }   
}
//------------------------------------------------------------------------------
/**
 * @param {mat4} normalmatrix
 * @param {mat4} modelview
 * @param {mat4} projection
 */
ShaderManager.prototype.UseShader_PNT = function(normalmatrix, modelview, projection)
{
   if (this.program_pnt)
   {
      this.gl.useProgram(this.program_pnt);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pnt, "matModelView"), false, modelview.ToFloat32Array());
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pnt, "matProjection"), false, projection.ToFloat32Array());
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pnt, "matNormal"), false, normalmatrix.ToFloat32Array());
      this.gl.uniform1i(this.gl.getUniformLocation(this.program_pnt, "uTexture"),0);
   }
}
//------------------------------------------------------------------------------
/**
 *
 * @param {mat4} modelviewprojection
 * @param {vec4} color
 */
ShaderManager.prototype.UseShader_PC = function(modelviewprojection, color)
{
   if (this.program_pc)
   {
      this.gl.useProgram(this.program_pc);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pc, "matMVP"), false, modelviewprojection.ToFloat32Array());
      this.gl.uniform4fv(this.gl.getUniformLocation(this.program_pc, "uColor"), color.ToFloat32Array());
   }    
}
//------------------------------------------------------------------------------
/**
 * @param {mat4} normalmatrix
 * @param {mat4} modelview
 * @param {mat4} modelviewprojection
 * @param {vec4} color
 */
ShaderManager.prototype.UseShader_PNC = function(normalmatrix, modelview, modelviewprojection, color)
{
   if (this.program_pnc)
   {
      var ambientcolor = new vec4(0.1,0.1,0.1,0.0);

      this.gl.useProgram(this.program_pnc);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pnc, "matMVP"), false, modelviewprojection.ToFloat32Array());
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pnc, "matNormal"), false, normalmatrix.ToFloat32Array());
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pnc, "matModelView"), false, modelview.ToFloat32Array());

      this.gl.uniform4fv(this.gl.getUniformLocation(this.program_pnc, "uAmbientColor"), ambientcolor.ToFloat32Array());
      this.gl.uniform4fv(this.gl.getUniformLocation(this.program_pnc, "uColor"), color.ToFloat32Array());
   }
}
//------------------------------------------------------------------------------
/**
 *  
 * @param {mat4} modelviewprojection
 * @param {vec4} color 
 */
ShaderManager.prototype.UseShader_PT = function(modelviewprojection, color)
{
   if (this.program_pt)
   {
      this.gl.useProgram(this.program_pt);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pt, "matMVP"), false, modelviewprojection.ToFloat32Array());
      this.gl.uniform1i(this.gl.getUniformLocation(this.program_pt, "uTexture"), 0);
      this.gl.uniform4fv(this.gl.getUniformLocation(this.program_pt, "uColor"), color.ToFloat32Array());
   }    
}
//------------------------------------------------------------------------------
/**
 *  
 * @param {mat4} modelviewprojection
 * @param {mat4} model
 */
ShaderManager.prototype.UseShader_PT_chroma = function(modelviewprojection, model)
{
   if (this.program_pt_chroma)
   {
      this.gl.useProgram(this.program_pt_chroma);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pt_chroma, "matM"), false, model.ToFloat32Array());
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pt_chroma, "matMVP"), false, modelviewprojection.ToFloat32Array());
      this.gl.uniform1i(this.gl.getUniformLocation(this.program_pt_chroma, "uTexture"), 0);   
   }    
}
//------------------------------------------------------------------------------
/**
 *  
 * @param {mat4} modelviewprojection
 */
ShaderManager.prototype.UseShader_PNCT = function(modelviewprojection)
{
   if (this.program_pnct)
   {
      this.gl.useProgram(this.program_pnct);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pnct, "matMVP"), false, modelviewprojection.ToFloat32Array());
   }    
}
//------------------------------------------------------------------------------
/**
 *  
 * @param {mat4} modelviewprojection
 */
ShaderManager.prototype.UseShader_Font = function(modelviewprojection, fontcolor)
{
   if (this.program_font)
   {
      this.gl.useProgram(this.program_font);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_font, "matMVP"),false,modelviewprojection.ToFloat32Array());
      this.gl.uniform4fv(this.gl.getUniformLocation(this.program_font, "uColor"), fontcolor.ToFloat32Array());
   }    
}
//------------------------------------------------------------------------------
/** 
 * @param {mat4} modelviewprojection
 * @param {vec4} color
 */
ShaderManager.prototype.UseShader_Poi = function(modelviewprojection, color)
{
   if (this.program_poi)
   {
      this.gl.useProgram(this.program_poi);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_poi, "matMVP"),false,modelviewprojection.ToFloat32Array());
      this.gl.uniform4fv(this.gl.getUniformLocation(this.program_poi, "uColor"), color.ToFloat32Array());
   }    
}
//------------------------------------------------------------------------------
/** 
 * @param {mat4} modelviewprojection
 * @param {mat4} invmatmodelviewprojection the inverse mvp
 */
ShaderManager.prototype.UseShader_Point = function(modelviewprojection, invmatmodelviewprojection)
{
   if (this.program_point)
   {
      this.gl.useProgram(this.program_point);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_point, "matMVP"),false,modelviewprojection.ToFloat32Array());
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_point, "matInvMVP"),false,invmatmodelviewprojection.ToFloat32Array());
   }    
}
//------------------------------------------------------------------------------
/**
 * PT Stereo (Anaglph Correction)
 * @param {mat4} modelviewprojection
 * @param {mat4} colormat1
 * @param {mat4} colormat2
 * @param {number} dx
 * @param {number} dy
 */
ShaderManager.prototype.UseShader_PT_STEREO = function(modelviewprojection, colormat1, colormat2, dx, dy)
{
   if (this.program_pt_stereo)
   {
      this.gl.useProgram(this.program_pt_stereo);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pt_stereo, "matMVP"), false, modelviewprojection.ToFloat32Array());
      this.gl.uniform1i(this.gl.getUniformLocation(this.program_pt_stereo, "uTexture1"), 0);
      this.gl.uniform1i(this.gl.getUniformLocation(this.program_pt_stereo, "uTexture2"), 1);
      this.gl.uniform1f(this.gl.getUniformLocation(this.program_pt_stereo, "dx"), dx);
      this.gl.uniform1f(this.gl.getUniformLocation(this.program_pt_stereo, "dy"), dy);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pt_stereo, "uColorMat1"), false, colormat1.ToFloat32Array());
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program_pt_stereo, "uColorMat2"), false, colormat2.ToFloat32Array());

   }
}
//------------------------------------------------------------------------------
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
      if (!this.gl.getProgramParameter(this.program_p, this.gl.LINK_STATUS) && !this.gl.isContextLost())
      {
          alert("Shader Link: " + this.gl.getProgramInfoLog(this.program_p));
          return;
      }
   } 
}
//------------------------------------------------------------------------------
/**
 *  Initializes the point,normal, texture shader 
 *  internal use
 */
ShaderManager.prototype.InitShader_PNT = function()
{
   var src_vertexshader_PNT = "attribute vec3 aPosition;\nattribute vec3 aNormal;\nattribute vec2 aTexCoord;\n\nuniform mat4 matModelView;\nuniform mat4 matProjection;\nuniform mat4 matNormal;\n\nvarying vec2 vTexCoord;\nvarying vec3 vNormal;\nvarying vec4 vPosition;\n\nvoid main(void)\n{\nvPosition = matModelView * vec4(aPosition, 1.0);\ngl_Position = matProjection * vPosition;\nvTexCoord = aTexCoord;\nvNormal = (matNormal * vec4(aNormal,1.0)).xyz;\n}\n";
   var src_fragmentshader_PNT= "#ifdef GL_ES\nprecision highp float;\n#endif\n\nvarying vec2 vTexCoord;\nvarying vec3 vNormal;\nvarying vec4 vPosition;\nuniform sampler2D uTexture;\nvoid main(void)\n{\nvec3 L = normalize(-vPosition.xyz);\nfloat lamb = 2.0*max(dot(normalize(vNormal), L), 0.0);\nvec3 diff = vec3(1.0,0.0,0.0) * lamb;\ngl_FragColor = vec4(diff.xyz, 1.0);\n}\n";  
  
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
      if (!this.gl.getProgramParameter(this.program_pnt, this.gl.LINK_STATUS) && !this.gl.isContextLost())
      {
          alert(this.gl.getProgramInfoLog(this.program_pnt));
          return;
      }
   }
}
//------------------------------------------------------------------------------
/**
 *  Initializes the point,color shader 
 *  internal use
 */
ShaderManager.prototype.InitShader_PC = function()
{
   var src_vertexshader_PC= "uniform mat4 matMVP;\nattribute vec3 aPosition;\nattribute vec4 aColor;\nvarying vec4 vColor;\n\nvoid main()\n{\n   gl_Position = matMVP * vec4(aPosition, 1.0);\n   vColor = aColor;\n   gl_PointSize = 1.0;}\n";
   var src_fragmentshader_PC= "#ifdef GL_ES\nprecision highp float;\n#endif\n\nvarying vec4 vColor;\n\nuniform vec4 uColor;\nvoid main()\n{\n   gl_FragColor = vColor * uColor;\n}\n\n";
  
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
      if (!this.gl.getProgramParameter(this.program_pc, this.gl.LINK_STATUS) && !this.gl.isContextLost())
      {
          alert(this.gl.getProgramInfoLog(this.program_pc));
          return;
      }
   }
}
//------------------------------------------------------------------------------
/**
 *  Initializes the point,color shader for lighting
 *  internal use
 */
ShaderManager.prototype.InitShader_PNC = function()
{
   var src_vertexshader_PNC= "uniform mat4 matMVP;\n" +
                             "attribute vec3 aPosition;\n" +
                             "attribute vec3 aNormal;" +
                             "attribute vec4 aColor;\n" +
                             "varying vec4 vColor;\n\n" +
                             "uniform mat4 matNormal;\n" +
                             "uniform mat4 matModelView;\n" +
                             "varying vec2 vTexCoord;\n" +
                             "varying vec4 vPosition;" +
                             "varying vec3 vNormal;\n\n" +
                             "void main()\n" +
                             "{\n" +
                             "   gl_Position = matMVP * vec4(aPosition, 1.0);\n" +
                             "   vPosition = matModelView * vec4(aPosition, 1.0);\n" +
                             "   vNormal = normalize((matNormal * vec4(aNormal,1.0)).xyz);" +
                             "   vColor = aColor;\n" +
                             "}\n";
   var src_fragmentshader_PNC= "#ifdef GL_ES\n" +
                               "precision highp float;\n" +
                               "#endif\n\n" +
                               "uniform vec4 uAmbientColor;\n" +
                               "uniform vec4 uColor;\n" +
                               "varying vec4 vColor;\n" +
                               "varying vec3 vNormal;\n" +
                               "varying vec4 vPosition;\n" +
                               "void main()\n" +
                               "{\n" +
                               "   vec3 L = normalize(-vPosition.xyz);\n" +
                               "   float lamb1 = dot(normalize(vNormal), L);\n" +
                               "   float lamb2 = dot(normalize(vNormal), -L);\n" +
                               "   vec4 diff1 = clamp(vec4(vColor.xyz * lamb1,1.0),0.0,1.0);\n" +
                               "   vec4 diff2 = clamp(vec4(vColor.xyz * lamb2,1.0),0.0,1.0);\n" +
                               "   gl_FragColor = diff1+diff2;\n" +
                               "}\n";

   this.vs_pnc = this._createShader(this.gl.VERTEX_SHADER, src_vertexshader_PNC);
   this.fs_pnc = this._createShader(this.gl.FRAGMENT_SHADER, src_fragmentshader_PNC);

   if (this.vs_pnc && this.fs_pnc)
   {
      // create program object
      this.program_pnc = this.gl.createProgram();

      // attach our two shaders to the program
      this.gl.attachShader(this.program_pnc, this.vs_pnc);
      this.gl.attachShader(this.program_pnc, this.fs_pnc);

      // setup attributes
      this.gl.bindAttribLocation(this.program_pnc, 0, "aPosition");
      this.gl.bindAttribLocation(this.program_pnc, 1, "aNormal");
      this.gl.bindAttribLocation(this.program_pnc, 2, "aColor");

      // linking
      this.gl.linkProgram(this.program_pnc);
      if (!this.gl.getProgramParameter(this.program_pnc, this.gl.LINK_STATUS) && !this.gl.isContextLost())
      {
         alert(this.gl.getProgramInfoLog(this.program_pnc));
         return;
      }
   }
}
//------------------------------------------------------------------------------
/**
 *  Initializes the point,texture
 *  internal use
 */
ShaderManager.prototype.InitShader_PT = function()
{
   var src_vertexshader_PT= "uniform mat4 matMVP;\nattribute vec3 aPosition;\nattribute vec2 aTexCoord;\nvarying vec2 vTexCoord;\n\nvoid main()\n{\n   gl_Position = matMVP * vec4(aPosition,1.0);\n   vTexCoord = aTexCoord;\n}\n";
   var src_fragmentshader_PT= "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform vec4 uColor;\nvarying vec2 vTexCoord;\nuniform sampler2D uTexture;\n\nvoid main()\n{\n   gl_FragColor = texture2D(uTexture, vTexCoord)*uColor;\n}\n\n";
     
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
      if (!this.gl.getProgramParameter(this.program_pt, this.gl.LINK_STATUS) && !this.gl.isContextLost())
      {
          alert(this.gl.getProgramInfoLog(this.program_pt));
          return;
      }
   }
  
}
//------------------------------------------------------------------------------
/**
 *  Initializes the point,texture
 *  internal use
 */
ShaderManager.prototype.InitShader_PT_chroma = function()
{
   // Variant 1: Chroma-Depth View Frustum
   //var src_vertexshader_PT_chroma= "uniform mat4 matMVP;\nvarying float w_val;\nattribute vec3 aPosition;\nattribute vec2 aTexCoord;\nvarying vec2 vTexCoord;\n\nvoid main()\n{\n   gl_Position = matMVP * vec4(aPosition,1.0);\n   w_val = clamp((gl_Position.z-0.00001)/0.0055,0.0,1.0);; vTexCoord = aTexCoord;\n}\n";
   
   // Variant 2: Chroma-Depth Elevation
   var src_vertexshader_PT_chroma= "uniform mat4 matM;uniform mat4 matMVP;\nvarying float w_val;\nattribute vec3 aPosition;\nattribute vec2 aTexCoord;\nvarying vec2 vTexCoord;\n\nvoid main()\n{gl_Position = matMVP * vec4(aPosition,1.0);\nvec4 xyz = matM * vec4(aPosition,1.0);\nfloat x = xyz.x*8388607.0;\nfloat y = xyz.y*8388607.0;\nfloat z = xyz.z*8388607.0;\nfloat sq, lat, sinlat, coslat, sinlat2, Rn, elevation;\nsq = sqrt(x*x+y*y);\n lat = atan(z,sq);\n      for (int i=0;i<2;i++)\n{\nsinlat = sin(lat);\ncoslat = cos(lat);\nsinlat2 = sinlat*sinlat;\nRn = 6378137.0 / sqrt(1.0-0.0066943799*sinlat2);\n   elevation = sq / coslat - Rn;\nlat = atan(z/sq, 1.0-(Rn*0.0066943799)/(Rn+elevation));\n}\nw_val = 1.0-clamp(abs(elevation)/4000.0,0.0,1.0); vTexCoord = aTexCoord;\n}\n";
   var src_fragmentshader_PT_chroma = "#ifdef GL_ES\nprecision highp float;\n#endif\n\nvarying float w_val;\nvarying vec2 vTexCoord;\nuniform sampler2D uTexture;\n\nvoid main()\n{\n   float depth = w_val;\nfloat depth2 = depth*depth;\nvec4 rgb;\n if (depth < 0.5) { rgb.g = 1.6*depth2+1.2*depth; } else { rgb.g = 3.2*depth2-6.8*depth+3.6; rgb.b = depth2*-4.8+9.2*depth-3.4; }\nrgb.a=1.0;\ndepth = depth/0.9;\ndepth2 = depth2/0.81;\nrgb.r = -2.14*depth2*depth2 -1.07*depth2*depth + 0.133*depth2 +0.0667*depth +1.0;\ngl_FragColor = texture2D(uTexture, vTexCoord)*rgb;\n\n}\n\n";
   
   this.vs_pt_chroma = this._createShader(this.gl.VERTEX_SHADER, src_vertexshader_PT_chroma);
   this.fs_pt_chroma = this._createShader(this.gl.FRAGMENT_SHADER, src_fragmentshader_PT_chroma);
   
   if (this.vs_pt_chroma && this.fs_pt_chroma)
   {
      // create program object
      this.program_pt_chroma = this.gl.createProgram();
      
      // attach our two shaders to the program
      this.gl.attachShader(this.program_pt_chroma, this.vs_pt_chroma);
      this.gl.attachShader(this.program_pt_chroma, this.fs_pt_chroma);
      
      // setup attributes
      this.gl.bindAttribLocation(this.program_pt_chroma, 0, "aPosition"); 
      this.gl.bindAttribLocation(this.program_pt_chroma, 1, "aTexCoord");

      
      // linking
      this.gl.linkProgram(this.program_pt_chroma);
      if (!this.gl.getProgramParameter(this.program_pt_chroma, this.gl.LINK_STATUS) && !this.gl.isContextLost())
      {
          alert(this.gl.getProgramInfoLog(this.program_pt_chroma));
          return;
      }
   }
} 
//------------------------------------------------------------------------------
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
      if (!this.gl.getProgramParameter(this.program_pnct, this.gl.LINK_STATUS) && !this.gl.isContextLost())
      {
          alert(this.gl.getProgramInfoLog(this.program_pnct));
          return;
      }
   }
   
} 
//------------------------------------------------------------------------------
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
      if (!this.gl.getProgramParameter(this.program_font, this.gl.LINK_STATUS) && !this.gl.isContextLost())
      {
          alert("font shader: "+this.gl.getProgramInfoLog(this.program_font));
          return;
      }
   }
}
//------------------------------------------------------------------------------
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
      if (!this.gl.getProgramParameter(this.program_poi, this.gl.LINK_STATUS) && !this.gl.isContextLost())
      {
          alert("poi shader: "+this.gl.getProgramInfoLog(this.program_poi));
          return;
      }
   }
}

//------------------------------------------------------------------------------
/**
 *  Initializes the point,normal,color,texture shader 
 *  internal use
 */
ShaderManager.prototype.InitShader_Point = function()
{
   
 // var src_vertexshader_Point= "uniform mat4 matMVP;\nuniform mat4 matInvMVP;\nattribute vec3 aPosition;\nattribute vec4 aColor;\nvarying vec4 vColor;\n\nvoid main()\n{\n   gl_Position = matMVP * vec4(aPosition, 1.0);\n   vColor = aColor;\n   gl_PointSize = clamp(100000000.0/abs((distance(matMVP*vec4(aPosition, 1.0),matInvMVP*vec4(0.0,0.0,0.0,1.0)))),0.0,5.0);}\n";
   var src_vertexshader_Point= "uniform mat4 matMVP;\nuniform mat4 matInvMVP;\nattribute vec3 aPosition;\nattribute vec4 aColor;\nvarying vec4 vColor;\n\nvoid main()\n{\n   gl_Position = matMVP * vec4(aPosition, 1.0);\n   vColor = aColor;\n   gl_PointSize=4.0; \n}\n";
   var src_fragmentshader_Point= "#ifdef GL_ES\nprecision highp float;\n#endif\n\nvarying vec4 vColor;\n\nvoid main()\n{\n   gl_FragColor = vColor;\n}\n\n";
      
    
   this.vs_point = this._createShader(this.gl.VERTEX_SHADER, src_vertexshader_Point);
   this.fs_point= this._createShader(this.gl.FRAGMENT_SHADER, src_fragmentshader_Point);
   
   if (this.vs_point && this.fs_point)
   {
      // create program object
      this.program_point = this.gl.createProgram();
      
      // attach our two shaders to the program
      this.gl.attachShader(this.program_point, this.vs_point);
      this.gl.attachShader(this.program_point, this.fs_point);

      // setup attributes
      this.gl.bindAttribLocation(this.program_point, 0, "aPosition"); 
      this.gl.bindAttribLocation(this.program_point, 1, "aColor");
      
      // linking
      this.gl.linkProgram(this.program_point);
      if (!this.gl.getProgramParameter(this.program_point, this.gl.LINK_STATUS) && !this.gl.isContextLost())
      {
          alert(this.gl.getProgramInfoLog(this.program_point));
          return;
      }
   }
}

//------------------------------------------------------------------------------
/**
 *  Initializes the point,texture with anaglyph correction
 *  internal use
 */
ShaderManager.prototype.InitShader_PT_STEREO = function()
{
   var src_vertexshader_PT_STEREO= "uniform mat4 matMVP;\n" +
                                   "attribute vec3 aPosition;\n" +
                                   "attribute vec2 aTexCoord;\n" +
                                   "varying vec2 vTexCoord;\n" +
                                   "void main()\n" +
                                   "{" +
                                     "gl_Position = matMVP * vec4(aPosition,1.0);\n"+
                                     "vTexCoord = aTexCoord;\n" +
                                   "}\n";
   var src_fragmentshader_PT_STEREO= "#ifdef GL_ES\nprecision highp float;\n#endif\n" +
                                     "varying vec2 vTexCoord;" +
                                     "uniform float dx;" +
                                     "uniform float dy;" +
                                     "uniform mat4 uColorMat1;" +
                                     "uniform mat4 uColorMat2;" +
                                     "uniform sampler2D uTexture1;\n" +
                                     "uniform sampler2D uTexture2;\n" +
                                     "void main()\n" +
                                     "{\n" +
                                       "float sep = 4.0;"  +
                                       "vec4 col1 = texture2D(uTexture1, vTexCoord+vec2(sep*dx,0));" +
                                       "vec4 col2 = texture2D(uTexture2, vTexCoord+vec2(-sep*dx,0));" +
                                       "vec4 colc = col1*uColorMat1 + col2*uColorMat2;\n" +
                                       "gl_FragColor = vec4(pow(colc.r, 1.0/1.5), pow(colc.g, 1.0/1.5),pow(colc.b, 1.0/1.5),1.0);" +
                                     "}\n\n";

   this.vs_pt_stereo = this._createShader(this.gl.VERTEX_SHADER, src_vertexshader_PT_STEREO);
   this.fs_pt_stereo = this._createShader(this.gl.FRAGMENT_SHADER, src_fragmentshader_PT_STEREO);

   if (this.vs_pt_stereo && this.fs_pt_stereo)
   {
      // create program object
      this.program_pt_stereo = this.gl.createProgram();

      // attach our two shaders to the program
      this.gl.attachShader(this.program_pt_stereo, this.vs_pt_stereo);
      this.gl.attachShader(this.program_pt_stereo, this.fs_pt_stereo);

      // setup attributes
      this.gl.bindAttribLocation(this.program_pt_stereo, 0, "aPosition");
      this.gl.bindAttribLocation(this.program_pt_stereo, 1, "aTexCoord");


      // linking
      this.gl.linkProgram(this.program_pt_stereo);
      if (!this.gl.getProgramParameter(this.program_pt_stereo, this.gl.LINK_STATUS) && !this.gl.isContextLost())
      {
         alert(this.gl.getProgramInfoLog(this.program_pt_stereo));
         return;
      }
   }

}

//------------------------------------------------------------------------------
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
   this.InitShader_Point();
   this.InitShader_PT_chroma();
   this.InitShader_PNC();
   this.InitShader_PT_STEREO();
} 
//------------------------------------------------------------------------------
/**
 *  internal use.
 */
ShaderManager.prototype._createShader = function(shaderType, shaderSource) 
{
   var shader = this.gl.createShader(shaderType);
   if (!shader) { return null; }    
   this.gl.shaderSource(shader, shaderSource);
   this.gl.compileShader(shader);

   if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS) && !this.gl.isContextLost())
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

