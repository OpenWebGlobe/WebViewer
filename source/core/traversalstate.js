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
/**
 * @constructor
 * @description This class is used to store the traversal state of the scene graph
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function TraversalState()
{
   this.MatrixStackView = new Array();
   this.MatrixStackModel = new Array();
   this.MatrixStackProjection = new Array();
} 

//------------------------------------------------------------------------------
/**
 * @description Push a new view matrix to stack
 * @param{mat4} matrix view matrix
 */
TraversalState.prototype.PushView = function(matrix)
{
   this.MatrixStackView.push(matrix);
}
//------------------------------------------------------------------------------
/**
 * @description Pop view matrix from stack and return it
 */
TraversalState.prototype.PopView = function()
{
   return this.MatrixStackView.pop();
}
//------------------------------------------------------------------------------
/**
 * @description Push a new model matrix to stack
 * @param{mat4} matrix model matrix
 */
TraversalState.prototype.PushModel = function(matrix)
{
   this.MatrixStackModel.push(matrix);
}
//------------------------------------------------------------------------------
/**
 * @description Pop model matrix from stack and return it
 */
TraversalState.prototype.PopModel = function()
{
   return this.MatrixStackModel.pop();
}
//------------------------------------------------------------------------------
/**
 * @description Push a new projection matrix to stack
 * @param{mat4} matrix model matrix
 */
TraversalState.prototype.PushProjection = function(matrix)
{
   this.MatrixStackProjection.push(matrix);
}
//------------------------------------------------------------------------------
/**
 * @description Pop projection matrix from stack and return it
 */
TraversalState.prototype.PopProjection = function()
{
   return this.MatrixStackProjection.pop();
}
//------------------------------------------------------------------------------
/**
 * @description Return current modelviewprojection matrix from stack and return it
 * @param{mat4} matrix preallocatefor the current modelviewprojection matrix
 */
TraversalState.prototype.GetModelViewProjectionMatrix = function(matrix)
{

}
//------------------------------------------------------------------------------
/**
 * @description Return current modelview matrix from stack and return it
 * @param{mat4} matrix the current modelview matrix
 */
TraversalState.prototype.GetModelViewMatrix = function(matrix)
{
   
}
//------------------------------------------------------------------------------
/**
 * @description Return current view matrix from stack and return it
 * @param{mat4} matrix the current view matrix
 */
TraversalState.prototype.GetViewMatrix = function(matrix)
{
   var l = this.MatrixStackView.length();
   if (l>0)
   {
      matrix.CopyFrom(this.MatrixStackView[l-1]);
   }
}
//------------------------------------------------------------------------------
/**
 * @description Return current model matrix from stack and return it
 * @param{mat4} matrix the current model matrix
 */
TraversalState.prototype.GetModelMatrix = function(matrix)
{
   var l = this.MatrixStackModel.length();
   matrix.CopyFrom(this.MatrixStackModel[l-1]);
}
//------------------------------------------------------------------------------
/**
 * @description Return current projection matrix from stack and return it
 * @param{mat4} matrix the current projection matrix
 */
TraversalState.prototype.GetProjectionMatrix = function(matrix)
{
   var l = this.MatrixStackProjection.length();
   matrix = this.MatrixStackProjection[l-1];
}
//------------------------------------------------------------------------------



