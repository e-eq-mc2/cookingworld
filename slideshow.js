const THREE = require('three');
const Common = require("./lib/common.js")
const TWEEN = require('@tweenjs/tween.js')
import { Smoke }  from  './smoke.js'

export class Slideshow {
  constructor(fnamePrefix, num, width, height, scene) {

    this.pages = []
    const perPage = 3
    for (let i = 0; i < num; ) {
      const fnames = []
      for (let j=0; j < perPage; ++j) {
        const fname = `${fnamePrefix}${i}.png`
        fnames.push(fname)

        ++i
        if ( i >= num ) break
      }

      const page = new Slideshow.Page(fnames, width, height, scene)
      this.pages.push(page)
    }
    this.current = -1

    this.tween  = undefined
    this.finished = false

    this.smoke = new Smoke("img/smoke.png", width, height, scene, 8000)

    this.color  = {opacity: 0}
    this.syncColor()
    this.isFirstTime = true
  }

  createTween(color) {
    const tween = new TWEEN.Tween({opacity: 0})
    tween
      .to({opacity: 1}, 2000)
      .easing(TWEEN.Easing.Exponential.In)
			.onUpdate((o) => { 
        color.opacity = o.opacity 
      })
    return tween
  }

  next() {
    this.previous = this.current
    this.current  = (this.current + 1) % this.pages.length

    for(let i=0; i<this.pages.length; ++i) {
      const p = this.pages[i]
      if ( i == this.current || i == this.previous )  {
        p.startAppear()
        continue
      }
      p.startFin()
    }

    if ( this.current == 0 && this.isFirstTime ) {
      this.smoke.appear() 
      this.isFirstTime = false
    }

    this.tween = this.createTween(this.color)
    this.tween.start()
  }

  startInit() {
    this.previous = -1
    this.current  = -1

    this.tween = undefined
    this.color  = {opacity: 0}

    for(let i=0; i<this.pages.length; ++i) {
      const p = this.pages[i]
      p.startInit()
    }

    this.isFirstTime = true
    this.finished = false
    this.smoke.startInit()
  }

  isFinished() {
    return this.current == this.pages.length -1
  }

  move(dt = 0.03) {
    const currP = this.pages[this.current ]
    const prevP = this.pages[this.previous]

    const vx = - 0.1
    const dx = vx * dt 

    if ( currP ) currP.moveX(dx)
    if ( prevP ) prevP.moveX(dx)
  }

  syncColor() {
    const currP = this.pages[this.current ]
    const prevP = this.pages[this.previous]

    const currO = this.color.opacity
    const prevO = 1 - this.color.opacity

    if ( currP ) currP.setOpacity(currO)
    if ( prevP ) prevP.setOpacity(prevO)

    //for(let i=0; i<this.pages.length; ++i) {
    //  if (i == curr) continue
    //  if (i == prev) continue

    //  const p = this.pages[i]
    //  p.setOpacity(0)
    //}
  }

  update(dt) {
    const t = this.tween
    if ( t  && t.isPlaying() ) t.update()

    this.syncColor()
    this.move()
    this.smoke.update(dt)
  }

}

Slideshow.Page = class { 
  constructor(fnames, width, height, scene) {
    const geometry  = this.plateGeometry(width, height, 1, 1)

    this.meshes = []
    const num = fnames.length
    const a = new THREE.Group()
    for (let i=0; i < num; ++i) {
      const fname    = fnames[i]
      const material = this.plateMaterial(fname)

      const mesh = new THREE.Mesh(geometry, material)
      this.meshes.push(mesh)
      mesh.material.opacity = 0
      a.add( mesh )
    }
    this.meshes.push( a )

    this.ALL = this.meshes.length -1
    //scene.add( a )
    this.scene = scene

    a.translateY(height * 0.5)
    switch(num) {
      case 1:
        this.align1(width, height)
        break
      case 2:
        this.align2(width, height)
        break
      case 3:
        this.align3(width, height)
      default:
        break
    }

    this.startPos = a.position.clone()
  }

  startInit() {
    this.setOpacity(0)
    const m = this.meshes[this.ALL]
    m.position.copy(this.startPos)
    this.scene.remove(m)
  }

  startAppear() {
    const m = this.meshes[this.ALL]
    this.scene.add(m)
  }

  startFin() {
    const m = this.meshes[this.ALL]
    m.position.copy(this.startPos)
    this.scene.remove(m)
  }

  align1(width, height) {
  }

  align2(width, height) {
    const lm = this.meshes[0] 
    const rm = this.meshes[1] 

    lm.translateX(- width * 0.5)
    rm.translateX(  width * 0.5)
  }

  align3(width, height) {
    const lm = this.meshes[0] 
    const mm = this.meshes[1] 
    const rm = this.meshes[2] 

    lm.translateX(- width * 1.0)
    rm.translateX(  width * 1.0)
  }

  setOpacity(o) {
    const num = this.meshes.length -1
    for (let  i=0; i < num; ++i) {
      const m = this.meshes[i]
      m.material.opacity = o
   }
  }

  moveX(dx) {
    const m = this.meshes[this.ALL]
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
