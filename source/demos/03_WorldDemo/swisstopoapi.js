

function swisstopoapi(cbfSearchStarted,cbfSearchSuccessful)
{
   
   this.queryname = "";
   this.targets = [];
   this.cbfSearchStarted = cbfSearchStarted;
   this.cbfSearchSuccessful = cbfSearchSuccessful;
   
}

swisstopoapi.prototype.SetSearchStartedCallback = function(f)
{
   this.cbfSearchStarted(f);
}

swisstopoapi.prototype.SetSearchSuccessfullCallback = function(f)
{
   this.cbfSearchSuccessful(f);
}


swisstopoapi.prototype.searchplace = function(name)
{
   this.queryname = name;
   //queryUrl = "http://api.geo.admin.ch/swisssearch/geocoding?query="+name+"&amp;format=raw&amp;cb=?";
   queryUrl = "http://api.geo.admin.ch/swisssearch/geocoding?query="+name+"&amp;&amp;cb=?";
   var a = this;
   jQuery.getJSON(queryUrl,function(data){a.rawjsoncallback(data);});
   
   document.body.style.cursor = 'wait';
   if(this.cbfSearchStarted)
   {
      this.cbfSearchStarted();  
   }

}

swisstopoapi.prototype.rawjsoncallback = function(data)
{
   //parse json answer
   rawdata = data.results;
   targets = [];
   
   for(var i=0;i<rawdata.length;i++)
   {
      if(rawdata[i].service == "swissnames")
      {
         var bbox=rawdata[i].bbox;
         var name = rawdata[i].label.split('<b>');
         var name = name[1].split('</b>');
         var a = {
                  "lat" : CHtoWGSlat(bbox[0],bbox[1]),
                  "lng" : CHtoWGSlng(bbox[0],bbox[1]),
                  "elv" : 3000,
                  "name" : name[0]
                  }
         targets.push(a);
         
         if(a.name.toLowerCase() == this.queryname.toLowerCase())
         {
            targets = [];
            targets.push(a);
            break;
         }
         
      }
   }
   
   this.targets = targets;
   
   document.body.style.cursor = 'default';
   if(this.cbfSearchSuccessful)
   {
      this.cbfSearchSuccessful(); 
   }
}