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

As a special  exception to the  GPL, any HTML  file which merely  makes function
calls to  this code,  and for  that purpose  includes it  by reference, shall be
deemed a separate work for copyright law purposes. If you modify this code,  you
may extend this exception to your version of the code, but you are not obligated
to do so. If you do not wish to do so, delete this exception statement from your
version.

Commercial License

OEMs (Original  Equipment Manufacturers),  ISVs (Independent  Software Vendors),
VARs (Value Added Resellers) and other distributors that combine and  distribute
commercially licensed  software with  i3D OpenWebGlobe  SDK and  do not  wish to
distribute the source code for the commercially licensed software under  version
2 of the  GNU General Public  License (the "GPL")  must enter into  a commercial
license agreement with the Institute of Geomatics Engineering at the  University
of Applied Sciences Northwestern Switzerland (FHNW).
*******************************************************************************/

/**
 * Unique ID for nodes.
 * @ignore
 */
_g_id = 0;

//------------------------------------------------------------------------------
/**
 * Scenegraph Node (Base)
 * @author Martin Christen martin.christen@fhnw.ch 
 * @constructor
 */
function Node()
{
   this.Id = _g_id; //_generateId();
   _g_id++;
   
  
   this.OnRender = function(){};
   this.OnTraverse = function(TraversalState){}; 
   this.OnChangeState = function(){};  
   this.OnInit = function(){};
   this.OnExit = function(){};
   
   this.OnRegisterEvents = function(){}; // function that is called to register events (mouse/key/...)

   this.engine = null;
   
   this.ParentNode = null;    // Parent node or 0 if root
   this.vecChildren = new Array();  // Child Nodes. Empty if there are none.
}

//------------------------------------------------------------------------------
Node.prototype.SetEngine = function(e)
{
   this.engine = e;
}

//------------------------------------------------------------------------------
Node.prototype.InitNode = function()
{
   this.OnRegisterEvents();
   this.OnInit();
}
//------------------------------------------------------------------------------
// Nodes for OpenWebGlobe
//------------------------------------------------------------------------------

// *** NAVIGATION ***
function NavigationNode()
{

}

NavigationNode.prototype = new Node();


//------------------------------------------------------------------------------
// *** CAMERA ***
function CameraNode()
{
   
      
      this.OnRender = function(engine)
      {
         
      }
      
      this.OnTraverse = function(ts)
      {
         
      }
      
      // on init..
      this.OnInit = function()
      {
      
      }
      
      // on exit
      this.OnExit = function()
      {
      
      }
      
      // register events: camera doesn't need any!
      this.OnRegisterEvents = function()
      {
         
      }
}

CameraNode.prototype = new Node();

//------------------------------------------------------------------------------

function BeginRenderNode()
{
 
}

BeginRenderNode.prototype = new Node();
//------------------------------------------------------------------------------

function RenderObjectNode()
{

}

RenderObjectNode.prototype = new Node();
//------------------------------------------------------------------------------

function RenderNode()
{

}

RenderNode.prototype = new Node();
//------------------------------------------------------------------------------

function EndRenderNode()
{

}

EndRenderNode.prototype = new Node();
//------------------------------------------------------------------------------

function LogosNode()
{

}

LogosNode.prototype = new Node();
//------------------------------------------------------------------------------

