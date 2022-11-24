const THREE = require('three');
import { Sound }  from  './sound.js'
const Common   = require("./lib/common.js")

// Particle3D class
const TO_RADIANS = Math.PI/180.0

export class Food {
  constructor(fnames, width, height, scene) {
    this.BEFORE_0 = 0
    this.BEFORE_1 = 1
    this.AFTER    = 2
    this.BEFORE   = 3
    this.ALL      = 4

    this.meshes = [] 
    const geometry = this.plateGeometry(width, height, 1, 1)
    for (let i = 0; i < 3; i++) {
      const fname = fnames[i]
      const material = this.plateMaterial(fname)

      const mesh = new THREE.Mesh(geometry, material)
      this.meshes.push( mesh ) 
      mesh.translateY(height / 2.0)
      mesh.translateZ( i * - 0.3   )
    }

    const b = new THREE.Group()
    b.add( this.meshes[this.BEFORE_0] ) 
    b.add( this.meshes[this.BEFORE_1] )
    this.meshes.push( b  )

    const a = new THREE.Group()
    a.add( this.meshes[this.BEFORE] )
    a.add( this.meshes[this.AFTER ] )
    this.meshes.push( a )

    scene.add( this.meshes[this.ALL] )
    this.meshes[this.ALL].position.y = 20

    this.startPos = [] 
    this.startRot = [] 
    for (let i = 0; i < this.ALL + 1; i++) {
      const m = this.meshes[i]
      this.startPos.push( m.position.clone() )
      this.startRot.push( m.rotation.clone() ) 
    }
    this.meshes[this.BEFORE_1].material.opacity = 0

    this.state = 0
    this.actions = [this.startInit, this.startDropping, this.startCutting, this.startFin]
    this.waitTime      = 0 
    this.waitPeriod    = 2
    this.cuttingTime   = 0
    this.cuttingPeriod = 5
    this.fallingTime   = 0

    this.length = ((width + height) / 2) * 0.5

    this.setupPhisics()
    this.sound = new Sound("sound/cut.mp3", scene, 0.7, 1.0)
  }

  setupPhisics() {
    this.gravity    = new THREE.Vector3( 0, 0.0, 0 )
    this.velocity   = new THREE.Vector3( 0, 0.0, 0 )
    this.energyLoss = 0.7
  }

  next() {
    this.state += 1 
    if ( this.state >= this.actions.length ) this.state = 0
    this.actions[this.state].call(this)
  }

  reset() {
    this.state = 0
    this.waitTime    = 0
    this.cuttingTime = 0
    this.fallingTime = 0

    this.velocity.set(0, 0, 0)

    for (let i = 0; i < this.ALL + 1; i++) {
      const m = this.meshes[i]
      m.position.copy( this.startPos[i] )
      m.rotation.copy( this.startRot[i] )
    }

    this.meshes[this.BEFORE_1].material.opacity = 0
  }

  startInit() {
    this.reset()
  }

  startDropping() {
    this.velocity.set(0, -10.0, 0)
    this.gravity.set(0, -0.7, 0)
  }

  startCutting() {
    this.waitTime    = 0
    this.cuttingTime = 0
    this.fallingTime = 0
    this.velocity.set(0, 0, 0)
    this.gravity.set(0, -0.1, 0)

    this.sound.play()

    this.meshes[this.BEFORE_1].material.opacity = 1
  }

  startFin() {
    this.gravity.set(0, 0, 0)
    this.velocity.set(0, 0, 0)
  }

  update(dt) {
    switch (this.state) {
      case 0:
        break;
      case 1:
        this.updateDrop(dt / 4)
        break;
      case 2:
        if ( this.waitTime < this.waitPeriod  )  {
          this.waitTime += dt
          this.updateWait(dt)
          break
        }

        if ( this.cuttingTime < this.cuttingPeriod ) {
          this.cuttingTime += dt
          this.updateCut(dt)
          break
        } 

        this.fallingTime += dt
        this.updateFall(dt)
        break
      case 3:
        this.updateFin(dt)
        break

      default: 
        break
    }
  }

  updateDrop(dt) {
    const m = this.meshes[this.ALL]
    const pos = m.position
    
    pos.x += this.velocity.x * dt
    pos.y += this.velocity.y * dt
    pos.z += this.velocity.z * dt

    this.velocity.x += this.gravity.x
    this.velocity.y += this.gravity.y
    this.velocity.z += this.gravity.z

    if ( pos.y < 0  ) {
      this.velocity.y = - this.velocity.y * this.energyLoss
      pos.y = 0
    }

    if ( pos.y < 0.05 && this.velocity.y > 0 && this.velocity.y < 3.0 ) {
      this.velocity.y = 0
      pos.y = 0
    }
  }

  updateWait(dt) {
  }

  updateCut(dt) {
    const m = this.meshes[this.BEFORE]
    const rot = m.rotation
    const vrz = - 0.05
    const rz  = vrz * dt + rot.z
    rot.z = rz
  }

  updateFall(dt) {
    const m   = this.meshes[this.BEFORE]
    const pos = m.position
    const rot = m.rotation
    const t   = this.fallingTime

    this.velocity.x = this.normalDistribution(t, Math.sqrt(16.0), 0) * 3
    
    pos.x += this.velocity.x * dt
    pos.y += this.velocity.y * dt
    pos.z += this.velocity.z * dt

    //this.velocity.x += this.gravity.x
    this.velocity.y += this.gravity.y
    this.velocity.z += this.gravity.z

    const vrz = - 0.5
    const rz  = vrz * dt + rot.z
    rot.z = rz
  }

  updateFin(dt) {
    const vx = 1.5
    const dx = vx * dt
    this.moveX( dx )
  }

  moveLeft(dx = -0.08) {
    this.moveX(dx)
  }

  moveRight(dx = 0.08) {
    this.moveX(dx)
  }

  moveX(dx) {
    const m   = this.meshes[this.AFTER]
    const pos = m.position
    const rot = m.rotation

    const dr = - dx / this.length
    const dy = - Math.abs(dx) * 0.3 

    rot.z += dr
    pos.x += dx
    pos.y += dy
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
