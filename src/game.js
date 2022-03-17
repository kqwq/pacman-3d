import * as THREE from 'three';

import { floorFactory, wallFactory, ghostFactory } from './component/factory.js';
import { addBounds, detectCollisions } from './component/collision.js';
import { PointerLockControls } from './util/PointerLockControls.js';
import Minimap from './component/minimap.js';
var STLLoader = require('three-stl-loader')(THREE)

let scene, renderer, myPointLight, raycaster, skyboxGeo, skybox;
let materialCorona, materialRedEclipse;

const objects = [];

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let falling = true;
let playerSpeed = 400


let prevTime = performance.now();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 30000);
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const controls = new PointerLockControls(camera, document.body);
const minimap = new Minimap(objects, controls)

class Game {
  constructor() {
    this.stage = 1;
    this.coins = 0;
    this.score = 0;
    this.coinsTotal = 240;
    this.powerupActive = false;
    this.powerupDuration = 10 // seconds
    this.ghosts = [];
    this.powerupCountdown = 0;
  }

  loadStage() {
    objects.splice(0, objects.length);
    this.ghosts = [];

    // skybox
    skybox = new THREE.Mesh(skyboxGeo, this.stage === 1 ? materialCorona : materialRedEclipse);
    scene.add(skybox);
    
    // floor pattern
    floorFactory(scene);

    // walls
    new THREE.TextureLoader().load(`asset/wall${this.stage}.jpg`, function (texture) {

      wallFactory(scene, objects, texture);
      
    })

    // ghosts
    new STLLoader().load('asset/ghost.stl', function (geometry) {
      game.ghosts = ghostFactory(scene, objects, geometry);
    });

    // player
    direction.set(0, 0, 0);
    velocity.set(0, 0, 0);
    controls.getObject().rotation.set(0, Math.PI, 0);
    controls.getObject().position.set(112, 6, 211)

    document.getElementById('coinsTotal').innerHTML = this.coinsTotal;
    document.getElementById('stage').innerHTML = this.stage;

  }

  setTotalCoins(n) {
    document.getElementById('coinsTotal').innerHTML = n;
  }

  addCoin() {
    this.coins++;
    this.score += 10;
    document.getElementById('coins').innerHTML = this.coins;
    document.getElementById('score').innerHTML = this.score;

    if (this.coins >= this.coinsTotal) {
      setTimeout(() => {
        this.stage++;
        this.coins = 0;
        document.getElementById('stage').innerHTML = this.stage;
        document.getElementById('coins').innerHTML = this.coins;
        document.getElementById('coinsTotal').innerHTML = this.coinsTotal;
        document.getElementById('stage').innerHTML = this.stage;
        this.loadStage();
      }, 1000);
    }
  }

  addPowerup() {
    this.score += 50
    document.getElementById('score').innerHTML = this.score;
    document.getElementById('powerup').style.display = 'block';
    this.powerupActive = true;
    this.powerupCountdown = this.powerupDuration;
  }

  removePowerup() {
    this.powerupActive = false;
    document.getElementById('powerup').style.display = 'none';

  }

  loseGame() {

  }

  update(delta) {
    for (let i = 0; i < this.ghosts.length; i++) {
      let ghost = this.ghosts[i];
      ghost.update(delta);
      addBounds(ghost);
    }

    if (this.powerupActive) {
      this.powerupCountdown -= delta;
      if (this.powerupCountdown <= 0) {
        this.removePowerup();
      }
    }
  }
}
const game = new Game();


function createPathStrings(filename) {
  const basePath = "./asset/skybox/";
  const baseFilename = basePath + filename;
  const fileType = ".png";
  const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
  const pathStings = sides.map(side => {
    return baseFilename + "_" + side + fileType;
  });
  return pathStings;
}
function createMaterialArray(filename) {
  const skyboxImagepaths = createPathStrings(filename);
  const materialArray = skyboxImagepaths.map(image => {
    let texture = new THREE.TextureLoader().load(image);
    return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }); // <---
  });
  return materialArray;
}

function init() {

  // Camera/rendering
  scene = new THREE.Scene();
  //scene.fog = new THREE.Fog(0x222, 0, 70);

  // Lights
  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);
  myPointLight = new THREE.PointLight(0xffff99, 2.1, 19);
  scene.add(myPointLight);

  // skybox init (rest is set up in game.loadStage())
  materialCorona = createMaterialArray("corona");
  materialRedEclipse = createMaterialArray("redeclipse");
  skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);

  // 
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
  minimap.onResize()

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

    if (moveForward || moveBackward) velocity.z -= direction.z * playerSpeed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * playerSpeed * delta;

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

    game.update(delta);

  }

  // my point light
  myPointLight.position.x = controls.getObject().position.x;
  myPointLight.position.y = controls.getObject().position.y;
  myPointLight.position.z = controls.getObject().position.z;

  prevTime = time;

  renderer.render(scene, camera);


  let camDirection = camera.getWorldDirection( new THREE.Vector3() );
  let theta = Math.atan2(camDirection.x, camDirection.z);
  minimap.update(theta)
}

export { init };