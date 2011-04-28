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

goog.provide('owg.ViewFrustum');

//------------------------------------------------------------------------------
/** 
 * @constructor
 * @description Struct to save corner coordinates
 * @ignore
 */
function corner()
{
   this.x = 0;
   this.y = 0;
   this.z = 0;
}

//------------------------------------------------------------------------------
/** 
 * @description ViewFrustum: Class for test if a Box is inside or outside the view frustum. 
 * @constructor
 * @param mvpMatrix the model-view-projection matrix
 */
function ViewFrustum(mvpMatrix)
{
   this.frustumPlanes = new Array(6);
   this.frustumPlanes[0] = new plane3();
   this.frustumPlanes[1] = new plane3();
   this.frustumPlanes[2] = new plane3();
   this.frustumPlanes[3] = new plane3();
   this.frustumPlanes[4] = new plane3();
   this.frustumPlanes[5] = new plane3();  
   
   this.corners = new Array(8);
   this.corners[0] = new corner();
   this.corners[1] = new corner();
   this.corners[2] = new corner();
   this.corners[3] = new corner();
   this.corners[4] = new corner();
   this.corners[5] = new corner();
   this.corners[6] = new corner();
   this.corners[7] = new corner();
}

/** 
 * @constructor
 * @description Struct to save plane data.
 * @ignore
 */
function plane3()
{
   this.D = 0;
   this.nx = 0;
   this.ny = 0;
   this.nz = 0;
}


//------------------------------------------------------------------------------
/** 
 * @description Normalize plane
 * @ignore
 */
plane3.prototype.Normalize = function() 
{
      var mag = Math.sqrt(this.nx*this.nx+this.ny*this.ny+this.nz*this.nz);
      this.nx /= mag;
      this.ny /= mag;
      this.nz /= mag;
      this.D /= mag;
}

/** 
 * @description determine side of point (px,py,pz) (half space)
 * @ignore
 */
function SideOfPlane(plane, px, py, pz)
{
   var res = plane.nx * px + 
             plane.ny * py + 
             plane.nz * pz + plane.D;
   
   return res;          
}

//------------------------------------------------------------------------------
/** 
 * @description ViewFrustum: function to test if a Box (defined by min_x,min_y,min_z and max_x,max_y,max_z) is inside or outside the view frustum. 
 * @param min_x   min_x x coordinate of front-left-bottom box corner. 
 * @param min_y   min_y y coordinate of front-left-bottom box corner. 
 * @param min_z   min_z z coordinate of front-left-bottom box corner. 
 * @param max_x   max_x x coordinate of rear-right-top box corner. 
 * @param max_y   max_y y coordinate of rear-right-top box corner. 
 * @param max_z   max_z z coordinate of rear-right-top box corner. 
 */
ViewFrustum.prototype.TestBox = function(min_x, min_y, min_z, max_x, max_y, max_z)
{
  var nTotalIn = 0;
  
  this.corners[0].x = min_x; this.corners[0].y = min_y; this.corners[0].z = min_z;
  this.corners[1].x = max_x; this.corners[1].y = min_y; this.corners[1].z = min_z;
  this.corners[2].x = max_x; this.corners[2].y = max_y; this.corners[2].z = min_z;
  this.corners[3].x = min_x; this.corners[3].y = max_y; this.corners[3].z = min_z;
  this.corners[4].x = min_x; this.corners[4].y = min_y; this.corners[4].z = max_z;
  this.corners[5].x = min_x; this.corners[5].y = max_y; this.corners[5].z = max_z;
  this.corners[6].x = max_x; this.corners[6].y = max_y; this.corners[6].z = max_z;
  this.corners[7].x = max_x; this.corners[7].y = min_y; this.corners[7].z = max_z;
  
  for(var p=0; p<6; p++)
  {    
     var inCount = 8;
     for(var i=0; i<8; i++)
     {  
        //test for every point and plane combination
        var sign = SideOfPlane(this.frustumPlanes[p], this.corners[i].x, this.corners[i].y, this.corners[i].z);
        if( sign < 0)
        {
           --inCount;
        }
     }   
     if(inCount == 0)
     {
        //corner outside frustum
        return false;
     } 
  }
  return true;    
}

