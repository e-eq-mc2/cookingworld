const THREE = require('three');
const Common = require("./lib/common.js")
const TWEEN = require('@tweenjs/tween.js')

const TO_RADIANS = Math.PI/180.0

export class Smoke {
  constructor(fname, width, height, depth, scene) {
    const scale = 2.0
    const w = width  * scale
    const h = height * scale
    const geometry = this.plateGeometry(w, h, 1, 1)
    const material = this.plateMaterial(fname)

    const numElements = 10
    this.particles = []
    for (let p = 0, l = numElements; p < l; p++) {
      const mesh = new THREE.Mesh(geometry, material)

      const x = Common.randomReal(-0.5, 0.5) * width
      const y = Common.randomReal(-0.5, 0.5) * height
      const z = Common.randomReal(-0.5, 0.5) * depth
      mesh.position.set(x, y, z)

      mesh.rotation.z = Math.random() * 360;
      scene.add(mesh)

      this.particles.push(mesh)
    }

    // Create a tween for position first
    this.color = {opacity: 0}
    this.tween = new TWEEN.Tween(this.color)
    this.tween
      .to({opacity: [1, 0.8, 0.4, 0.3, 0.2, 0.1, 0]}, 2000)
      .onUpdate(function (obj) { console.log(obj) })
      //.easing(TWEEN.Easing.Elastic.Out)
      .interpolation(TWEEN.Interpolation.Linear)
      .easing(TWEEN.Easing.Linear.None)
  }

  start() {
    this.tween.start()
  }

  update(dt) {
    TWEEN.update()
    const vr = 0.2
    for(let i = 0; i < this.particles.length; ++i) {
      const mesh  = this.particles[i]
      mesh.rotation.z += vr * dt
      mesh.material.opacity = this.color.opacity
    }
  }

  plateGeometry(w, h, wsegs, hsegs) {
    const geometry = new THREE.PlaneGeometry(w, h, wsegs, hsegs)
    return geometry
  }

  plateMaterial(fname) {
    const tex  = new THREE.TextureLoader().load( fname )

    const mat = new THREE.MeshBasicMaterial({
      map:         tex, 
      //side:        THREE.FrontSide,
      //depthWrite:  true,
      transparent: true, //opacity: 0.5,
      //alphaTest:   0.5
    });

    return mat
  }
}
