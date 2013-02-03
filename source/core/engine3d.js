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
 #                              (c) 2010-2012 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/

goog.provide('owg.engine3d');

goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.MouseWheelHandler');
goog.require('owg.Font');
goog.require('owg.Surface');
goog.require('owg.SceneGraph');
goog.require('owg.ShaderManager');
goog.require('owg.Texture');
goog.require('owg.TraversalState');
goog.require('owg.mat4');
goog.require('owg.vec3');
goog.require('owg.PoiManager');
goog.require('owg.TextureManager');
goog.require('owg.GeoCoord');
goog.require('owg.PointSprite');

/**
 *
 * @class engine3d
 * The actual 3d engine with all functions.
 * Based on "ALGOS 3D Engine" created by Martin Christen
 *
 * @author Martin Christen martin.christen@fhnw.ch
 */

//------------------------------------------------------------------------------
// Global Variables
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
/** @type {Date} */
var dtEnd = new Date();
var dtStart = new Date();

/** @type {Array.<engine3d>} */
var _g_vInstances = new Array();    // array of all current instances

/** @type {number} */
var _g_nInstanceCnt = 0;              // total number of engine instances

/** @type {?number} */
var _gcbfKeyDown = null;           // global key down event

/** @type {?number} */
var _gcbfKeyUp = null;           // global key up event
//------------------------------------------------------------------------------



//------------------------------------------------------------------------------
/**
 * @description internal mousemove
 * @param {Object} evt the event object.
 * @ignore
 */
function _fncMouseMove(evt)
{
   for (var i = 0; i < _g_vInstances.length; i++)
   {
      var engine = _g_vInstances[i];
      if (evt.currentTarget == engine.context)
      {
         var x = evt.clientX - engine.xoffset / 2;
         var y = evt.clientY - engine.yoffset / 2;

         if (engine.cbfMouseMove && !engine.gl.isContextLost())
         {
            engine.cbfMouseMove(x, y, engine); // call mouse up callback function
         }
         return;
      }
   }
}
//------------------------------------------------------------------------------
/**
 * @ignore
 * @param {Object} evt the event object.
 * @description internal resize
 */
function _fncResize(evt)
{
   for (var i = 0; i < _g_vInstances.length; i++)
   {
      var engine = _g_vInstances[i];
      if (engine.bFullscreen)
      {
         if (engine.widthOffset > 0 && engine.heightOffset > 0)
         {
            engine.context.width = window.innerWidth - engine.widthOffset;
            engine.context.height = window.innerHeight - engine.heightOffset;
         }
         else
         {
            engine.context.width = window.innerWidth;
            engine.context.height = window.innerHeight;
         }

      }

      if (!engine.gl.isContextLost())
      {
         engine._resize(engine.context.width, engine.context.height);
      }
   }
}

//------------------------------------------------------------------------------
/**
 * @param {engine3d} engine
 */
function OnLostContext(engine)
{
   engine.ContextLost();
}
//------------------------------------------------------------------------------
/**
 * @param {engine3d} engine
 */
function OnRestoreContext(engine)
{
   engine.RestoreContext();
}

//------------------------------------------------------------------------------
/**
 * @description Create a new engine3d object
 * @class
 * @constructor
 */
function engine3d()
{
   // Callbacks:
   /** @type {?function(engine3d)} */
   this.cbfInit = null;
   /** @type {?function(number, engine3d)} */
   this.cbfTimer = null;
   /** @type {?function(engine3d)} */
   this.cbfRender = null;
   /** @type {?function()} */
   this.cbfMouseClicked = null;
   /** @type {?function()} */
   this.cbfMouseReleased = null;
   /** @type {?function()} */
   this.cbfMouseMoved = null;
   /** @type {?number} */
   this.cbfMouseWheel = null;
   /** @type {?function()} */
   this.cbfKeyPressed = null;
   /** @type {?function()} */
   this.cbfKeyReleased = null;
   /** @type {?function(number,number,engine3d)} */
   this.cbfResize = null;

   // flags
   /** @type {boolean} */
   this.init = false;
   /** @type {string} */
   this.canvasid = "";

   // width / height
   /** @type {number} */
   this.width = 0;
   /** @type {number} */
   this.height = 0;

   this.bFullscreen = false;

   /** @type {WebGLRenderingContext} */
   this.gl = null;          // opengl context

   this.context = null;

   /** @type {ShaderManager} */
   this.shadermanager = null;

   // Default Background color
   /** @type {number} */
   this.bg_r = 0.670588;
   /** @type {number} */
   this.bg_g = 0.921569;
   /** @type {number} */
   this.bg_b = 1;
   /** @type {number} */
   this.bg_a = 1;

   // Viewport
   /** @type {number} */
   this.vp_x = 0;
   /** @type {number} */
   this.vp_y = 0;
   /** @type {number} */
   this.vp_w = 0;
   /** @type {number} */
   this.vp_h = 0;

   // Special Offset for Fullscreen mode
   this.xoffset = 20;
   this.yoffset = 20;

   // Model, View and Projection Matrices
   /** @type {mat4} */
   this.matModel = new mat4();
   /** @type {mat4} */
   this.matView = new mat4();
   /** @type {mat4} */
   this.matProjection = new mat4();
   /** @type {mat4} */
   this.matModelView = new mat4();
   /** @type {mat4} */
   this.matModelViewProjection = new mat4();
   /** @type {mat4} */
   this.matNormal = new mat4();

   /** @type {Array.<Texture>} */
   this.RenderTargetStack = new Array();

   // Engine Traversal State
   /** @type {TraversalState} */
   this.TravState = new TraversalState();

   // Content Arrays
   /** @type {Array.<Surface>} */
   this.vecMeshes = new Array();
   /** @type {Array.<Texture>} */
   this.vecTextures = new Array();

   // engine instance voodoo
   /** @type {engine3d} */
   _g_vInstances[_g_nInstanceCnt] = this;
   /** @type {number} */
   _g_nInstanceCnt++;

   // system font (for ASCII Text only)
   /** @type {Font} */
   this.systemfont = null;

   // the scene
   /** @type {SceneGraph} */
   this.scene = null;

   // an empty texture for "failed" downloads
   /** @type {Texture} */
   this.nodata = null;

   /** @type {number} */
   this.worldtype = 1; // 0: custom, 1: wgs84, 2: flat, 3: 2D

   // POI Manager
   /** @type {PoiManager} */
   this.poimanager = null;

   /** @type {TextureManager} */
   this.texturemanager = null;

   /** @type {FlyToAnimation} */
   this.flyto = null;

   /** @type {number} */
   this.widthOffset = 0;

   /** @type {number} */
   this.heightOffset = 0;

}
//------------------------------------------------------------------------------
/**
 * Creates the HTLM for a failure message
 * @param {string} msg
 * @return {string} The html.
 */
