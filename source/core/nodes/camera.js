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

goog.provide('owg.CameraNode');

goog.require('owg.ScenegraphNode');
goog.require('owg.mat4');

/**
 * Camera Node. Setup projection matrix
 * @author Martin Christen martin.christen@fhnw.ch 
 * @constructor
 */
function CameraNode()
{
      this.matProjection = new mat4();
      this.near = 0.0000001;
      this.far = 2.0;
      this.fov = 45;

      //------------------------------------------------------------------------
      this.GetFovY = function()
      {
         return this.fov;
      }
      //------------------------------------------------------------------------
      this.OnChangeState = function()
      {
         this.engine.SetProjectionMatrix(this.matProjection);  
      }
     
      //------------------------------------------------------------------------
      this.OnRender = function()
      {
         
      }
      
      //------------------------------------------------------------------------
      this.OnTraverse = function(ts)
      {
         this.CreatePerspectiveProjection(this.fov, this.near , this.far);
         ts.OverwriteProjectionMatrix(this.matProjection);
      }
      
      //------------------------------------------------------------------------
      this.OnInit = function()
      {

      }
      
      //------------------------------------------------------------------------
      this.OnExit = function()
      {
      
      }
      
      //------------------------------------------------------------------------
      this.OnRegisterEvents = function(context)
      {
         
      }
}

CameraNode.prototype = new ScenegraphNode();

//------------------------------------------------------------------------------

CameraNode.prototype.CreatePerspectiveProjection = function(fovY, fNear, fFar)
{
   var aspect = this.engine.width / this.engine.height;
   this.matProjection.Perspective(fovY, aspect, fNear, fFar)
}

//------------------------------------------------------------------------
