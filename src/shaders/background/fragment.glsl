uniform vec3 uBackgroundColor;
uniform vec3 uLightColor;
uniform float uBackgroundLightStrength;
uniform float uBackgroundLightHeight;
uniform float uBackgroundLightVerticalPosition;

varying vec2 vUv;

void main()
{
    float strength = distance(vec2(vUv.x, vUv.y * uBackgroundLightHeight), vec2(0.5, 0.5 * uBackgroundLightVerticalPosition)) * uBackgroundLightStrength;

    vec3 color = mix(uLightColor, uBackgroundColor, strength);

    /* gl_FragColor = vec4(vec3(strength), 1.0); */
    gl_FragColor = vec4(color, 1.0);
}
