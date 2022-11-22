const THREE = require('three');

export class Sound {
  constructor(fname, scene, playbackRate = 1.0, volume = 1.0) {
    const camera = this.getCamera(scene)

    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add( listener );

    // create a global audio source
    const sound = new THREE.Audio( listener );

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();

    audioLoader.load( fname, function( buffer ) {
      sound.setBuffer( buffer );
      //sound.setLoop( true );
      sound.playbackRate = playbackRate
      sound.setVolume( volume );
    });

    this.sound =  sound


  }

  getCamera(scene ) {
    let camera 

    scene.children.forEach( i => {
      const p  = Object.getPrototypeOf( i )
      const pp = Object.getPrototypeOf( p )
      const ppc = pp.constructor.name
      if ( ppc == "Camera" ) {
        camera = i
      } 
    }) 

    return camera
  }

  play() {
    this.sound.play()
  }

}
