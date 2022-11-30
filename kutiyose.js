const THREE = require('three');
const Common = require("./lib/common.js")
const TWEEN = require('@tweenjs/tween.js')
import { Smoke }  from  './smoke.js'

export class Kutiyose {
  constructor(fname, width, height, scene) {
    const geometry = this.plateGeometry(width, height, 1, 1)
    const material = this.plateMaterial(fname)

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.translateY(height / 2.0)
    scene.add( this.mesh )

    this.smoke = new Smoke("img/smoke.png", width, height, scene)

    this.color = {opacity: 0}
    this.syncColor()

    this.state = 0
    this.actions = [this.startInit, this.startAppear , this.startDisappear]


    this.startPos = this.mesh.position.clone()

    this.tweenIn  = undefined
    this.tweenOut = undefined
    //this.setupTweenIn()
    //this.setupTweenOut()
  }

  setupTweenIn() {
    const color = this.color 

    this.tweenIn = new TWEEN.Tween({opacity: 0})
    this.tweenIn
      .to({opacity: [0.1, 0.1, 0.2, 1]}, 2000)
      .easing(TWEEN.Easing.Linear.None)
			.onUpdate((o) => { 
        color.opacity = o.opacity 
      })
  }

  setupTweenOut() {
    const color = this.color 

    this.tweenOut = new TWEEN.Tween({opacity: 1})
    this.tweenOut
      .to({opacity: [0.4, 0.1, 0]}, 2000)
      .easing(TWEEN.Easing.Linear.None)
			.onUpdate((o) => { 
        color.opacity = o.opacity 
      })
  }

  syncColor() {
    this.mesh.material.opacity = this.color.opacity
  }

  next() {
    this.state += 1 
    if ( this.state >= this.actions.length ) this.state = 0
    this.actions[this.state].call(this)
  }

  startInit() {
    this.reset()
  }


  reset() {
    this.state = 0
    this.mesh.position.copy(this.startPos) 
    this.color.opacity = 0
    tweenIn  = undefined 
    tweenOut = undefined 

    this.smoke.reset()
    this.update()
  }

  startAppear() {
    this.smoke.appear()

    this.setupTweenIn()
    this.tweenIn.start()
  }

  startDisappear() {
    this.smoke.disappear()

    this.setupTweenOut()
    this.tweenOut.start()
  }

  update(dt) {
    if ( this.tweenIn  && this.tweenIn .isPlaying() ) this.tweenIn .update()
    if ( this.tweenOut && this.tweenOut.isPlaying() ) this.tweenOut.update()
    this.smoke.update(dt)
    this.syncColor()
  }

  disappear() {
    this.color.opacity = 0
  }

  appear() {
    this.mesh.material.opacity = 1
  }

  moveLeft(dx = -0.05) {
    const m = this.mesh
    m.position.x += dx
  }

  moveRight(dx = 0.05) {
    const m = this.mesh
    m.position.x += dx
  }

  plateGeometry(w, h, wsegs, hsegs) {
    const geometry = new THREE.PlaneGeometry(w, h, wsegs, hsegs)
    return geometry
  }

  plateMaterial(fname) {
    const tex  = new THREE.TextureLoader().load(fname)

    const mat = new THREE.MeshBasicMaterial({
      map:         tex, 
      side:        THREE.FrontSide,
      depthWrite:  true,
      transparent: true, //opacity: 0.5,
      //alphaTest:   0.5
    });

    return mat
  }
}
