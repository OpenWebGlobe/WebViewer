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

MercatorQuadtree.prototype.QuadKeyToMercatorCoord = function(quadKey, coords)
{
   this.QuadKeyToNormalizedCoord(quadKey,coords);
   
   coords[0] = 2 * coords[0] -1.0;
   coords[1] = 2 * coords[1] -1.0;
   coords[2] = 2 * coords[2] -1.0;
   coords[3] = 2 * coords[3] -1.0;
   
}
//------------------------------------------------------------------------------
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
//------------------------------------------------------------------------------






goog.exportSymbol('MercatorQuadtree', MercatorQuadtree);
goog.exportProperty(MercatorQuadtree.prototype, 'QuadKeyToMercatorCoord', MercatorQuadtree.prototype.QuadKeyToMercatorCoord);
goog.exportProperty(MercatorQuadtree.prototype, 'QuadKeyToNormalizedCoord', MercatorQuadtree.prototype.QuadKeyToNormalizedCoord);
goog.exportProperty(MercatorQuadtree.prototype, 'QuadKeyToTileCoord', MercatorQuadtree.prototype.QuadKeyToTileCoord);
