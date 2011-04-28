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

goog.provide('owg.Mesh');

goog.require('goog.debug.Logger');
goog.require('goog.json');
goog.require('owg.AABB');
goog.require('owg.TriangleIntersector');
goog.require('owg.mat4');
goog.require('owg.vec3');
goog.require('owg.vec4');

//------------------------------------------------------------------------------
/** 
 * @class mesh 
 * Represents a Mesh Object.
 * 
 * {@link http://www.openwebglobe.org} 
 *
 * @author Benjamin Loesch benjamin.loesch@fhnw.ch 
 * @author Martin Christen martin.christen@fhnw.ch
 */
//------------------------------------------------------------------------------
/*
 One Mesh supports one vertex buffer, one index buffer and one texture
 The following semanic is used for vertices:
 
 P: Position
 N: Normal
 T: Texture
 C: Color

 Currently the following vertex semantics are supported:
    P:    Position only
    PNT:  Position, Normal, Texcoord
    PC:   Position, Color
    PT:   Position, Texcoord
    PNCT: Position, Normal, Color, Texcoord

 For Indices the following semantics are used:
 
 "TRIANGLE" for triangles rendering
 "LINE" for line rendering
 "POINT" for point rendering

example:

 // Example 1: manual generation of a mesh

 myMesh = new Mesh(engine);
 myMesh.SetBufferP([0,0,0,   1,0,0,   1,1,0,]);
 myMesh.SetIndexBuffer([0,1,2], "TRIANGLES");
 
 // Example 2: load from JSON
 
 myMesh = new Mesh(engine);
 myMesh.loadFromJSON("myGeometry.json");
 
*/
//------------------------------------------------------------------------------
/**
 * Create a new Mesh Object
 * This is the mesh class
 * @param {engine3d} engine the 3d engine. 
 * @constructor
 */
function Mesh(engine)
{
   this.engine = engine;
   this.gl = engine.gl;
   
   this.vbo = null;              // vertex buffer (WebGL)
   this.ibo = null;              // index buffer  (WebGL)
   this.texture = null;          // Texture (texture class)
   
   this.vertexbufferdata = null; // interleaved vertex buffer data
   this.mode = "";               // vertex semantic
   this.numvertex = 0;           // number of vertices
   this.numindex = 0;            // number of elements of index vector
   
   this.indexbufferdata = null;  // Uint16Array(indices)
   this.indexsemantic = null;    // triangle, line, or point.
  
   this.Ready = false;           // Ready to draw
   this.http = null; 
   this.jsonUrl = null;
   this.cbfJSONLoad = null;
   this.defaultfontcolor = new vec4();
   this.defaultfontcolor.Set(1,1,1,1);
   this.intersector = new TriangleIntersector();
   this.bbmin = null;
   this.bbmax = null;
   this.offset = null;
   this.curtainindex = null;
   
   
   this.aabb = new AABB();
   
   this.modelMatrix = null; 
   this.vertexLength = 0; //number of entries in the vertexbufferdata array per vertex
     
   
   this.numOfTriangles = 0;     //number of triangles depends on indexsemantic "TRIANGLES or TRIANGLESTRIP"
   this.currentTriangle = {}; //current triangle used for intersection tests.
   this.billboardPos = new Array(3);

   
}


//------------------------------------------------------------------------------
/**
 * @description Specify a buffer with the vertex semantic "p"
 * @param {Array|Float32Array} p the points.
 */
Mesh.prototype.SetBufferP = function(p)
{
   if ((p.length % 3) == 0)
   {
      this.vertexbufferdata = new Float32Array(p);
      this.mode = "p";
      this.vertexLength = 3;
   }
}

//------------------------------------------------------------------------------
/**
 * @description Specify a buffer with the vertex semantic "pnt"
 * @param {Array|Float32Array} pnt the point,normal,texture-coordinates array.
 */
