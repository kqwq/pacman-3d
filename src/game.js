import * as THREE from 'three';

import { floorFactory, wallFactory, ghostFactory } from './component/factory.js';
import { detectCollisions } from './component/collision.js';
import { PointerLockControls } from './util/PointerLockControls.js';
import Minimap from './component/minimap.js';
var STLLoader = require('three-stl-loader')(THREE)

let camera, scene, renderer, controls, myPointLight, raycaster;

const objects = [];

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let falling = true;


let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const minimp = new Minimap(objects, direction)

class Game {
  constructor() {
    this.stage = 1;
    this.coins = 0;
    this.lives = 3;
    this.score = 0;
    this.coinsTotal = 240;
    this.powerupActive = false;
    this.powerupDuration = 10 // seconds
  }

  loadStage() {
    objects.splice(0, objects.length);
    
    // floor pattern
    floorFactory(scene);

    // walls
    new THREE.TextureLoader().load(`asset/wall${this.stage}.jpg`, function (texture) {

      wallFactory(scene, objects, texture);
      
    })

    // ghosts
    new STLLoader().load('asset/ghost.stl', function (geometry) {
      console.log(34, geometry)
      for (let i = 0; i < 4; i++) {
        ghostFactory(scene, objects, geometry, i);
      }
    });

    document.getElementById('coinsTotal').innerHTML = this.coinsTotal;
    document.getElementById('stage').innerHTML = this.stage;

  }

  setTotalCoins(n) {
    document.getElementById('coinsTotal').innerHTML = n;
  }

  addCoin() {
    this.coins++;
    this.score++;
    document.getElementById('coins').innerHTML = this.coins;
    document.getElementById('score').innerHTML = this.score;

    if (this.coins >= this.coinsTotal) {
      setTimeout(() => {
        this.stage++;
        this.coins = 0;
        this.coinsTotal = 0;
        document.getElementById('stage').innerHTML = this.stage;
        document.getElementById('coins').innerHTML = this.coins;
        document.getElementById('coinsTotal').innerHTML = this.coinsTotal;
        document.getElementById('stage').innerHTML = this.stage;
        this.loadStage();
      }, 1000);
    }
  }

  addPowerup() {
    this.score += 10
    document.getElementById('score').innerHTML = this.score;
    document.getElementById('powerup').style.display = 'block';
    this.powerupActive = true;
    setTimeout(() => {
      this.removePowerup();
    }, this.powerupDuration * 1000);
  }

  removePowerup() {
    this.powerupActive = false;
    document.getElementById('powerup').style.display = 'none';

  }
}
const game = new Game();

function init() {

  // Camera/rendering
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x445);
  scene.fog = new THREE.Fog(0x222, 0, 70);

  // Lights
  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);
  myPointLight = new THREE.PointLight(0xffff99, 2.1, 19);
  scene.add(myPointLight);


  controls = new PointerLockControls(camera, document.body);

  const blocker = document.getElementById('blocker');
  const instructions = document.getElementById('instructions');

  instructions.addEventListener('click', function () {

    controls.lock();

  });

  controls.addEventListener('lock', function () {

    instructions.style.display = 'none';
    blocker.style.display = 'none';

  });

  controls.addEventListener('unlock', function () {

    blocker.style.display = 'block';
    instructions.style.display = '';

  });

  scene.add(controls.getObject());

  const onKeyDown = function (event) {

    switch (event.code) {

      case 'ArrowUp':
      case 'KeyW':
        moveForward = true;
        break;

      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = true;
        break;

      case 'ArrowDown':
      case 'KeyS':
        moveBackward = true;
        break;

      case 'ArrowRight':
      case 'KeyD':
        moveRight = true;
        break;

      case 'Space':
        if (!falling || velocity.y == 0) velocity.y = 50;
        falling = true;
        break;

    }

  };

  const onKeyUp = function (event) {

    switch (event.code) {

      case 'ArrowUp':
      case 'KeyW':
        moveForward = false;
        break;

      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = false;
        break;

      case 'ArrowDown':
      case 'KeyS':
        moveBackward = false;
        break;

      case 'ArrowRight':
      case 'KeyD':
        moveRight = false;
        break;

    }

  };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);

  game.loadStage()

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  //renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  // resize
  window.addEventListener('resize', onWindowResize);

  // animate
  animate();
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}



function animate() {

  requestAnimationFrame(animate);

  const time = performance.now();

  if (controls.isLocked === true) {

    //raycaster.ray.origin.copy( controls.getObject().position );
    //raycaster.ray.origin.y += 1;

    //const intersections = raycaster.intersectObjects( objects, false );

    //const onObject = intersections.length > 0;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    if (falling) {
      velocity.y -= 9.8 * 10.0 * delta; // 100.0 = mass
    }

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    let lastSafePosition = controls.getObject().position.clone();

    controls.moveRight(- velocity.x * delta);
    controls.moveForward(- velocity.z * delta);
    controls.getObject().position.y += (velocity.y * delta); // new behavior



    // check collision
    falling = !detectCollisions(controls, lastSafePosition, velocity, scene, game, objects)

    // falling
    if (controls.getObject().position.y < 6.5) {
      velocity.y = 0;
      controls.getObject().position.y = 6.5;
      falling = false;
    }

    // make powerup text rainbow
    if (game.powerupActive) {
      let powerupText = document.getElementById('powerup');
      powerupText.style.color = 'hsl(' + time + ', 100%, 50%)';
    }
  }

  // my point light
  myPointLight.position.x = controls.getObject().position.x;
  myPointLight.position.y = controls.getObject().position.y;
  myPointLight.position.z = controls.getObject().position.z;

  prevTime = time;

  renderer.render(scene, camera);

  // mini map
  minimp.update()

}

export { init };