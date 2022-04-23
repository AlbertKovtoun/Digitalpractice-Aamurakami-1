import * as THREE from "three"
import { Water } from "three/examples/jsm/objects/Water"
import { camera, loaders, renderer, scene } from "./Experience"
import MeshReflectorMaterial from "./materials/MeshReflectorMaterial"

export class WaterSurface {
  constructor() {
    this.setWater()
  }

  setWater() {
    // this.water = new THREE.Mesh(new THREE.PlaneGeometry(80, 50, 500, 500))
    // this.water.rotation.x = -Math.PI / 2
    // scene.add(this.water)

    // this.water.material = new MeshReflectorMaterial(
    //   renderer.renderer,
    //   camera.camera,
    //   scene,
    //   this.water,
    //   {
    //     resolution: 2048,
    //     blur: [512, 128],
    //     mixBlur: 0.6,
    //     mixContrast: 1,
    //     mirror: 1,
    //   },
    //   { wireframe: true }
    // )
    // this.water.receiveShadow = true
    // this.water.castShadow = true

    this.waterGeometry = new THREE.PlaneGeometry(80, 50, 500, 500)
    this.water = new Water(this.waterGeometry, {
      textureWidth: 1024,
      textureHeight: 1024,
      waterNormals: loaders.textureLoader.load(
        "/assets/water-normal-maps/water-normal-4.png",
        (texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        }
      ),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.5,
    })

    this.water.rotation.x = -Math.PI / 2

    scene.add(this.water)
  }
}
