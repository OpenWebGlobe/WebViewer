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

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Base Class for all elevation layer types.
 * This is an interface, don't use directly.
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ElevationLayer()
{
   /**
    * @description Returns true if elevation layer is ready to be used
    */
   this.Ready = function(){return false;}
   /**
    * @description Returns false if elevation layer failed initialization
    */
   this.Failed = function(){return false;}
   
   /**
    * @description Request an elevation tile. Once this tile finished download
    * the ready-callback function will be called. If failed, the failed
    * callback will be called.
    */
   this.RequestTile = function(engine, quadcode, layer, cbfReady, cbfFailed){};
   
   /**
    * @description Returns the min level of detail supported by this dataset
    */
   this.GetMinLod = function(){return 0;}
   
   /**
    * @description Returns the max level of detail supported by this dataset
    */
   this.GetMaxLod = function(){return 0;}
   
   /**
   * @description Test if specified tile (given by quadcode) exists in this layer. 
   * Only call this if this layer is Ready().
   */
   this.Contains = function(quadcode){return false;}
}
//------------------------------------------------------------------------------

