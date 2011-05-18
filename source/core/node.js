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

goog.provide('owg.ScenegraphNode');

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
function ScenegraphNode()
{
   /** @type number */
   this.Id = _g_id; //_generateId();
   _g_id++;
   
   /** @type function() */
   this.OnRender = function(){};
   /** @type function(TraversalState) */
   this.OnTraverse = function(TraversalState){};
   /** @type function() */
   this.OnChangeState = function(){};
   /** @type function() */
   this.OnInit = function(){};
   /** @type function() */
   this.OnExit = function(){};
   /** @type function() */
   this.OnRegisterEvents = function(){}; // function that is called to register events (mouse/key/...)
   /** @type engine3d */
   this.engine = null;
   /** @type Object|number */
   this.ParentNode = null;    // Parent node or 0 if root
   this.vecChildren = new Array();  // Child Nodes. Empty if there are none.
}

//------------------------------------------------------------------------------
/**
 * @description sets the engine
 * @param {engine3d} e
 *
 */
ScenegraphNode.prototype.SetEngine = function(e)
{
   this.engine = e;
}

//------------------------------------------------------------------------------
/**
 * @description init
 *
 */
ScenegraphNode.prototype.InitNode = function()
{
   this.OnRegisterEvents();
   this.OnInit();
}












