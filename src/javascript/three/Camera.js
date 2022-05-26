import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { canvas, scene, sizes } from "./Experience"

export class Camera {
  constructor() {
    this.camera
    this.controls

    this.setCamera()
    this.setCameraControls()
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      sizes.width / sizes.height,
      0.1,
      500
    )
    this.camera.position.set(0, 8, 25)
    scene.add(this.camera)
  }

  setCameraControls() {
    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.enableDamping = true
    this.controls.minPolarAngle = -Math.PI / 4
    // this.controls.maxPolarAngle = Math.PI / 2 - 0.2
    this.controls.maxPolarAngle = Math.PI / 2
    this.controls.target.set(0, 4, 0)

    this.controls.enableRotate = false
    this.controls.minDistance = 10
    this.controls.maxDistance = 28

    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
    }

    this.controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN }
  }
}
