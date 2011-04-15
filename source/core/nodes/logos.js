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

//------------------------------------------------------------------------
/**
 * Logos Node. Draw logos
 * @author Martin Christen martin.christen@fhnw.ch 
 * @constructor
 */
function LogosNode()
{
      this.logo = null;
      this.compassbg = null;
      this.compassr = null;
      this.mx = 0;
      this.my = 0;
      this.btn = false;
      //------------------------------------------------------------------------
      this.OnChangeState = function()
      {
         
      }
     
      //------------------------------------------------------------------------
      this.OnRender = function()
      {
         this.logo.Blit(this.engine.width-72, this.engine.height-72,0,0,1,1,true);
         
         if (this.btn)
         {
            this.compassbg.Blit(this.mx-64, this.my-64,0,0,1,1,true);
            this.compassr.Blit(this.mx-64, this.my-64,0,0,1,1,true);
         }
         
      }
      
      //------------------------------------------------------------------------
      this.OnTraverse = function(ts)
      {
         
      }
      
      //------------------------------------------------------------------------
      this.OnInit = function()
      {
          this.logo = new texture(this.engine);
          this.logo.LoadLogo();
          
          this.compassbg = new texture(this.engine);
          this.compassbg.LoadCompassBackground();
          
          this.compassr = new texture(this.engine);
          this.compassr.LoadCompassRose();
      }
      
      //------------------------------------------------------------------------
      this.OnExit = function()
      {
      
      }
      
      //------------------------------------------------------------------------
      this.OnRegisterEvents = function()
      {
         this.engine.eventhandler.AddMouseDownCallback(this, this.OnMouseDown);
         this.engine.eventhandler.AddMouseUpCallback(this, this.OnMouseUp);
      }
      //------------------------------------------------------------------------
      
      this.OnMouseDown = function(sender, button, x, y)
      {
         if (button == 0)
         {
            sender.mx = x;
            sender.my = sender.engine.height-y-1;
            sender.btn = true;
         }
      }
      
      this.OnMouseUp = function(sender, button, x, y)
      {
         if (button == 0)
         {
            sender.btn = false;
         }
      }
}

LogosNode.prototype = new Node();

//------------------------------------------------------------------------------


