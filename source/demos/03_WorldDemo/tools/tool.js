/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/



/** 
 * @class Tool
 * @description  Base class for all tools.
 * @constructor
 * 
 * {@link http://www.openwebglobe.org} 
 * 
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch 
 * @version 0.1  
 */
function Tool()
{
   this.active = false;
   this.enable = false;
   this.toolbox = null;
   

   this.div = null;
   this.activeCallback = null;
   this.inactiveCallback = null;  
   
}


//------------------------------------------------------------------------------
/**
 * @description Initializes the icon
 * @param {object} the toolbox
 * @param {number} sizeX icon width
 * @param {number} sizeY icon height
 * @param {number} offsetX the x-position from toolboxes upper left corner. 
 * @param {number} offsetY the y-position from toolboxes upper left corner. 
 */
Tool.prototype.InitTool = function(toolbox,sizeX,sizeY,offsetX,offsetY)
{
   this.active = false;
   this.enable = true; //no enable-disable handling implemented, but foreseen...
   this.toolbox = toolbox;
   
   //set up Tool div
   this.div = document.createElement('div');
   this.div.style.height = sizeX+'px';
   this.div.style.width = sizeY+'px';
   this.div.style.position = 'absolute';
   this.div.style.left = offsetX+'px';
   this.div.style.top = offsetY+'px';
   
   this.div.id = 'pickCoordinatesIcon';
   this.toolbox.div.appendChild(this.div);
  
}

//------------------------------------------------------------------------------
/**
 * @description Sets the icon into active mode
 * 
 */
Tool.prototype.SetIconActive = function()
{
   this.div.style.opacity = 0.5;
   this.active = true;
   if(this.activeCallback)
   {
      this.activeCallback();
   }
}


//------------------------------------------------------------------------------
/**
 * @description Sets the icon into inactive mode
 * 
 */
Tool.prototype.SetIconInactive = function()
{
   this.div.style.opacity = 1.0;
   this.active = false;
   if(this.inactiveCallback)
   {
      this.inactiveCallback();
   }
}



//------------------------------------------------------------------------------
/**
 * @description sets the callback function for a inactive-active state change event.
 * @param {function} f the callback function.
 */
Tool.prototype.SetActiveCallback = function(f)
{
      this.activeCallback = f;  
}


//------------------------------------------------------------------------------
/**
 * @description sets the callback function for a active-inactive state change event.
 * @param {function} f the callback function.
 */
Tool.prototype.SetInactiveCallback = function(f)
{
      this.inactiveCallback = f;  
}



