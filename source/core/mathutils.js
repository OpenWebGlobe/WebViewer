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

goog.provide('owg.MathUtils');

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------
/**
 * @description semi major axis [m]
 * @type number
 */
var WGS84_a = 6378137.0;
//------------------------------------------------------------------------------
/**
 * @description semi major axis scaled
 * @type number
 */
var WGS84_a_scaled = 0.76033327106634033517126264229568;
//------------------------------------------------------------------------------
/**
 * @description semi major axis sqared and scaled 
 * @type number
 */
var WGS84_a2_scaled = 0.57810668309044096908440598010419;
//------------------------------------------------------------------------------
/**
 * @description semi minor axis [m]
 * @type number
 */
var WGS84_b = 6356752.314245;
//------------------------------------------------------------------------------
/**
 * @description semi minor axis scaled
 * @type number
 */
var WGS84_b_scaled = 0.75778401756632537440364055676944;
//------------------------------------------------------------------------------
/**
 * @description semi minor axis scaled
 * @type number
 */
var WGS84_b2_scaled = 0.57423661727896092360996387075915;

//------------------------------------------------------------------------------
/**
 * @description first numeric exccentrity (squared)
 * @type number
 */
var WGS84_E_SQUARED = 0.006694379990197;  
//------------------------------------------------------------------------------
/**
 * @description second numeric exccentrity (squared)
 * @type number
 */
var WGS84_E_SQUARED2 = 0.006739496742;
//------------------------------------------------------------------------------
/**
 * @description second numeric excentrity
 * @type number
 */
var WGS84_E = 0.081819190842961775161887117288255; 
//------------------------------------------------------------------------------
/**
 * @description 1 - WGS84_E_SQUARED
 * @type number
 */
var WGS84_E_SQQ = 0.993305620011365;//0.993260503258;
//------------------------------------------------------------------------------
/**
 * @description factor to convert geocentric cartesian coordinates to interal representation
 * @type number
 */
var CARTESIAN_SCALE_INV = 1.1920930376163765926810017443897e-7;
//------------------------------------------------------------------------------
/**
 * @description factor to convert internal coordinates to geocentric cartesian coordinates
 * @type number
 */
var CARTESIAN_SCALE = 8388607.0;
//------------------------------------------------------------------------------        
/**
 * @description position of prime meridian (0 for Royal Greenwich Observatory)
 * @type number
 */
var LNG_RAD0 = 0;   
//------------------------------------------------------------------------------
/**
 * @namespace This namespace contains math utility functions.
 * @author Martin Christen, martin.christen@fhnw.ch
 * @author Benjamin Loesch, benjamin.loesch@fhnw.ch
 */
var MathUtils = {};

//------------------------------------------------------------------------------
/**
 * @description convert degree to rad
 * Please avoid using this function in time critical operations.
 * @param {number} deg
 * @return {number}
 */
MathUtils.Deg2Rad = function(deg)
{ 
   return ((deg)*0.017453292519943295769236907684886);
}

//------------------------------------------------------------------------------
/**
 * @description convert rad to degree
 * Please avoid using this function in time critical operations.
 * @param {number} rad
 * @return {number}
 */
