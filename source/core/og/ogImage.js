/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/



goog.provide('owg.ogImage');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {ogObject} 
 * @description Image class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogImage()
{
   /** @type {string} */
   this.name = "ogImage";
   /** @type {number} */
   this.type = OG_OBJECT_IMAGE; 
}

//------------------------------------------------------------------------------
ogImage.prototype = new ogObject();
