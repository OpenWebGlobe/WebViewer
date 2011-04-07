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

Commercial License

OEMs (Original  Equipment Manufacturers),  ISVs (Independent  Software Vendors),
VARs (Value Added Resellers) and other distributors that combine and  distribute
commercially licensed  software with  i3D OpenWebGlobe  SDK and  do not  wish to
distribute the source code for the commercially licensed software under  version
2 of the  GNU General Public  License (the "GPL")  must enter into  a commercial
license agreement with the Institute of Geomatics Engineering at the  University
of Applied Sciences Northwestern Switzerland (FHNW).
*******************************************************************************/


//Constructor
//vec4(string type)     with "double" or "float"(default) Vector is initialized with [0.0,0.0,0.0,0.0]
//Set(r,g,b,a)         
//Get                   returns the values as array




/** 
 * @fileoverview vec4.js
 * vec4 object for colors. (R,G,B,A)
 * 
 * {@link http://www.openwebglobe.org} 
 *
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch  
 * @version 0.1  
 */
function vec4(typeparam)
{
   if (typeparam == "double")
   {
      this._values = new Float64Array([0.0, 0.0, 0.0]);  
   }
   else //(typeparam == "float")
   {
      this._values = new Float32Array([0.0, 0.0, 0.0]);
   }
}

/**
 * Set Values
 * @extends vec3
 *
 * @param {float} r - red
 * @param {float} g - green
 * @param {float} b - blue
 * @param {float} a - alpha
 */
vec4.prototype.Set = function(r,g,b,a)
{
      this._values[0]=r;
      this._values[1]=g;
      this._values[2]=b;
      this._values[3]=a;
}

/**
 * Get Values 
 * @extends vec3
 *
 * @return returns an array with all values [r,g,b,a]
 */
vec4.prototype.Get = function()
{
   return this._values;
}

/**
 * ToString
 * @extends vec3
 *
 * @return returns a string like: [1,0,1,1]
 */
vec4.prototype.ToString = function()
{
   return "["+this._values[0]+","+this._values[1]+","+this._values[2]+","+this._values[3]+"]";
}