MathUtils.Rad2Deg = function(rad)
{ 
   return ((rad)*57.295779513082320876798154814105);     
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
/**
 * @description gets the next higher power of 2 value
 * @param {number} value
 * @return {number}
 */
MathUtils.GetNextPowerOfTwo = function(value)
{ 
   var powerOfTwo = 1;
   while(value > powerOfTwo)
   {
      powerOfTwo*=2;
      
   }
   return powerOfTwo;
}
//------------------------------------------------------------------------------
/**
 * @description gets the next higher power of 2 value
 * @param {Array} arr
 * @param {number} index
 * @return {number}
 */
MathUtils.InterpolateArray = function(arr,index)
{
   var num = Math.floor(index);
   var rest = index-num;
   var length = arr.length;
   
   if(num < length-1)
   {
    return arr[num]+rest*(arr[num+1]-arr[num]);
   }
   else
   {
      return arr[length-1];
   }
}
//------------------------------------------------------------------------------
/** @description Inverse Geodetic Problem (Zweite Geodätische Hauptaufgabe)
  * Input: lng0, lat0: First point (radiant)
  *        lng1, lat1: second point (radiant)
  * Output:
  *    result["s"]:     distance from point 1 to point 2
  *    result["azi0"]:  azimuth from lng0, lat0 to lng1, lat1 (in radiant)
  *    result["azi1"]:  azimuth from lng1, lat1 to lng0, lat0 (in radiant)
  *
  * @param {number} lng0 in radiant
  * @param {number} lat0 in radiant
  * @param {number} lng1 in radiant
  * @param {number} lat1 in radiant
  * @param {Object} result
  */ 
MathUtils.InverseGeodeticProblem = function(lng0, lat0, lng1, lat1, result)
{
   var dlat = lat1 - lat0;
   var dlng = lng1 - lng0;
   var mlat = (lat0 + lat1) / 2;
   var V = Math.sqrt(1 + WGS84_E_SQUARED * Math.sqrt(Math.cos(mlat)));
   var RNm = WGS84_a_scaled / V;
   var RMm = WGS84_a_scaled / (V*V*V);
   var x = ((dlng*RNm * Math.cos(mlat)) * (1 + (dlng*dlng*Math.sqrt(Math.sin(mlat)))/24 + dlng*dlng/12));
   var y = (dlat*RMm*(1+(dlng*dlng*Math.sqrt(Math.sin(mlat)))/24-dlat*dlat/24));
   var Am = Math.atan(x / y);
   var s = 1/(Math.cos(Am) / (dlat*RMm)*(1+(dlng*dlng*Math.sqrt(Math.sin(mlat)))/24 + dlng*dlng/12));
   var t = (s*Math.sin(Am) * Math.tan(mlat) / RNm)*(1+(dlng*dlng*Math.sqrt(Math.sin(mlat))) / 24 + (dlng*dlng*Math.sqrt(Math.cos(mlat)))/12+dlat*dlat/12);
   var A0 = (2*Am-t) / 2;
   var A1 = (2*Am) - A0;
   
   result["s"] = s;
   result["azi0"] = A0;
   result["azi1"] = A1;
}
//------------------------------------------------------------------------------
/**
  * @description Direct Geodetic Problem (Erste Geodätische Hauptaufgabe)
  *              solved using Runge-Kutta
  * Input: lng0, lat0: Coordinate of point (radiant)
  *        azi0: azimuth (radiant)
  *        s: length
  * Output: lng1, lat1: Coordinate of desintation point (radiant)
  *         azi1: Azimuth from lng1,lat1 to coordinate lng0, lat0 (radiant)
  * @param {number} lng0 in radiant
  * @param {number} lat0 in radiant
  * @param {number} azi0 in radiant
  * @param {number} s
  * @param {Object} result
  *
  * result["lng1"]: Longitude of destination point in radiant
  * result["lat1"]: Latitude of destination point in radiant
  * result["azi1"]: Azimuth from (lng1, lat1) to (lng0, lat0) in radiant
  */
MathUtils.DirectGeodeticProblem = function(lng0, lat0, s, azi0, result)
{
   var A,B,L,A0A,B0A,dB,dL,dA,dB1, dB2, dB3, dB4, dL1, dL2, dL3, dL4, dA1, dA2, dA3, dA4, KA, KB, KL, V, dS; 
   
   A = azi0;
   L = lng0;
   B = lat0;
  
   // m: number of iterations
   var m=1;

   dS = s/m;
   s = 0;
   for (var i=0;i<m;i++)
   {
      s = s + dS;
      A0A = A;
      B0A = B;
      for (var j=0;j<4;j++)
      {
         V = Math.sqrt(1.0 + WGS84_E_SQUARED * Math.sqrt(Math.cos(B)));
         dB = V*V*V / WGS84_a_scaled * Math.cos(A)*dS;
         dL = V / WGS84_a_scaled * Math.sin(A) / Math.cos(B) * dS;
         dA = dL * Math.sin(B);
         switch (j)
         {
            case 0:
               dA1 = dA;
               dB1 = dB;
               dL1 = dL;
               A = A0A + dA1 / 2;
               B = B0A + dB1 / 2;
               break;
            case 1:
               dA2 = dA;
               dB2 = dB;
               dL2 = dL;
               A = A0A + dA2 / 2;
               B = B0A + dB2 / 2;
               break;
            case 2:
               dA3 = dA;
               dB3 = dB;
               dL3 = dL;
               A = A0A + dA3;
               B = B0A + dB3;
               break;
            case 3:
               dA4 = dA;
               dB4 = dB;
               dL4 = dL;
               break;
         }
      }
      // Runge-Kutta:
      KA = (dA1 + 2 * (dA2 + dA3) + dA4) / 6;
      KB = (dB1 + 2 * (dB2 + dB3) + dB4) / 6;
      KL = (dL1 + 2 * (dL2 + dL3) + dL4) / 6;
      A = A0A + KA;
      B = B0A + KB;
      L = L + KL;
   }
   
   // store result:
   result["azi1"] = A;
   result["lng1"] = L;
   result["lat1"] = B;
}
//------------------------------------------------------------------------------