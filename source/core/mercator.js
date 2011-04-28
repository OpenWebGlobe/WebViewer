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

goog.provide('owg.Mercator');

goog.require('owg.MathUtils');

//------------------------------------------------------------------------------
/** 
 * @namespace Mercator 
 * @description used for Mercator <-> wgs84 coordinate transformation
 *
 * @author Martin Christen martin.christen@fhnw.ch
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch 
 */
 var Mercator = {};

//------------------------------------------------------------------------------
/**
 * @description Transforms WGS84 lat & lng in Mercator ELLIPSOID coordinates.
 * 
 * @param longitude the wgs84 longitude
 * @param latitude the wgs84 latitude
 * @param result Array for result values (length 2).
 */
Mercator.WGS84ToMercatorE = function(longitude, latitude, result)
{

   var lngRad = MathUtils.Deg2Rad(longitude);
   var latRad = MathUtils.Deg2Rad(latitude);
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
 * @param result Array for result values. (length 2)
 */
Mercator.MercatorEToWGS84 = function(x, y, result)
{
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
   
   lat = MathUtils.Rad2Deg(lat);
   lng = MathUtils.Rad2Deg(lng);
   
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
 * @param result Array for result values (length 2)
 */
Mercator.WGS84ToMercator = function(longitude, latitude, result)
{
   var lngRad = MathUtils.Deg2Rad(longitude);
   var latRad = MathUtils.Deg2Rad(latitude); 
   
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
 * @param result Array for result values (length 2)
 */
Mercator.MercatorToWGS84 = function(x, y, result)
{
   x *= Math.PI;
   y *= Math.PI;
   
   var t = Math.exp(-y);   
   var lat = Math.PI/2 - 2.0 * Math.atan(t);    //initial value for iteration
   
   var lng = x / 1.0 + LNG_RAD0;
   
   lat = MathUtils.Rad2Deg(lat);
   lng = MathUtils.Rad2Deg(lng);
   
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
   
   
   
   
   



