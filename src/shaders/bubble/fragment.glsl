uniform vec3 uOuterColor;
uniform vec3 uInnerColor;
uniform float uRingSize;

varying vec2 vUv;
varying vec3 vNormal;

void main()
{

    // float strength = distance(vec2(vUv.x * 2.0, vUv.y), vec2(0.5 * 2.0, 0.5)) * uRingSize;

    // vec3 color = mix(uInnerColor, uOuterColor, strength);

    float strength = distance(vec2(vNormal.x * uRingSize), vec2(0.5));

    vec3 color = mix(uOuterColor, uInnerColor, strength); 

    gl_FragColor = vec4(color, 1.0);
}
