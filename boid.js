const THREE = require('three');
import {MeshLine, MeshLineMaterial} from 'meshline'
const Common = require("./lib/common.js")

export class Bird {
  constructor(scene) {
    const geometry = this.birdGeometry()
    const material = this.birdMaterial()

    this.mesh = new THREE.Mesh(geometry , material)
    //scene.add(this.mesh)
    this.mesh.scale.x = 0.1
    this.mesh.scale.y = 0.1
    this.mesh.scale.z = 0.1

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
      color: Math.random() * 0xffffff, 
      side: THREE.DoubleSide,
    } )

    return material
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
    this.meshLine = new MeshLine()
    this.meshLine.setPoints(points, p => { return p } ) // makes width taper (p is a decimal percentage of the number of points)

    this.initMesh()
  }

  initMesh() {
    const material = this.createMaterial()

    this.mesh = new THREE.Mesh(this.meshLine.geometry, material)
    this.mesh.frustumCulled = false
  }

  setColor(color) {
     this.mesh.material.uniforms.color.value = color
  }

  createMaterial() {
    const color = new THREE.Color( 0xffffff * Common.randomReal() )

    const w = window.innerWidth
    const h = window.innerHeight
    const res = new THREE.Vector2(w, h)

    // Create the line material
    const material = new MeshLineMaterial({
      color: new THREE.Color( "rgb(255, 2, 2)" ),
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
}

export class Boid {
  constructor() {
    this.vector = new THREE.Vector3()
    this._width  = 150
    this._height = 150
    this._depth  =  75
    this._neighborhoodRadius = 20
    this._maxSpeed = 0.5
    this._maxSteerForce = 0.1
    this._avoidWalls = false
    this._goal = undefined 

    this.position          = new THREE.Vector3()
    this.velocity          = new THREE.Vector3()
    this._acceleration     = new THREE.Vector3()
    this.trail_initialized = false
  }

  initTrail (scene) {
    // Create the line mesh
    this.trail_initialized = true
    this.trail_line = new Bird.Line(this.position)
    //scene.add(this.trail_line.mesh)

  };

  setGoal( target ) {
    this._goal = target;
  };

  setAvoidWalls( value ) {
    this._avoidWalls = value;
  };

  setWorldSize ( width, height, depth ) {
    this._width = width;
    this._height = height;
    this._depth = depth;

  };

  run( boids ) {
    if ( this._avoidWalls ) {
      const scale = 1
      this.vector.set( - this._width, this.position.y, this.position.z );
      this.vector = this.avoid( this.vector );
      this.vector.multiplyScalar( scale );
      this._acceleration.add( this.vector );

      this.vector.set( this._width, this.position.y, this.position.z );
      this.vector = this.avoid( this.vector );
      this.vector.multiplyScalar( scale );
      this._acceleration.add( this.vector );

      this.vector.set( this.position.x, - this._height, this.position.z );
      this.vector = this.avoid( this.vector );
      this.vector.multiplyScalar( scale );
      this._acceleration.add( this.vector );

      this.vector.set( this.position.x, this._height, this.position.z );
      this.vector = this.avoid( this.vector );
      this.vector.multiplyScalar( scale );
      this._acceleration.add( this.vector );

      this.vector.set( this.position.x, this.position.y, - this._depth );
      this.vector = this.avoid( this.vector );
      this.vector.multiplyScalar( scale );
      this._acceleration.add( this.vector );

      this.vector.set( this.position.x, this.position.y, this._depth );
      this.vector = this.avoid( this.vector );
      this.vector.multiplyScalar( scale );
      this._acceleration.add( this.vector );

    }

    if ( Math.random() > 0.60 ) {
      this.flock( boids );
    }

    const  dt = 1.0
    this.move(dt);

  };

  flock( boids ) {

    if ( this._goal ) {

      //this._acceleration.add( this.reach( _goal, 0.005 ) );

    }

    this._acceleration.add( this.alignment( boids ) );
    //this._acceleration.add( this.cohesion( boids ) );
    //this._acceleration.add( this.separation( boids ) );

  };

  move(dt) {

    this.velocity.add( this._acceleration );

    var l = this.velocity.length();

    if ( l > this._maxSpeed ) {

      this.velocity.divideScalar( l / this._maxSpeed );

    }

    this.position.x += this.velocity.x * dt
    this.position.y += this.velocity.y * dt
    this.position.z += this.velocity.z * dt
    this._acceleration.set( 0, 0, 0 );

    // Advance the trail by one position
    if (this.trail_initialized) this.trail_line.advance( this.position )
  };

  avoid( target ){
    var steer = new THREE.Vector3();

    steer.copy( this.position );
    steer.sub( target );

    steer.multiplyScalar( 1 / this.position.distanceToSquared( target ) );

    return steer;

  };

  repulse( target ) {
    var distance = this.position.distanceTo( target );

    if ( distance < 1 ) {

      var steer = new THREE.Vector3();

      steer.subVectors( this.position, target );
      steer.multiplyScalar( 0.5 / distance );

      this._acceleration.add( steer );

    }
  }

  reach( target, amount ) {

    var steer = new THREE.Vector3();

    steer.subVectors( target, this.position );
    steer.multiplyScalar( amount );

    return steer;

  };

  alignment( boids ) {
    const scale = 1
    let velSum = new THREE.Vector3()
    let count = 0

    for (let i = 0; i < boids.length; i++ ) {

      if ( Math.random() > 0.6 ) continue;

      const boid = boids[ i ];
      const distance = boid.position.distanceTo( this.position );

      if ( distance > 0 && distance <= this._neighborhoodRadius ) {

        velSum.add( boid.velocity );
        count++;

      }

    }

    if ( count > 0 ) {

      velSum.divideScalar( count );

      //var l = velSum.length();
      //if ( l > this._maxSteerForce ) {
      //  velSum.divideScalar( l / this._maxSteerForce );
      //}

    }

    return velSum;
  };

  cohesion(boids) {
    const scale = 0.004
    let posSum = new THREE.Vector3()
    let count = 0

    for ( var i = 0, il = boids.length; i < il; i ++ ) {

      if ( Math.random() > 0.6 ) continue;

      const boid = boids[ i ];
      const distance = boid.position.distanceTo( this.position );

      if ( distance > 0 && distance <= this._neighborhoodRadius ) {

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
    var l = steer.length();

    //if ( l > this._maxSteerForce ) {

    //  steer.divideScalar( l / this._maxSteerForce );


    //}

    return steer;
  }

  separation( boids ){
    var boid, distance,
      posSum = new THREE.Vector3(),
      repulse = new THREE.Vector3();

    const  scale = 0.03

    for ( var i = 0, il = boids.length; i < il; i ++ ) {

      if ( Math.random() > 0.6 ) continue;

      const boid = boids[ i ]
      distance = boid.position.distanceTo( this.position );

      if ( distance > 0 && distance <= this._neighborhoodRadius ) {

        repulse.subVectors( this.position, boid.position )
        repulse.normalize()
        repulse.divideScalar( distance )
        repulse.multiplyScalar( scale )
        posSum.add( repulse )

      }

    }
    return posSum;
  }
}