var makeFailHTML = function (msg)
{
   return '' +
          '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
          '<td align="center">' +
          '<div style="display: table-cell; vertical-align: middle;">' +
          '<div style="">' + msg + '</div>' +
          '</div>' +
          '</td></tr></table>';
};
//------------------------------------------------------------------------------
/**
 * Message: getting a webgl browser
 * @type {string}
 */
var GET_A_WEBGL_BROWSER = '' +
                          'This page requires a browser that supports WebGL.<br/>' +
                          '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';
//------------------------------------------------------------------------------
/**
 * Message: need better hardware
 * @type {string}
 */
var OTHER_PROBLEM = '' +
                    "It doesn't appear your browser supports WebGL.<br/>" +
                    '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';
//------------------------------------------------------------------------------
/**
 * Creates a webgl context. If creation fails it will
 * change the contents of the container of the <canvas>
 * tag to an error message with the correct links for WebGL.
 * @param {Element} canvas. The canvas element to create a
 *     context from.
 * @return {WebGLRenderingContext} The created context.
 */
var setupWebGL = function (canvas)
{
   function showLink(str)
   {
      var container = canvas.parentNode;
      if (container)
      {
         container["innerHTML"] = makeFailHTML(str);
      }
   }

   if (!window["WebGLRenderingContext"])
   {
      showLink(GET_A_WEBGL_BROWSER);
      return null;
   }

   var context = create3DContext(canvas);
   if (goog.isNull(context))
   {
      showLink(OTHER_PROBLEM);
      return null;
   }

   return context;
};
//------------------------------------------------------------------------------
/**
 * Creates a webgl context.
 * @param {!Element} canvas The canvas tag to get context
 *     from. If one is not passed in one will be created.
 * @return {!WebGLRenderingContext} The created context.
 */
var create3DContext = function (canvas)
{
   var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
   var context = null;
   for (var ii = 0; ii < names.length; ++ii)
   {
      try
      {
         context = canvas.getContext(names[ii], { antialias:false });
      }
      catch (e)
      {
      }
      if (context)
      {
         break;
      }
   }
   return context;
}
//------------------------------------------------------------------------------
/**
 * @description Initialize Engine
 * @param {Element} canvas The canvas for webgl
 * @param {boolean} bFullscreen True if the canvas should autofit the browser window
 */
engine3d.prototype.InitEngine = function (canvas, bFullscreen)
{
   this.gl = setupWebGL(canvas);
   if (!this.gl)
   {
      return;
   }

   this.context = canvas;

   // Handling losing/restoring context:
   var evt_engine = this;
   canvas.addEventListener("webglcontextlost", function(event) { OnLostContext(evt_engine); event.preventDefault(); }, false);
   canvas.addEventListener("webglcontextrestored", function(event) { OnRestoreContext(evt_engine); }, false);

   if (bFullscreen)
   {
      this.xoffset = 0; //document.body.scrollLeft - document.body.clientLeft;
      this.yoffset = 0; //document.body.scrollTop - document.body.clientTop;
      canvas.width = window.innerWidth - this.xoffset;
      canvas.height = window.innerHeight - this.yoffset;
      this.bFullscreen = true;
   }

   var names = [ "webgl", "experimental-webgl", "moz-webgl", "webkit-3d" ];
   for (var i = 0; names.length > i; i++)
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
      alert("Can't find webgl context. It seems your browser is not compatible! For example, you can get the latest Firefox or Chrome");
      return;
   }

   this.InitGL();

   //disable context menu on canvas
   this.context.oncontextmenu = function (event)
   {
      event.preventDefault();
      event.stopPropagation();
      return false;
   };

   goog.events.listen(window, goog.events.EventType.RESIZE, _fncResize, false, this);
   goog.events.listen(window, goog.events.EventType.UNLOAD, this.OnDestroy, false, this);
}
/**
 * @description Initialize Engine
 * @param {string} canvasid The id of the webgl canvas
 * @param {boolean} bFullscreen True if the canvas should autofit the browser window
 */
engine3d.prototype.InitEngineById = function(canvasid, bFullscreen)
{
   var canvas = document.getElementById(canvasid);
   this.InitEngine(canvas, bFullscreen);
}
//------------------------------------------------------------------------------
/**
 * Initialize Graphics Subsystem
 */
engine3d.prototype.InitGL = function()
{
   // Call OnResize(canvas.width, canvas.height)
   this._resize(this.context.width, this.context.height);

   // basic settings
   this.gl.clearColor(0, 0, 0, 1);
   this.gl.enable(this.gl.DEPTH_TEST);

   this.gl.frontFace(this.gl.CCW);
   //this.gl.cullFace(this.gl.FRONT_AND_BACK);
   this.gl.cullFace(this.gl.BACK);

   //Init Shaders
   this.shadermanager = new ShaderManager(this.gl);
   this.shadermanager.InitShaders();

   // Create Font
   this.systemfont = new Font(this);

   // Create Nodata texture
   this.nodata = new Texture(this);
   this.nodata.LoadNoDataTexture();

   // Create Poi Manager
   this.poimanager = new PoiManager(this);

   //Create TextureManager
   this.texturemanager = new TextureManager(this);

   //Create FlyToAnimation
   this.flyto = new FlyToAnimation(this);

   // call init callback
   if (this.cbfInit)
   {
      var engine = this;
      this.cbfInit(engine);
   }

   dtStart = new Date(); // setup main timer...
   if (typeof(window) != "undefined") // if owg runs in a webworker "window" is not available!
   {
      window.requestAnimFrame(fncTimer, this.context); // request first frame
   }

}
//------------------------------------------------------------------------------
/**
 * @description Called when engine is destroyed
 */
