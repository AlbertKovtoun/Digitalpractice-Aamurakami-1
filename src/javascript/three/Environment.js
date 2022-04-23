import * as THREE from "three"
import { bubbles, environmentFolder } from "./Experience"

export class Environment {
  constructor() {
    this.cubeTextureLoader = new THREE.CubeTextureLoader()

    this.environments = {}
    this.setEnvironment()

    this.setEnvironmentTweaks()
  }

  setEnvironment() {
    this.environment1 = this.cubeTextureLoader.load([
      "assets/2/px.png",
      "assets/2/nx.png",
      "assets/2/py.png",
      "assets/2/ny.png",
      "assets/2/pz.png",
      "assets/2/nz.png",
    ])
    this.environment2 = this.cubeTextureLoader.load([
      "assets/1/px.png",
      "assets/1/nx.png",
      "assets/1/py.png",
      "assets/1/ny.png",
      "assets/1/pz.png",
      "assets/1/nz.png",
    ])
    this.environment3 = this.cubeTextureLoader.load([
      "assets/3/px.png",
      "assets/3/nx.png",
      "assets/3/py.png",
      "assets/3/ny.png",
      "assets/3/pz.png",
      "assets/3/nz.png",
    ])
    this.environment4 = this.cubeTextureLoader.load([
      "assets/4/px.png",
      "assets/4/nx.png",
      "assets/4/py.png",
      "assets/4/ny.png",
      "assets/4/pz.png",
      "assets/4/nz.png",
    ])
  }

  setEnvironmentTweaks() {}
}
