import * as THREE from "three"
// import { Water } from "three/examples/jsm/objects/Water"
import { Water } from "three/examples/jsm/objects/Water2"
import { camera, loaders, renderer, scene } from "./Experience"
import MeshReflectorMaterial from "./materials/MeshReflectorMaterial"

import waterVertexShader from "../../shaders/water/vertex.glsl"
import waterFragmentShader from "../../shaders/water/fragment.glsl"

export class WaterSurface {
  constructor() {
    this.setWater()
  }

  setWater() {
    //!1
    this.water = new THREE.Mesh(new THREE.PlaneGeometry(80, 50, 500, 500))
    this.water.rotation.x = -Math.PI / 2
    scene.add(this.water)
    this.water.material = new MeshReflectorMaterial(
      renderer.renderer,
      camera.camera,
      scene,
      this.water,
      {
        resolution: 2048,
        // blur: [512, 128],
        // mixBlur: 0.6,
        // mixContrast: 1,
        mirror: 1,
      }
    )
    this.water.material.setValues({
      // wireframe: true,
    })
  }

  update() {}
}
