/*******************************************************************************
 * Demo-Service 3D Model Streaming in OpenWebGlobe written in node.js
 * This service creates cubes all over the world
 * This is meant as a reference implementation of true 3D streaming
 *
 * Note: Meridian convergence is ignored, use for "small" buildings only.
 *
 * Last Update: July 28, 2013
 * created by: martin.christen@fhnw.ch
 *
 ******************************************************************************/

var http = require('http');
var url = require('url');

var mat4 = require('./mat4.js').mat4;
var vec3 = require('./vec3.js').vec3;

//------------------------------------------------------------------------------
function ParseQueryParams(req)
{
   var result = {};

   var url_parsed = url.parse(req.url, true);
   var extent = url_parsed.query["extent"];
   var format = url_parsed.query["format"];
   result.errormsg = "";

   if (extent && format)
   {  // make sure format is correct:
      if (format == "owg")
      {
         result.format = format;
         result.extentarray = extent.split(',');

         // convert to float
         for(var i=0; i<result.extentarray.length; i++)
         {

            result.extentarray[i] = parseFloat(result.extentarray[i]);
            if (isNaN(result.extentarray[i]))
            {
               result.errormsg = "failed to convert extent to floats";
            }

         }
      }
      else
      {
         result.errormsg = format + " is an unknown format...";
      }
   }
   else
   {
      result.errormsg = "query params 'extent' and 'format' are required";
   }

   return result;
}
//------------------------------------------------------------------------------
// Convert WGS84 Coord to normalized Web Mercator [-1,-1] to [1,1]
function WGS84ToMercator(longitude, latitude)
{
   var lngRad = longitude * Math.PI / 180.0;
   var latRad = latitude * Math.PI / 180.0;

   var x = lngRad;
   var y = Math.log(Math.tan(Math.PI / 4.0 + latRad / 2.0));

   x /= Math.PI;
   y /= Math.PI;

   var result = [x,y];
   return result;
}
//------------------------------------------------------------------------------
// Convert WGS84 Coord to scaled geocentric cartesian coordinate
function WGS84ToCartesian(lng, lat, elv)
{
   var result = [];
   var lngRad = lng * Math.PI / 180.0;
   var latRad = lat * Math.PI / 180.0;
   var sinlat = Math.sin(latRad);
   var coslat = Math.cos(latRad);
   var sinlong = Math.sin(lngRad);
   var coslong = Math.cos(lngRad);
   var Rn = 6378137.0 / Math.sqrt(1.0-0.006694379990197*sinlat*sinlat);
   result[0] = (Rn + elv) * coslat * coslong * 1.1920930376163765926810017443897e-7;
   result[1] = (Rn + elv) * coslat * sinlong * 1.1920930376163765926810017443897e-7;
   result[2] = (0.993305620011365*Rn + elv) * sinlat * 1.1920930376163765926810017443897e-7;
   return result;
}

