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
 * @class Tool
 * @description  the picking-coordinates tool. subclass of tool.js
 * @constructor
 * 
 * {@link http://www.openwebglobe.org} 
 * 
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch 
 * @version 0.1
 * @param {object} toolbox the toolbox object.
 * @param {number} sizeX icon width
 * @param {number} sizeY icon height
 * @param {number} offsetX the x-position from toolboxes upper left corner. 
 * @param {number} offsetY the y-position from toolboxes upper left corner.
 */
function CoordinatesTool(toolbox,sizeX,sizeY,offsetX,offsetY)
{
  
   this.InitTool(toolbox,sizeX,sizeY,offsetX,offsetY);// constructor from base class.
   

   //set up lat,long indicator
   this.display = document.createElement('div');
   this.display.id = "pickCoordinatesToolDisplayDiv";
   this.display.style.visibility = 'hidden';
   document.body.appendChild(this.display);
   
   
   
   var tool = this;
   this.cbfClickWhenActive = function(event){tool.onclick(event);}; //event-handling voodoo...
   
 
   this.div.addEventListener("click",function(){tool.cbfToggleActiveState();},false);
  

}
CoordinatesTool.prototype = new Tool();


//------------------------------------------------------------------------------
/**
 * @description toggles the tool active state.
 */
CoordinatesTool.prototype.cbfToggleActiveState = function()
{
    //we are in the tool focus
   if(!this.active)
   {
      this.SetActive();
      this.SetIconActive();
   }
   else
   {
      this.SetInactive();
      this.SetIconInactive();
   }   
}

//------------------------------------------------------------------------------
/**
 * @description sets the tool in active mode.
 */
CoordinatesTool.prototype.SetActive = function()
{
   this.SetIconActive();
   document.getElementById(this.toolbox.canvasId).style.cursor = 'crosshair';
   document.getElementById(this.toolbox.canvasId).addEventListener("click",this.cbfClickWhenActive,false);
     
}

//------------------------------------------------------------------------------
/**
 * @description sets the tool in inactive state.
 */
CoordinatesTool.prototype.SetInactive = function()
{
   this.SetIconInactive(); //defined in superclass
   document.getElementById(this.toolbox.canvasId).style.cursor = 'default'; 
   document.getElementById(this.toolbox.canvasId).removeEventListener("click",this.cbfClickWhenActive,false);
}


//------------------------------------------------------------------------------
/**
 * @description onclick eventhandler. gets the coordinate position and displays the div.
 * @param {object} eventData the mouse position
 */
CoordinatesTool.prototype.onclick = function(eventData)
{  
   this.display.style.left = eventData.clientX-this.display.clientWidth/2+'px';
   this.display.style.top = eventData.clientY-this.display.clientHeight/2+'px';
   this.display.style.visibility = 'visible';
   this.display.addEventListener('mouseout',function(){this.style.visibility = 'hidden';},false);
   
  // alert('clicked with tool x:'+this.div.style.left+'y:'+this.div.style.top);
   
   //here call the web globe picking method...
   //and switch off the compass!
   //var pickresult = new Object();
   //engine.PickGlobe(eventData.clientX, eventData.clientY, pickresult);
   var scene = ogGetScene(g_context);
   var result = ogPickGlobe(scene, eventData.clientX, eventData.clientY);
   
   if (result[0])
   {
      this.display.innerHTML = "<p class='pickCoordinatesTooldisplay'>Latitude: "+result[1]+"<br><br>Longitude: "+result[2]+"<br><br>Elevation: "+result[3]+"</p>";
   }
   else
   {
      this.display.innerHTML = "<p class='pickCoordinatesTooldisplay'>no pick result!</p>";
   }
}











