const THREE = require('three');
//import { SceneUtils } from 'three/examples/jsm/utils/SceneUtils.js'
import { createMultiMaterialObject } from 'three/examples/jsm/utils/SceneUtils.js'
import CubicBezier from 'cubic-bezier-easing'
const Common   = require("./lib/common.js")
const Colormap = require("./lib/colormap.js")

// Particle3D class
const TO_RADIANS = Math.PI/180.0

export class Food {
  const 
  constructor(fnames, width, height, scene) {

    this.BEFORE_0 = 0
    this.BEFORE_1 = 1
    this.AFTER    = 2
    this.BEFORE   = 3

    this.meshes = [] 
    const geometry = this.plateGeometry(width, height, 1, 1)
    for (let i = 0; i < 3; i++) {
      const fname = fnames[i]
      const material = this.plateMaterial(fname)

      const mesh = new THREE.Mesh(geometry, material)
      this.meshes.push( mesh ) 
      mesh.translateY(height / 2.0)
      mesh.translateZ( i * -0.1   )
    }

    const b = new THREE.Group()
    b.add( this.meshes[this.BEFORE_0] ) 
    b.add( this.meshes[this.BEFORE_1] )
    this.meshes.push( b  )


    scene.add( this.meshes[this.BEFORE] )
    scene.add( this.meshes[this.AFTER ] )

    this.startPos = [] 
    this.startRot = [] 
    for (let i = 0; i < 4; i++) {
      const m = this.meshes[i]
      this.startPos.push( m.position.clone() )
      this.startRot.push( m.rotation.clone() )
    }

    this.meshes[this.BEFORE_1].opacity = 0

    this.waitTime   = 0 
    this.waitPeriod = 2

    this.cuttingTime = 0
		this.cuttingPeriod = 5

    this.fallingTime = 0
    this.isCut = false

    this.setupSound(scene)


  }

  setupSound(scene) {
    const camera = this.getCamera(scene)

    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add( listener );

    // create a global audio source
    const sound = new THREE.Audio( listener );

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();

    audioLoader.load( 'sound/cut.mp3', function( buffer ) {
      sound.setBuffer( buffer );
      //sound.setLoop( true );
      sound.playbackRate = 0.7
      sound.setVolume( 1.0 );
    });

    this.sound =  sound
  }

  getCamera(scene ) {
    let camera 
    
    scene.children.forEach( i => {
      const p  = Object.getPrototypeOf( i )
      const pp = Object.getPrototypeOf( p )
      const ppc = pp.constructor.name
      if ( ppc == "Camera" ) {
        camera = i
      } 
    }) 

    return camera
  }

	reset() {
	  this.isCut = false
    this.waitTime = 0
		this.cuttingTime = 0
		this.fallingTime = 0

    for (let i = 0; i < 4; i++) {
      const m = this.meshes[i]
      m.position.copy( this.startPos[i] )
      m.rotation.copy( this.startRot[i] )
    }

    this.meshes[this.BEFORE_1].material.opacity = 0
	}

  startCuttOff() {
    this.waitTime = 0
    this.cuttingTime = 0
    this.fallingTime = 0
    this.isCut = true

    this.sound.play();

    this.haloMesh.material.opacity = 1
  }

  update(dt) {
    if ( ! this.isCut ) return

    if ( this.waitTime < this.waitPeriod  )  {
      this.waitTime += dt
      return 
    }

		if ( this.cuttingTime < this.cuttingPeriod ) {
      this.cuttingTime += dt
			this.update0(dt)
      return
		} 

    this.fallingTime += dt
    this.update1(dt)
  }

	update0(dt) {
    const m = this.meshes[this.BEFORE]
    const rot = m.rotation
		const vrz = - 0.05
		const rz  = vrz * dt + rot.z
    rot.z = rz
	}


  update1(dt) {
    const m   = this.meshes[this.BEFORE]
    const pos = m.position
    const rot = m.rotation
    const t   = this.fallingTime

    const alpha = - 0.005
    const beta  = 300.0
    const vy    = - beta * ( 1 - Math.exp( alpha * Math.pow(t, 1.8) ) ) 
    const vx    = this.normalDistribution(t, Math.sqrt(16.0), 0) * 3
    const y     = vy * dt + pos.y
    const x     = vx * dt + pos.x
   
    pos.y = y
    pos.x = x

		const vrz = - 0.5
		const rz  = vrz * dt + rot.z
    rot.z = rz
  }

	normalDistribution(x, sd,mean) {
	  const a = ( x - mean ) / sd
		const b = 1 / ( Math.sqrt( 2 * Math.PI ) * sd ) 
    const y = b * Math.exp ( - 0.5 * a * a ) 
		return y
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