Mesh.prototype.SetBufferPNT = function(pnt)
{
   if ((pnt.length % 8) == 0)
   {
      this.vertexbufferdata = new Float32Array(pnt);
      this.mode = "pnt";
      this.vertexLength = 8;
   }
}

//------------------------------------------------------------------------------
/**
 * @description Specify a buffer with the vertex semantic "pc"
 * @param {Array|Float32Array} pc the point,color array.
 */
Mesh.prototype.SetBufferPC = function(pc)
{
   if ((pc.length % 7) == 0)
   {
      this.vertexbufferdata = new Float32Array(pc);
      this.mode = "pc";
      this.vertexLength = 7;
   }
}

//------------------------------------------------------------------------------
/**
 * @description Specify a buffer with the vertex semantic "pt"
 * @param {Array|Float32Array} pt the point,texture-coordinates array.
 */
Mesh.prototype.SetBufferPT = function(pt)
{
   if ((pt.length % 5) == 0)
   {
      this.vertexbufferdata = new Float32Array(pt);
      this.mode = "pt";
      this.vertexLength = 5;
   }
}

//------------------------------------------------------------------------------
/**
 * @description Specify a buffer with the vertex semantic "pnct"
 * @param {Array|Float32Array} pnct the point,normal,color texture-coordinates array.
 */
Mesh.prototype.SetBufferPNCT = function(pnct)
{
   if ((pnct.length % 12) == 0)
   {
      this.vertexbufferdata = new Float32Array(pnct);
      this.mode = "pnct";
      this.vertexLength = 12;
   }
}

//------------------------------------------------------------------------------
/**
 * @description Specify a buffer with the vertex semantic "pt"
 * @param {Array|Float32Array} fontdata the point,texture-coordinates array.
 */
Mesh.prototype.SetBufferFont= function(fontdata)
{
   if ((fontdata.length % 5) == 0)
   {
      this.vertexbufferdata = new Float32Array(fontdata);
      this.mode = "font";
      this.vertexLength = 5;
   }
}
//------------------------------------------------------------------------------
/**
 * @description Specify a an index buffer with the specified index semantic
 * @param {Array} idx indices array.
 * @param {string} idxsem supports "TRIANGLES","POINTS" or "LINES".
 */
Mesh.prototype.SetIndexBuffer = function(idx,idxsem)
{
   this.indexbufferdata = new Uint16Array(idx); 
   this.indexsemantic = idxsem;
   this.numindex = idx.length;
   this.Ready = true;
   
   //calculate the number of triangles
   switch(idxsem)
   {
      case "TRIANGLES"     :  this.numOfTriangles = idx.length/3;
                              break;
                           
      case "TRIANGLESTRIP" :  this.numOfTriangles = (idx.length-3)+1
       
      case "default"       :  break;
      
   }
   
}

//------------------------------------------------------------------------------
/**
 * @description Set Texture for this mesh
 * @param {Texture} tex This is the texture to set.
 */
Mesh.prototype.SetTexture = function(tex)
{
   this.texture = tex; 
}
//------------------------------------------------------------------------------
/**
 * @description Create Buffers on GPU
 * @ignore
 */
Mesh.prototype._ToGPU = function()
{
   //test vertexbufferdata ungleich null
   // Create VB
    this.vbo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexbufferdata, this.gl.STATIC_DRAW);
    
    // Create IB
    this.ibo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indexbufferdata, this.gl.STATIC_DRAW);
}



//------------------------------------------------------------------------------
/**
 * @description Free all memory, especially the GPU buffers.
 * @ignore
 */
