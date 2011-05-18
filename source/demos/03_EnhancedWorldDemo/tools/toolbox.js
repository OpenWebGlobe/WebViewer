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

//goog.provide('owg.CanvasTexture');
/** 
 * @class ToolBox 
 * @description  Creates a Toolbox and handles the tools object activeness.
 * @constructor
 * 
 * {@link http://www.openwebglobe.org} 
 * 
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch 
 * @version 0.1  
 */
function ToolBox(tbname, canvasId)
{
   //create toolbox panel 
   this.name = tbname;
   this.canvasId = canvasId;
   this.div = document.createElement('div');
   this.div.id = tbname;
    document.body.appendChild(this.div);
   
   
   this.positionX = parseInt(getStyle(this.div,'left'));
   this.positionY = parseInt(getStyle(this.div,'top'));
  
   
   this.dragOffsetX = 0;
   this.dragOffsetY = 0;  
 
   var tb = this;
   this.div.onmousedown = function(e){tb.StartDrag(e)};
   this.div.onmouseup = function(e){tb.StopDrag(e)};
   this.cbfDrag = function(e){tb.MouseMove(e)}; 

   this.tools = [];
   
    
   //add tools
   
   pickCoordinates = new CoordinatesTool(this,40,40,10,40);
   pickCoordinates.SetActiveCallback(this.cbfToolSetActive);
   this.tools.push(pickCoordinates);
   
   //insert more tools here... 
  
}

//------------------------------------------------------------------------------
/**
 * @description This function will be called from a tool-object if one of the tools is set to active.
 * 
 */
ToolBox.prototype.cbfToolSetActive = function()
{
   //set all others inactive
   for(var i=0;i<this.toolbox.tools.length;i++)
   {
      if(this.toolbox.tools[i] != this)
      {
         this.toolbox.tools[i].SetInactive();
      }     
   }  
}

//------------------------------------------------------------------------------
/**
 * @description Start dragging the toolbox. 
 * @param {object} event data with mouse-position.
 * 
 */
ToolBox.prototype.StartDrag = function(eventData)
{
   this.startDragX = eventData.clientX;
   this.startDragY = eventData.clientY;
   
   var tb = this;
   window.addEventListener("mousemove",this.cbfDrag,false);
   //store offset
}

//------------------------------------------------------------------------------
/**
 * @description Stop dragging the toolbox. 
 * 
 */
ToolBox.prototype.StopDrag = function()
{
    var tb = this;
    window.removeEventListener("mousemove",this.cbfDrag,false);
    this.positionX = this.newPositionX;
    this.positionY = this.newPositionY;
}

//------------------------------------------------------------------------------
/**
 * @description If drag-mode this function moves the div.
 * @param {object} event data with mouse-position.
 */
ToolBox.prototype.MouseMove = function(eventData)
{
   this.div.style.left = this.positionX-(this.startDragX-eventData.clientX)+'px';  //calc offset;
   this.div.style.top = this.positionY-(this.startDragY-eventData.clientY)+'px';
   this.newPositionX = this.positionX-(this.startDragX-eventData.clientX);
   this.newPositionY = this.positionY-(this.startDragY-eventData.clientY);
}



//------------------------------------------------------------------------------
/**
 * @description Function to get specific css style attribute.
 * @param {html-object} the html object e.g. a 'div'-element
 * @param {string} css attribute.
 */
function getStyle(oElm, strCssRule){
	var strValue = "";
	if(document.defaultView && document.defaultView.getComputedStyle){
		strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
	}
	else if(oElm.currentStyle){
		strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
			return p1.toUpperCase();
		});
		strValue = oElm.currentStyle[strCssRule];
	}
	return strValue;
}

/*
goog.exportSymbol('ToolBox', ToolBox);
goog.exportProperty(ToolBox.prototype, 'SetCanvasContent', CanvasTexture.prototype.SetCanvasContent);
goog.exportProperty(ToolBox.prototype, 'DrawToCanvas2D', CanvasTexture.prototype.DrawToCanvas2D);
goog.exportProperty(ToolBox.prototype, 'GenerateText', CanvasTexture.prototype.GenerateText);
*/