//------------------------------------------------------------------------------
engine3d.prototype.OnDestroy = function ()
{
   if (this.cbfInit)
   {
      this.cbfInit = null;
   }

   if (this.cbfMouseDown)
   {
      goog.events.unlistenByKey(this.cbfMouseDown);
      this.cbfMouseDown = null;
   }
   if (this.cbfMouseUp)
   {
      goog.events.unlistenByKey(this.cbfMouseUp);
      this.cbfMouseUp = null;
   }
   if (this.cbfMouseWheel)
   {
      goog.events.unlistenByKey(this.cbfMouseWheel);
      this.cbfMouseWheel = null;
   }

   if (this.cbfTimer)
   {
      this.cbfTimer = null;
   }
   if (this.cbfRender)
   {
      this.cbfRender = null;
   }

   if (_gcbfKeyDown)
   {
      goog.events.unlistenByKey(_gcbfKeyDown);
      _gcbfKeyUp = null;
   }
   if (_gcbfKeyUp)
   {
      goog.events.unlistenByKey(_gcbfKeyUp);
      _gcbfKeyUp = null;
   }

   //if (this.cbfMouseMoved) { goog.events.unlistenByKey(this.cbfMouseMoved); this.cbfMouseMoved = null;}

   //if (this.cbfResize) { goog.events.unlistenByKey(this.cbfResize); this.cbfResize = null;}

   if (this.scene)
   {
      this.scene.Destroy();
      this.scene = null;
   }

   this.gl.clearColor(0, 0, 0, 0);
   this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

   this.gl = null;
   this.context = null;
   this.shadermanager = null;
   this.vecMeshes = [];
   this.vecTextures = [];
   this.systemfont = null;
   this.scene = null;
   this.poimanager = null;
   this.texturemanager = null;
   goog.events.unlisten(window, goog.events.EventType.RESIZE, null, false, this);

   _g_nInstanceCnt = 0;
   _g_vInstances = [];
}
//------------------------------------------------------------------------------
/**
 * Called when context is lost
 */
engine3d.prototype.ContextLost = function()
{
}
//------------------------------------------------------------------------------
/*
 * Called when context is restored
 */
engine3d.prototype.RestoreContext = function()
{
   // This is a temporary fix
   // in future all WebGL resources must be regenerated
   window.location.reload();
}
//------------------------------------------------------------------------------
/**
 * @description Sets the clear color
 * @param {number} r red component, range [0,1]
 * @param {number} g green component, range [0,1]
 * @param {number} b blue component, range [0,1]
 * @param {number} a alpha component, range [0,1]
 */
engine3d.prototype.SetClearColor = function (r, g, b, a)
{
   if (r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1 && a >= 0 && a <= 1)
   {
      this.bg_r = r;
      this.bg_g = g;
      this.bg_b = b;
      this.bg_a = a;
   }
}
//------------------------------------------------------------------------------
/**
 * @description Gets the clear color
 * returns an array A. You can access components using A.r, A.g, A.b, A.a
 */
engine3d.prototype.GetClearColor = function (color)
{
   return {r:this.bg_r, g:this.bg_g, b:this.bg_b, a:this.bg_a};
}
//------------------------------------------------------------------------------
/**
 * @description Clear color and depth buffer (using current clear color)
 */
engine3d.prototype.Clear = function ()
{
   /** @type {WebGLRenderingContext} */
   var gl = this.gl;

   if (gl)
   {
      gl.clearColor(this.bg_r, this.bg_g, this.bg_b, this.bg_a);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   }
   else
   {
      ogLog("Warning: no gl context!!")
   }
}
//------------------------------------------------------------------------------
/**
 * @description Initialize Render-Target
 */
engine3d.prototype.SetupDepthTextureTarget = function ()
{
   /** @type {WebGLRenderingContext} */
   var gl = this.gl;
   gl.clearColor(0.0, 0.0, 0.0, 0.0);
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
   gl.enable(gl.DEPTH_TEST);
   //gl.frontFace(gl.CCW);
   gl.disable(gl.CULL_FACE);
   //gl.cullFace(gl.BACK);
}
//------------------------------------------------------------------------------
/**
 * @description Render Geometry on Terrain,
 * based on Schneider, M. and Klein, R. (2007) "Efficient and Accurate Rendering
 * of Vector Data on Virtual Landscapes", in Proceedings of WSCG.
 * (Note: This code will partially move to vectorrenderer.js in future)
 * @param {Array.<Surface>} geometryarray
 * @param {Array.<Surface>} bboxarray
 * @param {boolean=} opt_bBlend
 */
engine3d.prototype.VectorRender = function (geometryarray, bboxarray, opt_bBlend)
{
   /** @type {WebGLRenderingContext} */
   var gl = this.gl;

   //gl.clear(gl.STENCIL_BUFFER_BIT);

   /** @type {boolean} */
   var bBlend = opt_bBlend || false;

   gl.colorMask(false, false, false, false);
   gl.enable(gl.CULL_FACE);
   gl.enable(gl.DEPTH_TEST);
   gl.depthMask(false);
   gl.depthFunc(gl.GEQUAL);
   gl.enable(gl.STENCIL_TEST);
   gl.stencilFunc(gl.ALWAYS, 0, 0);
   gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
   gl.cullFace(gl.FRONT);
   // First Pass:
   for (var i = 0; i < geometryarray.length; i++)
   {
      geometryarray[i].Draw();
   }

   gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
   gl.cullFace(gl.BACK);

   // Second Pass:
   for (var i = 0; i < geometryarray.length; i++)
   {
      geometryarray[i].Draw();
   }

   gl.depthMask(true);
   gl.colorMask(true, true, true, true);
   gl.cullFace(gl.FRONT);
   gl.stencilFunc(gl.NOTEQUAL, 0, 1);
   gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

   if (bBlend)
   {
      gl.enable(gl.BLEND);
   }
   //gl.disable(gl.DEPTH_TEST);
   gl.depthMask(true);

   for (var i = 0; i < bboxarray.length; i++)
   {
      bboxarray[i].Draw();
   }

   gl.stencilFunc(gl.NOTEQUAL, 0, 2);
   for (var i = 0; i < bboxarray.length; i++)
   {
      bboxarray[i].Draw();
   }

   if (bBlend)
   {
      gl.disable(gl.BLEND);
   }

   gl.enable(gl.DEPTH_TEST);
   gl.enable(gl.CULL_FACE);
   gl.cullFace(gl.BACK);
   gl.depthFunc(gl.LESS);
   gl.disable(gl.STENCIL_TEST);
}
//------------------------------------------------------------------------------
/**
 * @description Set Viewport
 * @param {number} x x-Screen-Position
 * @param {number} y y-Screen-Position
 * @param {number} w Screen width
 * @param {number} h Screen height
 */