Mesh.prototype.Destroy = function()
{
   if (this.vbo)
   {
      this.gl.deleteBuffer(this.vbo);
      this.vbo = 0;
   }
   
   if (this.ibo )
   {
      this.gl.deleteBuffer(this.ibo);
      this.ibo = 0;
   }
   
   this.texture = null;          
   this.vertexbufferdata = null; 
   this.mode = ""; 
   this.numvertex = 0;         
   this.numindex = 0;
   this.indexbufferdata = null;
   this.indexsemantic = null;
}
var j=0;
//------------------------------------------------------------------------------
/**
 * @description Draws the mesh element. Ensure that "toGPU" is called before calling this method.
 * note: this method still needs some optimization
 * note: ranged draw must be supported soon
 * @param {boolean=} opt_ranged
 * @param {number=} opt_count
 * @param {number=} opt_offset
 * @param {vec4=} opt_fontcolor
 */
Mesh.prototype.Draw = function(opt_ranged, opt_count, opt_offset, opt_fontcolor)
{
   if (!this.Ready)
   {
      return;  // not yet loaded
   }
   
   // this will be changed, but for now the draw function creates the GPU buffers.
   if (this.vbo == null)
   {
      this._ToGPU();
   }
   
   // setup interleaved VBO and IBO
   this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
   this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
           
   if(this.modelMatrix)
   {     
      this.engine.PushMatrices();
      this.engine.SetModelMatrix(this.modelMatrix);   
   }  
         
   switch (this.mode) 
   {
       case "p":      this.gl.enableVertexAttribArray(0);
                      this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 8*4, 0*4); // position
                      break;
                       
       case "pnt": 
                      this.gl.enableVertexAttribArray(0);
                      this.gl.enableVertexAttribArray(1);
                      this.gl.enableVertexAttribArray(2);
                      this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 8*4, 0*4); // position
                      this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, 8*4, 3*4); // normal
                      this.gl.vertexAttribPointer(2, 2, this.gl.FLOAT, false, 8*4, 6*4); // texcoord
                      this.engine.shadermanager.UseShader_PNT(this.engine.matModelViewProjection);
                      break;
                        
        case "pc": 
                      this.gl.enableVertexAttribArray(0);
                      this.gl.enableVertexAttribArray(1);
                      this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 7*4, 0*4); // position
                      this.gl.vertexAttribPointer(1, 4, this.gl.FLOAT, false, 7*4, 3*4); // color
                      this.engine.shadermanager.UseShader_PC(this.engine.matModelViewProjection);
                      break;
                        
        case "pt": 
                      this.gl.enableVertexAttribArray(0);
                      this.gl.enableVertexAttribArray(1);
                      this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 5*4, 0*4); // position
                      this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 5*4, 3*4); // texture
                      this.engine.shadermanager.UseShader_PT(this.engine.matModelViewProjection);
                      break;
                        
        case "pnct": 
                      this.gl.enableVertexAttribArray(0);
                      this.gl.enableVertexAttribArray(1);
                      this.gl.enableVertexAttribArray(2);
                      this.gl.enableVertexAttribArray(3);
                      this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 12*4, 0*4); // position
                      this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, 12*4, 3*4); // normal
                      this.gl.vertexAttribPointer(2, 4, this.gl.FLOAT, false, 12*4, 6*4); // color
                      this.gl.vertexAttribPointer(3, 2, this.gl.FLOAT, false, 12*4, 10*4); // texture
                      this.engine.shadermanager.UseShader_PNCT(this.engine.matModelViewProjection);
                      break;
                      
        case "font": 
                      this.gl.enableVertexAttribArray(0);
                      this.gl.enableVertexAttribArray(1);
                      this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 5*4, 0*4); // position
                      this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 5*4, 3*4); // texture
                      if (opt_fontcolor == null)
                      {
                         opt_fontcolor = this.defaultfontcolor;
                      }
                      this.engine.shadermanager.UseShader_Font(this.engine.matModelViewProjection,opt_fontcolor);
                      break;
                             
             
        default:       
                      alert("unknown mesh mode!!");
         
      }
  
      if (this.texture)
      {
         this.texture.Enable();
      }

      switch(this.indexsemantic)
      {
         case "TRIANGLES":
                           if(opt_ranged)
                           {
                              this.gl.drawElements(this.gl.TRIANGLES, opt_count, this.gl.UNSIGNED_SHORT, opt_offset);
                           }
                           else
                           {
                               this.gl.drawElements(this.gl.TRIANGLES, this.numindex, this.gl.UNSIGNED_SHORT, 0);
                           }                          
                           break;
         case "TRIANGLESTRIP":
                           if(opt_ranged)
                           {
                              this.gl.drawElements(this.gl.TRIANGLE_STRIP, opt_count, this.gl.UNSIGNED_SHORT, opt_offset);
                           }
                           else
                           {
                               this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.numindex, this.gl.UNSIGNED_SHORT, 0);
                           }                          
                           break;                  
         case "LINES":     
                           this.gl.drawElements(this.gl.LINES, this.numindex, this.gl.UNSIGNED_SHORT, 0);
                           break;
                           
         case "POINTS":     
                           this.gl.drawElements(this.gl.POINTS, this.numindex, this.gl.UNSIGNED_SHORT, 0);
                           break;             
                        
         default:          
                           alert("unknown indexsemantic");
      }
      
      if(this.modelMatrix)
      {     
         this.engine.PopMatrices();   
      }  
      if (this.texture)
      {
         this.texture.Disable();
      }
          
      this.gl.disableVertexAttribArray(0);
      this.gl.disableVertexAttribArray(1);
      this.gl.disableVertexAttribArray(2);
      this.gl.disableVertexAttribArray(3);  
}