//------------------------------------------------------------------------------
// Add Version
function AddVersion(object)
{
   object["Version"] = "1.0";
}
//------------------------------------------------------------------------------
// Add Bounds (Mercator)
function AddBounds(object, extent)
{
   var m0 = WGS84ToMercator(extent[0],extent[1]);
   var m1 = WGS84ToMercator(extent[1],extent[2]);

   object["Bounds"] = [m0[0],m0[1],m1[0],m1[1]];
}
//------------------------------------------------------------------------------
// Add Texture atlas to this tile
function AddTexture(object, url)
{
   object["Texture"] = url;
}
//------------------------------------------------------------------------------
function GetVertexLength(vertex_semantic)
{
   var n=3;
   switch (vertex_semantic)
   {
      case "p":
         n = 3;
         break;
      case "pc":
         n = 7;
         break;
      case "pt":
         n = 5;
         break;
      case "pnc":
         n = 10;
         break;
      default:
         console.log("ERROR: vertex semantic", vertex_semantic, "is not supported!");
   }
   return n;
}
//------------------------------------------------------------------------------
// Add 3D Object
// center: WGS84 coord (with elevation)
function Add3DObject(object, id, center, vertex_semantic, vertexlist, indexlist)
{
   if (!object["Objects"])
   {
      object["Objects"] = [];
   }
   var object3d = {};

   var navframe = mat4.create();
   mat4.CalcNavigationFrame(navframe, center[0], center[1]);

   var cartesian = WGS84ToCartesian(center[0],center[1],center[2]);

   mat4.scale(navframe,navframe,vec3.fromValues(1.1920930376163765926810017443897e-7,1.1920930376163765926810017443897e-7,1.1920930376163765926810017443897e-7));

   // manually set translation component.
   navframe[12] = cartesian[0];
   navframe[13] = cartesian[1];
   navframe[14] = cartesian[2];
   // ...now the navframe matrix transforms cartesian positions to the globe
   //    at the specified position.

   // create inverse of navframe
   //navframe_inv = mat4.create();
   //mat4.invert(navframe_inv, navframe);

   var n=GetVertexLength(vertex_semantic);

   if (vertexlist.length % n != 0)
   {
      console.log("ERROR: size of vertex list is not correct! Check semantic!");
      return;
   }

   if (indexlist.length % 3 != 0)
   {
      console.log("ERROR: size of index list is not correct!");
      return;
   }

   var pos = vec3.create();
   var pos_transformed = vec3.create();
   //var texcoord = vec2.create();
   for (var i=0;i<vertexlist.length / n;i++)
   {
      pos[0] = vertexlist[i*n+0];
      pos[1] = vertexlist[i*n+1];
      pos[2] = vertexlist[i*n+2];

      vec3.transformMat4(pos_transformed, pos, navframe);
      //console.log("transformed: ", vec3.str(pos_transformed));

      vertexlist[i*n+0] = pos_transformed[0];
      vertexlist[i*n+1] = pos_transformed[1];
      vertexlist[i*n+2] = pos_transformed[2];

   }

   object3d["Id"] = id;
   object3d["VertexSemantic"] = vertex_semantic;
   object3d["Vertices"] = vertexlist;
   object3d["Indices"] = indexlist;
   object3d["IndexSemantic"] = "TRIANGLES";

   object["Objects"].push(object3d);

}
//------------------------------------------------------------------------------
// Add offset and bounding box to this tile
function CalcOffsetAndBoundingBox(object)
{
   if (!object["Objects"] || object["Objects"].length == 0)
   {
      console.log("ERROR: CalcOffsetAndBoundingBox: There is no 3D-Object data...");
      return;
   }

   var minx = 1e20;
   var miny = 1e20;
   var minz = 1e20;
   var maxx = -1e20;
   var maxy = -1e20;
   var maxz = -1e20;

   var pos = vec3.create();
   for (var i=0;i<object["Objects"].length;i++)
   {
      var vertex_semantic = object["Objects"][i]["VertexSemantic"];
      var n=GetVertexLength(vertex_semantic);

      var vertexlist = object["Objects"][i]["Vertices"];
      for (var i=0;i<vertexlist.length / n;i++)
      {
         pos[0] = vertexlist[i*n+0];
         pos[1] = vertexlist[i*n+1];
         pos[2] = vertexlist[i*n+2];

         minx = Math.min(minx, pos[0]);
         miny = Math.min(miny, pos[1]);
         minz = Math.min(minz, pos[2]);
         maxx = Math.max(maxx, pos[0]);
         maxy = Math.max(maxy, pos[1]);
         maxz = Math.max(maxz, pos[2]);
      }
   }

   object["Offset"] = [0.5*(minx+maxx),0.5*(miny+maxy),0.5*(minz+maxz)];
   object["BoundingBox"] = [[minx, miny, minz],[maxx,maxy,maxz]];
}
//------------------------------------------------------------------------------
function MakeRelative(object)
{
   if (!object["Objects"] || object["Objects"].length == 0)
   {
      console.log("ERROR: MakeRelative: There is no 3D-Object data...");
      return;
   }

   var offset = vec3.clone(object["Offset"]);
   for (var i=0;i<object["Objects"].length;i++)
   {
      var vertex_semantic = object["Objects"][i]["VertexSemantic"];
      var n=GetVertexLength(vertex_semantic);

      var vertexlist = object["Objects"][i]["Vertices"];
      for (var i=0;i<vertexlist.length / n;i++)
      {
         vertexlist[i*n+0] -= offset[0];
         vertexlist[i*n+1] -= offset[1];
         vertexlist[i*n+2] -= offset[2];

         /*vertexlist[i*n+0] = vertexlist[i*n+0].toPrecision(7);
         vertexlist[i*n+1] = vertexlist[i*n+1].toPrecision(7);
         vertexlist[i*n+2] = vertexlist[i*n+2].toPrecision(7);*/
      }
   }
}
//------------------------------------------------------------------------------
// Main Application
http.createServer(function (req, res) {

   res.writeHead(200, {'Content-Type': 'application/json'});

   var JSONObject = {};

   var query = ParseQueryParams(req);

   //
   if (query.errormsg.length > 0)
   {
      JSONObject["error"] = query.errormsg;
   }
   else
   {
      // no errors, we have a valid "query.format" and and "query.extentarray"
      AddVersion(JSONObject);
      AddBounds(JSONObject, query.extentarray);

      // center coordinate (WGS84) of request:
      var center = [0.5*(query.extentarray[0] + query.extentarray[2]),
                0.5*(query.extentarray[1] + query.extentarray[3]),0.0];

      //-----------------------------------------------
      // A CUBE (dimensions in [m])
      // Vertex semantic is "pc": position, color
      // vertices: xyz rgba
      var vertices = [ -10.0, -100.0, -10.0, 1,0,0,1,
                       -10.0, -100.0,  10.0, 0,1,0,1,
                       -10.0,  100.0, -10.0, 0,0,1,1,
                       -10.0,  100.0,  10.0, 1,1,0,1,
                        10.0, -100.0, -10.0, 0,1,1,1,
                        10.0, -100.0,  10.0, 1,0,1,1,
                        10.0,  100.0, -10.0, 0,0,0,1,
                        10.0,  100.0,  10.0, 1,1,1,1
                     ];

      var indices = [0, 6, 4,
                     0, 2, 6,
                     0, 3, 2,
                     0, 1, 3,
                     2, 7, 6,
                     2, 3, 7,
                     4, 6, 7,
                     4, 7, 5,
                     0, 4, 5,
                     0, 5, 1,
                     1, 5, 7,
                     1, 7, 3];
      //-----------------------------------------------
      AddTexture(JSONObject, "");
      Add3DObject(JSONObject, "custom_id", center, "pc", vertices, indices);
      CalcOffsetAndBoundingBox(JSONObject);
      MakeRelative(JSONObject); // make vertex positions relative to offset...
   }

   res.end(JSON.stringify(JSONObject, undefined, 2));

}).listen(1111, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1111/');
