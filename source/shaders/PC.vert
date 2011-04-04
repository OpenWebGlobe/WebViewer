uniform mat4 matMVP;
attribute vec3 aPosition;
attribute vec4 aColor;
varying vec4 vColor;

void main()
{
   gl_Position = gl_Position = matMVP * aPosition;
   vTexCoord = aTexCoord;
   vColor = aColor;
}