//------------------------------------------------------------------------------
/** 
 * @description download callback
 * @ignore
 */
function _cbfjsondownload(mesh)
{
   if (mesh.http.readyState==4)
   {
      if(mesh.http.status==404)
      {
         if (mesh.cbf)
         {
            mesh.cbf(mesh);
         }
      }
      else
      {
         var data=mesh.http.responseText;      
         var jsonobject=goog.json.parse(data);
         
         if (jsonobject.BoundingBox)
         {
            mesh.bbmin = jsonobject.BoundingBox[0];
            mesh.bbmax = jsonobject.BoundingBox[1];
         }
         
         if (jsonobject.Offset)
         {
            mesh.offset = jsonobject.Offset;
         }
         
         if (jsonobject.CurtainIndex)   
         {
            mesh.curtainindex = jsonobject.CurtainIndex;
         }
         
         switch(jsonobject.VertexSemantic)
         {
            case "p":      mesh.numvertex = jsonobject.Vertices.length/3;    
                           mesh.SetBufferP(jsonobject.Vertices);
                           mesh.mode = "p";
                                
                           break;
                            
            case "pnt":    mesh.numvertex = jsonobject.Vertices.length/8;
                           mesh.SetBufferPNT(jsonobject.Vertices);
                           mesh.mode = "pnt";
                           
                           break;
                           
            case "pc":     mesh.numvertex = jsonobject.Vertices.length/7; 
                           mesh.mode = "pc";
                           mesh.SetBufferPC(jsonobject.Vertices); 
                           break;
                           
            case "pt":     mesh.numvertex = jsonobject.Vertices.length/5; 
                           mesh.mode = "pt";   
                           mesh.SetBufferPT(jsonobject.Vertices);                     
                           break;
                           
            case "pnct":   mesh.numvertex = jsonobject.Vertices.length/12;
                           mesh.mode = "p";
                           mesh.SetBufferPNCT(jsonobject.Vertices); 
                           break;
        
            default:       
                           alert("unknown mesh mode!!");
         }      
         mesh.SetIndexBuffer(jsonobject.Indices,jsonobject.IndexSemantic);
         
         
         mesh.numindex = jsonobject.Indices.length;         // number of elements of index vector
         mesh.Ready = true; 
         
         if(mesh.cbfJSONLoad)
         {
            mesh.cbfJSONLoad(mesh);
         }
         
         if (mesh.cbr)
         {
            mesh.cbr(mesh);
         }
      }     
   }    
}

