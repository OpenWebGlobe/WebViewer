uniform mat4 matMVP;
attribute vec3 aPosition;
attribute vec4 aColor;
varying vec4 vColor;

void main()
{
   gl_Position = matMVP * vec4(aPosition, 1.0);
   vColor = aColor;
}
