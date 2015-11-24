/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/


goog.provide('owg.ogPointSprite');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {ogObject} 
 * @description Mesh Object (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogPointSprite()
{
   /** @type {string} */
   this.name = "ogPointSpriteObject";
   /** @type {number} */
   this.type = OG_OBJECT_POINTSPRITE;
   /** @type {PointSprite}*/
   this.pointsprite = null;
   
   this.options = null;
   
   this.pointdata = null;
   
   this.dataindex = 0;
   this.oldindex = 0;
}

//------------------------------------------------------------------------------
ogPointSprite.prototype = new ogObject();


//------------------------------------------------------------------------------
/**
* @description parse options
* @param {GeometryOptions} options
* @ignore
*/
ogPointSprite.prototype.ParseOptions = function(options)
{
   this.options = options;
   
   var scene = this.parent.parent;
   var context = scene.parent;
   var engine = context.engine; // get engine!
   this.pointsprite = new  PointSprite(engine);
   if(options["Vertices"])
   {
      this.pointsprite.SetPoints(options["Vertices"]);
   }
   if(options['PointUrl'])
   {
      this.loadPointCloudFromXYZ(options['PointUrl']);
      this.numberofpoints = options["NumberOfPoints"];
      this.pointsprite.SetNumberOfPoints(this.numberofpoints);
   }
   this.pointsprite.SetCenter(options["Center"][0],options["Center"][1],options["Center"][2]);
}

//------------------------------------------------------------------------------
/**
* @description parse options
* @param {Array.<number>} pointData
* @ignore
*/
ogPointSprite.prototype.UpdatePointData = function(pointData)
{
   this.pointsprite.SetPoints(pointData); 
}



//------------------------------------------------------------------------------
/**
* @description parse options
* @param {Array.<{Number}>} pointData 
* @ignore
*/
ogPointSprite.prototype.loadPointData = function(pointData)
{
   this.pointdata = pointData;
   this.pointsprite.SetPoints(pointData);
   
}

//------------------------------------------------------------------------------
/**
 * @description Called when object is destroyed. Never call manually.
 * @ignore
 */
ogPointSprite.prototype._OnDestroy = function()
{
   if (this.pointsprite)
   {
      this.pointsprite.Destroy();
      this.pointsprite = null;
      this.status = OG_OBJECT_FAILED;
   }
}






/**
 * @description hides the mesh
 * 
 */
ogPointSprite.prototype.Hide = function()
{
  this.pointsprite.hide=true;
}


//------------------------------------------------------------------------------
/**
 * @description Sets the postion of the whole geometry
 * @param {number} lng
 * @param {number} lat
 * @param {number} elv
 */
ogPointSprite.prototype.SetPositionWGS84 = function(lng,lat,elv)
{
   //todo  
}



/**
 * @description shows the mesh
 * 
 */
ogPointSprite.prototype.Show = function()
{
   this.pointsprite.hide=false;
}








//------------------------------------------------------------------------------
/**
 * @description Load surface-data from a JSON file.
 * @param {string} url the url to the JSON file.
 */
ogPointSprite.prototype.loadPointCloudFromXYZ = function(url)
{
   if(url == null) 
   {
      alert("invalid xyzurl");
      return;
   }  
   this.xyzUrl=url;
      
   this.http=new window.XMLHttpRequest();
   this.http.open("GET",this.xyzUrl,true);
   //this.http.setRequestHeader("Cache-Control", "public");
   
   var me=this;
   this.http.onreadystatechange = function(){me._cbfxyzdownload();};
   this.http.onprogress = function(){me._cbfonprogress();}
   this.http.send();
   this.dataindex = 0;
   this.oldindex = 0;
}








ogPointSprite.prototype._cbfonprogress = function()
{
   //get the response data
   var response = this.http.responseText;
   
   //look for the last \n
   this.dataindex = response.lastIndexOf('\n');


   //this.dataindex = response.length;  
   response = response.substr(this.oldindex,this.dataindex-this.oldindex-1);
  
  // var lr = (response.substr(response.length-100,response.length));
   //var lr = (response.substr(0,100));
   //console.log("uuaaii: "+lr);
   
   
   var data = [];
   var pointarray = response.split(',');
  
   
   for(var i=0;i<pointarray.length;i++)
   {
      
         var n = parseFloat(pointarray[i]);
         if(isNaN(n))
         {
            continue;
         }
         data.push(n);
         
         
   }
   
     

   this.pointsprite.SetPoints(data);
   
   this.oldindex = this.dataindex;
   
  
}


//------------------------------------------------------------------------------
/** 
 * @description download callback
 * @ignore
 */
ogPointSprite.prototype._cbfxyzdownload = function()
{
   if (this.http.readyState==4)
   {
      if(this.http.status==404)
      {
         alert('xyz-file not found...');
      }
      else
      {
         //var data=this.http.responseText;
         this._cbfonprogress();
        
      }     
   }    
}
