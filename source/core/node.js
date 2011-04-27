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

/**
 * Unique ID for nodes.
 * @ignore
 */
var _g_id = 0;

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












