const THREE = require('three');
const Common = require("./lib/common.js")
const TWEEN = require('@tweenjs/tween.js')
import { Sound }  from  './sound.js'

export class Smoke {
  constructor(fname, width, height, scene, time = 8000) {
    const depth = Math.max(width, height) * 0.3

    const scale = 3
    const w = width  * scale
    const h = height * scale
    const geometry = this.plateGeometry(w, h, 1, 1)
    const material = this.plateMaterial(fname)

    this.ALL = 15
    this.meshes = []
    const a = new THREE.Group()
    for (let i = 0; i < this.ALL; i++) {
      const mesh = new THREE.Mesh(geometry, material)

      const x = Common.randomReal(-0.3, 0.3) * width
      const y = Common.randomReal(-0.0, 0.5) * height
      const z = Common.randomReal(-0.3, 0.3) * depth
      mesh.position.set(x, y, z)

      mesh.rotation.z = Math.random() * 360;
      mesh.translateY(height * 0.7)
      //scene.add(mesh)

      this.meshes.push(mesh)
      a.add(mesh)
    }
    this.meshes.push(a)
    this.scene = scene

    this.color = {opacity: 0}
    this.syncColor()
    this.finished = false

    //this.setupTween()
    this.tween = undefined
    this.time = time

    this.sound0 = new Sound("sound/smoke0.mp3", scene, 0.8, 1.0)
    this.sound1 = new Sound("sound/smoke1.mp3", scene, 0.8, 1.0)
  }

  isCleaned() {
    const m = this.meshes[this.ALL]
    const o = this.scene.getObjectByProperty("uuid", m.uuid)
    return o ? false : true
  }

  setupTween() {
    const color = this.color 

    const mesh = this.meshes[this.ALL]
    const scene  = this.scene

    this.tween = new TWEEN.Tween({opacity: 0})
    this.tween
      .to({opacity: [1, 1, 0.9, 0.8, 0.4, 0.3, 0.2, 0.1, 0]}, this.time)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate( o => { color.opacity = o.opacity })
      .onStart( o => { scene.add(mesh) })
      .onComplete( o => { scene.remove(mesh) })
  }

  appear() {
    this.setupTween()
    this.tween.start()
    this.sound0.play()
    this.finished = false
  }

  disappear() {
    this.setupTween()
    this.tween.start()
    this.sound1.play()
  }

  startInit() {
    this.color.opacity = 0
    this.tween         = undefined
    this.finished      = false
    this.scene.remove(this.meshes[this.ALL])
    this.syncColor()
  }

  startFin() {
    this.scene.remove(this.meshes[this.ALL])
    this.finished = true
  }

  update(dt) {
    if ( this.tween && this.tween.isPlaying() ) this.tween.update()
    this.rotate(dt)
    this.syncColor()
  }

  rotate(dt) {
    const vr = 0.2
    for(let i = 0; i < this.ALL; ++i) {
      const m = this.meshes[i]
      m.rotation.z += vr * dt
    }
  }

  syncColor() {
    for(let i = 0; i < this.ALL; ++i) {
      const m = this.meshes[i]
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
      transparent: true,
    });

    return mat
  }
}
