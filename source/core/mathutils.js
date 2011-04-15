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
 */
MathUtils.Deg2Rad = function(deg)
{ 
   return ((deg)*0.017453292519943295769236907684886);
}

//------------------------------------------------------------------------------
/**
 * @description convert rad to degree
 */
MathUtils.Rad2Deg = function(rad)
{ 
   return ((rad)*57.295779513082320876798154814105);     
}
//------------------------------------------------------------------------------

