#ifdef GL_ES
precision highp float;
#endif

varying vec3 vNormal;
varying vec2 vTexCoord;
varying vec4 vColor;
uniform sampler2D uTexture;

void main()
{
   gl_FragColor = vColor * texture2D(uTexture, vTexCoord);
}

