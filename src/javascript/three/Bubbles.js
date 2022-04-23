import * as THREE from "three"

import bubbleVertexShader from "../../shaders/bubble/vertex.glsl"
import bubbleFragmentShader from "../../shaders/bubble/fragment.glsl"

import {
  bubblesFolder,
  camera,
  debugObject,
  environment,
  environmentFolder,
  renderer,
  scene,
} from "./Experience"

export class Bubbles {
  constructor() {
    this.bubbles = []
    this.setBubbles()
    this.setBubblesTweaks()
  }

  setBubbles() {
    //Option1
    // this.bubbleMaterial = new THREE.MeshPhysicalMaterial({
    //   color: debugObject.bubblesColor,
    //   envMap: environment.environment1,
    //   roughness: 0,
    //   // transmission: 0.8,
    //   transparent: true,
    //   emissive: 0xf7931e,
    //   emissiveIntensity: 0.5,
    //   // opacity: 0.8,
    // })

    //Option2
    this.bubbleMaterial = new THREE.ShaderMaterial({
      vertexShader: bubbleVertexShader,
      fragmentShader: bubbleFragmentShader,

      uniforms: {
        uOuterColor: { value: new THREE.Color(debugObject.bubblesOuterColor) },
        uInnerColor: { value: new THREE.Color(debugObject.bubblesInnerColor) },
        uRingSize: { value: 4 },
      },
    })

    for (let i = 0; i < debugObject.bubblesCount; i++) {
      this.bubbleGeometry = new THREE.SphereGeometry(2.5, 50, 50)
      this.bubble = new THREE.Mesh(this.bubbleGeometry, this.bubbleMaterial)
      this.bubble.position.set(
        // Math.random() * 4 - 2,
        // Math.random(),
        // Math.random() * 4 - 2
        0,
        6,
        -30
      )
      this.bubble.rotation.set(0, -Math.PI / 2, 0)
      this.bubbles.push(this.bubble)
      scene.add(this.bubbles[i])
    }
  }

  setBubblesTweaks() {
    //bubblesFolder
    //  .addInput(debugObject, "bubblesColor", {
    //    label: "Bubbles Color",
    //  })
    //  .on("change", (ev) => {
    //    this.bubbleMaterial.color = new THREE.Color(ev.value)
    //  })
    //bubblesFolder.addInput(this.bubbleMaterial, "roughness", {
    //  min: 0,
    //  max: 1,
    //  step: 0.01,
    //  label: "Bubbles Reflectivity",
    //})
    //bubblesFolder.addInput(this.bubbleMaterial, "transmission", {
    //  min: 0,
    //  max: 1,
    //  step: 0.01,
    //  label: "Bubbles Transmission",
    //})
    //bubblesFolder.addInput(this.bubbleMaterial, "opacity", {
    //  min: 0,
    //  max: 1,
    //  step: 0.01,
    //  label: "Bubbles Opacity",
    //})
    //bubblesFolder
    //  .addInput(debugObject, "bubblesCount", {
    //    min: 1,
    //    max: 20,
    //    step: 1,
    //    label: "Bubbles Amount",
    //  })
    //  .on("change", (ev) => {
    //    setTimeout(() => {
    //      for (let i = 0; i < ev.value + 1; i++) {
    //        scene.remove(this.bubbles[i])
    //      }
    //      for (let i = 0; i < ev.value; i++) {
    //        this.bubbleGeometry = new THREE.SphereGeometry(
    //          Math.random() * 2,
    //          50,
    //          50
    //        )
    //        this.bubble = new THREE.Mesh(
    //          this.bubbleGeometry,
    //          this.bubbleMaterial
    //        )
    //        this.bubble.position.set(
    //          Math.random() * 4 - 2,
    //          Math.random(),
    //          Math.random() * 4 - 2
    //        )
    //        this.bubbles.push(this.bubble)
    //        scene.add(this.bubbles[i])
    //      }
    //    }, 500)
    //  })
    //bubblesFolder
    //  .addInput(debugObject, "bubblesScale", {
    //    min: 0,
    //    max: 5,
    //    step: 0.01,
    //    label: "Bubble Scale",
    //  })
    //  .on("change", (ev) => {
    //    console.log(ev)
    //    for (const bubble of this.bubbles) {
    //      console.log(bubble)
    //      bubble.scale.set(ev.value, ev.value, ev.value)
    //    }
    //  })
    //bubblesFolder.addInput(this.bubbleMaterial, "wireframe", {
    //  label: "Wireframe",
    //})
    ////Not the right way to do it, but works
    //const params = {
    //  quality: 0,
    //}
    //environmentFolder
    //  .addInput(params, "quality", {
    //    options: {
    //      neutral: 1,
    //      studio: 2,
    //      night: 3,
    //      sunny: 4,
    //    },
    //    label: "Environment Map",
    //  })
    //  .on("change", (ev) => {
    //    console.log(ev.value)
    //    switch (ev.value) {
    //      case 1:
    //        this.bubbleMaterial.envMap = environment.environment1
    //        break
    //      case 2:
    //        this.bubbleMaterial.envMap = environment.environment2
    //        break
    //      case 3:
    //        this.bubbleMaterial.envMap = environment.environment3
    //        break
    //      case 4:
    //        this.bubbleMaterial.envMap = environment.environment4
    //        break
    //    }
    //  })
    //environmentFolder.addInput(this.bubbleMaterial, "envMapIntensity", {
    //  min: 0,
    //  max: 3,
    //  label: "Map Intensity",
    //})

    bubblesFolder
      .addInput(debugObject, "bubblesOuterColor", {
        label: "Bubble Outside Color",
      })
      .on("change", (ev) => {
        this.bubbleMaterial.uniforms.uOuterColor.value = new THREE.Color(
          ev.value
        )
      })

    bubblesFolder
      .addInput(debugObject, "bubblesInnerColor", {
        label: "Bubble Inside Color",
      })
      .on("change", (ev) => {
        this.bubbleMaterial.uniforms.uInnerColor.value = new THREE.Color(
          ev.value
        )
      })

    bubblesFolder.addInput(this.bubbleMaterial.uniforms.uRingSize, "value", {
      min: 0,
      max: 20,
      step: 0.01,
      label: "Ring Size",
    })

    bubblesFolder.addInput(this.bubble.position, "y", {
      min: -5,
      max: 15,
      step: 0.01,
      label: "Bubble Height",
    })
  }
}
