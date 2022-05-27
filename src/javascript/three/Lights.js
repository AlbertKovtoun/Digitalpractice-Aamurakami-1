import * as THREE from "three"
import { scene } from "./Experience"

export class Lights {
  constructor() {
    this.setLights()
  }

  setLights() {
    const al = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(al)

    const pl = new THREE.PointLight(0xffffff, 1.5)
    pl.position.set(0, 4, -22)
    pl.castShadow = true
    scene.add(pl)
  }
}
