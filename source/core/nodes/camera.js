/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
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
      this.near = 0.00001;
      this.far = 10.0;
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
