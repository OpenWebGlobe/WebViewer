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
*                Read the file LICENSE for licensing information               *
*******************************************************************************/

/**
 * Camera Node. Setup projection matrix
 * @author Martin Christen martin.christen@fhnw.ch 
 * @constructor
 */
function CameraNode()
{
      this.matProjection = new mat4();
   
      //------------------------------------------------------------------------
      this.OnChangeState = function()
      {
         this.engine.SetProjectionMatrix(this.matProjection);  
      }
     
      //------------------------------------------------------------------------
      this.OnRender = function()
      {
         this.engine.DrawText("Hello from Camera Node", 0, 0);
      }
      
      //------------------------------------------------------------------------
      this.OnTraverse = function(ts)
      {
         this.CreatePerspectiveProjection(45, 0.01, 100.0);
         //ts.overwriteProjection(this.matProjection);
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
      this.OnRegisterEvents = function()
      {
         
      }
}

CameraNode.prototype = new Node();

//------------------------------------------------------------------------------

CameraNode.prototype.CreatePerspectiveProjection = function(fovY, fNear, fFar)
{
   var aspect = this.engine.width / this.engine.height;
   this.matProjection.Perspective(fovY, aspect, fNear, fFar)
}

//------------------------------------------------------------------------
