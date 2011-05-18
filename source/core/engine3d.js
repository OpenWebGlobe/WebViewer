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
#                              ____) | |__| | . \                             #
#                             |_____/|_____/|_|\_\                             #
#                                                                              #
#                              (c) 2010-2011 by                                #
#           University of Applied Sciences Northwestern Switzerland            #
#                     Institute of Geomatics Engineering                       #
#                           martin.christen@fhnw.ch                            #
********************************************************************************
*     Licensed under MIT License. Read the file LICENSE for more information   *
*******************************************************************************/

goog.provide('owg.engine3d');

goog.require('goog.debug.Logger');
goog.require('owg.EventHandler');
goog.require('owg.Font');
goog.require('owg.Mesh');
goog.require('owg.SceneGraph');
goog.require('owg.ShaderManager');
goog.require('owg.Texture');
goog.require('owg.TraversalState');
goog.require('owg.mat4');
goog.require('owg.vec3');
goog.require('owg.PoiManager');
goog.require('owg.TextureManager');

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
var _g_vInstances    = new Array();    // array of all current instances

/** @type {number} */
var _g_nInstanceCnt  = 0;              // total number of engine instances

/** @type {?function(number, engine3d)} */
var _gcbfKeyDown     = null;           // global key down event

/** @type {?function(number, engine3d)} */
var _gcbfKeyUp       = null;           // global key up event
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
/**
 * @description internal key up
 * @param {Object} evt the event object.
 * @ignore
 */
function _fncKeyDown(evt)
{
   for (var i=0;i<_g_vInstances.length;i++)
   {
      var engine = _g_vInstances[i];
      engine.eventhandler.KeyDown(evt.keyCode,engine);
      
      if (_gcbfKeyDown)
      {
         _gcbfKeyDown(evt.keyCode, engine); 
      }
   }
   

   return;
}

//------------------------------------------------------------------------------
/**
 * @description internal key up
 * @param {Object} evt the event object.
 * @ignore
 */
function _fncKeyUp(evt)
{
   for (var i=0;i<_g_vInstances.length;i++)
   {
      var engine = _g_vInstances[i];
      engine.eventhandler.KeyUp(evt.keyCode,engine);
      
      if (_gcbfKeyUp)
      {
      _gcbfKeyUp(evt.keyCode, engine);
      }
   }
   

   return;
}

//------------------------------------------------------------------------------
/**
 * @description internal mouse up
 * @param {Object} evt the event object.
 * @ignore
 */
function _fncMouseUp(evt)
{
   for (var i=0;i<_g_vInstances.length;i++)
   {
      var engine = _g_vInstances[i];
      if (evt.currentTarget == engine.context)
      {
         var x = evt.clientX-engine.xoffset/2;
         var y = evt.clientY-engine.yoffset/2;
         engine.eventhandler.MouseUp(evt.button,x,y);
         if (engine.cbfMouseUp)
         {
            engine.cbfMouseUp(evt.button, x, y, engine); // call mouse up callback function
         }
         return;
      }
   }
}

//------------------------------------------------------------------------------
/**
 * @description internal mousedown
 * @param {Object} evt the event object.
 * @ignore
 */
function _fncMouseDown(evt)
{
   for (var i=0;i<_g_vInstances.length;i++)
   {
      var engine = _g_vInstances[i];
      if (evt.currentTarget == engine.context)
      {
         var x = evt.clientX-engine.xoffset/2;
         var y = evt.clientY-engine.yoffset/2;
         engine.eventhandler.MouseDown(evt.button,x,y);
         
         if (_g_vInstances[i].cbfMouseDown)
         {
            _g_vInstances[i].cbfMouseDown(evt.button,x,y, engine); // call mouse down callback function
         }
         return;
      }
   }
}

//------------------------------------------------------------------------------
/**
 * @description internal mousemove
 * @param {Object} evt the event object.
 * @ignore
 */
