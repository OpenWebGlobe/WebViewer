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
 #                              (c) 2010-2013 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/

goog.provide('owg.Geometry');
goog.require('owg.Surface');


//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Geometry Manager
 * @author Martin Christen, martin.christen@fhnw.ch
 * @param {engine3d} engine
 */
function Geometry(engine)
{
   /** @type {Array.<Surface>} */
   this.geometries = [];

   /** @type {string} */
   this.type = "tile";

   /** @type {string} */
   this.jsonUrl = "";

   this.cbr = null;
   this.cbf = null;
}
//------------------------------------------------------------------------------
/**
 * @description Loads a geometry from URL
 * @param {string} url
 * @param {function(Geometry)=} opt_callbackready optional function called when geometry finished download
 * @param {function(Geometry)=} opt_callbackfailed optional function called when geometry failed download

 */
Geometry.prototype.Load = function(url, opt_callbackready, opt_callbackfailed)
{
   this.jsonUrl = url;
   this.http = new window.XMLHttpRequest();
   this.http.open("GET", this.jsonUrl, true);

   this.cbr = opt_callbackready;
   this.cbf = opt_callbackfailed;

   var me = this;
   this.http.onreadystatechange = function ()
   {
      _cbfgeometrydownload(me);
   };
   this.http.send();
}
//------------------------------------------------------------------------------
/**
 * @description Renders a geometry
 */
Geometry.prototype.Render = function()
{

}
//------------------------------------------------------------------------------
/**
 * @param {Object} jsonobject
 */
Geometry.prototype.CreateFromJSONObject = function(jsonobject)
{


   // if ready:
   /*if (this.cbr)
   {
      this.cbr(geometry);
   }*/
}

//------------------------------------------------------------------------------
/**
 * @description download callback
 * @ignore
 */
function _cbfgeometrydownload(geometry)
{
   if (geometry.http.readyState == 4)
   {
      if (geometry.http.status == 404)
      {
         if (geometry.cbf)
         {
            geometry.cbf(geometry);
         }
      }
      else
      {
         var data = geometry.http.responseText;
         var jsonobject = goog.json.parse(data);
         geometry.CreateFromJSONObject(jsonobject);
      }
   }
}
//------------------------------------------------------------------------------
