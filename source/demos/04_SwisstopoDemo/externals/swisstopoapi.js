

var swisstopoapi = {};
swisstopoapi.waitforheight = [];
swisstopoapi.timeoutid;

/**
 * @description loads a jsonp file: internal function
 * @param {string} url the request url
 * @param {function} cb the callback function
 */
swisstopoapi.getJSONP = function(url,cb)
{
   var cbnum = "cb"+swisstopoapi.getJSONP.counter++;
   var cbname ="swisstopoapi.getJSONP."+cbnum;
   
   url+="&cb="+cbname;
   
   var script = document.createElement("script");
   swisstopoapi.getJSONP[cbnum] = function(response)
                     {
                        try{
                           cb(response)
                        }
                        finally
                        {
                           delete swisstopoapi.getJSONP[cbnum];
                           script.parentNode.removeChild(script);
                        }
                     }
   script.src = url;
   document.body.appendChild(script);
}
swisstopoapi.getJSONP.counter = 0;


/**
 * @description loads a jsonp file
 * @param {string} place the place to look for
 */
swisstopoapi.sendQuery = function(place)
{
   /*clear result list */
   var node = document.getElementById('divSearchResults');
   while(node.children.length>1) {
    node.removeChild(node.lastChild);
   }
   // send the query
   queryUrl = "http://api.geo.admin.ch/swisssearch/geocoding?query="+place;
   this.getJSONP(queryUrl,swisstopoapi.jsoncallback);
   document.body.style.cursor = "wait";
   document.getElementById("txtInput").style.cursor = 'wait';
   //set a timeout for the request...
   swisstopoapi.timeoutid = setTimeout(function(){document.getElementById("txtInput").value = "Not found...";
      document.body.style.cursor = 'default';
      document.getElementById("txtInput").style.cursor = 'text';},10000);
}


/**
 * @description the json callback this function parses the result and sets the "search result" content
 * @param {Object} data the answer data object from geo.admin.ch
 */
swisstopoapi.jsoncallback = function(data)
{
   clearTimeout(swisstopoapi.timeoutid);
   //if no data return
   if(data.results.length==0)
   {
      document.getElementById("txtInput").value = "Not found...";
      document.body.style.cursor = 'default';
      document.getElementById("txtInput").style.cursor = 'text';
      return; 
   }
   
   //set the searchresult-div to visible
   var divResults = document.getElementById("divSearchResults");
   divResults.style.visibility = 'visible';
   document.getElementById("divSearchResultTitle").style.visibility = 'visible';
   
   //parse json answer
   rawdata = data.results;
   
   
   
   //go trough the result array and append resultbars
   for(var i=0;i<rawdata.length;i++)
   {

      //create a resultbar and append it
      var resultbar = document.createElement('div');
      resultbar.innerHTML = rawdata[i].label;
      resultbar.id = 'divResultBar';
      
      resultbar.bbox = rawdata[i].bbox;
      resultbar.data = rawdata[i];
      
      //the onclick callback if someone clicks on a resultbar
      resultbar.onclick = function()
      {
         document.getElementById("divSearchResultTitle").style.visibility = 'hidden';
         var sr = document.getElementById("divSearchResults");
         sr.style.visibility = 'hidden';
         
         //fly to position
         if(this.bbox[0]==this.bbox[2] && this.bbox[1] == this.bbox[3])
         {
            var lat = CHtoWGSlat(this.bbox[0],this.bbox[1]);
            var lng = CHtoWGSlng(this.bbox[0],this.bbox[1]);
            
            //fly to position and set a poi
            //get the height of the position - unused
            swisstopoapi.getJSONP("http://api.geo.admin.ch/height?easting="+this.bbox[0]+"&northing="+this.bbox[1],swisstopoapi.heightcallback);
            this.data.lat = lat;
            this.data.lng = lng;
            swisstopoapi.waitforheight.push(this.data);
            
         }
         else //calc the middle of the bounding box
         {
            var lat = CHtoWGSlat((this.bbox[0]+this.bbox[2])/2,(this.bbox[1]+this.bbox[3])/2);
            var lng = CHtoWGSlng((this.bbox[0]+this.bbox[2])/2,(this.bbox[1]+this.bbox[3])/2);
            
            // just fly to position
            var pos = ogGetOrientation(scene);
            ogFlyToLookAtPosition(scene,lng,lat,100,5000,pos.yaw,-45,0);
            
         }
         


         
    
      }
      
      //the search result div dissapears if a click on body occurs.
      document.body.onclick = function()
      {
         document.getElementById("divSearchResultTitle").style.visibility = 'hidden';
         var sr = document.getElementById("divSearchResults");
         sr.style.visibility = 'hidden';
         document.body.onclick = null;
      }

      //add the resultbar to the search results.
      divResults.appendChild(resultbar);
   }
   
   document.body.style.cursor = 'default';
   document.getElementById("txtInput").style.cursor = 'text';
}


/**
 * @description callback of a height request... not really used at the moment.
 */
swisstopoapi.heightcallback = function(data)
{
   //posdata = swisstopoapi.waitforheight.pop(rawdata[i]);
   posdata = swisstopoapi.waitforheight.pop();
   posdata.height = data.height;
   
  //set a poi if it's an address....
   if(posdata.service == "address")
   {
      ogChangePOIPositionWGS84(searchpoi,posdata.lng,posdata.lat,posdata.height+10);
   }
  
   
   //fly to
   var pos = ogGetOrientation(scene);
   ogFlyToLookAtPosition(scene,posdata.lng,posdata.lat,posdata.height,1000,pos.yaw,-45,0);
}



