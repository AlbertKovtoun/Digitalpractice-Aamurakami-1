import {
  DepthFormat,
  DepthTexture,
  LinearFilter,
  Matrix4,
  MeshStandardMaterial,
  PerspectiveCamera,
  Plane,
  UnsignedShortType,
  Vector3,
  Vector4,
  WebGLRenderTarget,
} from "three"
import * as POSTPROCESSING from "postprocessing"

export default class MeshReflectorMaterial extends MeshStandardMaterial {
  constructor(
    renderer,
    camera,
    scene,
    object,
    {
      mixBlur = 0,
      mixStrength = 1,
      resolution = 256,
      blur = [0, 0],
      minDepthThreshold = 0.9,
      maxDepthThreshold = 1,
      depthScale = 0,
      depthToBlurRatioBias = 0.25,
      mirror = 0,
      distortion = 1,
      mixContrast = 1,
      distortionMap,
      reflectorOffset = 0,
      bufferSamples = 8,
      planeNormal = new Vector3(0, 0, 1),
    } = {}
  ) {
    super()

    this.gl = renderer
    this.camera = camera
    this.scene = scene
    this.parent = object

    this.hasBlur = blur[0] + blur[1] > 0
    this.reflectorPlane = new Plane()
    this.normal = new Vector3()
    this.reflectorWorldPosition = new Vector3()
    this.cameraWorldPosition = new Vector3()
    this.rotationMatrix = new Matrix4()
    this.lookAtPosition = new Vector3(0, -1, 0)
    this.clipPlane = new Vector4()
    this.view = new Vector3()
    this.target = new Vector3()
    this.q = new Vector4()
    this.textureMatrix = new Matrix4()
    this.virtualCamera = new PerspectiveCamera()
    this.reflectorOffset = reflectorOffset
    this.planeNormal = planeNormal

    this.setupBuffers(resolution, blur, bufferSamples)

    this.reflectorProps = {
      mirror,
      textureMatrix: this.textureMatrix,
      mixBlur,
      tDiffuse: this.fbo1.texture,
      tDepth: this.fbo1.depthTexture,
      tDiffuseBlur: this.fbo2.texture,
      hasBlur: this.hasBlur,
      mixStrength,
      minDepthThreshold,
      maxDepthThreshold,
      depthScale,
      depthToBlurRatioBias,
      distortion,
      distortionMap,
      mixContrast,
      "defines-USE_BLUR": this.hasBlur ? "" : undefined,
      "defines-USE_DEPTH": depthScale > 0 ? "" : undefined,
      "defines-USE_DISTORTION": distortionMap ? "" : undefined,
    }
  }

  setupBuffers(resolution, blur, bufferSamples) {
    const parameters = {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      encoding: this.gl.outputEncoding,
    }

    const fbo1 = new WebGLRenderTarget(resolution, resolution, parameters)
    fbo1.depthBuffer = true
    fbo1.depthTexture = new DepthTexture(resolution, resolution)
    fbo1.depthTexture.format = DepthFormat
    fbo1.depthTexture.type = UnsignedShortType

    const fbo2 = new WebGLRenderTarget(resolution, resolution, parameters)

    if (this.gl.capabilities.isWebGL2) {
      fbo1.samples = bufferSamples
    }

    this.fbo1 = fbo1
    this.fbo2 = fbo2

    this.kawaseBlurPass = new POSTPROCESSING.KawaseBlurPass()
    this.kawaseBlurPass.setSize(blur[0], blur[1])
  }

