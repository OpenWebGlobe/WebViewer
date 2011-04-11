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
#                           martin.christen@fhnw.ch                            #
********************************************************************************

This file is part of the OpenWebGlobe SDK

GPL LICENSE

i3D OpenWebGlobe SDK is free software: you can redistribute it and/or modify  it
under the  terms of  the GNU  General Public  License as  published by  the Free
Software Foundation, either version  2 of the License,  or (at your option)  any
later version.

i3D OpenWebGlobe  SDK is  distributed in  the hope  that it  will be useful, but
WITHOUT ANY WARRANTY;  without even the  implied warranty of  MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See  the GNU General Public License for  more
details.

You should have received a copy of the GNU General Public License along with i3D
OpenWebGlobe SDK.  If not, see <http://www.gnu.org/licenses/>.

As a special  exception to the  GPL, any HTML  file which merely  makes function
calls to  this code,  and for  that purpose  includes it  by reference, shall be
deemed a separate work for copyright law purposes. If you modify this code,  you
may extend this exception to your version of the code, but you are not obligated
to do so. If you do not wish to do so, delete this exception statement from your
version.

Commercial License

OEMs (Original  Equipment Manufacturers),  ISVs (Independent  Software Vendors),
VARs (Value Added Resellers) and other distributors that combine and  distribute
commercially licensed  software with  i3D OpenWebGlobe  SDK and  do not  wish to
distribute the source code for the commercially licensed software under  version
2 of the  GNU General Public  License (the "GPL")  must enter into  a commercial
license agreement with the Institute of Geomatics Engineering at the  University
of Applied Sciences Northwestern Switzerland (FHNW).
*******************************************************************************/


const LNG_RAD0 = 0;
const WGS84_E = 0.081819190842961775161887117288255;  //evtl. /1.0

//------------------------------------------------------------------------------
/** 
 * @class Mercator used for Mercator <-> wgs84 coordinate transformation
 * 
 * {@link http://www.openwebglobe.org} 
 *
 * @author Martin Christen martin.christen@fhnw.ch
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch 
 */
function Mercator()
{
   
}

//------------------------------------------------------------------------------
/**
 * @description Transforms WGS84 lat & lng in Mercator ELLIPSOID coordinates.
 * 
 * @param longitude the wgs84 longitude
 * @param latitude the wgs84 latitude
 * @param result Float64Array for result values.
 */
Mercator.prototype.WGS84ToMercatorE = function(longitude, latitude, result)
{
   if(!(result instanceof Float64Array))
   {
      return;
   }
   
   var lngRad = _deg2rad(longitude);
   var latRad = _deg2rad(latitude);
   result[0] = (lngRad - LNG_RAD0);
   result[1] =  Math.log(Math.tan(Math.PI/4.0+latRad/2.0)*Math.pow((1.0-WGS84_E * Math.sin(latRad))/(1.0 + WGS84_E * Math.sin(latRad)),0.5*WGS84_E));
   result[0] /= Math.PI;
   result[1] /= Math.PI;
}

//------------------------------------------------------------------------------
/**
 * @description Transforms x and y Mercator ELLIPSOID coordinates in WGS84 lat, lng coordinates.
 * 
 * @param x x values of Mercator ELLIPSOID Coordinates
 * @param y y values of Mercator ELLIPSOID Coordinates
 * @param result Float64Array for result values.
 */
Mercator.prototype.MercatorEToWGS84 = function(x, y, result)
{
   if(!(result instanceof Float64Array))
   {
      return;
   }
   
   x *= Math.PI;
   y *= Math.PI;
  
   
   var t = Math.exp(-y);   
   var lat = Math.PI/2 - 2.0 * Math.atan(t);    //initial value for iteration
   
   var F = 0.0;
   for(var i=0;i<10;i++)
   {
      F = Math.pow((1.0 - WGS84_E * Math.sin(lat))/(1.0+WGS84_E * Math.sin(lat)),0.5 * WGS84_E);
      lat = Math.PI/2.0 -2 * Math.atan(t * F);
   }
   
   var lng = x + LNG_RAD0;
   
   lat = _rad2deg(lat);
   lng = _rad2deg(lng);
   
   while (lng > 180)
   {
      lng -= 180;
   }
   while (lng < -180)
   { 
      lng += 180;
   }
   while (lat > 90)
   {
      lat -= 180;
   }
   while (lat < -90)
   {
      lat += 180;
   }
   
   result[0] = lng;
   result[1] = lat;
}

//------------------------------------------------------------------------------
/**
 * @description Transforms WGS84 lng & lat in Mercator SPHERE coordinates.
 * 
 * @param longitude the wgs84 longitude
 * @param latitude the wgs84 latitude
 * @param result Float64Array for result values.
 */
Mercator.prototype.WGS84ToMercator = function(longitude, latitude, result)
{
   
   if(!(result instanceof Float64Array))
   {
      return;
   }
   
   var lngRad = _deg2rad(longitude);
   var latRad = _deg2rad(latitude); 
   
   var x = lngRad - LNG_RAD0;
   var y = Math.log(Math.tan(Math.PI / 4.0 + latRad / 2));
   
   x /= Math.PI;
   y /= Math.PI;
   
   result[0] = x;
   result[1] = y;
}

//------------------------------------------------------------------------------
/**
 * @description Transforms x and y Mercator SPHERE coordinates in WGS84 lat, lng coordinates.
 * 
 * @param x x values of Mercator SPHERE Coordinates
 * @param y y values of Mercator SPHERE Coordinates
 * @param result Float64Array for result values.
 */
Mercator.prototype.MercatorToWGS84 = function(x, y, result)
{
   if(!(result instanceof Float64Array))
   {
      return;
   }
   
   x *= Math.PI;
   y *= Math.PI;
   
   var t = Math.exp(-y);   
   var lat = Math.PI/2 - 2.0 * Math.atan(t);    //initial value for iteration
   
   var lng = x / 1.0 + LNG_RAD0;
   
   lat = _rad2deg(lat);
   lng = _rad2deg(lng);
   
   while (lng > 180)
   {
      lng -= 180;
   }
   while (lng < -180)
   { 
      lng += 180;
   }
   while (lat > 90)
   {
      lat -= 180;
   }
   while (lat < -90)
   {
      lat += 180;
   }
   
   result[0] = lng;
   result[1] = lat;  
}
   
   
   
   
   



