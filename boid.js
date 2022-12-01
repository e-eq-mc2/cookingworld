const THREE = require('three');
import {MeshLine, MeshLineMaterial} from 'meshline'
const Common = require("./lib/common.js")


class MeshLineExt extends MeshLine {
  jump(pos) {
    const numv = this.positions.length / 3
    for (var i = 0; i < numv; ++i) {
      const ix = i * 3 + 0
      const iy = i * 3 + 1
      const iz = i * 3 + 2
      this.positions[ix] = pos.x
      this.positions[iy] = pos.y
      this.positions[iz] = pos.z
    }

    this.process()
    console.log(this.previous)
  }
}


export class Boid {
  constructor(scene) {

    const num               = 0
    this.width              = 20
    this.height             = 20
    this.depth              = 20
    this.neighborhoodRadius = 5
    this.maxSpeed           = 5
    this.avoidWalls         = true
    this.birds  = []
    this.scene              = scene

    this.initPos = new THREE.Vector3(0, 0, 0)

    for ( let i = 0; i < num; i ++ ) {
      const p = this.initPos.clone()
      const v = this.russianRoulette()

      v.multiplyScalar(1)
      const bird = new Bird(p, v, this, scene)
      this.birds.push(bird)
    }
  }

  updateResolution() {
    this.birds.forEach( (b) => {
        const r = b.line.updateResolution()
    })
  }

  update(dt) {
    for (let i = 0; i < this.birds.length; i++) {
      const bird = this.birds[i]
      bird.update(dt)
    }
  }

  next(num = 1) {
    for ( let i = 0; i < num; i ++ ) {
      const p = this.initPos.clone()
      const v = this.russianRoulette()

      v.multiplyScalar(3)
      const bird = new Bird(p, v, this, this.scene)
      this.birds.push(bird)
    }
  }

  russianRoulette() {
    const e = 20
    const r0 = Common.randomReal()
    const r1 = Common.randomReal()
    const cosPhi = Math.cos(2 * Math.PI * r0)
    const sinPhi = Math.sin(2 * Math.PI * r0)

    const cosTheta = Math.pow(1.0 - r1, 1.0 / (e + 1.0))
    const sinTheta = Math.sqrt(1.0 - cosTheta * cosTheta)

    const x = sinTheta * cosPhi
    const y = sinTheta * sinPhi
    const z = cosTheta

    const v = new THREE.Vector3(x, z, y)
    return v
  }
}

class Bird {
  constructor(position, velocity, boid, scene) {

    this.position     = position
    this.velocity     = velocity
    this.acceleration = new THREE.Vector3()

    this.boid   = boid
    this.goal = undefined 
    
    this.initBody(scene)
    this.initLine(scene)

    const color = new THREE.Color( Math.random() * 0xffffff )
    this.body.setColor(color)
    this.line.setColor(color)

  }

  initBody (scene) {
    // Create the line mesh
    this.body = new Bird.Body(this.position, this.velocity)
    scene.add(this.body.mesh)
  }

  initLine (scene) {
    // Create the line mesh
    this.line = new Bird.Line(this.position)
    scene.add(this.line.mesh)
  }

  setGoal( target ) {
    this.goal = target;
  }

  update(dt = 1) {
    //if ( this.boid.avoidWalls ) {

      if ( this.position.x >   this.boid.width )  {
        this.position.x = - this.boid.width
        this.position.y = Math.abs(this.position.y)
        this.body.update(this.position, this.velocity) 
        this.line.jump(this.position)
        return
      }

      if ( this.position.x < - this.boid.width ) {
        this.position.x = this.boid.width
        this.body.update(this.position, this.velocity) 
        this.line.jump(this.position)
        return
      }

      const scale = 5

      let v = new THREE.Vector3()
      //v.set( - this.boid.width, this.position.y, this.position.z );
      //v = this.avoid( v );
      //v.multiplyScalar( scale );
      //this.acceleration.add( v );

      //v.set( this.boid.width, this.position.y, this.position.z );
      //v = this.avoid( v );
      //v.multiplyScalar( scale );
      //this.acceleration.add( v );


      v.set( this.position.x, - this.boid.height, this.position.z );
      v = this.avoid( v );
      v.multiplyScalar( scale );
      this.acceleration.add( v );

      v.set( this.position.x, this.boid.height, this.position.z );
      v = this.avoid( v );
      v.multiplyScalar( scale );

      const distanceToTop = Math.abs(this.boid.height - this.position.y)
      const st = (1 / distanceToTop) * 0.1
      this.velocity.x += (this.velocity.x > 0) ? st : -st 
      this.acceleration.add( v )


      v.set( this.position.x, this.position.y, - this.boid.depth );
      v = this.avoid( v );
      v.multiplyScalar( scale );
      this.acceleration.add( v );

      v.set( this.position.x, this.position.y, this.boid.depth );
      v = this.avoid( v );
      v.multiplyScalar( scale );
      this.acceleration.add( v );
    //}

    if ( Math.random() > 0.80 ) {
      //this.flock()
    }

    this.move(dt);

  };