engine3d.prototype.SetViewport = function (x, y, w, h)
{
   if (this.gl)
   {
      this.vp_x = x;
      this.vp_y = y;
      this.vp_w = w;
      this.vp_h = h;
      this.gl.viewport(x, y, w, h);
   }
}

//------------------------------------------------------------------------------
/**
 * @description Retrieve current Viewport
 * returns an array A. You can access components using A.x, A.y, A.w, A.h
 */
engine3d.prototype.GetViewport = function ()
{
   return {x:this.vp_x, y:this.vp_y, w:this.vp_w, h:this.vp_h};
}
//------------------------------------------------------------------------------
/**
 * Enable Depth Test
 */
engine3d.prototype.EnableDepthTest = function ()
{
   this.gl.enable(this.gl.DEPTH_TEST);
}
//------------------------------------------------------------------------------
/**
 * Disable Depth Test
 */
engine3d.prototype.DisableDepthTest = function ()
{
   this.gl.disable(this.gl.DEPTH_TEST);
}
//------------------------------------------------------------------------------
/**
 * @description Set projection matrix
 * @param{mat4} projmat The projection matrix to copy from.
 */
engine3d.prototype.SetProjectionMatrix = function (projmat)
{
   this.matProjection.CopyFrom(projmat);
   this._UpdateMatrices();
}
//------------------------------------------------------------------------------
/**
 * @description set view matrix
 * @param{mat4} viewmat The view matrix to copy from.
 */
engine3d.prototype.SetViewMatrix = function (viewmat)
{
   this.matView.CopyFrom(viewmat);
   this._UpdateMatrices();
}

//------------------------------------------------------------------------------
/**
 * @description Set model matrix
 * @param{mat4} modelmat The model matrix to copy from.
 */
engine3d.prototype.SetModelMatrix = function (modelmat)
{
   this.matModel.CopyFrom(modelmat);
   this._UpdateMatrices();
}

//------------------------------------------------------------------------------
/**
 * @description Update matrices: calc ModelView, ModelViewProjection
 * @ignore
 */
engine3d.prototype._UpdateMatrices = function ()
{
   this.matModelView.Multiply(this.matView, this.matModel);
   this.matModelViewProjection.Multiply(this.matProjection, this.matModelView);
   this.matNormal.Inverse(this.matModelView);
   this.matNormal.Transpose();
}

//------------------------------------------------------------------------------
/**
 * @description Load Texture from url (async)
 * @param {string} url The URL to the texture
 * @return {Texture} the texture
 */
engine3d.prototype.LoadTexture = function (url)
{
   var tex = new Texture(this);
   tex.loadTexture(url);
   this.vecTextures.push(tex);

   return tex;
}

//------------------------------------------------------------------------------
/**
 * @description Load Mesh from url (async)
 * @param{string} url The URL to the mesh (JSON)
 */
engine3d.prototype.LoadMesh = function (url)
{
   var m = new Surface(this);
   m.loadFromJSON(url);
   this.vecMeshes.push(m);

   return m;
}

//------------------------------------------------------------------------------
/**
 * @description Push all matrices (model, view, projectoin) to matrix stack
 */
engine3d.prototype.PushMatrices = function ()
{
   this.TravState.PushView(this.matView);
   this.TravState.PushModel(this.matModel);
   this.TravState.PushProjection(this.matProjection);
}

//------------------------------------------------------------------------------
/**
 * @description Pop all matrices from matrix stack
 */
engine3d.prototype.PopMatrices = function ()
{
   var model = this.TravState.PopModel()
   this.matModel.CopyFrom(model);

   var view = this.TravState.PopView();
   this.matView.CopyFrom(view);

   var proj = this.TravState.PopProjection();
   this.matProjection.CopyFrom(proj);
   // update matrices again:
   this._UpdateMatrices();
}

//------------------------------------------------------------------------------
/**
 * @description Set Matrices to 2D projection, so you can draw directly on 2D screen.
 */
engine3d.prototype.SetOrtho2D = function ()
{
   var vp = this.gl.getParameter(this.gl.VIEWPORT);
   var w = vp[2] - vp[0];
   var h = vp[3] - vp[1];
   this.matModel.Identity();
   this.matView.Identity();
   this.matProjection.Ortho2D(0, w, 0, h);
   this._UpdateMatrices();
}

//------------------------------------------------------------------------------
/**
 * @description Create Scene
 * @param {Object} options
 */
engine3d.prototype.CreateScene = function (options)
{
   if (this.worldtype == 0) // custom scene
   {
      options["type"] = "custom";
      this.scene = new SceneGraph(this, options);
      this.scene.nodeRenderObject.DoResize(this.width, this.height);
   }
   else if (this.worldtype == 1) // wgs84
   {
      options["type"] = "ellipsoid";

      this.scene = new SceneGraph(this, options);
      this.scene.nodeRenderObject.DoResize(this.width, this.height);

   }
   else if (this.worldtype == 2)
   {
      goog.debug.Logger.getLogger('owg.engine3d').warning("** WARNING: not implemented");
   }
   else if (this.worldtype == 3)
   {
      goog.debug.Logger.getLogger('owg.engine3d').warning("** WARNING: not implemented");
   }

}

//------------------------------------------------------------------------------
/**
 * @description Draw Text using internal bitmap font
 * @param {string} txt the text
 * @param {number} x x-coord (window)
 * @param {number} y y-coord (window)
 * @param {number=} scale a scale for the font size
 * @param {vec4=} fontcolor the color
 */