  beforeRender() {
    if (!this.parent) return

    this.reflectorWorldPosition.setFromMatrixPosition(this.parent.matrixWorld)
    this.cameraWorldPosition.setFromMatrixPosition(this.camera.matrixWorld)
    this.rotationMatrix.extractRotation(this.parent.matrixWorld)

    // was changed from this.normal.set(0, 0, 1)
    this.normal.copy(this.planeNormal)
    this.normal.applyMatrix4(this.rotationMatrix)
    this.reflectorWorldPosition.addScaledVector(
      this.normal,
      this.reflectorOffset
    )
    this.view.subVectors(this.reflectorWorldPosition, this.cameraWorldPosition)
    // Avoid rendering when reflector is facing away
    if (this.view.dot(this.normal) > 0) return
    this.view.reflect(this.normal).negate()
    this.view.add(this.reflectorWorldPosition)
    this.rotationMatrix.extractRotation(this.camera.matrixWorld)
    this.lookAtPosition.set(0, 0, -1)
    this.lookAtPosition.applyMatrix4(this.rotationMatrix)
    this.lookAtPosition.add(this.cameraWorldPosition)
    this.target.subVectors(this.reflectorWorldPosition, this.lookAtPosition)
    this.target.reflect(this.normal).negate()
    this.target.add(this.reflectorWorldPosition)
    this.virtualCamera.position.copy(this.view)
    this.virtualCamera.up.set(0, 1, 0)
    this.virtualCamera.up.applyMatrix4(this.rotationMatrix)
    this.virtualCamera.up.reflect(this.normal)
    this.virtualCamera.lookAt(this.target)
    this.virtualCamera.far = this.camera.far // Used in WebGLBackground
    this.virtualCamera.updateMatrixWorld()
    this.virtualCamera.projectionMatrix.copy(this.camera.projectionMatrix)

    // Update the texture matrix
    this.textureMatrix.set(
      0.5,
      0.0,
      0.0,
      0.5,
      0.0,
      0.5,
      0.0,
      0.5,
      0.0,
      0.0,
      0.5,
      0.5,
      0.0,
      0.0,
      0.0,
      1.0
    )
    this.textureMatrix.multiply(this.virtualCamera.projectionMatrix)
    this.textureMatrix.multiply(this.virtualCamera.matrixWorldInverse)
    this.textureMatrix.multiply(this.parent.matrixWorld)

    // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
    // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
    this.reflectorPlane.setFromNormalAndCoplanarPoint(
      this.normal,
      this.reflectorWorldPosition
    )
    this.reflectorPlane.applyMatrix4(this.virtualCamera.matrixWorldInverse)
    this.clipPlane.set(
      this.reflectorPlane.normal.x,
      this.reflectorPlane.normal.y,
      this.reflectorPlane.normal.z,
      this.reflectorPlane.constant
    )
    const projectionMatrix = this.virtualCamera.projectionMatrix
    this.q.x =
      (Math.sign(this.clipPlane.x) + projectionMatrix.elements[8]) /
      projectionMatrix.elements[0]
    this.q.y =
      (Math.sign(this.clipPlane.y) + projectionMatrix.elements[9]) /
      projectionMatrix.elements[5]
    this.q.z = -1.0
    this.q.w =
      (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14]
    // Calculate the scaled plane vector
    this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(this.q))

