/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/


goog.provide('owg.MercatorQuadtree');

//------------------------------------------------------------------------------
/** 
 * @class MercatorQuadtree
 * @constructor
 * @author Martin Christen martin.christen@fhnw.ch
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch 
 */
function MercatorQuadtree()
{
   
}
//------------------------------------------------------------------------------
/**
* @description calculates a quadkey to mercator coordiantes
* @param {string} quadKey
* @param {Array} coords this is a output paramter.
*/
MercatorQuadtree.prototype.QuadKeyToMercatorCoord = function(quadKey, coords)
{
   this.QuadKeyToNormalizedCoord(quadKey,coords);
   
   coords[0] = 2 * coords[0] -1.0;
   coords[1] = 2 * coords[1] -1.0;
   coords[2] = 2 * coords[2] -1.0;
   coords[3] = 2 * coords[3] -1.0;
   
}
//------------------------------------------------------------------------------
/**
* @param {string} quadKey
* @param {Array} coords this is a output paramter.
*/
MercatorQuadtree.prototype.QuadKeyToNormalizedCoord = function(quadKey, coords)
{
   var nLevelOfDetail = quadKey.length;
   var x = 0;
   var y = 0;
   var scale = 1.0;
   
   for(var i=0; i< nLevelOfDetail; i++)
   {
      scale /= 2.0;
      
      switch(quadKey[i])
      {
         case "0":
            y += scale;
            break;
            
         case "1":
            x += scale;
            y += scale;
            
         case "2":
            break;
            
         case "3":
            x += scale;
            break;
            
         default:
            alert("Wrong quadKey: "+quadKey);     
      }
   }
   
   coords[0] = x;          //swap(y0,y1) coordinates for pixel based coordinates.
   coords[1] = y + scale;
   coords[2] = x + scale;
   coords[3] = y;          
}
//------------------------------------------------------------------------------
/**
 * @description returns the quadkey of the parent quad.
 * 
 * @param{string} quadKey the quadKey as string for example "0123"
 */
MercatorQuadtree.prototype.GetParent = function(quadKey)
{
  if(quadKey.length < 2)
  {
   return;   
  }
  return quadKey.slice(0,quadKey.length-1);
}
//------------------------------------------------------------------------------
MercatorQuadtree.prototype.GetQuad = function(quadKey)
{
   var l = quadKey.length;  
}
//------------------------------------------------------------------------------
/**
 * @description calculates the tile coord of the specific quadkey, origin is set to left bottom corner.
 * 
 * @param {string} quadcode the quadKey as string for example "0123"
 * @param {Object} result an empty object to store the tile coordinates in it.
 * returns result.x, result.y -> Tile coordinates
 *         result.lod -> level of detail
 */
MercatorQuadtree.prototype.QuadKeyToTileCoord = function(quadcode, result)
{
   result.x = 0;
   result.y = 0;
   result.lod = quadcode.length;
   var mask;
   
   for (var i = result.lod; i > 0; i--)
   {
      mask = 1 << (i - 1);
      switch (quadcode[result.lod - i])
      {
      case '0':
         break;

      case '1':
         result.x |= mask;
         break;

      case '2':
         result.y |= mask;
         break;

      case '3':
         result.x |= mask;
         result.y |= mask;
         break;  
      }
   }
}
MercatorQuadtree.prototype.QuadKeyToMercator = function(quadcode, coords)
{
   var result = {
	   x : null,
      y : null,
	   lod : null
   }
   this.QuadKeyToTileCoord(quadcode,result);
    var maxx=20037508.34;
    var maxy=20037508.34;
    var minx=-20037508.34;
    var miny=-20037508.34;
    var lodTileCount = Math.pow(2,result.lod);
    var scale = (maxx-minx)/lodTileCount;
    coords[0]=minx+scale*result.x;
    coords[1]=maxy-scale*(result.y+1);
    coords[2]=minx+scale*(result.x+1);
    coords[3]=maxy-scale*(result.y);

}
MercatorQuadtree.prototype.QuadKeyToWGS84 = function(quadcode, coords)
{
   var lod = quadcode.length;
   var mercator = [];
   var mapSize = 256*Math.pow(2,lod);
   this.QuadKeyToNormalizedCoord(quadcode, mercator);
   var minpixelX=mercator[0]*256*Math.pow(2,lod); 
   var minpixelY=(1.00-mercator[1])*256*Math.pow(2,lod);
   var maxpixelX=mercator[2]*256*Math.pow(2,lod);
   var maxpixelY=(1.00-mercator[3])*256*Math.pow(2,lod);  
   var x = (Math.min(Math.max(minpixelX, 0), mapSize - 1) / mapSize) - 0.5;
   var y = 0.5 - (Math.min(Math.max(minpixelY, 0), mapSize - 1) / mapSize);
   var minx = 90.0 - 360.0 * Math.atan(Math.exp(-y * 2.0 * Math.PI)) / Math.PI;
   var miny = 360.0000 * x;

   x = (Math.min(Math.max(maxpixelX, 0), mapSize - 1) / mapSize) - 0.5;
   y = 0.5 - (Math.min(Math.max(maxpixelY, 0), mapSize - 1) / mapSize);
   var maxx = 90.0 - 360.0 * Math.atan(Math.exp(-y * 2.0 * Math.PI)) / Math.PI;
   var maxy = 360.0000 * x;
    coords[0]=minx;
    coords[1]=miny;
    coords[2]=maxx;
    coords[3]=maxy;

}
//------------------------------------------------------------------------------

goog.exportSymbol('MercatorQuadtree', MercatorQuadtree);
goog.exportProperty(MercatorQuadtree.prototype, 'QuadKeyToMercatorCoord', MercatorQuadtree.prototype.QuadKeyToMercatorCoord);
goog.exportProperty(MercatorQuadtree.prototype, 'QuadKeyToNormalizedCoord', MercatorQuadtree.prototype.QuadKeyToNormalizedCoord);
goog.exportProperty(MercatorQuadtree.prototype, 'QuadKeyToTileCoord', MercatorQuadtree.prototype.QuadKeyToTileCoord);
goog.exportProperty(MercatorQuadtree.prototype, 'QuadKeyToMercator', MercatorQuadtree.prototype.QuadKeyToMercator);
goog.exportProperty(MercatorQuadtree.prototype, 'QuadKeyToWGS84', MercatorQuadtree.prototype.QuadKeyToWGS84);