engine3d.prototype.DrawText = function (txt, x, y, scale, fontcolor)
{
   if (this.systemfont)
   {
      this.systemfont.DrawText(txt, x, y, scale, fontcolor);
   }
}
//------------------------------------------------------------------------------
/**
 * @description Get Text size
 * @param {string} txt the text
 * @returns {Array} array with width, height
 */
engine3d.prototype.GetTextSize = function (txt)
{
   var ret = new Array(2);
   ret[0] = 0;
   ret[1] = 0;
   if (this.systemfont)
   {
      var w = this.systemfont.GetStringWidth(txt);
      var h = this.systemfont.GetStringHeight();
      ret[0] = w;
      ret[1] = h;
   }
   return ret;
}
//------------------------------------------------------------------------------
/**
 * @description returns the mousepos and direction vector of a mouse click on the canvas in coordinates.
 * @param {number} x the screen x coordinate
 * @param {number} y the screen y coordinate
 * @param {mat4} mvp the model-view-projection matrix.
 * @param {boolean} normalize_dir true if direction should be normalized
 */
engine3d.prototype.GetDirectionMousePos = function (x, y, mvp, normalize_dir)
{
   var mvpInv = new mat4();
   mvpInv.Inverse(mvp);

   var winx = x;
   var winy = this.height - y - 1;
   var winz = 0;

   var mx = (winx - 0) * 2 / this.width - 1;
   var my = (winy - 0) * 2 / this.height - 1;
   var mz = -1;                    //cordinates on nearplane

   var fx = (winx - 0) * 2 / this.width - 1;
   var fy = (winy - 0) * 2 / this.height - 1;
   var fz = 1;                    //coordinates on farplane

   var CoorOnNearPlane = new vec3();
   CoorOnNearPlane.Set(mx, my, mz);
   var CoorOnNearPlaneWorld = mvpInv.MultiplyVec3(CoorOnNearPlane);

   var CoorOnFarPlane = new vec3();
   CoorOnFarPlane.Set(fx, fy, fz);
   var CoorOnFarPlaneWorld = mvpInv.MultiplyVec3(CoorOnFarPlane);

   //direction
   var dirx = CoorOnFarPlaneWorld.Get()[0] - CoorOnNearPlaneWorld.Get()[0];
   var diry = CoorOnFarPlaneWorld.Get()[1] - CoorOnNearPlaneWorld.Get()[1];
   var dirz = CoorOnFarPlaneWorld.Get()[2] - CoorOnNearPlaneWorld.Get()[2];

   //normalize direction

   if (normalize_dir)
   {
      var a = Math.sqrt(dirx * dirx + diry * diry + dirz * dirz);
      dirx /= a;
      diry /= a;
      dirz /= a;
   }

   var res = CoorOnNearPlaneWorld.Get();
   var pointAndDir = {};
   pointAndDir.x = res[0];
   pointAndDir.y = res[1];
   pointAndDir.z = res[2];
   pointAndDir.dirx = dirx;
   pointAndDir.diry = diry;
   pointAndDir.dirz = dirz;

   return pointAndDir;
}
//------------------------------------------------------------------------------
/**
 * @description cartesian coordinate to window coord inate.
 * @param {number} x the world x coordinate
 * @param {number} y the world y coordinate
 * @param {number} z the world z coordinate
 */
engine3d.prototype.WorldToWindow = function (x, y, z)
{
   var matViewProjection = new mat4();
   matViewProjection.Multiply(this.matProjection, this.matModelView);

   var v = new vec3(x, y, z);
   var res = matViewProjection.MultiplyVec3(v);  // (-1,-1)-(+1,+1)

   var xw = res._values[0];
   var yw = -res._values[1];
   var zw = res._values[2];

   xw = (xw + 1) * 0.5;
   yw = (yw + 1) * 0.5;
   zw = (zw + 1) * 0.5;

   xw = Math.floor(xw * this.width + 0.5);
   yw = Math.floor(yw * this.height - 1 + 0.5);
   return [xw, yw, zw];
}
//------------------------------------------------------------------------------
/**
 * @description Request an animation frame compatibility wrapper.
 * @see http://www.khronos.org/webgl/wiki/FAQ#What_is_the_recommended_way_to_implement_a_rendering_loop.3F
 * @param {function()} callback
 * @param {Element=} opt_element
 */
if (typeof(window) != "undefined") //if owg runs in a webworker "window" is not available!
{
   window.requestAnimFrame = (function ()
   {
      return window.requestAnimationFrame ||
             window.webkitRequestAnimationFrame ||
             window.mozRequestAnimationFrame ||
             window.oRequestAnimationFrame ||
             window.msRequestAnimationFrame ||
             function (callback, element)
             {
                window.setTimeout(callback, 30);
             };
   })();
}

//------------------------------------------------------------------------------
// MAIN TIMER FUNCTION
//------------------------------------------------------------------------------

/**
 * @description timer function (internal)
 * @ignore
 */
function fncTimer()
{
   dtEnd = new Date();
   var nMSeconds = dtEnd.valueOf() - dtStart.valueOf();
   dtStart = dtEnd;

   for (var i = 0; i < _g_vInstances.length; i++)
   {
      var engine = _g_vInstances[i];
      // (1) Call Timer Event

      if (!engine.gl.isContextLost())
      {
         if (engine.scene)
         {
            engine.scene.Tick(nMSeconds);
         }

         if (engine.cbfTimer)
         {
            engine.cbfTimer(nMSeconds, engine);
         }

         // (2) Set Current Viewport and clear
         engine.SetViewport(0, 0, engine.width, engine.height);
         engine.Clear();

         // (3) Draw Scenegraph
         if (engine.scene)
         {
            engine.scene.Traverse();
            engine.scene.Render();
         }

         var error = engine.gl.getError();
         if (error != engine.gl.NO_ERROR && error != engine.gl.CONTEXT_LOST_WEBGL)
         {
            ogLog("WebGL Error: " + error);
         }

         // (4) Call Render Callback (-> integrate in Scenegraph)
         if (engine.cbfRender)
         {
            engine.cbfRender(engine); // call  draw callback function
         }
         if (typeof(window) != "undefined") //if owg runs in a webworker "window" is not available!
         {
            window.requestAnimFrame(fncTimer, engine.context);
         }
      }
   }

}

