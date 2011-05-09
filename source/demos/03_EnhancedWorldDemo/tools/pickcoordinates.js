function PickCoordinatesTool(toolbox,sizeX,sizeY,offsetX,offsetY)
{
   this.active = false;
   this.icon = "";
   this.iconActive = "";
   this.enable = true; //maybe if some tools sometimes not useful...
   this.webGLCanvas = null;
   this.toolbox = toolbox; 
   
   //set up Tool div
   this.div = document.createElement('div');
   this.div.style.height = sizeX+'px';
   this.div.style.width = sizeY+'px';
   this.div.style.position = 'absolute';
   this.div.style.left = offsetX+'px';
   this.div.style.top = offsetY+'px';
   this.div.style.backgroundColor = '#ff0000';
   
   //set up lat,long indicator
   this.display = document.createElement('div');
   this.display.id = "pickCoordinatesToolDisplayDiv";
   document.body.appendChild(this.display);
   /*
   this.display.style.height = '40px';
   this.display.style.width = '80px';
   this.display.style.backgroundColor = '#ffffff';
   this.display.style.position = 'absolute';
   */
 
   this.toolbox.div.appendChild(this.div);
   
   var tool = this;
   this.div.addEventListener("click",function(){tool.cbfToggleActiveState();},false);
   var tool = this;
   this.cbfClickWhenActive = function(event){tool.onclick(event);}; //event-handling voodoo...
   
   this.setActiveCallback = null;
}




PickCoordinatesTool.prototype.cbfToggleActiveState = function()
{
    //we are in the tool focus
   if(this.active)
   {
      //set inactive
      this.div.style.backgroundColor='#ff0000';
      document.getElementById("canvas").style.cursor = 'default'; //todo what if it's not canvas?
      document.getElementById("canvas").removeEventListener("click",this.cbfClickWhenActive,false);
      this.active = false;
   }
   else
   {
      //set active
      //tool.div.style.backgroundColor='#00ff00';
      this.div.style.backgroundColor='#00ff00';
      document.getElementById("canvas").style.cursor = 'crosshair';
      var tool = this;
      document.getElementById("canvas").addEventListener("click",this.cbfClickWhenActive,false);
      this.active = true;
      if(this.setActiveCallback)
      {
         this.setActiveCallback();
      }     
   }   
}


PickCoordinatesTool.prototype.onclick = function(eventData)
{  
   this.display.style.left = eventData.clientX-this.display.clientWidth/2+'px';
   this.display.style.top = eventData.clientY-this.display.clientHeight/2+'px';
   this.display.style.visibility = 'visible';
   this.display.addEventListener('mouseout',function(){this.style.visibility = 'hidden';},false);
   
  // alert('clicked with tool x:'+this.div.style.left+'y:'+this.div.style.top);
   
   //here call the web globe picking method...
   //and switch off the compass!
   var pickresult = new Object();
   engine.PickGlobe(eventData.clientX, eventData.clientY, pickresult);
   this.display.innerHTML = "<p class='pickCoordinatesTooldisplay'>Latitude: "+pickresult.lat+"<br><br>Longitude: "+pickresult.lng+"<br><br>Elevation: "+pickresult.elv+"</p>";    
}


PickCoordinatesTool.prototype.SetInactive = function()
{
   this.div.style.backgroundColor='#ff0000';
   document.getElementById("canvas").removeEventListener("click",this.cbfClickWhenActive,false);
   this.active = false;
   this.display.style.visibility = 'hidden';
   
}


/*
 * Function will be called if the tool is getting active...
 */
PickCoordinatesTool.prototype.SetActiveCallback = function(f)
{
      this.setActiveCallback = f;  
}



