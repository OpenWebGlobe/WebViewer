

/**
 * Toolbox handling class.
 */

function ToolBox(tbname)
{
   //create toolbox panel 
   this.name = tbname;
   this.div = document.createElement('div');
   this.div.id = 'toolbox';  //todo: think about this...
   this.positionX = 400;
   this.positionY = 400;
   
   this.dragOffsetX = 0;
   this.dragOffsetY = 0;
   
   
   
   
   //todo: dragging implementieren
 
 
   var tb = this;
   this.div.onmousedown = function(e){tb.StartDrag(e)};
   this.div.onmouseup = function(e){tb.StopDrag(e)};
   this.cbfDrag = function(e){tb.MouseMove(e)};

   document.body.appendChild(this.div);

   this.tools = [];
   
   
   //add tools
   pickCoordinates = new PickCoordinatesTool(this,40,40,10,40);
   pickCoordinates.SetActiveCallback(this.cbfToolSetActive);
   this.tools.push(pickCoordinates);
  /* 
   pickCoordinates2 = new PickCoordinatesTool(this,20,20,30,5);
   pickCoordinates2.SetActiveCallback(this.cbfToolSetActive);
   this.tools.push(pickCoordinates2);
   
   
   pickCoordinates3 = new PickCoordinatesTool(this,20,20,5,30);
   pickCoordinates3.SetActiveCallback(this.cbfToolSetActive);
   this.tools.push(pickCoordinates3);
   
   pickCoordinates4 = new PickCoordinatesTool(this,20,20,30,30);
   pickCoordinates4.SetActiveCallback(this.cbfToolSetActive);
   this.tools.push(pickCoordinates4);
  */
}


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


ToolBox.prototype.StartDrag = function(eventData)
{
   this.startDragX = eventData.clientX;
   this.startDragY = eventData.clientY;
   
   var tb = this;
   window.addEventListener("mousemove",this.cbfDrag,false);
   //store offset
}

ToolBox.prototype.StopDrag = function()
{
    var tb = this;
    window.removeEventListener("mousemove",this.cbfDrag,false);
    this.positionX = this.newPositionX;
    this.positionY = this.newPositionY;
    console.log("stop dragging toolbox");
}

ToolBox.prototype.MouseMove = function(eventData)
{
   
   this.div.style.left = this.positionX-(this.startDragX-eventData.clientX)+'px';  //calc offset;
   this.div.style.top = this.positionY-(this.startDragY-eventData.clientY)+'px';
   this.newPositionX = this.positionX-(this.startDragX-eventData.clientX);
   this.newPositionY = this.positionY-(this.startDragY-eventData.clientY);
}











