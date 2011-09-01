

var swisstopoapi = {};



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
swisstopoapi.waitforheight = [];



swisstopoapi.sendQuery = function(place)
{
   /*clear result list */
   var node = document.getElementById('divSearchResults');
   while(node.children.length>1) {
    node.removeChild(node.lastChild);
   }
   queryUrl = "http://api.geo.admin.ch/swisssearch/geocoding?query="+place;
   this.getJSONP(queryUrl,swisstopoapi.rawjsoncallback);
   document.body.style.cursor = "wait";
   
}



swisstopoapi.rawjsoncallback = function(data)
{
   if(data.results.length==0)
   {
      document.getElementById("txtInput").value = "Not found...";
      return; 
   }
   //parse json answer
   rawdata = data.results;
   targets = [];
   var divResults = document.getElementById("divSearchResults");
   
   
   for(var i=0;i<rawdata.length;i++)
   {
      divResults.style.visibility = 'visible';
      document.getElementById("divSearchResultTitle").style.visibility = 'visible';
      var resultbar = document.createElement('div');
      resultbar.innerHTML = rawdata[i].label;
      resultbar.id = 'divResultBar';
      
      resultbar.bbox = rawdata[i].bbox;
      resultbar.data = rawdata[i];
      
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

         }
         else //calc the middle of the bounding box
         {
            var lat = CHtoWGSlat((this.bbox[0]+this.bbox[2])/2,(this.bbox[1]+this.bbox[3])/2);
            var lng = CHtoWGSlng((this.bbox[0]+this.bbox[2])/2,(this.bbox[1]+this.bbox[3])/2);
         }
         ogFlyToLookAtPosition(scene,lng,lat,100,10000);
         
         //get the height of the position
         swisstopoapi.getJSONP("http://api.geo.admin.ch/height?easting="+this.bbox[0]+"&northing="+this.bbox[1],swisstopoapi.heightcallback);
         this.data.lat = lat;
         this.data.lng = lng;
         swisstopoapi.waitforheight.push(this.data);
         
      }
      document.body.onclick = function()
      {
         document.getElementById("divSearchResultTitle").style.visibility = 'hidden';
         var sr = document.getElementById("divSearchResults");
         sr.style.visibility = 'hidden';
         document.body.onclick = null;
      }

      divResults.appendChild(resultbar);
   }
   
   document.body.style.cursor = 'default';
}

swisstopoapi.heightcallback = function(data)
{
   posdata = swisstopoapi.waitforheight.pop(rawdata[i]);
   posdata.height = data.height;
   
   poistring="poidef = {icon     : \"[image]\",\n\
               text 		: "+posdata.label+",\n\
               position : ["+posdata.lng+","+posdata.lat+","+posdata.height+"],\n\
               size 		: 	20,\n\
               flagpole : true\n\
               };"
   //alert(poistring);
}



