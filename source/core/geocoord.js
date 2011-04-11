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

//Constants
const WGS84_a = 6378137.0;                  // grosse Halbachse [m]
const WGS84_E_SQUARED = 0.006739496742;     // second numeric excentrity squared
const WGS84_E_SQQ = 0.993260503258;         // 1-WGS84_E_SQUARED 
const CARTESIAN_SCALE_INV = 1.1920930376163765926810017443897e-7;
const CARTESIAN_SCALE = 8388607.0;
    
//------------------------------------------------------------------------------
/**
 * @constructor
 * @class
 * @description This class is used to calculate wgs84 <-> cartesian conversions.
 * @author Martin Christen, martin.christen@fhnw.ch
 * @author Benjamin Loesch, benjamin.loesch@fhnw.ch
 * @version 0.1
 */
 function GeoCoord(longitude, latitude, elevation)
 {  
    this._wgscoords = new Float64Array([longitude, latitude, elevation]);      //Array elements = [latitude,longitude,elevation]
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
 * @param{Float64Array} result float 64 array to store the results. 
 */
 GeoCoord.prototype.ToCartesian = function(result)
 {
    if (!(result instanceof Float64Array) && result.length!=3)
    {
       return;
    }
    var sinlat = Math.sin(_deg2rad(this._wgscoords[1]));    // sin of latitude
    var coslat = Math.cos(_deg2rad(this._wgscoords[1]));    // cos of latitude
    var sinlong = Math.sin(_deg2rad(this._wgscoords[0]));    // sin of latitude
    var coslong = Math.cos(_deg2rad(this._wgscoords[0]));    // cos of latitude
    
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
 * @param{float} x the cartesian x coordinate.
 * @param{float} y the cartesian y coordinate.
 * @param{float} z the cartesian z coordinate.
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
     
   this._wgscoords[0] = _rad2deg(_longitude);
   this._wgscoords[1] = _rad2deg(_latitude);
   this._wgscoords[2] = _elevation;
 }
 
 
//------------------------------------------------------------------------------
/**
 * @description internal degree to radiant conversion function.
 * @ignore
 */
 _deg2rad = function(deg)
 {
    return ((deg)*0.017453292519943295769236907684886); //3.14159265358979323846/180.0)
    //return deg*Math.PI/180;
 }
 
//------------------------------------------------------------------------------
/**
 * @description internal radiant to degree conversion function.
 * @ignore
 */
 _rad2deg = function(rad)
 {
    //return rad*180/Math.PI;
    return ((rad)*57.295779513082320876798154814105);
 }
 
 GeoCoord.prototype.ToString = function()
 {
    return " Longitude: "+this.GetLongitude().toPrecision(17)+" Latitude: "+this.GetLatitude().toPrecision(17)+" Elevation: "+this.GetElevation().toPrecision(17);
 }
 
 