//------------------------------------------------------------------------------
/**
 * @description Load mesh-data from a JSON file.
 * @param {string} url the url to the JSON file.
 * @param {function()=} opt_callbackready optional function called when mesh finished download
 * @param {function()=} opt_callbackfailed optional function called when mesh failed download
 */
Mesh.prototype.loadFromJSON = function(url, opt_callbackready, opt_callbackfailed)
{
   if(url == null) 
   {
      alert("invalid json-url");
      return;
   }  
   this.jsonUrl=url;
      
   this.http=new window.XMLHttpRequest();
   this.http.open("GET",this.jsonUrl,true);
   
   this.cbr = opt_callbackready;
   this.cbf = opt_callbackfailed;
   
   var me=this;
   this.http.onreadystatechange = function(){_cbfjsondownload(me);};
   this.http.send();  
}

//------------------------------------------------------------------------------
/**
 * @description Specify the function called as soon as the JSON File is fully loaded. This is optional.
 * @param {function()} f Callback Function which has "mesh" as param.
 * */
Mesh.prototype.SetJSONLoadCallback = function(f)
{
   this.cbfJSONLoad = f;
}



/**
 * @description   Test for ray mesh intersection iterates through all triangles.
 * @param x x ray startpoint x coordinate
 * @param y y ray startpoint y coordinate
 * @param z z ray startpoint z coordinate
 * @param dirx normalized direction x coordinate
 * @param diry normalized direction y coordinate
 * @param dirz normalized direction z coordinate
 */
Mesh.prototype.TestRayIntersection = function(x,y,z,dirx,diry,dirz)
{
   
   var hit = false;
   var vertexlength = 0;
   var hitresult = null;
   var t=null;      
            
            
   for(var i=0; i < this.numOfTriangles; i++)
   {
      var setTriangle = this.SetCurrentTriangle(i);
      if(!setTriangle)
      {
         continue; 
      }
  
        /* 
      //not tested...yet !!!!        
      if(this.modelMatrix)
      {
               
       
         var invModelMatrix = new mat4();
         invModelMatrix.Inverse(this.modelMatrix); 
              
         v1 = new vec3();
         v1.Set(v1x,v1y,v1z);
              
         v2 = new vec3();
         v2.Set(v2x,v2y,v2z);
              
         v3 = new vec3();
         v3.Set(v3x,v3y,v3z);
              
             
         vec = invModelMatrix.MultiplyVec3(v1);
         v1x = vec.Get()[0];
         v1y = vec.Get()[1];
         v1z = vec.Get()[2];
              
         vec = invModelMatrix.MultiplyVec3(v2);
         v2x = vec.Get()[0];
         v2y = vec.Get()[1];
         v2z = vec.Get()[2];
              
         vec = invModelMatrix.MultiplyVec3(v3);
         v3x = vec.Get()[0];
         v3y = vec.Get()[1];
         v3z = vec.Get()[2];
         
       }  
         */
        
      var result = this.intersector.IntersectTriangle(x,y,z,dirx,diry,dirz,this.currentTriangle.v1x,this.currentTriangle.v1y,this.currentTriangle.v1z,this.currentTriangle.v2x,this.currentTriangle.v2y,this.currentTriangle.v2z,this.currentTriangle.v3x,this.currentTriangle.v3y,this.currentTriangle.v3z);      
             
      if(result)
      {
         hit = true;  
         if(hitresult)
         {
            if(result.t < hitresult.t)
            {
            hitresult = result;      
            }  
            
         }
         else
         {
            hitresult = result;    
         }            
      }
   } 
   return hitresult;
}


/**
 * @ignore
 * @description Reads a Triangle from the current vertexBuffer using the correct mode and sets the value to this.currentTriangle.v...values
 */