  flock() {

    if ( this.goal ) {

      //this.acceleration.add( this.reach( goal, 0.005 ) );

    }

    //this.acceleration.add( this.alignment() )
    //this.acceleration.add( this.cohesion() )
    //this.acceleration.add( this.separation() )

  };

  move(dt) {
    this.velocity.x += this.acceleration.x * dt
    this.velocity.y += this.acceleration.y * dt
    this.velocity.z += this.acceleration.z * dt

    let l = this.velocity.length();

    if ( l > this.boid.maxSpeed ) {
      this.velocity.divideScalar( l / this.boid.maxSpeed )
    }

    this.position.x += this.velocity.x * dt
    this.position.y += this.velocity.y * dt
    this.position.z += this.velocity.z * dt
    this.acceleration.set( 0, 0, 0 );

    // Update Graphics
    this.body.update(this.position, this.velocity) 
    this.line.advance(this.position)
  };

  avoid( target ){
    let steer = new THREE.Vector3();

    steer.copy( this.position );
    steer.sub( target );

    steer.multiplyScalar( 1 / this.position.distanceToSquared( target ) );

    return steer;

  };

  repulse( target ) {
    let distance = this.position.distanceTo( target );

    if ( distance < 1 ) {

      let steer = new THREE.Vector3();

      steer.subVectors( this.position, target );
      steer.multiplyScalar( 0.5 / distance );

      this.acceleration.add( steer );

    }
  }

  reach( target, amount ) {

    let steer = new THREE.Vector3();

    steer.subVectors( target, this.position );
    steer.multiplyScalar( amount );

    return steer;

  };

  alignment() {
    const scale = 1
    const velSum = new THREE.Vector3()
    let count = 0

    const birds = this.boid.birds
    for (let i = 0; i < birds.length; i++ ) {

      if ( Math.random() > 0.6 ) continue

      const bird = birds[ i ]
      const distance = bird.position.distanceTo( this.position );

      if ( distance > 0 && distance <= this.boid.neighborhoodRadius ) {
        velSum.add( bird.velocity )
        count++
      }

    }

    if ( count > 0 ) {

      velSum.divideScalar( count );

      //if ( l > this.boid.maxSteerForce ) {
      //  velSum.divideScalar( l / this.boid.maxSteerForce );
      //}

    }

    return velSum
  }

  cohesion(boids) {
    const scale = 0.004
    let posSum = new THREE.Vector3()
    let count = 0

    for ( let i = 0, il = boids.length; i < il; i ++ ) {

      if ( Math.random() > 0.6 ) continue;

      const boid = boids[ i ];
      const distance = boid.position.distanceTo( this.position );

      if ( distance > 0 && distance <= this.boid.neighborhoodRadius ) {

        posSum.add( boid.position );
        count++;

      }
    }

    if ( count > 0 ) {

      posSum.divideScalar( count );

    }

    const steer = new THREE.Vector3()
    steer.subVectors( posSum, this.position );

    steer.multiplyScalar(scale)
    let l = steer.length();

    //if ( l > this.boid.maxSteerForce ) {

    //  steer.divideScalar( l / this.boid.maxSteerForce );


    //}

    return steer;
  }

  separation(){
    let posSum  = new THREE.Vector3()

    const  scale = 1

    const birds = this.boid.birds
    for (let i = 0; i < birds.length; ++i) {

      if ( Math.random() > 0.6 ) continue

      const bird = birds[i]
      const distance = bird.position.distanceTo( this.position );

      if ( distance > 0 && distance <= this.boid.neighborhoodRadius ) {

        const repulse = new THREE.Vector3()
        repulse.subVectors( this.position, bird.position )
        repulse.normalize()
        repulse.divideScalar( distance )
        repulse.multiplyScalar( scale )
        posSum.add( repulse )
      }

    }
    return posSum
  }
}

