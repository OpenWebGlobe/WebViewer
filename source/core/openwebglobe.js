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
// STANDARD FONT
// This font texture has a size of 512x512 and contains 16x16s characters
var fonttexture;        
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

//------------------------------------------------------------------------------
/**
 * @description internal key up
 * @ignore
 */
function _fncKeyDown(evt)
{
   for (var i=0;i<_g_vInstances.length;i++)
   {
      var engine = _g_vInstances[i];
      engine.eventhandler.KeyDown(evt.keyCode);
   }
   
   if (_gcbfKeyDown)
   {
      _gcbfKeyDown(evt.keyCode); 
   }
   return;
}

//------------------------------------------------------------------------------
/**
 * @description internal key up
 * @ignore
 */
function _fncKeyUp(evt)
{
   for (var i=0;i<_g_vInstances.length;i++)
   {
      var engine = _g_vInstances[i];
      engine.eventhandler.KeyUp(evt.keyCode);
   }
   
   if (_gcbfKeyUp)
   {
      _gcbfKeyUp(evt.keyCode);
   }
   return;
}

//------------------------------------------------------------------------------
/**
 * @description internal mouse up
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
            engine.cbfMouseUp(evt.button, x, y); // call mouse up callback function
         }
         return;
      }
   }
}

//------------------------------------------------------------------------------
/**
 * @description internal mousedown
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
            _g_vInstances[i].cbfMouseDown(evt.button,x,y); // call mouse down callback function
         }
         return;
      }
   }
}

//------------------------------------------------------------------------------
/**
 * @description internal mousemove
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
            engine.cbfMouseMove(x,y); // call mouse up callback function
         }
         return;
      }
   }
}
//------------------------------------------------------------------------------
/**
 * @description internal mousewheel
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
         delta = evt.detail/3;;
      }
      
      engine.eventhandler.MouseWheel(delta);
         
      if (engine.cbfMouseWheel)
      {
        engine.cbfMouseWheel(delta);
      }
   }
}

//------------------------------------------------------------------------------
/**
 * @ignore
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
	this.cbfInit = null;
	this.cbfTimer = null;
	this.cbfRender = null;
	this.cbfMouseClicked = null;
	this.cbfMouseReleased = null;
	this.cbfMouseMoved = null;
	this.cbfMouseWheel = null;
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
	
	// Default Background color
	this.bg_r = 0;
   this.bg_g = 0;
   this.bg_b = 0;
   this.bg_a = 1;
   
   // Viewport
   this.vp_x = 0;
   this.vp_y = 0;
   this.vp_w = 0;
   this.vp_h = 0;
   
   // Special Offset for Fullscreen mode
   this.xoffset = 0;
   this.yoffset = 0;
   
   // Model, View and Projection Matrices
   this.matModel = new mat4();
   this.matView = new mat4();
   this.matProjection = new mat4();
   this.matModelView = new mat4();
   this.matModelViewProjection = new mat4();
   
   // Engine Traversal State
   this.TravState = new TraversalState();
   
   // Content Arrays
   this.vecMeshes = new Array();
   this.vecTextures = new Array();
   
	// engine instance voodoo
	_g_vInstances[_g_nInstanceCnt] = this;
   _g_nInstanceCnt++;
   
   // Event Handler
   this.eventhandler = new EventHandler();
   
   // system font (for ASCII Text only)
   this.systemfont = null;
   
   // the scene
   this.scene = null;
   
   // an empty texture for "failed" downloads
   this.nodata = null;
      
}

//------------------------------------------------------------------------------
/**
 * @description Initialize Engine 
 * @param{String} canvasid The id of the webgl canvas
 * @param{Bool} bFullscreen True if the canvas should autofit the browser window
 */
engine3d.prototype.InitEngine = function(canvasid, bFullscreen) 
{ 
   var canvas = document.getElementById(canvasid);
   this.context = canvas;
   
   if (bFullscreen)
   {
         this.xoffset = 20;
         this.yoffset = 20;
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
   //this.gl.cullFace(this.gl.BACK);
   
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
   
   // call init callback 
   this.cbfInit();
   
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
 * @param{float} r red component, range [0,1]
 * @param{float} g green component, range [0,1]
 * @param{float} b blue component, range [0,1]
 * @param{float} a alpha component, range [0,1]
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
 * @param x x-Screen-Position
 * @param y y-Screen-Position
 * @param w Screen width
 * @param h Screen height
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
 * @param{string} url The URL to the texture
 * @return{texture} the texture
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
   this.scene = new SceneGraph(this);
}

//------------------------------------------------------------------------------
/**
 * @description Draw Text using internal bitmap font
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
 * @description returns the mousepos and direction vector of a mouse click on the canvas in ?? coordinates
 */
engine3d.prototype.GetDirectionMousePos = function(x, y, mvp)
{
   if (mvp == null)
   {
      mvp = this.matModelViewProjection;
   }
   
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
       // console.log("engine CoorOnNearPlaneWorld: "+CoorOnNearPlaneWorld.ToString());

   var CoorOnFarPlane = new vec3();   
       CoorOnFarPlane.Set(fx,fy,fz);              
   var CoorOnFarPlaneWorld = mvpInv.MultiplyVec3(CoorOnFarPlane);
       // console.log("engine CoorOnFarPlaneWorld: "+CoorOnFarPlaneWorld.ToString());
                    
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
         engine.cbfTimer(nMSeconds);
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
         engine.cbfRender(); // call  draw callback function
      }
   }
}

//------------------------------------------------------------------------------
// *** ENGINE CALLBACK MANAGEMENT ** (INTERNAL FUNCTIONS)
//------------------------------------------------------------------------------
/**
 * @description internal _resize
 * @ignore
 */
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
