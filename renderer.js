import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Food }  from  './food.js'
import { Smoke }  from  './smoke.js'
const Common = require("./lib/common.js")

function randomRange(min, max) {
  return ((Math.random()*(max-min)) + min); 
}

//let SCREEN_WIDTH  = window.innerWidth
//let SCREEN_HEIGHT = window.innerHeight

const container = document.body

let renderer, scene, camera, stats

let mouseX = 0
let mouseY = 0

let food
let smoke

init()
let lastUpdate = performance.now()
animate()

function init() {
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight )
  document.body.appendChild( renderer.domElement )
  //renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  //container.appendChild( renderer.domElement );

  scene = new THREE.Scene();

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
  scene.add(directionalLight);

  const axesHelper = new THREE.AxesHelper( 5 )
  scene.add( axesHelper )

  const fnames = ["img/tomato_0.png", "img/tomato_1.png", "img/tomato_2.png"]
  food = new Food(fnames, 10, 10, scene)

  smoke = new Smoke("img/smoke.png", 10, 10, 3, scene)

  window.addEventListener( 'resize', onWindowResize )

  stats = new Stats();
  //document.body.appendChild( stats.dom );

  const controls = new OrbitControls( camera, renderer.domElement );
  camera.position.z = 30
  camera.position.y = 10
  controls.target.y = 10

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

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
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

  food.update(deltaT)
  smoke.update(deltaT)

  renderer.render(scene, camera)
  stats.update()
}

//looks for key presses and logs them
document.body.addEventListener("keydown", function(e) {
  console.log(`key: ${e.key}`);

  switch(true) {
    case e.key == 'd':
      food.startDropping()
      smoke.start()
      break

    case e.key == 'c':
      food.startCutting()
      break

    case e.key == 'f':
      food.startFin()
      break

    case e.key == 'r':
      food.reset()
      break
      break

    case e.key == '0':
      break
    case e.key == '1':
      break
    case e.key == '2':
      break
    case e.key == '3':
      break
    case e.key == '4':
      break
    case e.key == '5':
      break
    case e.key == '6':
      break
    case e.key == '7':
      break
    case e.key == '8':
      break
    case e.key == 'm':

    case e.key == "W":
     break

    case e.key == "w":
      break

    case e.key == "s":
      break

    case e.key == "S":
     break

    case e.key == "r":
      break

    default:
      break
  }
});
