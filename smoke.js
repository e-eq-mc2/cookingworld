const THREE = require('three');
const Common = require("./lib/common.js")
const TWEEN = require('@tweenjs/tween.js')
import { Sound }  from  './sound.js'

export class Smoke {
  constructor(fname, width, height, scene) {
    const depth = Math.max(width, height) * 0.3

    const scale = 3
    const w = width  * scale
    const h = height * scale
    const geometry = this.plateGeometry(w, h, 1, 1)
    const material = this.plateMaterial(fname)

    const numElements = 10
    this.particles = []
    for (let p = 0, l = numElements; p < l; p++) {
      const mesh = new THREE.Mesh(geometry, material)

      const x = Common.randomReal(-0.3, 0.3) * width
      const y = Common.randomReal(-0.3, 0.3) * height
      const z = Common.randomReal(-0.3, 0.3) * depth
      mesh.position.set(x, y, z)

      mesh.rotation.z = Math.random() * 360;
      mesh.translateY(height * 0.7)
      scene.add(mesh)

      this.particles.push(mesh)
    }

    this.color = {opacity: 0}
    this.syncColor()

    this.setupTween()

    this.sound0 = new Sound("sound/smoke0.mp3", scene, 0.8, 1.0)
    this.sound1 = new Sound("sound/smoke1.mp3", scene, 0.8, 1.0)
  }

  setupTween() {
    const color = this.color 

    this.tween = new TWEEN.Tween({opacity: 0})
    this.tween
			.to({opacity: [1, 1, 0.9, 0.8, 0.4, 0.3, 0.2, 0.1, 0]}, 2000)
      .easing(TWEEN.Easing.Linear.None)
			.onUpdate((o) => { color.opacity = o.opacity })
  }

  appear() {
    console.log('aaaaaa')
    this.setupTween()
    this.tween.start()
    this.sound0.play()
  }

  disappear() {
    this.setupTween()
    this.tween.start()
    this.sound1.play()
  }

  update(dt) {
    if ( this.tween && this.tween.isPlaying() ) this.tween.update()
    this.rotate(dt)
    this.syncColor()
  }

  rotate(dt) {
    const vr = 0.2
    for(let i = 0; i < this.particles.length; ++i) {
      const m = this.particles[i]
      m.rotation.z += vr * dt
    }
  }

  syncColor() {
    for(let i = 0; i < this.particles.length; ++i) {
      const m = this.particles[i]
      m.material.opacity = this.color.opacity
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
