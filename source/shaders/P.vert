uniform mat4 matMVP;
attribute vec3 aPosition;

void main()
{
   gl_Position = gl_Position = matMVP * aPosition;
}
