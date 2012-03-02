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

goog.provide('owg.EarthPolyline');

goog.require('goog.debug.Logger');
goog.require('owg.GeoCoord');
goog.require('owg.mat4');

/** 
* @class EarthPolyline
* @constructor
* 
* @description a EarthPolyline class
* 
* @author Benjamin Loesch benjamin.loesch@fhnw.ch
* 
* @param {engine3d} engine
*/
function EarthPolyline(engine,options)
{
  /** @type {engine3d} */
  this.engine = engine;
  /** @type {WebGLRenderingContext} */
  this.gl = engine.gl;
 
   /** @type {?Float32Array} */
   this.vertexbufferdata = null;
   
   /** @type {?Uint16Array} */
   this.indexbufferdata = null;
  
  this.vbo = null;
  
  this.ibo = null;
  
  this.modelMatrix = null;

  this.newModelMatrix = new mat4();
  
  this.points = [];
  
  this.options = options;
  
}



/**
 * @description sets the point data
 * @param {Array.<number>} wgs84coords
 */
EarthPolyline.prototype.SetPoints = function(wgs84coords)
{
   this.points = wgs84coords;
   
  var k = 0;
   
   
   
   //segment the line here!
   var cartcoords = [];
   var idx = [];

   if(this.options["segmentation"])
   {
      for(var i=0;i<wgs84coords.length-1;i++)
      {
        var p1 = [];
        Mercator.WGS84ToMercator(wgs84coords[i][0],wgs84coords[i][1],p1);
        p1[2]=wgs84coords[i][2];
        
        var p2 = [];
        Mercator.WGS84ToMercator(wgs84coords[i+1][0],wgs84coords[i+1][1],p2);
        p2[2]=wgs84coords[i+1][2];
        
        
        var diff = [p2[0]-p1[0],p2[1]-p1[1],p2[2]-p2[2]];
        
        var merccoords = [];
        
        for(var j=0;j<this.options["segmentation"]+1;j++)
        { 
          var x = p1[0]+diff[0]*j/this.options["segmentation"];
          var y = p1[1]+diff[1]*j/this.options["segmentation"];
          var z = p1[2]+diff[2]*j/this.options["segmentation"];
          
          var p = [];
          Mercator.MercatorToWGS84(x,y,p);
          p[2]=z;
          
          var gc = new GeoCoord(p[0],p[1],p[2]);
          var pw = [];
          gc.ToCartesian(pw);
          
          cartcoords.push(pw[0]);
          cartcoords.push(pw[1]);
          cartcoords.push(pw[2]);
          cartcoords.push(this.options["color"][0]); //the color
          cartcoords.push(this.options["color"][1]);
          cartcoords.push(this.options["color"][2]);
          cartcoords.push(this.options["color"][3]);
          
          
          idx.push(k);
          idx.push(k+1);
          k=k+1;

          
        }
        
        
      }
   }
   else
   {
    for(var i=0;i<wgs84coords.length;i++)
      {
        var gc = new GeoCoord(wgs84coords[i][0],wgs84coords[i][1],wgs84coords[i][2]);
        var p = [];
        gc.ToCartesian(p);
        cartcoords.push(p[0]);
        cartcoords.push(p[1]);
        cartcoords.push(p[2]);
        cartcoords.push(this.options["color"][0]); //the color
        cartcoords.push(this.options["color"][1]);
        cartcoords.push(this.options["color"][2]);
        cartcoords.push(this.options["color"][3]);
        idx.push(i);
        idx.push(i+1);
      } 
   }
   
   idx.pop();
   idx.pop();
   this.numofpoints = i*this.options["segmentation"];
   
  this.vertexbufferdata = new Float32Array(cartcoords);
  this.indexbufferdata = new Uint16Array(idx);
  this.numindex = idx.length;
  this._ToGPU();
  

}



/**
 * @description frees all memory
 */
EarthPolyline.prototype.Destroy = function()
{

   if (this.vbo)
   {
      this.gl.deleteBuffer(this.vbo);
      this.vbo = null;
   }
   if (this.ibo)
   {
      this.gl.deleteBuffer(this.ibo);
      this.vbo = null;
   }
   this.pointdata = null;
   this.vbo = null;

}



/**
 * @description draws the line.
 */
EarthPolyline.prototype.Draw = function()
{
    if(this.points != null)
    {
      //1. set points into gpu
      if(!this.vbo)
      {
        this._ToGPU();
      }
     
      
      // setup interleaved VBO and IBO
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
   
      //3. activate shader and get attribute pointers
      this.gl.enableVertexAttribArray(0);
      this.gl.enableVertexAttribArray(1);
      this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 7*4, 0*4); // position
      this.gl.vertexAttribPointer(1, 4, this.gl.FLOAT, false, 7*4, 3*4); // color
      this.engine.shadermanager.UseShader_PC(this.engine.matModelViewProjection);
      
                        
      this.gl.lineWidth(this.options["linewidth"]);
      
     
      this.gl.enable(this.gl.POLYGON_OFFSET_FILL);
      this.gl.polygonOffset(1.0,1000.0);
  
      //4. draw the points
      this.gl.drawElements(this.gl.LINES, this.numindex, this.gl.UNSIGNED_SHORT, 0);
                      
  
      this.gl.disable(this.gl.POLYGON_OFFSET_FILL);
    
      this.gl.disableVertexAttribArray(0);
      this.gl.disableVertexAttribArray(1);
      
      this.gl.lineWidth(1.0);
    }
   
}


/**
 * @description internal function writes everything to the gpu
 */

EarthPolyline.prototype._ToGPU = function()
{
   // Create VB
    this.vbo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexbufferdata, this.gl.STATIC_DRAW);

    
    // Create IB
    this.ibo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indexbufferdata, this.gl.STATIC_DRAW);
}


