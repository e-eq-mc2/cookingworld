const THREE = require('three');
const Common = require("./lib/common.js")

export class Boid {
  constructor() {
    this.vector = new THREE.Vector3()
    this._width = 500
    this._height = 500
    this._depth = 200 
    this._neighborhoodRadius = 100
    this._maxSpeed = 4
    this._avoidWalls = false
    this._goal = undefined 

    this.position          = new THREE.Vector3()
    this.velocity          = new THREE.Vector3()
    this._acceleration     = new THREE.Vector3()
    this.trail_initialized = false
  }

  makeBirdGeometry() {
    const geometry = new THREE.BufferGeometry();

    const verts = []
    verts.push( new THREE.Vector3(   5,   0,   0 ) )
    verts.push( new THREE.Vector3( - 5,   0,   0 ) )
    //verts.push( new THREE.Vector3( - 5, - 2,   1 ) )
    verts.push( new THREE.Vector3( - 5, - 2,   0 ) )

    verts.push( new THREE.Vector3(   0,   2, - 6 ) ) // 4
    verts.push( new THREE.Vector3( - 3,   0,   0 ) ) // 7
    verts.push( new THREE.Vector3(   2,   0,   0 ) ) // 6

    verts.push( new THREE.Vector3(   0,   2,   6 ) ) // 5
    verts.push( new THREE.Vector3(   2,   0,   0 ) ) // 6
    verts.push( new THREE.Vector3( - 3,   0,   0 ) ) // 7
    geometry.setFromPoints(verts)

    const normals = []
    for (let f = 0; f <  3; ++f) {
      const i0 = f
      const i1 = f + 1
      const i2 = f + 2
      this.setNornmal(verts[i0], verts[i1], verts[i2], normals)
    }
    
    geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute(normals, 3 ) )

