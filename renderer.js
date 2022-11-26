import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { Food }  from  './food.js'
import { Kutiyose }  from  './kutiyose.js'
import { Boid }  from  './boid.js'
const Common = require("./lib/common.js")

let renderer, scene, camera, stats

let mouseX = 0
let mouseY = 0

let activeObj
let food
let kutiyose
let boid

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
    100 
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


  boid = new Boid()
  const birdGeo = boid.makeBirdGeometry()
  //const birdMat = new THREE.MeshBasicMaterial( { color:Math.random() * 0xffffff, side: THREE.DoubleSide } )
  const birdMat = new THREE.MeshLambertMaterial( { color:Math.random() * 0xffffff, side: THREE.DoubleSide } )

   const mesh = new THREE.Mesh( birdGeo ,  birdMat) ;

   scene.add(mesh)


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

  activeObj.update(deltaT)

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
