const THREE = require('three');
const Common = require("./lib/common.js")
const TWEEN = require('@tweenjs/tween.js')
import { Sound }  from  './sound.js'

export class Spotlight {
  constructor(fnamePrefix, height, width, scene) {
    this.CENTER = 0
    this.LEFT   = 1
    this.RIGHT  = 2
    this.ALL    = 3

    this.maxOpacity = 0.8
    this.LeftX  = - 10
    this.RightX =   10

    const geometry = this.plateGeometry(height, width, 1, 1)

    this.meshes = []
    for (let i = 0; i < this.ALL; i++) {
      const fname = `${fnamePrefix}${i}.png`
      const material = this.plateMaterial(fname)
      const mesh = new THREE.Mesh(geometry, material)

      this.meshes.push(mesh) 
      mesh.translateY(height / 2.0)
      mesh.translateY(-0.5)
      mesh.translateZ(-1)
    }

    this.meshes[this.LEFT ].position.x = this.LeftX
    this.meshes[this.RIGHT].position.x = this.RightX

    const a = new THREE.Group()
    a.add( this.meshes[this.CENTER] )
    a.add( this.meshes[this.LEFT  ] )
    a.add( this.meshes[this.RIGHT ] )
    this.meshes.push(a)
    scene.add( a )

    this.state = 0
    this.actions = [this.startInit, this.startCenter, this.startEnds, this.startFin]

    this.sound = new Sound("sound/fight.mp3", scene, 0.7, 1.0)

    this.colors = [{opacity: 0}, {opacity: 0}, {opacity: 0}] 
    this.syncColor()

    this.tweenIn  = new Array(this.ALL + 1)
    this.tweenOut = new Array(this.ALL + 1)
  }

  createTweenIn(color) {
    const tweenIn = new TWEEN.Tween({opacity: 0})
    tweenIn
      .to({opacity: [0.1, this.maxOpacity]}, 1000)
      .easing(TWEEN.Easing.Linear.None)
			.onUpdate((o) => { 
        color.opacity = o.opacity 
      })
    return tweenIn
  }

  createTweenOut(color) {
    const tweenOut = new TWEEN.Tween({opacity: this.maxOpacity})
    tweenOut
      .to({opacity: [0.4, 0.1, 0]}, 2000)
      .easing(TWEEN.Easing.Linear.None)
			.onUpdate((o) => { 
        color.opacity = o.opacity 
      })
    return tweenOut
  }

  next() {
    this.state += 1 
    if ( this.state >= this.actions.length ) this.state = 0
    this.actions[this.state].call(this)
  }

  startInit() {
  }


  startCenter() {
    this.startTweenIn(this.CENTER)
    this.sound.play()
  }

  startEnds() {
    //this.sound.stop()
    this.startTweenOut(this.CENTER)
    this.startTweenIn(this.LEFT)
    this.startTweenIn(this.RIGHT)
  }

  startFin() {
    //this.startTweenOut(this.LEFT)
    //this.startTweenOut(this.RIGHT)
  }

  startTweenIn(i) {
    this.tweenIn[i] = this.createTweenIn(this.colors[i])
    this.tweenIn[i].start()
  }

  startTweenOut(i) {
    this.tweenOut[i] = this.createTweenOut(this.colors[i])
    this.tweenOut[i].start()
  }


  update(dt){
    for (let i = 0; i < this.ALL; ++i ) {
      const ti = this.tweenIn [i]
      const to = this.tweenOut[i]
      if ( ti  && ti.isPlaying() ) ti.update()
      if ( to  && to.isPlaying() ) to.update()
    } 

    this.syncColor()
    this.syncSound()
  }

  syncColor() {
    for (let i = 0; i < this.ALL; ++i ) {
      this.meshes[i].material.opacity = this.colors[i].opacity
    }
  }

  syncSound() {
    const v = this.colors[this.CENTER].opacity
    if( this.sound.isReady() ) this.sound.setVolume(v)
  }

  moveLeft(dx = -0.05) {
    const m = this.mesh
    m.position.x += dx
    console.log(m.position)
  }

  moveRight(dx = 0.05) {
    const m = this.mesh
    m.position.x += dx
    console.log(m.position)
  }

  addOpacity(deltaO) {
    const m = this.mesh
    let o = m.material.opacity  + deltaO
    if ( o < 0 ) o = 0
    if ( o > 1 ) o = 1
    m.material.opacity = o
  }

  plateGeometry(w, h, wsegs, hsegs) {
    const geometry = new THREE.PlaneGeometry(w, h, wsegs, hsegs)
    return geometry
  }

  plateMaterial(fname) {
    const tex  = new THREE.TextureLoader().load( fname )
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
