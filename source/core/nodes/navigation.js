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
 * Navigation Node. Setup view matrix using a navigation
 * @author Martin Christen martin.christen@fhnw.ch 
 * @constructor
 */
function NavigationNode()
{
      this.lastkey = 0;
      //------------------------------------------------------------------------
      this.OnChangeState = function()
      {
         
      }
      //------------------------------------------------------------------------
      this.OnRender = function(engine)
      {
         this.engine.DrawText("Key: " + this.lastkey,0,100);
      }
      //------------------------------------------------------------------------
      this.OnTraverse = function(ts)
      {
         
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
          this.engine.eventhandler.AddKeyDownCallback(this, this.OnKeyDown);
      }
      //------------------------------------------------------------------------
      
      this.OnKeyDown = function(sender, key)
      {
         sender.lastkey = key;
      }
}

NavigationNode.prototype = new Node();