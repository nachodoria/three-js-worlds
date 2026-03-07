varying vec3 vColor;
varying float vAlpha;

void main()
{
    float d = length(gl_PointCoord - 0.5);
    float strength = 1.0 - smoothstep(0.45, 0.5, d);

    gl_FragColor = vec4(vColor, vAlpha * strength);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}