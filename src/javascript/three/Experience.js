import * as THREE from "three"
import Stats from "stats.js"

import { Camera } from "./Camera"
import { Renderer } from "./Renderer"
import { Sizes } from "./Sizes"
import { Bubbles } from "./Bubbles"
import { Pane } from "tweakpane"
import { WaterSurface } from "./WaterSurface"
import { Lights } from "./Lights"
import { Background } from "./Background"
import { Loaders } from "./Loaders"

export const randomNumber = (min, max) => {
  return Math.random() * (max - min) + min
}

export const pane = new Pane()
export const backgroundFolder = pane.addFolder({
  title: "Background",
})
export const bubblesFolder = pane.addFolder({
  title: "Bubbles",
})
export const environmentFolder = pane.addFolder({
  title: "Environment",
})

export const debugObject = {
  backgroundColor: "#e5001e",
  backgroundLightColor: "#ffffff",
  bubblesColor: "#00c3ff",
  bubblesCount: 1,
  bubblesScale: 1,
  bubblesOuterColor: "#a0e8fe",
  bubblesInnerColor: "#ffffff",
}

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

export const loaders = new Loaders()

export const canvas = document.querySelector("canvas.webgl")

export const scene = new THREE.Scene()
scene.background = debugObject.backgroundColor

export const lights = new Lights()

export const background = new Background()

export const bubbles = new Bubbles()

export const sizes = new Sizes()

export const camera = new Camera()

export const renderer = new Renderer()

export const waterSurface = new WaterSurface()

//Animate
const clock = new THREE.Clock()
let time = Date.now()

const tick = () => {
  stats.begin()

  const elapsedTime = clock.getElapsedTime()

  const currentTime = Date.now()
  const deltaTime = currentTime - time
  time = currentTime

  // Update controls
  camera.controls.update()

  //Update Mesh Reflector Material
  waterSurface.water.material.update()
  // waterSurface.water.material.uniforms["time"].value += 1.0 / 240.0
  // waterSurface.water.material.uniforms["time"].value += deltaTime * 0.00005

  waterSurface.update()

  // Render
  renderer.renderer.render(scene, camera.camera)

  setTimeout(() => {
    window.requestAnimationFrame(tick)
  }, 1000 / 60)

  stats.end()
}

tick()
