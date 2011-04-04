uniform mat4 matMVP;
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;
varying vec3 vNormal;
varying vec2 vTexCoord;

void main()
{
   gl_Position = gl_Position = matMVP * aPosition;
   vTexCoord = aTexCoord;
   vNormal = aNormal;
}
