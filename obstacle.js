const THREE = require('three');
//import { SceneUtils } from 'three/examples/jsm/utils/SceneUtils.js'
import { createMultiMaterialObject } from 'three/examples/jsm/utils/SceneUtils.js'
import CubicBezier from 'cubic-bezier-easing'
const Common   = require("./lib/common.js")
const Colormap = require("./lib/colormap.js")

// Particle3D class
const TO_RADIANS = Math.PI/180.0

export class Obstacle {
  constructor(fnames, width, height, camera, scene) {
    const geometry = this.plateGeometry(width, height, 1, 1)

    const meshes = [] 
    for (let i = 0; i < 3; i++) {
      const fname = fnames[i]
      const material = this.plateMaterial(fname)
      const mesh = new THREE.Mesh(geometry, material)
      meshes.push( mesh ) 
    }


    this.beforeMesh = meshes[0]
    this.haloMesh   = meshes[1]
    this.afterMesh  = meshes[2]

    this.beforePivot = new THREE.Group()
    this.beforePivot.add( this.beforeMesh )
    this.beforePivot.add( this.haloMesh )

		this.beforeMesh.translateY(height / 2)
		this.haloMesh  .translateY(height / 2)
		this.afterMesh .translateY(height / 2)
    this.haloMesh  .translateZ(-0.1)
    this.afterMesh .translateZ(-0.2)

    scene.add( this.beforePivot )
    scene.add( this.afterMesh   )

		this.beforeMStartPos = this.beforeMesh.position.clone()
		this.beforeMStartRot = this.beforeMesh.rotation.clone()

    this.haloMStartPos  = this.haloMesh.position.clone()
    this.haloMStartRot  = this.haloMesh.rotation.clone()

		this.beforePStartPos = this.beforePivot.position.clone()
		this.beforePStartRot = this.beforePivot.rotation.clone()

    this.haloMesh.material.opacity = 0

    this.waitTime   = 0 
    this.waitPeriod = 2

    this.cuttingTime = 0
		this.cuttingPeriod = 5

    this.fallingTime = 0
    this.isCut = false

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

	reset() {
	  this.isCut = false
    this.waitTime = 0
		this.cuttingTime = 0
		this.fallingTime = 0

		this.beforeMesh .position.copy(this.beforeMStartPos)
    this.haloMesh   .position.copy(this.haloMStartPos  )
		this.beforePivot.position.copy(this.beforePStartPos)

		this.beforeMesh .rotation.copy(this.beforeMStartRot)
    this.haloMesh   .rotation.copy(this.haloMStartRot  )
		this.beforePivot.rotation.copy(this.beforePStartRot)

    this.haloMesh.material.opacity = 0
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
    const rot = this.beforePivot.rotation
		const vrz = - 0.05
		const rz  = vrz * dt + rot.z
    rot.z = rz
	}


  update1(dt) {
    const pos    = this.beforePivot.position
    const t      = this.fallingTime

    const alpha = - 0.005
    const beta  = 300.0
    const vy    = - beta * ( 1 - Math.exp( alpha * Math.pow(t, 1.8) ) ) 
    const vx    = this.normalDistribution(t, Math.sqrt(16.0), 0) * 3
    const y     = vy * dt + pos.y
    const x     = vx * dt + pos.x
   
    pos.y = y
    pos.x = x


    const rot = this.beforePivot.rotation
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