    // Replacing the third row of the projection matrix
    projectionMatrix.elements[2] = this.clipPlane.x
    projectionMatrix.elements[6] = this.clipPlane.y
    projectionMatrix.elements[10] = this.clipPlane.z + 1.0
    projectionMatrix.elements[14] = this.clipPlane.w
  }

  update() {
    if (this.parent.material !== this) return

    this.parent.visible = false
    const currentXrEnabled = this.gl.xr.enabled
    const currentShadowAutoUpdate = this.gl.shadowMap.autoUpdate

    this.beforeRender()
    this.gl.xr.enabled = false
    this.gl.shadowMap.autoUpdate = false
    this.gl.setRenderTarget(this.fbo1)
    this.gl.state.buffers.depth.setMask(true)
    if (!this.gl.autoClear) this.gl.clear()

    this.gl.render(this.scene, this.virtualCamera)

    if (this.hasBlur) {
      this.kawaseBlurPass.render(this.gl, this.fbo1, this.fbo2)
    }

    this.gl.xr.enabled = currentXrEnabled
    this.gl.shadowMap.autoUpdate = currentShadowAutoUpdate
    this.parent.visible = true
    this.gl.setRenderTarget(null)
  }

  onBeforeCompile(shader, ...args) {
    super.onBeforeCompile(shader, ...args)

    if (this.defines === undefined) this.defines = {}

    if (!this.defines.USE_UV) {
      this.defines.USE_UV = ""
    }

    if (this.reflectorProps["defines-USE_BLUR"] !== undefined)
      this.defines.USE_BLUR = ""
    if (this.reflectorProps["defines-USE_DEPTH"] !== undefined)
      this.defines.USE_DEPTH = ""
    if (this.reflectorProps["defines-USE_DISTORTION"] !== undefined)
      this.defines.USE_DISTORTION = ""

    let props = this.reflectorProps

    for (let prop in props) {
      shader.uniforms[prop] = {
        get value() {
          return props[prop]
        },
      }
    }

    shader.vertexShader = `

            // Classic Perlin 3D Noise 
    // by Stefan Gustavson
    //
    vec4 permute(vec4 x)
    {
        return mod(((x*34.0)+1.0)*x, 289.0);
    }
vec4 taylorInvSqrt(vec4 r)
{
    return 1.79284291400159 - 0.85373472095314 * r;
}
vec3 fade(vec3 t)
{
    return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float cnoise(vec3 P)
{
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 / 7.0;
    vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 / 7.0;
    vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    return 2.2 * n_xyz;
}

            uniform mat4 textureMatrix;
            varying vec4 my_vUv;     
          ${shader.vertexShader}`

    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      /* glsl */ `
          #include <project_vertex>


          my_vUv = textureMatrix * vec4( position, 1.0 );

          vec4 modelPosition = modelMatrix * vec4(position, 1.0);

          modelPosition.y += sin(uv.x * 20.0) * 0.2;
          modelPosition.y += cnoise(vec3(modelPosition.xz, uv.x)) * 0.2;

          vec4 viewPosition = viewMatrix * modelPosition;

          vec4 projectedPosition = projectionMatrix * viewPosition;

          gl_Position = projectedPosition;
          `
    )

    shader.fragmentShader = /* glsl */ `
            uniform sampler2D tDiffuse;
            uniform sampler2D tDiffuseBlur;
            uniform sampler2D tDepth;
            uniform sampler2D distortionMap;
            uniform float distortion;
            uniform float cameraNear;
            uniform float cameraFar;
            uniform bool hasBlur;
            uniform float mixBlur;
            uniform float mirror;
            uniform float mixStrength;
            uniform float minDepthThreshold;
            uniform float maxDepthThreshold;
            uniform float mixContrast;
            uniform float depthScale;
            uniform float depthToBlurRatioBias;
            varying vec4 my_vUv;        
            ${shader.fragmentShader}`

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      /* glsl */ `
          #include <emissivemap_fragment>
        
          float distortionFactor = 0.0;
          #ifdef USE_DISTORTION
            distortionFactor = texture2D(distortionMap, vUv).r * distortion;
          #endif
    
          vec4 new_vUv = my_vUv;
          new_vUv.x += distortionFactor;
          new_vUv.y += distortionFactor;
    
          vec4 base = texture2DProj(tDiffuse, new_vUv);
          vec4 blur = texture2DProj(tDiffuseBlur, new_vUv);
          
          vec4 merge = base;
          
          #ifdef USE_NORMALMAP
            vec2 normal_uv = vec2(0.0);
            vec4 normalColor = texture2D(normalMap, vUv);
            vec3 my_normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );
            vec3 coord = new_vUv.xyz / new_vUv.w;
            normal_uv = coord.xy + coord.z * my_normal.xz * 0.05 * normalScale;
            vec4 base_normal = texture2D(tDiffuse, normal_uv);
            vec4 blur_normal = texture2D(tDiffuseBlur, normal_uv);
            merge = base_normal;
            blur = blur_normal;
          #endif
    
          float depthFactor = 0.0001;
          float blurFactor = 0.0;
    
          #ifdef USE_DEPTH
            vec4 depth = texture2DProj(tDepth, new_vUv);
            depthFactor = smoothstep(minDepthThreshold, maxDepthThreshold, 1.0-(depth.r * depth.a));
            depthFactor *= depthScale;
            depthFactor = max(0.0001, min(1.0, depthFactor));
    
            #ifdef USE_BLUR
              blur = blur * min(1.0, depthFactor + depthToBlurRatioBias);
              merge = merge * min(1.0, depthFactor + 0.5);
            #else
              merge = merge * depthFactor;
            #endif
      
          #endif
    
          float reflectorRoughnessFactor = roughness;
          #ifdef USE_ROUGHNESSMAP
            vec4 reflectorTexelRoughness = texture2D( roughnessMap, vUv );
            
            reflectorRoughnessFactor *= reflectorTexelRoughness.g;
          #endif
          
          #ifdef USE_BLUR
            blurFactor = min(1.0, mixBlur * reflectorRoughnessFactor);
            merge = mix(merge, blur, blurFactor);
          #endif
    
          vec4 newMerge = vec4(0.0, 0.0, 0.0, 1.0);
          newMerge.r = (merge.r - 0.5) * mixContrast + 0.5;
          newMerge.g = (merge.g - 0.5) * mixContrast + 0.5;
          newMerge.b = (merge.b - 0.5) * mixContrast + 0.5;
          
          diffuseColor.rgb = diffuseColor.rgb * ((1.0 - min(1.0, mirror)) + newMerge.rgb * mixStrength);
          `
    )
  }
}
