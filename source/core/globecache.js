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

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Cache Manager for virtual globe
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function GlobeCache(engine, imagelayerlist, elevationlayerlist, quadtree, cachesize)
{
   this.engine = engine;
   this.imagelayerlist = imagelayerlist;
   this.elevationlayerlist = elevationlayerlist;
   this.quadtree = quadtree;
   
   this.cache = new Cache(cachesize, false);
}
//------------------------------------------------------------------------------
/**
 * @description Returns true if cache is ready to be used.
 * Please note that for some tile services creation of cache needs async requests.
 * You can't make tile requests before this function returns true.
 */
GlobeCache.prototype.IsReady = function()
{
   if (!this.imagelayerlist) { return false; }
   
   if (this.imagelayerlist.length == 0) {return false;}
   
   for (var i=0;i<this.imagelayerlist.length;i++)
   {
      if (!this.imagelayerlist[i].Ready())
      {
         return false;
      }
   }
  
   return true; // all image layers are ready!
}
//------------------------------------------------------------------------------
/**
 * @description Request a new Terrainblock. This is async. 
 * Always returns a terrain block (possibly marked as not ready)
 */
//------------------------------------------------------------------------------
GlobeCache.prototype.RequestBlock = function(quadcode)
{
   var terrainblock = this.cache.getItem(quadcode);
   if (terrainblock == null)
   {
      // item doesn't exist yet, create a new one and request data (async)
      terrainblock = new TerrainBlock(this.engine, quadcode, this.quadtree);
      terrainblock._AsyncRequestData(this.imagelayerlist);
      this.cache.setItem(quadcode, terrainblock);
   }
   
   return terrainblock;
}
//------------------------------------------------------------------------------
/**
 * @description Get an already cached block (or null if unavailable)
 * This doesn't force downloading a block if not available.
 * Returns terrain block or null.
 */
GlobeCache.prototype.GetCachedBlock = function(quadcode)
{
   var terrainblock = this.cache.getItem(quadcode);
   return terrainblock;
}
//------------------------------------------------------------------------------


