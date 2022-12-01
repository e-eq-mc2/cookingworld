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

    this.smoke = new Smoke("img/smoke.png", width, height, scene)

    this.color  = {opacity: 0}
    this.syncColor()
    this.isFirstTime = true
  }

  reset() {
    this.current = -1
    this.tween = undefined
    this.color  = {opacity: 0}

    for(let i=0; i<this.pages.length; ++i) {
      const p = this.pages[i]
      p.setOpacity(0)
    }

    //this.isFirstTime = true
    this.smoke.reset()
    this.update()
  }

  createTween(color) {
    const tween = new TWEEN.Tween({opacity: 0})
    tween
      .to({opacity: 1}, 1500)
      .easing(TWEEN.Easing.Cubic.In)
			.onUpdate((o) => { 
        color.opacity = o.opacity 
      })
    return tween
  }

  next() {
    this.current = this.current + 1

    if ( this.current == this.pages.length ) {
      this.reset()
      return
    }

    if ( this.current == 0 && this.isFirstTime ) {
      this.smoke.appear() 
      this.isFirstTime = false
    }

    this.tween = this.createTween(this.color)
    this.tween.start()
  }


  syncColor() {
    const curr = this.current
    const prev = curr -1
    const currPage = this.pages[curr]
    const prevPage = this.pages[prev]

    const currOpacity = this.color.opacity
    const prevOpacity = 1 - this.color.opacity

    if ( currPage ) currPage.setOpacity(currOpacity)
    if ( prevPage ) prevPage.setOpacity(prevOpacity)

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

    console.log(this.color.opacity)
    this.syncColor()
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
    scene.add( a )
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

    this.initialPosition = a.position.clone()
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