//------------------------------------------------------------------------------
// *** ENGINE CALLBACK MANAGEMENT ** (INTERNAL FUNCTIONS)
//------------------------------------------------------------------------------
/**
 * @description internal _resize
 * @param {number} w width
 * @param {number} h height
 * @ignore
 */
engine3d.prototype._resize = function (w, h)
{
   this.width = w;
   this.height = h;
   // called on resize...
   if (this.cbfResize)
   {
      var engine = this;
      this.cbfResize(w, h, engine);
   }

   if (this.scene)
   {
      this.scene.nodeRenderObject.DoResize(w, h); // todo: move to scenegraph
   }
}

//------------------------------------------------------------------------------
/**
 * @description sets the init callback function
 * @param {function(engine3d)} f init callback handler.
 */
engine3d.prototype.SetInitCallback = function (f)
{
   this.cbfInit = f;
}

//------------------------------------------------------------------------------
/**
 * @description sets the timer callback function
 * @param {?function(number, engine3d)} f timer callback handler.
 */
engine3d.prototype.SetTimerCallback = function (f)
{
   this.cbfTimer = f;
}

//------------------------------------------------------------------------------
/**
 * @description sets the render callback function
 *
 * @param {function(engine3d)} f render callback handler.
 */
engine3d.prototype.SetRenderCallback = function (f)
{
   this.cbfRender = f;
}

//------------------------------------------------------------------------------
/**
 * @description sets the mousedown callback function
 *
 * @param {?function(number, number, number, engine3d)} opt_f mousedown callback handler.
 */
engine3d.prototype.SetMouseDownCallback = function (opt_f)
{
   if (this.cbfMouseDown)
   {
      goog.events.unlistenByKey(this.cbfMouseDown);
      this.cbfMouseDown = null;
   }
   if (opt_f)
   {
      this.cbfMouseDown = goog.events.listen(this.context, goog.events.EventType.MOUSEDOWN, function (e)
      {
         var x = e.clientX - this.xoffset / 2;
         var y = e.clientY - this.yoffset / 2;
         opt_f(e.button, x, y, this);
      }, false, this);
   }
};

//------------------------------------------------------------------------------
/**
 * @description sets the mouseup callback function
 *
 * @param {?function(number, number, number, engine3d)} opt_f mouseup callback handler.
 */
engine3d.prototype.SetMouseUpCallback = function (opt_f)
{
   if (this.cbfMouseUp)
   {
      goog.events.unlistenByKey(this.cbfMouseUp);
      this.cbfMouseUp = null;
   }
   if (opt_f)
   {
      this.cbfMouseUp = goog.events.listen(this.context, goog.events.EventType.MOUSEUP, function (e)
      {
         var x = e.clientX - this.xoffset / 2;
         var y = e.clientY - this.yoffset / 2;
         opt_f(e.button, x, y, this);
      }, false, this);
   }
};

//------------------------------------------------------------------------------
/**
 * @description sets the mousemoveup callback function
 *
 * @param {?function(number, number, engine3d)} opt_f mousemove callback handler.
 */
engine3d.prototype.SetMouseMoveCallback = function (opt_f)
{
   if (this.cbfMouseMove)
   {
      goog.events.unlistenByKey(this.cbfMouseMove);
      this.cbfMouseMove = null;
   }
   if (opt_f)
   {
      this.cbfMouseMove = goog.events.listen(this.context, goog.events.EventType.MOUSEMOVE, function (e)
      {
         var x = e.clientX - this.xoffset / 2;
         var y = e.clientY - this.yoffset / 2;
         opt_f(x, y, this);
      }, false, this);
   }
};

//------------------------------------------------------------------------------
/**
 * @description sets the mousewheel callback function
 *
 * @param {?function(number, engine3d)} opt_f mousewhell callback handler.
 */
engine3d.prototype.SetMouseWheelCallback = function (opt_f)
{
   if (this.cbfMouseWheel)
   {
      goog.events.unlistenByKey(this.cbfMouseWheel);
      this.cbfMouseWheel = null;
   }
   if (opt_f)
   {
      var mouseWheelHandler = new goog.events.MouseWheelHandler(this.context);
      this.cbfMouseWheel = goog.events.listen(mouseWheelHandler, goog.events.EventType.MOUSEMOVE, function (e)
      {
         e.preventDefault();
         opt_f(e.deltaY, this);
      }, false, this);
   }
};

//------------------------------------------------------------------------------
/**
 * @description sets the resize callback function
 *
 * @param {function(number, number, engine3d)} f resize callback handler.
 */
engine3d.prototype.SetResizeCallback = function (f)
{
   this.cbfResize = f;
}

//------------------------------------------------------------------------------
/**
 * @description sets the keydown callback function
 *
 * @param {?function(number, engine3d)} opt_f keydown callback handler.
 */
engine3d.prototype.SetKeyDownCallback = function (opt_f)
{
   if (_gcbfKeyDown)
   {
      goog.events.unlistenByKey(_gcbfKeyDown);
      _gcbfKeyDown = null;
   }
   if (opt_f)
   {
      _gcbfKeyDown = goog.events.listen(window, goog.events.EventType.KEYDOWN, function (e)
      {
         opt_f(e.keyCode, this);
      }, false, this);
   }
};
//------------------------------------------------------------------------------
/**
 * @description sets the keyup callback function
 *
 * @param {?function(number, engine3d)} opt_f keyup callback handler.
 */
engine3d.prototype.SetKeyUpCallback = function (opt_f)
{
   if (_gcbfKeyUp)
   {
      goog.events.unlistenByKey(_gcbfKeyUp);
      _gcbfKeyUp = null;
   }
   if (opt_f)
   {
      _gcbfKeyUp = goog.events.listen(window, goog.events.EventType.KEYUP, function (e)
      {
         opt_f(e.keyCode, this);
      }, false, this);
   }
};

//------------------------------------------------------------------------------
/**
 * @description PickGlobe: Retrieve clicked position on globe (high precision result)
 * @param {number} mx
 * @param {number} my
 * @param {Object} pickresult
 * The result contains the following:
 *    pickresult["hit"]: true if there was a hit with terrain
 *    pickresult["lng"]: longitude at mouse position
 *    pickresult["lat"]: latitude at mouse position
 *    pickresult["elv"]: elevation at mouse position
 *    pickresult["x"]: geocentric cartesian x-coordinate at mouse position
 *    pickresult["y"]: geocentric cartesian y-coordinate at mouse position
 *    pickresult["z"]: geocentric cartesian z-coordinate at mouse position
 */
