const THREE = require('three');
const Common = require("./lib/common.js")
const TWEEN = require('@tweenjs/tween.js')
import { Smoke }  from  './smoke.js'


export class Slideshow {
  constructor(fnamePrefix, num, width, height, scene) {

    this.pages = []
    const perPage = 2
    for (let i = 0; i < num; ) {
      const fnames = []
      for (let j=0; j < perPage; ++j) {
        const fname = `${fnamePrefix}${i}.png`
        fnames.push(fname)

        if ( i >= num ) break
        ++i
      }

      const page = new Slideshow.Page(fnames, width * 0.5, height, scene)
      this.pages.push(page)
    }
  }


  update() {}




}

Slideshow.Page = class { 
  constructor(fnames, width, height, scene) {
    this.LEFT  = 0
    this.RIGHT = 1
    this.ALL   = 2

    const geometry  = this.plateGeometry(width, height, 1, 1)

    this.meshes = []
    const num = Math.min(fnames.length, this.ALL)
    const a = new THREE.Group()
    for (let  i=0; i < num; ++i) {
      const fname    = fnames[i]
      const material = this.plateMaterial(fname)

      const mesh = new THREE.Mesh(geometry, material)
      this.meshes.push(mesh)
      mesh.material.opacity = 1
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
      default:
        break
    }
  }

  align1(width, height) {
  }

  align2(width, height) {
    const lm = this.meshes[this.LEFT ] 
    const rm = this.meshes[this.RIGHT] 

    lm.translateX(- width * 0.5)
    rm.translateX(  width * 0.5)
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
