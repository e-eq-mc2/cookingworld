const THREE = require('three');
//import { SceneUtils } from 'three/examples/jsm/utils/SceneUtils.js'
import { createMultiMaterialObject } from 'three/examples/jsm/utils/SceneUtils.js'
import CubicBezier from 'cubic-bezier-easing'
const Common   = require("./lib/common.js")
const Colormap = require("./lib/colormap.js")

// Particle3D class
const TO_RADIANS = Math.PI/180.0

export class Obstacle {
  constructor(fnames, width, height) {
    const geometry = this.plateGeometry(width, height, 1, 1)

    this.meshes = [] 

    for (let i = 0; i < 2; i++) {
      const fname = fnames[i]
      const material = this.plateMaterial(fname)
      const mesh = new THREE.Mesh(geometry, material)
      this.meshes.push( mesh ) 
    }

    this.stepback()

    this.time = 0
    this.isFalling = false
  }


  stepback() {
    const after = this.meshes[1]
    after.translateZ(-1)
  }

  startCuttOff() {
    this.time = 0
    this.isFalling = true
  }

  update(dt) {
    if ( ! this.isFalling ) return
    this.time = this.time + dt
    this.updatePosition(dt)
  }

  updatePosition(dt) {
    const before = this.meshes[0]
    const pos = before.position

    const alpha = - 0.005
    const beta  = 300.0
    const t     = this.time
    const v     = - beta * ( 1 - Math.exp( alpha * Math.pow(t, 1.8) ) ) 
    const prevY = pos.y
    const y     = v * dt + prevY
    
   
    pos.y = y
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
      //transparent: true,
      alphaTest:   0.5
    });

    return mat
  }
}
