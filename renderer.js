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

let tomato, broccoli, pumpkin
let snail, butterfly0, butterfly1, frog, god
let slideshow

let boid


let currentPerformer = 0
let performers       = []

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
  //scene.add( axesHelper )

  window.addEventListener( 'resize', onWindowResize )

  stats = new Stats();
  //document.body.appendChild( stats.dom );

  const controls = new OrbitControls( camera, renderer.domElement );
  camera.position.z = 13.5
  camera.position.y = 7
  controls.target.y = 7

  controls.update();
}

function initPerformers() {
  spotlight = new Spotlight("img/spotlight_", 8, 8, scene)

  const height = 14
  tomato   = new Food("img/tomato_"   , Math.floor(height * 1024/1024), height, scene)
  broccoli = new Food("img/broccoli_" , Math.floor(height * 1250/1024), height, scene)
  pumpkin  = new Food("img/pumpkin_"  , Math.floor(height * 1530/1024), height, scene)

  tomato.exitType   = 0
  broccoli.exitType = 1
  pumpkin.exitType  = 2

  snail      = new Kutiyose("img/snail.png"      , Math.floor(12     * 2020/1024),     12, scene)
  butterfly0 = new Kutiyose("img/butterfly_0.png", Math.floor(height * 1024/1024), height, scene)
  butterfly1 = new Kutiyose("img/butterfly_1.png", Math.floor(height * 1024/1024), height, scene)
  god        = new Kutiyose("img/god_1.png"      , Math.floor(height * 1024/1024), height, scene)
  frog       = new Kutiyose("img/frog.png"       , Math.floor(height * 1338/1024), height, scene)

  slideshow = new Slideshow("img/omoide/", 40, Math.floor(height * (1478/1108)), height, scene)

  boid = new Boid(scene)

  // ---- Order ----
  performers.push(spotlight)  // 0
  performers.push(tomato )    // 1
  performers.push(broccoli)   // 2
  performers.push(pumpkin)    // 3
  performers.push(snail)      // 4
  performers.push(butterfly0) // 5 
  performers.push(butterfly1) // 6
  performers.push(god)        // 7
  performers.push(frog)       // 8
  performers.push(slideshow)  // 9
  performers.push(boid)       // a

  currentPerformer = 0
}

function activeObj() {
  return performers[currentPerformer]
}

function onDocumentMouseMove( event ) {

  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onDocumentTouchStart( event ) {

  if ( event.touches.length == 1 ) {

    event.preventDefault();

    const windowHalfX = window.innerWidth / 2
    const windowHalfY = window.innerHeight / 2
    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;
  }
}

function onDocumentTouchMove( event ) {

  if ( event.touches.length == 1 ) {

    event.preventDefault();

    const windowHalfX = window.innerWidth / 2
    const windowHalfY = window.innerHeight / 2
    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;
  }
}

function onWindowResize() {
  const w = window.innerWidth
  const h = window.innerHeight

  camera.aspect = w / h
  camera.updateProjectionMatrix()

	boid.updateResolution()

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

  activeObj().update(deltaT)

  renderer.render(scene, camera)
  stats.update()
}

// define a new console
var console=(function(oldCons){
    return {
			log: function(text){
					oldCons.log(text);
					window.api.send(text, 'log::to_main')
				// Your code
        },
        info: function (text) {
            oldCons.info(text);
            // Your code
        },
        warn: function (text) {
            oldCons.warn(text);
            // Your code
        },
        error: function (text) {
            oldCons.error(text);
            // Your code
        }
    };
}(window.console))

//Then redefine the old console
window.console = console



//looks for key presses and logs them
document.body.addEventListener("keydown", function(e) {
  //console.log(`key: ${e.key}`);

  switch(true) {
    case e.key == '0':
      activeObj().startInit()
      currentPerformer = 0
      break
    case e.key == '1':
      activeObj().startInit()
      currentPerformer = 1
      break
    case e.key == '2':
      activeObj().startInit()
      currentPerformer = 2
      break
    case e.key == '3':
      activeObj().startInit()
      currentPerformer = 3
      break
    case e.key == '4':
      activeObj().startInit()
      currentPerformer = 4
      break
    case e.key == '5':
      activeObj().startInit()
      currentPerformer = 5
      break
    case e.key == '6':
      activeObj().startInit()
      currentPerformer = 6
      break
    case e.key == '7':
      activeObj().startInit()
      currentPerformer = 7
      break
    case e.key == '8':
      activeObj().startInit()
      currentPerformer = 8
      break
    case e.key == '9':
      activeObj().startInit()
      currentPerformer = 9
      break

    case e.key == 'a':
      activeObj().startInit()
      currentPerformer = 9
      break

    case e.key == 'l':
      spotlight.appear()
      break

    case e.key == 'L':
      spotlight.disappear()
      break

    case e.key == 'b':
      currentPerformer = Math.max(currentPerformer - 1, 0)
      break

    case e.key == ' ':
      if ( activeObj().isFinished() )  {
          currentPerformer = Math.min(currentPerformer + 1, performers.length -1)
      }
      activeObj().next()
      break

    case e.key == 'ArrowLeft':
      activeObj().moveLeft()
      break

    case e.key == 'ArrowRight':
      activeObj().moveRight()
      break

    default:
      break
  }
});