function _fncMouseMove(evt)
{
   for (var i=0;i<_g_vInstances.length;i++)
   {
      var engine = _g_vInstances[i];
      if (evt.currentTarget == engine.context)
      {
         var x = evt.clientX-engine.xoffset/2;
         var y = evt.clientY-engine.yoffset/2;
         engine.eventhandler.MouseMove(x,y);
         
         if (engine.cbfMouseMove)
         {
            engine.cbfMouseMove(x,y, engine); // call mouse up callback function
         }
         return;
      }
   }
}
//------------------------------------------------------------------------------
/**
 * @description internal mousewheel
 * @param {Object} evt the event object.
 * @ignore
 */
function _fncMouseWheel(evt)
{
   if(evt.preventDefault) 
   { 
      evt.preventDefault();  // seems to work for: Chrome, Safari, Firefox
   } 
   
   for (var i=0;i<_g_vInstances.length;i++)
   {
      var engine = _g_vInstances[i];
      var delta = 0; 
      
      if ( evt.wheelDelta ) 
      { 
         delta= -evt.wheelDelta;
         if (window.opera) 
         {
            delta= -delta;
         }
      }
      else if (evt.detail)  // Firefox
      { 
         delta = evt.detail/3;
      }
      
      engine.eventhandler.MouseWheel(delta);
         
      if (engine.cbfMouseWheel)
      {
        engine.cbfMouseWheel(delta, engine);
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
   for (var i=0;i<_g_vInstances.length;i++)
   {
      var engine = _g_vInstances[i];
      if (engine.bFullscreen)
      {
         engine.context.width = window.innerWidth-20;
         engine.context.height = window.innerHeight-20;
      }
      
      engine._resize(engine.context.width, engine.context.height);
   }
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
   /** @type {?function(number, engine3d)} */
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
   this.bg_r = 0;
   /** @type {number} */
   this.bg_g = 0;
   /** @type {number} */
   this.bg_b = 0;
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
   this.xoffset = 0;
   this.yoffset = 0;
   
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
   
   // Engine Traversal State
   /** @type {TraversalState} */
   this.TravState = new TraversalState();
   
   // Content Arrays
   /** @type {Array.<Mesh>} */
   this.vecMeshes = new Array();
   /** @type {Array.<Texture>} */
   this.vecTextures = new Array();
   
   // engine instance voodoo
   /** @type {engine3d} */
   _g_vInstances[_g_nInstanceCnt] = this;
   /** @type {number} */
   _g_nInstanceCnt++;
   
   // Event Handler
   /** @type {EventHandler} */
   this.eventhandler = new EventHandler();
   
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
      
}

//------------------------------------------------------------------------------
/**
 * @description Initialize Engine 
 * @param {string} canvasid The id of the webgl canvas
 * @param {boolean} bFullscreen True if the canvas should autofit the browser window
 */
engine3d.prototype.InitEngine = function(canvasid, bFullscreen) 
{ 
   var canvas = document.getElementById(canvasid);
   this.context = canvas;
   
   if (bFullscreen)
   {
         this.xoffset = 20; //document.body.scrollLeft - document.body.clientLeft;
         this.yoffset = 20; //document.body.scrollTop - document.body.clientTop;
         canvas.width = window.innerWidth-this.xoffset;
         canvas.height = window.innerHeight-this.yoffset;
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
      alert("Can't find webgl context. It seems your browser is not compatible! For example, you can get the latest Firefox or Chrome");
      return;
   }
   
   // Call OnResize(canvas.width, canvas.height)
   this._resize(this.context.width, this.context.height);
   
   // basic settings
   this.gl.clearColor(0, 0, 0, 1);
   this.gl.enable(this.gl.DEPTH_TEST);
   
   this.gl.frontFace(this.gl.CCW);
   //this.gl.cullFace(this.gl.FRONT_AND_BACK);
   this.gl.cullFace(this.gl.BACK);
   
   // Create Default Shaders
   //this.CreateDefaultShaders();
   //this.UseShaderDefault();
   
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
   
   // call init callback
	if (this.cbfInit)
   {
		var engine = this;
		this.cbfInit(engine);
	}
   
   canvas.addEventListener("mousedown", _fncMouseDown, false);
   canvas.addEventListener("mouseup", _fncMouseUp, false);
   canvas.addEventListener("mousemove", _fncMouseMove, false);
   window.addEventListener("DOMMouseScroll", _fncMouseWheel, false);
   canvas.addEventListener('mousewheel', _fncMouseWheel, false); // for Chrome
   window.addEventListener("resize", _fncResize, false);
   window.addEventListener("keydown", _fncKeyDown, false);
   window.addEventListener("keyup", _fncKeyUp, false);
   
   
   // draw scene every 30 milliseconds
   dtStart = new Date(); // setup main timer...
   setInterval(fncTimer, 30);
  
}



//------------------------------------------------------------------------------
/**
 * @description Sets the clear color
 * @param {number} r red component, range [0,1]
 * @param {number} g green component, range [0,1]
 * @param {number} b blue component, range [0,1]
 * @param {number} a alpha component, range [0,1]
 */
engine3d.prototype.SetClearColor = function(r,g,b,a)
{
   if (r>=0 && r<=1 && g>=0 && g<=1 && b>=0 && b<=1 && a>=0 && a<=1)
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
engine3d.prototype.GetClearColor = function(color)
{
   return {r: this.bg_r, g: this.bg_g, b: this.bg_b, a: this.bg_a};
}

//------------------------------------------------------------------------------
/**
 * @description Clear color and depth buffer (using current clear color)
 */
engine3d.prototype.Clear = function()
{
   this.gl.clearColor(this.bg_r, this.bg_g, this.bg_b, this.bg_a);
   this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
}

//------------------------------------------------------------------------------
/**
 * @description Set Viewport
 * @param {number} x x-Screen-Position
 * @param {number} y y-Screen-Position
 * @param {number} w Screen width
 * @param {number} h Screen height
 */
engine3d.prototype.SetViewport = function(x,y,w,h)
{
   this.vp_x = x; this.vp_y = y; this.vp_w = w; this.vp_h = h;
   this.gl.viewport(x, y, w, h);
}

//------------------------------------------------------------------------------
/**
 * @description Retrieve current Viewport
 * returns an array A. You can access components using A.x, A.y, A.w, A.h
 */
engine3d.prototype.GetViewport = function()
{
   return {x: this.vp_x, y: this.vp_y, w: this.vp_w, h: this.vp_h};
}

//------------------------------------------------------------------------------
/**
 * @description Set projection matrix
 * @param{mat4} mat4 The projection matrix to copy from.
 */
engine3d.prototype.SetProjectionMatrix = function(mat4)
{
   this.matProjection.CopyFrom(mat4);
   this._UpdateMatrices();
}  
//------------------------------------------------------------------------------
/**
 * @description set view matrix
 * @param{mat4} mat4 The view matrix to copy from.
 */
engine3d.prototype.SetViewMatrix = function(mat4)  
{
   this.matView.CopyFrom(mat4);
   this._UpdateMatrices();
}      

//------------------------------------------------------------------------------
/**
 * @description Set model matrix
 * @param{mat4} mat4 The model matrix to copy from.
 */
engine3d.prototype.SetModelMatrix = function(mat4)
{
   this.matModel.CopyFrom(mat4);
   this._UpdateMatrices();
} 

//------------------------------------------------------------------------------
/**
 * @description Update matrices: calc ModelView, ModelViewProjection
 * @ignore
 */
engine3d.prototype._UpdateMatrices = function()
{
   this.matModelView.Multiply(this.matView, this.matModel);
   this.matModelViewProjection.Multiply(this.matProjection, this.matModelView); 
}

//------------------------------------------------------------------------------
/**
 * @description Load Texture from url (async)
 * @param {string} url The URL to the texture
 * @return {Texture} the texture
 */
engine3d.prototype.LoadTexture = function(url)
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
engine3d.prototype.LoadMesh = function(url)
{
   var m = new Mesh(this);
   m.loadFromJSON(url);
   this.vecMeshes.push(m);
   
   return m;
}


//------------------------------------------------------------------------------
/**
 * @description Push all matrices (model, view, projectoin) to matrix stack 
 */
engine3d.prototype.PushMatrices = function()
{
   this.TravState.PushView(this.matView);
   this.TravState.PushModel(this.matModel);
   this.TravState.PushProjection(this.matProjection);
}

//------------------------------------------------------------------------------
/**
 * @description Pop all matrices from matrix stack
 */
engine3d.prototype.PopMatrices = function()
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
engine3d.prototype.SetOrtho2D = function()
{
   var vp = this.gl.getParameter(this.gl.VIEWPORT);
   var w = vp[2]-vp[0];
   var h = vp[3]-vp[1];
   this.matModel.Identity();
   this.matView.Identity();
   this.matProjection.Ortho2D(0,w,0,h);
   this._UpdateMatrices();
}

//------------------------------------------------------------------------------
/**
 * @description Create Scene
 */
engine3d.prototype.CreateScene = function()
{
   if (this.worldtype == 0) // custom scene
   {
      goog.debug.Logger.getLogger('owg.engine3d').warning("** WARNING: not implemented");
   }
   else if (this.worldtype == 1) // wgs84
   {
      this.scene = new SceneGraph(this);   
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
engine3d.prototype.DrawText = function(txt,x,y,scale,fontcolor)
{
   if (this.systemfont)
   {
      this.systemfont.DrawText(txt,x,y,scale,fontcolor); 
   }
}
//------------------------------------------------------------------------------
/**
 * @description Get Text size
 * @param {string} txt the text
 * @returns {Array} array with width, height
 */
engine3d.prototype.GetTextSize = function(txt)
{
	var ret = new Array(2);
	ret[0] = 0; ret[1] = 0;
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
 */
engine3d.prototype.GetDirectionMousePos = function(x, y, mvp)
{
   var mvpInv = new mat4();
   mvpInv.Inverse(mvp);
   
   var winx = x;
   var winy = this.height-y-1;
   var winz = 0;
          
   var mx = (winx-0)*2/this.width - 1;
   var my = (winy-0)*2/this.height - 1;
   var mz = -1;                    //cordinates on nearplane
                  
   var fx = (winx-0)*2/this.width - 1;
   var fy = (winy-0)*2/this.height - 1;
   var fz = 1;                    //coordinates on farplane

   var CoorOnNearPlane = new vec3();   
       CoorOnNearPlane.Set(mx,my,mz);      
   var CoorOnNearPlaneWorld = mvpInv.MultiplyVec3(CoorOnNearPlane);
       // goog.debug.Logger.getLogger('owg.engine3d').info("engine CoorOnNearPlaneWorld: "+CoorOnNearPlaneWorld.ToString());

   var CoorOnFarPlane = new vec3();   
       CoorOnFarPlane.Set(fx,fy,fz);              
   var CoorOnFarPlaneWorld = mvpInv.MultiplyVec3(CoorOnFarPlane);
       // goog.debug.Logger.getLogger('owg.engine3d').info("engine CoorOnFarPlaneWorld: "+CoorOnFarPlaneWorld.ToString());
                    
   //direction
   var dirx = CoorOnFarPlaneWorld.Get()[0] - CoorOnNearPlaneWorld.Get()[0];
   var diry = CoorOnFarPlaneWorld.Get()[1] - CoorOnNearPlaneWorld.Get()[1];
   var dirz = CoorOnFarPlaneWorld.Get()[2] - CoorOnNearPlaneWorld.Get()[2];
            
   //normalize direction
   var a = Math.sqrt(dirx*dirx+diry*diry+dirz*dirz);
       a = Math.abs(a);
              
   dirx/=a;
   diry/=a;
   dirz/=a;

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
   
   for (var i=0;i<_g_vInstances.length;i++)
   {
      var engine = _g_vInstances[i];
      // (1) Call Timer Event
      engine.eventhandler.Timer(nMSeconds);
      
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
           
      // (4) Call Render Callback (-> integrate in Scenegraph)
      if (engine.cbfRender)
      {
         engine.cbfRender(engine); // call  draw callback function
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
engine3d.prototype._resize = function(w,h)
{
   this.width = w;
   this.height = h;
   // called on resize...
   if (this.cbfResize)
   {
		var engine = this;
      this.cbfResize(w, h, engine);
   }
}

//------------------------------------------------------------------------------
/**
 * @description sets the init callback function
 * @param {function()} f init callback handler.
 */
engine3d.prototype.SetInitCallback = function(f)
{
   this.cbfInit = f;
}

//------------------------------------------------------------------------------
/**
 * @description sets the timer callback function
 * @param {function()} f timer callback handler.
 */
engine3d.prototype.SetTimerCallback = function(f)
{
   this.cbfTimer = f;
}

//------------------------------------------------------------------------------
/**
 * @description sets the render callback function
 *
 * @param {function()} f render callback handler.
 */
engine3d.prototype.SetRenderCallback = function(f)
{
   this.cbfRender = f;
}

//------------------------------------------------------------------------------
/**
 * @description sets the mousedown callback function
 *
 * @param {function()} f mousedown callback handler.
 */
engine3d.prototype.SetMouseDownCallback = function(f)
{
   this.cbfMouseDown = f;
}

//------------------------------------------------------------------------------
/**
 * @description sets the mouseup callback function
 *
 * @param {function()} f mouseup callback handler.
 */
engine3d.prototype.SetMouseUpCallback = function(f)
{
   this.cbfMouseUp = f;
}

//------------------------------------------------------------------------------
/**
 * @description sets the mousemoveup callback function
 *
 * @param {function()} f mousemove callback handler.
 */
engine3d.prototype.SetMouseMoveCallback = function(f)
{
   this.cbfMouseMove = f;
}
//------------------------------------------------------------------------------
/**
 * @description sets the mousewheel callback function
 *
 * @param {function()} f mousewhell callback handler.
 */
engine3d.prototype.SetMouseWheelCallback = function(f)
{
   this.cbfMouseWheel = f;
}
//------------------------------------------------------------------------------
/**
 * @description sets the resize callback function
 *
 * @param {function()} f resize callback handler.
 */
engine3d.prototype.SetResizeCallback = function(f)
{
   this.cbfResize = f;
}

//------------------------------------------------------------------------------
/**
 * @description sets the keydown callback function
 *
 * @param {function()} f keydown callback handler.
 */
engine3d.prototype.SetKeyDownCallback = function(f)
{
   _gcbfKeyDown = f;
}
//------------------------------------------------------------------------------
/**
 * @description sets the keyup callback function
 *
 * @param {function()} f keyup callback handler.
 */
engine3d.prototype.SetKeyUpCallback = function(f)
{
   _gcbfKeyUp = f;
}

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
engine3d.prototype.PickGlobe = function(mx, my, pickresult)
{
   if (this.scene)
   {
      this.scene.nodeRenderObject.globerenderer.PickGlobe(mx,my,pickresult);
   }
}
 //-----------------------------------------------------------------------------
 /**
 * @description Returns the altitude above ground [m]
 */
engine3d.prototype.AltitudeAboveGround = function()
{
   if (this.scene)
   {
      return this.scene.nodeRenderObject.globerenderer.AltitudeAboveGround();
   }   
   
   return 0;  
}

 //-----------------------------------------------------------------------------
 /**
 * @description Returns the altitude above ellipsoid [m]
 */
engine3d.prototype.AltitudeAboveEllipsoid = function()
{
   if (this.scene)
   {
      return this.scene.nodeNavigation.GetPosition().elevation;
   }   
   
   return 0;
}

//------------------------------------------------------------------------------
/**
 * @ignore
 * @param {number} worldtype
 */
engine3d.prototype.SetWorldType = function(worldtype)
{
   this.worldtype = worldtype;
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
