obj-merge-textures
==================

This script takes a Wavefront OBJ file with multiple textures as input and
writes a Wavefront OBJ with a single, WebGL-compatible texture as output.


Usage
-----

    obj-merge-textures.py --input=input.obj --output=output.obj

This will create `output.obj`, `output.mtl` and `output.jpg` containing the
single texture Wavefront OBJ object, materials library and texture impage
respectively.  The script merges all textures from `input.obj`'s material
library into a single 2^N * 2^N image for some integer N and transforms the
texture coordinates appropriately.


Bugs
----

The script assumes that all faces are textured, strange things will happen to
non-textured faces.