Mesh.prototype.SetCurrentTriangle = function(triangleNumber)
{
   switch(this.indexsemantic)
   {
      case "TRIANGLES":
                        this.currentTriangle.v1x = this.vertexbufferdata[this.indexbufferdata[triangleNumber*3]*this.vertexLength];
                        this.currentTriangle.v1y = this.vertexbufferdata[this.indexbufferdata[triangleNumber*3]*this.vertexLength+1];
                        this.currentTriangle.v1z = this.vertexbufferdata[this.indexbufferdata[triangleNumber*3]*this.vertexLength+2];
              
                        this.currentTriangle.v2x = this.vertexbufferdata[this.indexbufferdata[triangleNumber*3+1]*this.vertexLength];
                        this.currentTriangle.v2y = this.vertexbufferdata[this.indexbufferdata[triangleNumber*3+1]*this.vertexLength+1];
                        this.currentTriangle.v2z = this.vertexbufferdata[this.indexbufferdata[triangleNumber*3+1]*this.vertexLength+2];
              
                        this.currentTriangle.v3x = this.vertexbufferdata[this.indexbufferdata[triangleNumber*3+2]*this.vertexLength];
                        this.currentTriangle.v3y = this.vertexbufferdata[this.indexbufferdata[triangleNumber*3+2]*this.vertexLength+1];
                        this.currentTriangle.v3z = this.vertexbufferdata[this.indexbufferdata[triangleNumber*3+2]*this.vertexLength+2];     
                        break;
                        
      case "TRIANGLESTRIP":
      
                        if(triangleNumber%2 == 0) //even
                        {  
                           
                                    
                          this.currentTriangle.v1x = this.vertexbufferdata[this.indexbufferdata[triangleNumber]*this.vertexLength];
                          this.currentTriangle.v1y = this.vertexbufferdata[this.indexbufferdata[triangleNumber]*this.vertexLength+1];
                          this.currentTriangle.v1z = this.vertexbufferdata[this.indexbufferdata[triangleNumber]*this.vertexLength+2];
              
                          this.currentTriangle.v2x = this.vertexbufferdata[this.indexbufferdata[triangleNumber+1]*this.vertexLength];
                          this.currentTriangle.v2y = this.vertexbufferdata[this.indexbufferdata[triangleNumber+1]*this.vertexLength+1];
                          this.currentTriangle.v2z = this.vertexbufferdata[this.indexbufferdata[triangleNumber+1]*this.vertexLength+2];
              
                          this.currentTriangle.v3x = this.vertexbufferdata[this.indexbufferdata[triangleNumber+2]*this.vertexLength];
                          this.currentTriangle.v3y = this.vertexbufferdata[this.indexbufferdata[triangleNumber+2]*this.vertexLength+1];
                          this.currentTriangle.v3z = this.vertexbufferdata[this.indexbufferdata[triangleNumber+2]*this.vertexLength+2]; 
                        }
                        else
                        {
                          this.currentTriangle.v1x = this.vertexbufferdata[this.indexbufferdata[triangleNumber+1]*this.vertexLength];
                          this.currentTriangle.v1y = this.vertexbufferdata[this.indexbufferdata[triangleNumber+1]*this.vertexLength+1];
                          this.currentTriangle.v1z = this.vertexbufferdata[this.indexbufferdata[triangleNumber+1]*this.vertexLength+2];
              
                          this.currentTriangle.v2x = this.vertexbufferdata[this.indexbufferdata[triangleNumber]*this.vertexLength];
                          this.currentTriangle.v2y = this.vertexbufferdata[this.indexbufferdata[triangleNumber]*this.vertexLength+1];
                          this.currentTriangle.v2z = this.vertexbufferdata[this.indexbufferdata[triangleNumber]*this.vertexLength+2];
              
                          this.currentTriangle.v3x = this.vertexbufferdata[this.indexbufferdata[triangleNumber+2]*this.vertexLength];
                          this.currentTriangle.v3y = this.vertexbufferdata[this.indexbufferdata[triangleNumber+2]*this.vertexLength+1];
                          this.currentTriangle.v3z = this.vertexbufferdata[this.indexbufferdata[triangleNumber+2]*this.vertexLength+2];          
                        }                     
                          
                        break;
                        
      default: 
                        goog.debug.Logger.getLogger('owg.Mesh').warning("This indexsemantic is not supported for function: Mesh.ReadTriangleFromBuffer() ");
                        break;
      
   }
   
   if(this.indexbufferdata[triangleNumber] == this.indexbufferdata[triangleNumber+1]
                              || this.indexbufferdata[triangleNumber] == this.indexbufferdata[triangleNumber+2]
                                 || this.indexbufferdata[triangleNumber+1] == this.indexbufferdata[triangleNumber+2])
   {
       return false;
   }
   return true;
   
   
}

