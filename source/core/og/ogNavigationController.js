/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/


goog.provide('owg.ogNavigationController');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');


//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {ogObject}
 * @description Navigation-Controller class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogNavigationController()
{
   /** @type {string} */
   this.name = "ogNavigationController";
   /** @type {number} */
   this.type = OG_OBJECT_NAVIGATIONCONTROLLER;  
   
}


//------------------------------------------------------------------------------

ogNavigationController.prototype = new ogObject();

