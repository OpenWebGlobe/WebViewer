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

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------
/**
 * @description semi major axis [m]
 */
var WGS84_a = 6378137.0; 
//------------------------------------------------------------------------------
/**
 * @description first numeric exccentrity (squared)
 */
var WGS84_E_SQUARED = 0.006694379990197;  
//------------------------------------------------------------------------------
/**
 * @description second numeric exccentrity (squared)
 */
var WGS84_E_SQUARED2 = 0.006739496742;
//------------------------------------------------------------------------------
/**
 * @description second numeric excentrity
 */
var WGS84_E = 0.081819190842961775161887117288255; 
//------------------------------------------------------------------------------
/**
 * @description 1 - WGS84_E_SQUARED
 */
var WGS84_E_SQQ = 0.993260503258;
//------------------------------------------------------------------------------
/**
 * @description factor to convert geocentric cartesian coordinates to interal representation
 */
var CARTESIAN_SCALE_INV = 1.1920930376163765926810017443897e-7;
//------------------------------------------------------------------------------
/**
 * @description factor to convert internal coordinates to geocentric cartesian coordinates
 */
var CARTESIAN_SCALE = 8388607.0;
//------------------------------------------------------------------------------        
/**
 * @description position of prime meridian (0 for Royal Greenwich Observatory)
 */
var LNG_RAD0 = 0;   
//------------------------------------------------------------------------------
/**
 * @constructor
 * @namespace This namespace contains math utility functions.
 * @author Martin Christen, martin.christen@fhnw.ch
 * @author Benjamin Loesch, benjamin.loesch@fhnw.ch
 */
var MathUtils = {};

//------------------------------------------------------------------------------
/**
 * @description convert degree to rad
 * Please avoid using this function in time critical operations.
 */
MathUtils.Deg2Rad = function(deg)
{ 
   return ((deg)*0.017453292519943295769236907684886);
}

//------------------------------------------------------------------------------
/**
 * @description convert rad to degree
 * Please avoid using this function in time critical operations.
 */
MathUtils.Rad2Deg = function(rad)
{ 
   return ((rad)*57.295779513082320876798154814105);     
}

//------------------------------------------------------------------------------