//------------------------------------------------------------------------------
/**
 * @description Updates the bounding box of the mesh
 * (Warning: currently ignoring mesh model matrix)
 */
Mesh.prototype.UpdateAABB = function()
{
   var minx = 1e20;
   var miny = 1e20;
   var minz = 1e20;
   var maxx = -1e20;
   var maxy = -1e20;
   var maxz = -1e20;
   var vx,vy,vz;
   
   // 
   for (var i=0;i<this.vertexbufferdata.length;i++)
   {
      vx = this.vertexbufferdata[i*this.vertexLength];
      vy = this.vertexbufferdata[i*this.vertexLength+1];
      vz = this.vertexbufferdata[i*this.vertexLength+2];
   
      if (vx>maxx) { maxx = vx;}
      if (vy>maxy) { maxy = vy;}
      if (vz>maxz) { maxz = vz;}
      if (vx<minx) { minx = vx;}
      if (vy<miny) { miny = vy;}
      if (vz<minz) { minz = vz;}
   }
   
   // if this node has a high precision virtual camera offset, add it to the vertices.
   if (this.offset)
   {
      minx += this.offset[0];
      miny += this.offset[1];
      minz += this.offset[2];
      maxx += this.offset[0];
      maxy += this.offset[1];
      maxz += this.offset[2];
   } 
   
   if (this.bbmin == null) // no bounding box yet ?
   {
      this.bbmin = new Array(3);
   }
   if (this.bbmax == null)
   {
      this.bbmax = new Array(3);
   }
   
   this.bbmin[0] = minx;
   this.bbmin[1] = miny;
   this.bbmin[2] = minz;
   this.bbmax[0] = maxx;
   this.bbmax[1] = maxy;
   this.bbmax[2] = maxz;
   
}


//------------------------------------------------------------------------------
/**
 * @description   Test for ray bounding box intersection
 * @param x x ray startpoint x coordinate
 * @param y y ray startpoint y coordinate
 * @param z z ray startpoint z coordinate
 * @param dirx normalized direction x coordinate
 * @param diry normalized direction y coordinate
 * @param dirz normalized direction z coordinate
 */
Mesh.prototype.TestBoundingBoxIntersection = function(x,y,z,dirx,diry,dirz)
{
   var result;
  
   //not tested...yet !!!!        
   if(this.modelMatrix)
   {       
      var invModelMatrix = new mat4();
      invModelMatrix.Inverse(this.modelMatrix); 
              
      var v1 = new vec3();
      v1.Set(this.bbmin[0],this.bbmin[1],this.bbmin[2]);
              
      var v2 = new vec3();
      v2.Set(this.bbmax[0],this.bbmax[1],this.bbmax[2]);
             
      var vec = invModelMatrix.MultiplyVec3(v1);
      var v1x = vec.Get()[0];
      var v1y = vec.Get()[1];
      var v1z = vec.Get()[2];
              
      var vec = invModelMatrix.MultiplyVec3(v2);
      var v2x = vec.Get()[0];
      var v2y = vec.Get()[1];
      var v2z = vec.Get()[2];
      
      result = this.aabb.HitBox(x,y,z,dirx,diry,dirz,v1x,v1y,v1z,v2x,v2y,v2z); 
   } 
   else
   {
      result = this.aabb.HitBox(x,y,z,dirx,diry,dirz,this.bbmin[0],this.bbmin[1],this.bbmin[2],this.bbmax[0],this.bbmax[1],this.bbmax[2]);   
   }      

   return result;  //if result = null -> no hit!
}