Bird.Body = class {
  constructor(position, velocity) {
    const geometry = this.birdGeometry()
    const material = this.birdMaterial()

    this.mesh = new THREE.Mesh(geometry , material)
    this.mesh.scale.x = 0.1
    this.mesh.scale.y = 0.1
    this.mesh.scale.z = 0.1

    this.update(position, velocity)
    this.phase = Math.floor( Math.random() * 62.83 )
  }

  birdGeometry() {
    const geometry = new THREE.BufferGeometry();

    const verts = []
    // body
    verts.push( new THREE.Vector3(   5,   0,   0 ) )  // 0
    verts.push( new THREE.Vector3( - 5,   0,   0 ) )  // 1
    verts.push( new THREE.Vector3( - 5, - 2,   0 ) )  // 2
    // left wing
    verts.push( new THREE.Vector3(   0,   2, - 6 ) ) // 3
    verts.push( new THREE.Vector3( - 3,   0,   0 ) ) // 4
    verts.push( new THREE.Vector3(   2,   0,   0 ) ) // 5
    // right wing
    verts.push( new THREE.Vector3(   0,   2,   6 ) ) // 6
    verts.push( new THREE.Vector3(   2,   0,   0 ) ) // 7
    verts.push( new THREE.Vector3( - 3,   0,   0 ) ) // 8

    geometry.setFromPoints(verts)

    const vns = []
    for (let f = 0; f <  3; ++f) {
      const i0 = f
      const i1 = f + 1
      const i2 = f + 2

      const n = this.computeNormal(verts[i0], verts[i1], verts[i2])
      vns.push(n.x, n.y, n.z)
      vns.push(n.x, n.y, n.z)
      vns.push(n.x, n.y, n.z)
    }

    const normals = new THREE.Float32BufferAttribute(vns, 3 )
    geometry.setAttribute( 'normal', normals)

    return geometry
  }

  birdMaterial() {
    const material = new THREE.MeshLambertMaterial( {
      color: 0xffffff, 
      side: THREE.DoubleSide,
    } )

    return material
  }

  setColor(c) {
    this.mesh.material.color.set(c)
  }

	update(position, velocity) {
    this.mesh.position.x = position.x 
    this.mesh.position.y = position.y
    this.mesh.position.z = position.z

		this.mesh.rotation.y = Math.atan2( - velocity.z, velocity.x );
		this.mesh.rotation.z = Math.asin( velocity.y / velocity.length() )

		this.phase = ( this.phase + ( Math.max( 0, this.mesh.rotation.z ) + 0.1 )  ) % 62.83

		// flapping
    const y = Math.sin( this.phase ) * 8
		const posAttr  = this.mesh.geometry.getAttribute("position")
    posAttr.array[ 3 * 3 + 1] = y
    posAttr.array[ 6 * 3 + 1] = y

    posAttr.needsUpdate = true
    this.mesh.geometry.computeVertexNormals()
	}

  computeNormal(a, b, c) {
    // a ------ b
    //  \      /
    //    \   /
    //      c 

    const ba = new THREE.Vector3()
    const ca = new THREE.Vector3()
    ba.subVectors(b, a) // b - a
    ca.subVectors(c, a) // c - a

    const n = new THREE.Vector3()
    n.crossVectors(ca, ba)
    n.normalize()
    return n
  }
}

Bird.Line = class {
  constructor(pos) {
    const lineLength = 64
    const points = []
    for (let i=0; i<lineLength; ++i) {
      points.push(pos.x)
      points.push(pos.y)
      points.push(pos.z)
    }

    // Create the line mesh
    this.meshLine = new MeshLineExt()
    this.meshLine.setPoints(points, p => { return p } ) // makes width taper (p is a decimal percentage of the number of points)

    this.initMesh()
  }

  initMesh() {
    const material = this.createMaterial()

    this.mesh = new THREE.Mesh(this.meshLine.geometry, material)
    this.mesh.frustumCulled = false
  }

  setColor(c) {
     this.mesh.material.uniforms.color.value = c
  }

  createMaterial() {
    const w = window.innerWidth
    const h = window.innerHeight
    const res = new THREE.Vector2(w, h)

    // Create the line material
    const material = new MeshLineMaterial({
      color: 0xffffff,
      opacity: 1,
      resolution: res,
      sizeAttenuation: 1,
      lineWidth: 0.1,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      transparent: false,
      side: THREE.DoubleSide
    })

    return material
  }

  updateResolution() {
    const w = window.innerWidth
    const h = window.innerHeight
    const r = new THREE.Vector2(w, h)
    this.mesh.material.uniforms.resolution.value.copy( r )
  }

  advance(pos) {
    // Advance the trail by one position
    this.meshLine.advance(pos)
  }

  jump(pos) {
    this.meshLine.jump(pos)
  }
}