engine3d.prototype.PickGlobe = function (mx, my, pickresult)
{
   if (this.scene && this.scene.nodeRenderObject && this.scene.nodeRenderObject.globerenderer)
   {
      this.scene.nodeRenderObject.globerenderer.PickGlobe(mx, my, pickresult);
   }
}

//------------------------------------------------------------------------------
/**
 * @description UpdatePickMatrix: Updates the pick matrix
 * @param {mat4} matView
 */
engine3d.prototype.UpdatePickMatrix = function (matView)
{
   if (this.scene && this.scene.nodeRenderObject && this.scene.nodeRenderObject.globerenderer)
   {
      var pickmatrix = new mat4();
      pickmatrix.Multiply(this.matProjection, matView);
      this.scene.nodeRenderObject.globerenderer.matPick = pickmatrix;
   }
}
/**
 * @description PickEllipsoid: Retrieve clicked position on ellipsoid (low precision result without elevation)
 * @param {number} mx
 * @param {number} my
 * @param {Object} pickresult
 * The result contains the following:
 *    pickresult["hit"]: true if there was a hit with terrain
 *    pickresult["lng"]: longitude at mouse position
 *    pickresult["lat"]: latitude at mouse position
 *    pickresult["elv"]: elevation at mouse position (this is always 0)
 *    pickresult["x"]: geocentric cartesian x-coordinate at mouse position
 *    pickresult["y"]: geocentric cartesian y-coordinate at mouse position
 *    pickresult["z"]: geocentric cartesian z-coordinate at mouse position
 */
engine3d.prototype.PickEllipsoid = function (mx, my, pickresult, initialize)
{
   if (this.scene && this.scene.nodeRenderObject && this.scene.nodeRenderObject.globerenderer)
   {
      this.scene.nodeRenderObject.globerenderer.PickEllipsoid(mx, my, pickresult, initialize);
   }
}

//------------------------------------------------------------------------------
/**
 * @description PickPoi: Retrieve poi id of clicked poi
 * @param {number} mx
 * @param {number} my
 */
engine3d.prototype.PickPOI = function (mx, my)
{
   if (this.scene && this.scene.nodeRenderObject && this.scene.nodeRenderObject.poirenderer)
   {
      return this.scene.nodeRenderObject.poirenderer.PickPOI(mx, my);
   }
   return null;
}

//------------------------------------------------------------------------------
/**
 * @description PickSurface: Retrieve geometry id of clicked poi
 * @param {number} mx
 * @param {number} my
 */
engine3d.prototype.PickSurface = function (mx, my)
{
   if (this.scene && this.scene.nodeRenderObject && this.scene.nodeRenderObject.geometryrenderer)
   {
      return this.scene.nodeRenderObject.geometryrenderer.PickSurface(mx, my);
   }
   return -1;
}

//------------------------------------------------------------------------------
/**
 * @description PickBillboard retrieve the billboard_id and the normalized picking coordinates.
 * @param {number} mx
 * @param {number} my
 */
engine3d.prototype.PickBillboard = function (mx, my)
{
   if (this.scene && this.scene.nodeRenderObject && this.scene.nodeRenderObject.billboardrenderer)
   {
      return this.scene.nodeRenderObject.billboardrenderer.PickBillboard(mx, my);
   }
   return -1;
}
//-----------------------------------------------------------------------------
/**
 * @description Returns the altitude above ground [m]
 */
engine3d.prototype.AltitudeAboveGround = function ()
{
   if (this.scene && this.scene.nodeRenderObject && this.scene.nodeRenderObject.globerenderer)
   {
      return this.scene.nodeRenderObject.globerenderer.AltitudeAboveGround();
   }

   return 0;
}

//-----------------------------------------------------------------------------
/**
 * @description Returns the altitude above ellipsoid [m]
 */
engine3d.prototype.AltitudeAboveEllipsoid = function ()
{
   if (this.scene)
   {
      return this.scene.nodeNavigation.GetPosition().elevation;
   }

   return 0;
}
//-----------------------------------------------------------------------------
/**
 * @description Returns the elevation at specified position.
 * @param {number} lng
 * @param {number} lat
 * @return {Object}
 *   return["hasvalue"] true, if there is a valid value
 *   return["elevation"] : elevation at specified position
 *   return["lod"] : level of detail at position
 */
engine3d.prototype.GetElevationAt = function (lng, lat)
{
   if (this.scene && this.scene.nodeRenderObject && this.scene.nodeRenderObject.globerenderer)
   {
      return this.scene.nodeRenderObject.globerenderer.GetElevationAt(lng, lat);
   }

   // Special case: There is no globe. GetElevationAt always returns 0 in this case.
   if (!this.scene.nodeRenderObject.globerenderer)
   {

      var oReturn = {  "hasvalue":true,
         "elevation":0,
         "lod":0
      };
      return oReturn;
   }

   var oFailed = {};
   oFailed["hasvalue"] = false;
   oFailed["elevation"] = 0;
   oFailed["lod"] = -1;
   return oFailed;
}

//------------------------------------------------------------------------------
/**
 * @ignore
 * @param {number} worldtype
 */
engine3d.prototype.SetWorldType = function (worldtype)
{
   this.worldtype = worldtype;
}
//------------------------------------------------------------------------------
//##############################################################################
// ** FlyTo Functions **
//##############################################################################
//------------------------------------------------------------------------------
/**
 * @description flies the camera to a specific position. yaw,pitch and roll are
 * optional if they are defined, there will be an interpolation between the current
 * angles and the target angles otherwise the angles will not be changed.
 * @param {number} lng target longitude
 * @param {number} lat target latitude
 * @param {number} elv target elevation
 * @param {number} yaw target yaw
 * @param {number} pitch target pitch
 * @param {number} roll target roll
 */
engine3d.prototype.FlyTo = function (lng, lat, elv, yaw, pitch, roll)
{
   this.flyto.StartFlyTo(lng, lat, elv, yaw, pitch, roll);
}

