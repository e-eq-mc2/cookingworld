import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { Food }  from  './food.js'
import { Kutiyose }  from  './kutiyose.js'
import { Bird, Boid }  from  './boid.js'
const Common = require("./lib/common.js")

let renderer, scene, camera, stats

let mouseX = 0
let mouseY = 0

let activeObj
let food
let kutiyose
let boids, birds 

// ---------- main 
init()
let lastUpdate = performance.now()
animate()
// ----------

function init() {
  renderer = new THREE.WebGLRenderer( { antialias: true } )
  renderer.setPixelRatio( window.devicePixelRatio )
  renderer.setSize( window.innerWidth, window.innerHeight )
  document.body.appendChild( renderer.domElement )

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.01, 
    1000 
  )

  scene.add(camera)

  // 環境光源
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3)
  scene.add(ambientLight)

  // 平行光源
  const directionalLight = new THREE.DirectionalLight(0xFFFFFF)
  directionalLight.position.set(1, 50, 50)
  // シーンに追加
  scene.add(directionalLight)

  const axesHelper = new THREE.AxesHelper( 5 )
  scene.add( axesHelper )

  const fnames = ["img/tomato_0.png", "img/tomato_1.png", "img/tomato_2.png"]
  food = new Food(fnames, 10, 10, scene)
  kutiyose = new Kutiyose("img/snail.png", 10, 10, scene)

  activeObj = food


	birds = [];
	boids = [];

	for ( var i = 0; i < 100; i ++ ) {
		const boid = boids[ i ] = new Boid();
    boid.position.x = Math.random() * 400 - 200;
    boid.position.y = Math.random() * 400 - 200;
    boid.position.z = Math.random() * 400 - 200;
    boid.velocity.x = Math.random() * 2 - 1;
    boid.velocity.y = Math.random() * 2 - 1;
    boid.velocity.z = Math.random() * 2 - 1;
    boid.setAvoidWalls( true );
    boid.setWorldSize( 300, 300, 300 );

		boid.initTrail(scene)

		const bird = birds[ i ] = new Bird(scene)
		bird.phase = Math.floor( Math.random() * 62.83 );
	}

  window.addEventListener( 'resize', onWindowResize )

  stats = new Stats();
  //document.body.appendChild( stats.dom );

  const controls = new OrbitControls( camera, renderer.domElement );
  camera.position.z = 13
  camera.position.y = 4
  controls.target.y = 4

  controls.update();
}

function onDocumentMouseMove( event ) {

  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onDocumentTouchStart( event ) {

  if ( event.touches.length == 1 ) {

    event.preventDefault();

    const windowHalfX   = window.innerWidth / 2
    const windowHalfY   = window.innerHeight / 2
    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;
  }
}

function onDocumentTouchMove( event ) {

  if ( event.touches.length == 1 ) {

    event.preventDefault();

    const windowHalfX   = window.innerWidth / 2
    const windowHalfY   = window.innerHeight / 2
    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;
  }
}

function onWindowResize() {
  const w = window.innerWidth
  const h = window.innerHeight

  camera.aspect = w / h
  camera.updateProjectionMatrix()

	boids.forEach( (b) => {
		if( b.trail_initialized ) {
      const r = b.trail_line.updateResolution()
    }
	})

  renderer.setSize(w, h)
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  const now = performance.now()
  const deltaT = (now - lastUpdate) / 1000
  if (deltaT  === void 0) {
    console.log(now, lastUpdate)
  }
  lastUpdate = now

  activeObj.update(deltaT)

  for ( var i = 0, il = birds.length; i < il; i++ ) {
    const boid = boids[ i ]
    boid.run( boids )

    const bird = birds[ i ]
    const p = boid.position
    const v = boid.velocity
    bird.update(p, v)

    const color = bird.mesh.material.color;

    if (boid.trail_initialized) boid.trail_line.setColor(color)
  }



  renderer.render(scene, camera)
  stats.update()
}

//looks for key presses and logs them
document.body.addEventListener("keydown", function(e) {
  console.log(`key: ${e.key}`);

  switch(true) {
    case e.key == '0':
      activeObj = food
      break

    case e.key == '1':
      activeObj = kutiyose
      break

    case e.key == ' ':
      activeObj.next()
      break

    case e.key == 'ArrowLeft':
      activeObj.moveLeft()
      break

    case e.key == 'ArrowRight':
      activeObj.moveRight()
      break

    default:
      break
  }
});
