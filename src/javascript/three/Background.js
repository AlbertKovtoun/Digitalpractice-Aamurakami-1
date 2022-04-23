import * as THREE from "three"
import { backgroundFolder, debugObject, scene } from "./Experience"

import backgroundVertexShader from "../../shaders/background/vertex.glsl"
import backgroundFragmentShader from "../../shaders/background/fragment.glsl"

export class Background {
  constructor() {
    this.setBackground()
    this.setBackgroundTweaks()
  }

  setBackground() {
    this.background = new THREE.Mesh(
      new THREE.PlaneGeometry(150, 150),
      new THREE.ShaderMaterial({
        vertexShader: backgroundVertexShader,
        fragmentShader: backgroundFragmentShader,

        uniforms: {
          uBackgroundColor: {
            value: new THREE.Color(debugObject.backgroundColor),
          },
          uLightColor: {
            value: new THREE.Color(debugObject.backgroundLightColor),
          },
          uBackgroundLightStrength: { value: 3.8 },
          uBackgroundLightHeight: { value: 2.17 },
          uBackgroundLightVerticalPosition: { value: 2.1 },
        },
      })
    )
    this.background.position.set(0, 0, -40)
    scene.add(this.background)
  }

  setBackgroundTweaks() {
    //Background Color
    backgroundFolder
      .addInput(debugObject, "backgroundColor", {
        label: "Background Color",
      })
      .on("change", (ev) => {
        this.background.material.uniforms.uBackgroundColor.value =
          new THREE.Color(ev.value)

        scene.background = new THREE.Color(ev.value)
      })

    //Background Light
    backgroundFolder
      .addInput(debugObject, "backgroundLightColor", {
        label: "Background Light",
      })
      .on("change", (ev) => {
        this.background.material.uniforms.uLightColor.value = new THREE.Color(
          ev.value
        )
      })

    backgroundFolder.addInput(
      this.background.material.uniforms.uBackgroundLightStrength,
      "value",
      {
        min: 0,
        max: 10,
        step: 0.01,
        label: "Light Strength",
      }
    )

    backgroundFolder.addInput(
      this.background.material.uniforms.uBackgroundLightHeight,
      "value",
      {
        min: 0,
        max: 4,
        step: 0.01,
        label: "Light Height",
      }
    )

    backgroundFolder.addInput(
      this.background.material.uniforms.uBackgroundLightVerticalPosition,
      "value",
      {
        min: 0,
        max: 5,
        step: 0.01,
        label: "Light Vertical Position",
      }
    )
  }
}
