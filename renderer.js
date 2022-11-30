import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { Spotlight }  from  './spotlight.js'
import { Food }  from  './food.js'
import { Kutiyose }  from  './kutiyose.js'
import { Slideshow }  from  './slideshow.js'
import { Bird, Boid }  from  './boid.js'
const Common = require("./lib/common.js")

let renderer, scene, camera, stats

let mouseX = 0
let mouseY = 0

let activeObj
let tomato, broccoli
let snail, ladybug, frog, god
let slideshow
let boids, birds 

let performers = []

let spotlight

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
    200 
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

  initPerformers()

  const axesHelper = new THREE.AxesHelper( 5 )
  scene.add( axesHelper )

	birds = [];
	boids = [];

  const sizeX = 80
  const sizeY = 80
  const sizeZ = 50
	for ( var i = 0; i < 100; i ++ ) {
		const boid = boids[ i ] = new Boid();
    boid.position.x = Math.random() * sizeX - sizeX * 0.5;
    boid.position.y = Math.random() * sizeY - sizeY * 0.5;
    boid.position.z = Math.random() * sizeZ - sizeZ * 0.5;
    boid.velocity.x = Math.random() * 0.02 - 0.01;
    boid.velocity.y = Math.random() * 0.02 - 0.01;
    boid.velocity.z = Math.random() * 0.02 - 0.01;
    boid.setAvoidWalls( true );
    boid.setWorldSize( sizeX, sizeY, sizeZ );

		boid.initTrail(scene)

		const bird = birds[ i ] = new Bird(scene)
		bird.phase = Math.floor( Math.random() * 62.83 );
	}

  window.addEventListener( 'resize', onWindowResize )

  stats = new Stats();
  //document.body.appendChild( stats.dom );

  const controls = new OrbitControls( camera, renderer.domElement );
  camera.position.z = 13
  camera.position.y = 6.5
  controls.target.y = 6.5

  controls.update();
}

function initPerformers() {
  spotlight = new Spotlight("img/spotlight_", 8, 8, scene)

  const height = 13
  tomato   = new Food("img/tomato_"   , Math.floor(height * 1024/1024), height, scene)
  broccoli = new Food("img/broccoli_" , Math.floor(height * 1250/1024), height, scene)

  snail   = new Kutiyose("img/snail.png"  , height, height, scene)
  ladybug = new Kutiyose("img/ladybug.png", height, height, scene)
  god     = new Kutiyose("img/god_1.png"  , height, height, scene)
  frog    = new Kutiyose("img/frog.png"   , height, height, scene)

  slideshow = new Slideshow("img/omoide/", 4, Math.floor(height * (1478/1108)), height, scene)

  activeObj = spotlight
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

  const bird0 = birds[ 0 ]
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
      activeObj = spotlight
      break

    case e.key == '1':
      activeObj = tomato
      break

    case e.key == '2':
      activeObj = broccoli
      break

    case e.key == '4':
      activeObj = snail
      break

    case e.key == '5':
      activeObj = ladybug
      break

    case e.key == '7':
      activeObj = frog
      break

    case e.key == '6':
      activeObj = god
      break

    case e.key == '9':
      activeObj = slideshow
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