/**
 * @description fills the modelmatrix to use this mesh as billboard.
 */
Mesh.prototype.SetAsBillboard= function(x,y,z)
{
   var view = this.engine.matView.Get();
   var bbmat = new mat4();
   this.billboardPos[0] = x;
   this.billboardPos[1] = y;
   this.billboardPos[2] = z;
   bbmat.Set([view[0],view[4],view[8],0,view[1],view[5],view[9],0,view[2],view[6],view[10],0,this.billboardPos[0],this.billboardPos[1],this.billboardPos[2],1]);
   this.modelMatrix = bbmat;
}


Mesh.prototype.UpdateBillboardMatrix = function()
{
   this.SetAsBillboard(this.billboardPos[0],this.billboardPos[1],this.billboardPos[2]);
}


/**
 * @description fills the modelmatrix to use this mesh as billboard.
 */
 /*
  * Alternative implementation  
  */
  /*
Mesh.prototype.SetAsBillboard = function(camX,camY,camZ,objX,objY,objZ)
{
   
   var camPos = new vec3();
   camPos.Set(camX,camY,camZ);
   
   var objPos = new vec3();
   objPos.Set(objX,objY,objZ);
   
   // objToCamProj is the vector in world coordinates from the 
   // local origin to the camera projected in the XZ plane
   var objToCamProj = new vec3();
   objToCamProj.Set(camX - objX,0,camZ - objZ);
   objToCamProj.Normalize();
   
   // This is the original lookAt vector for the object 
   // in world coordinates
   var lookAt = new vec3();
   lookAt.Set(0,0,1);
   
   
    var angleCos = lookAt.Dot(objToCamProj);
    goog.debug.Logger.getLogger('owg.Mesh').info(angleCos);
    
    lookAt.Cross(objToCamProj);
      goog.debug.Logger.getLogger('owg.Mesh').info(lookAt.ToString());

   if ((angleCos < 0.99990) && (angleCos > -0.9999))
   {
      this.modelMatrix = new mat4();
      if(lookAt.Get()[1]>0)
      {
         this.modelMatrix.RotationY(Math.acos(angleCos));
         goog.debug.Logger.getLogger('owg.Mesh').info("angle: "+Math.acos(angleCos)*180/Math.PI);
         goog.debug.Logger.getLogger('owg.Mesh').info(this.modelMatrix.ToString());
      }
      else
      {
         this.modelMatrix.RotationY(2*Math.PI-Math.acos(angleCos));
         goog.debug.Logger.getLogger('owg.Mesh').info("angle: "+(2*Math.PI-Math.acos(angleCos))*180/Math.PI);
      }
      
      
   }
   
}
*/

goog.exportSymbol('Mesh', Mesh);
goog.exportProperty(Mesh.prototype, 'Draw', Mesh.prototype.Draw);
goog.exportProperty(Mesh.prototype, 'SetAsBillboard', Mesh.prototype.SetAsBillboard);
goog.exportProperty(Mesh.prototype, 'SetTexture', Mesh.prototype.SetTexture);
goog.exportProperty(Mesh.prototype, 'TestBoundingBoxIntersection', Mesh.prototype.TestBoundingBoxIntersection);
goog.exportProperty(Mesh.prototype, 'TestRayIntersection', Mesh.prototype.TestRayIntersection);