//------------------------------------------------------------------------------
/**
 * @description The camera moves to a LookAt Position "distance" away from the
 * point defined by lng,lat,elv. The camera orientation will not changed.
 * @param {number} lng target longitude
 * @param {number} lat target latitude
 * @param {number} elv target elevation
 * @param {number} distance distance in [m]
 * @param {number} opt_yaw in [degrees]
 * @param {number} opt_pitch in [degrees]
 * @param {number} opt_roll in [degrees]
 */
engine3d.prototype.FlyToLookAtPosition = function (lng, lat, elv, distance, opt_yaw, opt_pitch, opt_roll)
{
   this.flyto.FlyToLookAtPosition(lng, lat, elv, distance, opt_yaw, opt_pitch, opt_roll);
}

//------------------------------------------------------------------------------
/**
 * @description Set the duration of the FlyTo-animation in [ms].
 * @param {number} timespan duration in [ms]
 */
engine3d.prototype.SetFlightDuration = function (timespan)
{
   this.flyto.SetFlightDuration(timespan);
}

//------------------------------------------------------------------------------
/**
 * @description Break fly to animation cycle
 */
engine3d.prototype.StopFlyTo = function ()
{
   this.flyto.StopFlyTo();
}
//------------------------------------------------------------------------------
/**
 * @description Set Current Render Target (must be texture)
 * @param {Texture} texture
 */
engine3d.prototype.PushRenderTarget = function (texture)
{
   this.RenderTargetStack.push(texture);
   texture._EnableRenderToTexture();

}
//------------------------------------------------------------------------------
/**
 * @description Reset Render Target
 */
engine3d.prototype.PopRenderTarget = function ()
{
   if (this.RenderTargetStack.length < 1)
   {
      ogError("Fatal error with render target stack. PushRenderTarget/PopRenderTarget do not correspond.");
      return;
   }

   /** @type {Texture} */
   var texture = this.RenderTargetStack.pop();

   var l = this.RenderTargetStack.length;

   if (l > 0)
   {
      /** @type {Texture} */
      var activetarget = this.RenderTargetStack[l - 1];
      activetarget._EnableRenderToTexture();
   }
   else
   {
      // If render target stack is empty we render to screen. (_DisableRenderToTexture binds to screen.)
      texture._DisableRenderToTexture();
   }
}
//------------------------------------------------------------------------------

goog.exportSymbol('engine3d', engine3d);
goog.exportProperty(engine3d.prototype, 'AltitudeAboveEllipsoid', engine3d.prototype.AltitudeAboveEllipsoid);
goog.exportProperty(engine3d.prototype, 'AltitudeAboveGround', engine3d.prototype.AltitudeAboveGround);
goog.exportProperty(engine3d.prototype, 'Clear', engine3d.prototype.Clear);
goog.exportProperty(engine3d.prototype, 'CreateScene', engine3d.prototype.CreateScene);
goog.exportProperty(engine3d.prototype, 'DrawText', engine3d.prototype.DrawText);
goog.exportProperty(engine3d.prototype, 'GetClearColor', engine3d.prototype.GetClearColor);
goog.exportProperty(engine3d.prototype, 'GetDirectionMousePos', engine3d.prototype.GetDirectionMousePos);
goog.exportProperty(engine3d.prototype, 'GetViewport', engine3d.prototype.GetViewport);
goog.exportProperty(engine3d.prototype, 'InitEngine', engine3d.prototype.InitEngine);
goog.exportProperty(engine3d.prototype, 'LoadMesh', engine3d.prototype.LoadMesh);
goog.exportProperty(engine3d.prototype, 'LoadTexture', engine3d.prototype.LoadTexture);
goog.exportProperty(engine3d.prototype, 'PickGlobe', engine3d.prototype.PickGlobe);
goog.exportProperty(engine3d.prototype, 'PopMatrices', engine3d.prototype.PopMatrices);
goog.exportProperty(engine3d.prototype, 'PushMatrices', engine3d.prototype.PushMatrices);
goog.exportProperty(engine3d.prototype, 'SetClearColor', engine3d.prototype.SetClearColor);
goog.exportProperty(engine3d.prototype, 'SetInitCallback', engine3d.prototype.SetInitCallback);
goog.exportProperty(engine3d.prototype, 'SetKeyDownCallback', engine3d.prototype.SetKeyDownCallback);
goog.exportProperty(engine3d.prototype, 'SetKeyUpCallback', engine3d.prototype.SetKeyUpCallback);
goog.exportProperty(engine3d.prototype, 'SetModelMatrix', engine3d.prototype.SetModelMatrix);
goog.exportProperty(engine3d.prototype, 'SetMouseDownCallback', engine3d.prototype.SetMouseDownCallback);
goog.exportProperty(engine3d.prototype, 'SetMouseMoveCallback', engine3d.prototype.SetMouseMoveCallback);
goog.exportProperty(engine3d.prototype, 'SetMouseUpCallback', engine3d.prototype.SetMouseUpCallback);
goog.exportProperty(engine3d.prototype, 'SetMouseWheelCallback', engine3d.prototype.SetMouseWheelCallback);
goog.exportProperty(engine3d.prototype, 'SetOrtho2D', engine3d.prototype.SetOrtho2D);
goog.exportProperty(engine3d.prototype, 'SetProjectionMatrix', engine3d.prototype.SetProjectionMatrix);
goog.exportProperty(engine3d.prototype, 'SetRenderCallback', engine3d.prototype.SetRenderCallback);
goog.exportProperty(engine3d.prototype, 'SetResizeCallback', engine3d.prototype.SetResizeCallback);
goog.exportProperty(engine3d.prototype, 'SetTimerCallback', engine3d.prototype.SetTimerCallback);
goog.exportProperty(engine3d.prototype, 'SetViewMatrix', engine3d.prototype.SetViewMatrix);
goog.exportProperty(engine3d.prototype, 'SetViewport', engine3d.prototype.SetViewport);
goog.exportProperty(engine3d.prototype, 'GetElevationAt', engine3d.prototype.GetElevationAt);
goog.exportProperty(engine3d.prototype, 'OnDestroy', engine3d.prototype.OnDestroy);
