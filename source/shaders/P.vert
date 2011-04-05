uniform mat4 matMVP;
attribute vec3 aPosition;

void main()
{
   gl_Position = matMVP * vec4(aPosition,1.0);
}
