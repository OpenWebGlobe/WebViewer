/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/


goog.provide('owg.GeoCoord');

goog.require('owg.MathUtils');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @class
 * @description This class is used to calculate wgs84 <-> cartesian conversions.
 * @author Martin Christen, martin.christen@fhnw.ch
 * @author Benjamin Loesch, benjamin.loesch@fhnw.ch
 * @param {number=} opt_longitude
 * @param {number=} opt_latitude
 * @param {number=} opt_elevation
 */
 function GeoCoord(opt_longitude, opt_latitude, opt_elevation)
 {  
    this._wgscoords = new Float32Array([opt_longitude, opt_latitude, opt_elevation]);      //Array elements = [opt_latitude,opt_longitude,opt_elevation]
 }
 //------------------------------------------------------------------------------
 /**
 * @description Set position
 * @param {number} longitude
 * @param {number} latitude
 * @param {number} elevation
 */
 GeoCoord.prototype.Set = function(longitude, latitude, elevation)
 {  
    this._wgscoords[0] = longitude;
    this._wgscoords[1] = latitude;
    this._wgscoords[2] = elevation;
 }
//------------------------------------------------------------------------------
/**
 * @description Get the longitude value
 * @return Longitude
 */
GeoCoord.prototype.GetLongitude = function()
{
   return this._wgscoords[0];
}
//------------------------------------------------------------------------------
/**
 * @description Get the latitude value
 * @return Latitude 
 */
GeoCoord.prototype.GetLatitude = function()
{
   return this._wgscoords[1];
}

//------------------------------------------------------------------------------
/**
 * @description Get the elevation value
 * @return elevation
 */
GeoCoord.prototype.GetElevation = function()
{
   return this._wgscoords[2];
}
//------------------------------------------------------------------------------
/**
 * @description transforms the wgs84 coordinates to cartesian coordinates.
 * @param{Array} result array to store the results. 
 */
 GeoCoord.prototype.ToCartesian = function(result)
 {
    var sinlat = Math.sin(MathUtils.Deg2Rad(this._wgscoords[1]));    // sin of latitude
    var coslat = Math.cos(MathUtils.Deg2Rad(this._wgscoords[1]));    // cos of latitude
    var sinlong = Math.sin(MathUtils.Deg2Rad(this._wgscoords[0]));    // sin of latitude
    var coslong = Math.cos(MathUtils.Deg2Rad(this._wgscoords[0]));    // cos of latitude
    
    var Rn = WGS84_a / Math.sqrt(1.0-WGS84_E_SQUARED*sinlat*sinlat);
  
    
    result[0] = (Rn + this._wgscoords[2]) * coslat * coslong;
    result[1] = (Rn + this._wgscoords[2]) * coslat * sinlong;
    result[2] = (WGS84_E_SQQ*Rn + this._wgscoords[2]) * sinlat;

    result[0] *= CARTESIAN_SCALE_INV;
    result[1] *= CARTESIAN_SCALE_INV;
    result[2] *= CARTESIAN_SCALE_INV;

 }

//------------------------------------------------------------------------------
/**
 * @description transforms the cartesian x,y,z coordinates to wgs84 coordinates and stores them internally.
 * @param {number} x the cartesian x coordinate.
 * @param {number} y the cartesian y coordinate.
 * @param {number} z the cartesian z coordinate.
 */
 GeoCoord.prototype.FromCartesian = function(x,y,z)
 {
    var _longitude = Math.atan2(y,x);
    var _latitude = Math.atan2(z,Math.sqrt(x*x+y*y));
    var _elevation = 0.0;
    var sinlat2 = 0.0;
    var coslat = 0.0;
    var Rn = 0.0;
    
    x *= CARTESIAN_SCALE;
    y *= CARTESIAN_SCALE;
    z *= CARTESIAN_SCALE;


    for (var i=0;i<10;i++)
    {
       sinlat2 = Math.sin(_latitude);
       sinlat2 *= sinlat2;
       coslat = Math.cos(_latitude),
       Rn = WGS84_a / Math.sqrt(1-WGS84_E_SQUARED*sinlat2);
       _elevation = Math.sqrt(x*x+y*y) / coslat - Rn;
       _latitude = Math.atan2(z/Math.sqrt(x*x+y*y), 1-(Rn*WGS84_E_SQUARED)/(Rn+_elevation));
    }
     
   this._wgscoords[0] = MathUtils.Rad2Deg(_longitude);
   this._wgscoords[1] = MathUtils.Rad2Deg(_latitude);
   this._wgscoords[2] = _elevation;
 }
 
 //------------------------------------------------------------------------------
 /**
  * @description returns a string with long, lat and elv data.
  */
 GeoCoord.prototype.ToString = function()
 {
    return " Longitude: "+this.GetLongitude().toPrecision(17)+" Latitude: "+this.GetLatitude().toPrecision(17)+" Elevation: "+this.GetElevation().toPrecision(17);
 }
 
goog.exportSymbol('GeoCoord', GeoCoord); 
goog.exportProperty(GeoCoord.prototype, 'FromCartesian', GeoCoord.prototype.FromCartesian); 
goog.exportProperty(GeoCoord.prototype, 'ToCartesian', GeoCoord.prototype.ToCartesian); 
goog.exportProperty(GeoCoord.prototype, 'ToString', GeoCoord.prototype.ToString); 