//------------------------------------------------------------------------------
/** 
 * @description Updates the object with a new mvpMatrix
 * @param mvpMatrix model-view-projection matrix.
 */
 ViewFrustum.prototype.Update = function(mvpMatrix)
 {
   this.mvp = mvpMatrix;
   this.mvpVals = mvpMatrix.Get();
   
   this.mvpval_11 = this.mvpVals[0]; this.mvpval_21 = this.mvpVals[1]; this.mvpval_31 = this.mvpVals[2];  this.mvpval_41 = this.mvpVals[3];
   this.mvpval_12 = this.mvpVals[4]; this.mvpval_22 = this.mvpVals[5]; this.mvpval_32 = this.mvpVals[6];  this.mvpval_42 = this.mvpVals[7];
   this.mvpval_13 = this.mvpVals[8]; this.mvpval_23 = this.mvpVals[9]; this.mvpval_33 = this.mvpVals[10]; this.mvpval_43 = this.mvpVals[11];
   this.mvpval_14 = this.mvpVals[12]; this.mvpval_24 = this.mvpVals[13]; this.mvpval_34 = this.mvpVals[14]; this.mvpval_44 = this.mvpVals[15];
   
   this.UpdateFrustumPlanes();
 }


//------------------------------------------------------------------------------
/** 
 * @description Extracts the frustum planes from mvpMatrix.
 */
ViewFrustum.prototype.UpdateFrustumPlanes = function()
{
  
   //Left clipping plane
   this.frustumPlanes[0].nx = this.mvpval_41 + this.mvpval_11; 
   this.frustumPlanes[0].ny = this.mvpval_42 + this.mvpval_12;
   this.frustumPlanes[0].nz = this.mvpval_43 + this.mvpval_13;
   this.frustumPlanes[0].D  = this.mvpval_44 + this.mvpval_14;
   this.frustumPlanes[0].Normalize();
   
   //Right clipping plane
   this.frustumPlanes[1].nx = this.mvpval_41 - this.mvpval_11; 
   this.frustumPlanes[1].ny = this.mvpval_42 - this.mvpval_12;
   this.frustumPlanes[1].nz = this.mvpval_43 - this.mvpval_13;
   this.frustumPlanes[1].D  = this.mvpval_44 - this.mvpval_14;
   this.frustumPlanes[1].Normalize();
   
   
   //Top clipping Plane
   this.frustumPlanes[2].nx = this.mvpval_41 - this.mvpval_21; 
   this.frustumPlanes[2].ny = this.mvpval_42 - this.mvpval_22;
   this.frustumPlanes[2].nz = this.mvpval_43 - this.mvpval_23;
   this.frustumPlanes[2].D  = this.mvpval_44 - this.mvpval_24;
   this.frustumPlanes[2].Normalize();
   
   //Bottom
   this.frustumPlanes[3].nx = this.mvpval_41 + this.mvpval_21; 
   this.frustumPlanes[3].ny = this.mvpval_42 + this.mvpval_22;
   this.frustumPlanes[3].nz = this.mvpval_43 + this.mvpval_23;
   this.frustumPlanes[3].D  = this.mvpval_44 + this.mvpval_24;
   this.frustumPlanes[3].Normalize();
   
   //near
   this.frustumPlanes[4].nx = this.mvpval_41 + this.mvpval_31; 
   this.frustumPlanes[4].ny = this.mvpval_42 + this.mvpval_32;
   this.frustumPlanes[4].nz = this.mvpval_43 + this.mvpval_33;
   this.frustumPlanes[4].D  = this.mvpval_44 + this.mvpval_34;
   this.frustumPlanes[4].Normalize();
   
   //far
   this.frustumPlanes[5].nx = this.mvpval_41 - this.mvpval_31; 
   this.frustumPlanes[5].ny = this.mvpval_42 - this.mvpval_32;
   this.frustumPlanes[5].nz = this.mvpval_43 - this.mvpval_33;
   this.frustumPlanes[5].D  = this.mvpval_44 - this.mvpval_34;
   this.frustumPlanes[5].Normalize();
  
}

goog.exportSymbol('ViewFrustum', ViewFrustum);
goog.exportSymbol('ViewFrustum.TestBox', ViewFrustum.TestBox);
goog.exportSymbol('ViewFrustum.Update', ViewFrustum.Update);
