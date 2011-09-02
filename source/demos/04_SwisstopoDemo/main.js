goog.require('owg.OpenWebGlobe');

//Definition oo global variables
var globe;
var boundlayer = 0;
var scene;
var world;

function OnKeyDown(ctx,key)
{
   if(key == 49) // 1 -
   {
      ogSetRenderQuality(world,1);
   }
   if(key == 50) // 2 - Change POI Icon
   {
       ogSetRenderQuality(world,2);
   }
      if(key == 51) // 3- Change POI Icon
   {
       ogSetRenderQuality(world,3);
   }
}
/**
 * @description set up the virtual globe
 */
function main()
{
      resizeCanvas();
      g_context = ogCreateContextFromCanvas("canvas", true);

      globe = ogCreateGlobe(g_context);


      //load blue marble image data
      var imgBlueMarble500 =
      {
         url     : ["http://www.openwebglobe.org/data/img"], //change adress here
         layer   : "World500",
         service : "i3d"
      };
      ogAddImageLayer(globe, imgBlueMarble500);

      //load swissimage data
      var imgSWISSTOPO =
      {
            url     : ["http://10.42.2.37"], //change adress here
            layer   : "swissimage",
            service : "owg"
      };
      ogAddImageLayer(globe, imgSWISSTOPO);

      //load Elevation data dhm25
      var elvDHM =
      {
            url     : ["http://10.42.2.37"], //change adress here.
            layer   : "DHM25",
            service : "owg"
      }
      ogAddElevationLayer(globe, elvDHM);

      ogSetBackgroundColor(g_context, 0.2,0.2,0.7,1);

      scene = ogGetScene(g_context);
      world = ogGetWorld(scene);

      //create the poilayer and load the pois from loadpois.js
      layer = ogCreatePOILayer(world,"poilayer");
      loadpois(layer);

      ogSetCanvasSizeOffset(scene,250,125);

      document.body.onclick = function(){ document.getElementById("divNavigationManual").style.visibility = 'hidden';
      document.body.onclick = null;}


}


/**
 * @description adapt canvas size.
 */
function resizeCanvas(engine,w,h)
{
      if(scene>0)
      {
            ogSetSize(scene,window.innerWidth-400,window.innerHeight-425);
      }


      /*var c = document.getElementById("canvas");
      c.width = window.innerWidth-250;
      c.height = window.innerHeight-125;
      console.log("resized w: "+w+" h: "+h);*/
}


/**
 * @description search button callback.
 */
function search()
{
      var searchtext = document.getElementById("txtInput").value;
      swisstopoapi.sendQuery(searchtext);
}


/**
 * @description flyto links callback.
 */
function flyto(n)
{
      var pos = ogGetOrientation(scene);
      switch(n)
      {
            //FHNW
            case 1:     ogFlyToLookAtPosition(scene,7.591127,47.550558,300,4000,pos.yaw,-45,0);
                        break;

            //EPFL
            case 2:    ogFlyToLookAtPosition(scene,6.565556,46.520278,300,4000,pos.yaw,-45,0);
                       break;

            //Nürensdorf
            case 3:    ogFlyToLookAtPosition(scene,8.648886,47.446943,300,4000,pos.yaw,-45,0);
                       break;

            //gruyere
            case 4:    ogFlyToLookAtPosition(scene, 7.081948,46.583608,300,4000,pos.yaw,-45,0);
                       break;

            default:    break;

      }
}


/**
 * @description toggle the boundary layer
 */
function toggleboundaries(sender)
{
      var boundariesLayer =
      {
            url     : ["http://10.42.2.37"], //??
            layer   : "DHM25",
            service : "owg"
      }

      //just for test - replace this with the boundary tile service.
      var imgOpenStreetMap =
      {
      url     : ["http://a.tile.openstreetmap.org", "http://b.tile.openstreetmap.org", "http://c.tile.openstreetmap.org" ],
      service : "osm"
      };
      if(sender.checked == true)
      {
            boundlayer = ogAddImageLayer(globe, imgOpenStreetMap);
      }
      else
      {
            ogRemoveImageLayer(boundlayer);
      }
}