    return geometry
  }

  setNornmal(a, b, c, normals) {
    const cb = new THREE.Vector3()
    const ab = new THREE.Vector3()
    cb.subVectors(c, b)
    ab.subVectors(a, b)
    cb.cross( ab )
    cb.normalize()

    normals.push(cb.x, cb.y, cb.z)
    normals.push(cb.x, cb.y, cb.z)
    normals.push(cb.x, cb.y, cb.z)
  }



  initTrail (scene) {
    // Create the line geometry used for storing verticies
    this.trail_geometry = new THREE.Geometry()
    for (var i = 0; i < 100; i++) {
      // must initialize it to the number of positions it will keep or it will throw an error
      this.trail_geometry.vertices.push(this.position.clone());
    }

    // Create the line mesh
    this.trail_line = new MeshLine();
    this.trail_line.setGeometry( this.trail_geometry,  function( p ) { return p; }  ); // makes width taper

    // Create the line material
    this.trail_material = new MeshLineMaterial( {
      color: new THREE.Color( "rgb(255, 2, 2)" ),
      opacity: 1,
      resolution: resolution,
      sizeAttenuation: 1,
      lineWidth: 1,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      transparent: false,
      side: THREE.DoubleSide
    });

    this.trail_mesh = new THREE.Mesh( this.trail_line.geometry, this.trail_material ); // this syntax could definitely be improved!
    this.trail_mesh.frustumCulled = false;

    scene.add( this.trail_mesh );

    this.trail_initialized = true;
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
      this.vector.set( - this._width, this.position.y, this.position.z );
      this.vector = this.avoid( this.vector );
      this.vector.multiplyScalar( 5 );
      this._acceleration.add( this.vector );

      this.vector.set( this._width, this.position.y, this.position.z );
      this.vector = this.avoid( this.vector );
      this.vector.multiplyScalar( 5 );
      this._acceleration.add( this.vector );

      this.vector.set( this.position.x, - this._height, this.position.z );
      this.vector = this.avoid( this.vector );
      this.vector.multiplyScalar( 5 );
      this._acceleration.add( this.vector );

      this.vector.set( this.position.x, this._height, this.position.z );
      this.vector = this.avoid( this.vector );
      this.vector.multiplyScalar( 5 );
      this._acceleration.add( this.vector );

      this.vector.set( this.position.x, this.position.y, - this._depth );
      this.vector = this.avoid( this.vector );
      this.vector.multiplyScalar( 5 );
      this._acceleration.add( this.vector );

      this.vector.set( this.position.x, this.position.y, this._depth );
      this.vector = this.avoid( this.vector );
      this.vector.multiplyScalar( 5 );
      this._acceleration.add( this.vector );

    }/* else {

            this.checkBounds();

          }
          */

    if ( Math.random() > 0.5 ) {

      this.flock( boids );

    }

    this.move();

  };

  flock( boids ) {

    if ( this._goal ) {

      this._acceleration.add( this.reach( _goal, 0.005 ) );

    }

    this._acceleration.add( this.alignment( boids ) );
    this._acceleration.add( this.cohesion( boids ) );
    this._acceleration.add( this.separation( boids ) );

  };

  move() {

    this.velocity.add( this._acceleration );

    var l = this.velocity.length();

    if ( l > this._maxSpeed ) {

      this.velocity.divideScalar( l / this._maxSpeed );

    }

    this.position.add( this.velocity );
    this._acceleration.set( 0, 0, 0 );

    // Advance the trail by one position
    if (this.trail_initialized) this.trail_line.advance( this.position );
  };

  checkBounds () {

    if ( this.position.x >   this._width ) this.position.x = - this._width;
    if ( this.position.x < - this._width ) this.position.x =   this._width;
    if ( this.position.y >   this._height ) this.position.y = - this._height;
    if ( this.position.y < - this._height ) this.position.y =  this._height;
    if ( this.position.z >  this._depth ) this.position.z = - this._depth;
    if ( this.position.z < - this._depth ) this.position.z =  this._depth;

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

    if ( distance < 150 ) {

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
    var boid, velSum = new THREE.Vector3(),
      count = 0;

    for ( var i = 0, il = boids.length; i < il; i++ ) {

      if ( Math.random() > 0.6 ) continue;

      boid = boids[ i ];

      distance = boid.position.distanceTo( this.position );

      if ( distance > 0 && distance <= this._neighborhoodRadius ) {

        velSum.add( boid.velocity );
        count++;

      }

    }

    if ( count > 0 ) {

      velSum.divideScalar( count );

      var l = velSum.length();

      if ( l > _maxSteerForce ) {

        velSum.divideScalar( l / _maxSteerForce );

      }

    }

    return velSum;
  };

  cohesion ( boids ) {
    var boid, distance,
      posSum = new THREE.Vector3(),
      steer = new THREE.Vector3(),
      count = 0;

    for ( var i = 0, il = boids.length; i < il; i ++ ) {

      if ( Math.random() > 0.6 ) continue;

      boid = boids[ i ];
      distance = boid.position.distanceTo( this.position );

      if ( distance > 0 && distance <= this._neighborhoodRadius ) {

        posSum.add( boid.position );
        count++;

      }
    }

    if ( count > 0 ) {

      posSum.divideScalar( count );

    }

    steer.subVectors( posSum, this.position );

    var l = steer.length();

    if ( l > _maxSteerForce ) {

      steer.divideScalar( l / _maxSteerForce );

    }

    return steer;
  }

  separation( boids ){
    var boid, distance,
      posSum = new THREE.Vector3(),
      repulse = new THREE.Vector3();

    for ( var i = 0, il = boids.length; i < il; i ++ ) {

      if ( Math.random() > 0.6 ) continue;

      boid = boids[ i ];
      distance = boid.position.distanceTo( this.position );

      if ( distance > 0 && distance <= this._neighborhoodRadius ) {

        repulse.subVectors( this.position, boid.position );
        repulse.normalize();
        repulse.divideScalar( distance );
        posSum.add( repulse );

      }

    }
    return posSum;
  }
}
