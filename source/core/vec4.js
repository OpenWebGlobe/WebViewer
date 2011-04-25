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


//Constructor
//vec4(string type)     with "double" or "float"(default) Vector is initialized with [0.0,0.0,0.0,0.0]
//Set(r,g,b,a)         
//Get                   returns the values as array




/** 
 * 
 * @class vec4
 * vec4 object for colors. (R,G,B,A)
 * 
 * {@link http://www.openwebglobe.org} 
 *
 * @author Martin Christen martin.christen@fhnw.ch 
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch  
 * @version 0.1  
 */
function vec4(typeparam)
{
   if (typeparam == "double")
   {
      this._values = new Array([0.0, 0.0, 0.0, 0.0]);  
   }
   else //(typeparam == "float")
   {
      this._values = new Float32Array([0.0, 0.0, 0.0, 0.0]);
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



