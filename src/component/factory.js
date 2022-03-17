import * as THREE from 'three';
const loader = new THREE.ImageLoader();
import { Coin, Powerup } from './collectable.js';
import { Ghost } from './ghost.js';
import { addBounds } from './collision.js';


const vertex = new THREE.Vector3();
const color = new THREE.Color();

/**
 * 
 * @param {Array[y][x]=(true|false)} pointArray 
 */
function convertPointsToRectangles(pointArray) {
  let rectangles = [];

  // Detect horizontal lines
  for (let y = 0; y < pointArray.length; y++) {
    for (let x = 0; x < pointArray[y].length; x++) {
      if (pointArray[y][x]) {
        let x1 = x;
        let x2 = x;
        while (pointArray[y][x2] === 1) {
          x2++;
        }
        if (x2 - x1 > 1) {
          // Mark as visited
          for (let i = x1; i <= x2; i++) {
            pointArray[y][i] = 2;
          }
          rectangles.push([x1, y, x2 - x1, 1])
        }
        x = x2;
      }
    }
  }

  // Detect vertical lines
  for (let x = 0; x < pointArray[0].length; x++) {
    for (let y = 0; y < pointArray.length; y++) {
      if (pointArray[y][x]) {
        let y1 = y;
        let y2 = y;
        while (pointArray[y2][x] === 1) {
          y2++;
        }
        if (y2 - y1 > 1) {
          // Mark as visited
          for (let i = y1; i <= y2; i++) {
            pointArray[i][x] = 2;
          }
          rectangles.push([x, y1, 1, y2 - y1])
        }
        y = y2;
      }
    }
  }

  // Add all remaining 1x1 points as rectangles
  for (let y = 0; y < pointArray.length; y++) {
    for (let x = 0; x < pointArray[y].length; x++) {
      if (pointArray[y][x] === 1) {
        rectangles.push([x, y, 1, 1])
      }
    }
  }


  return rectangles;
}


function floorFactory(scene) {
  // floor

  let floorGeometry = new THREE.PlaneGeometry(300, 300, 16, 16);
  floorGeometry.rotateX(- Math.PI / 2);
  // move floor


  // vertex displacement

  let position = floorGeometry.attributes.position;

  for (let i = 0, l = position.count; i < l; i++) {

    vertex.fromBufferAttribute(position, i);

    vertex.x += Math.random() * 20 + 100;
    vertex.y += Math.random() * 0.1;
    vertex.z += Math.random() * 20 + 150;

    position.setXYZ(i, vertex.x, vertex.y, vertex.z);

  }

  floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

  position = floorGeometry.attributes.position;
  const colorsFloor = [];

  for (let i = 0, l = position.count; i < l; i++) {

    color.setHSL(Math.random() * 0.1 + 0.6, 0.25, Math.random() * 0.25);
    colorsFloor.push(color.r, color.g, color.b);

  }

  floorGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsFloor, 3));

  const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.name = 'floor';
  scene.add(floor)
}

function wallFactory(scene, objects, txt) {

  var blueMaterial = new THREE.MeshBasicMaterial({ color: 0x2121de });

  const createBox = (x, y, z, w, h, d) => {
    let texture = txt.clone();

    const geometry = new THREE.BoxGeometry(w, h, d);
    var wallMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      flatShading: true,
    });

    let material1, material2
    if (w > d) {
      material1 = blueMaterial;
      material2 = wallMaterial;
    } else {
      material1 = wallMaterial;
      material2 = blueMaterial;
    }

    const box = new THREE.Mesh(geometry, [
      material1,
      material1,
      blueMaterial,
      blueMaterial,
      material2,
      material2,

    ])
    box.name = 'wall'

    // Prevent texture warping
    let longestSide = Math.max(w, d) / h
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(longestSide, 1)





    box.position.set(x + w / 2, y + h / 2, z + d / 2);
    addBounds(box)
    objects.push(box);
    scene.add(box);
  }

  // const boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, vertexColors: true } );
  // boxMaterial.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

  // const box = new THREE.Mesh( boxGeometry, boxMaterial );


  const boxGeometry = new THREE.BoxGeometry(1, 1, 1).toNonIndexed();

  let position = boxGeometry.attributes.position;
  const colorsBox = [];

  for (let i = 0, l = position.count; i < l; i++) {

    color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
    colorsBox.push(color.r, color.g, color.b);
  }

  boxGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsBox, 3));



  loader.load("asset/maze.png", function (img) {


    let canvas = document.createElement("canvas")
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    var pixelData = canvas.getContext('2d').getImageData(0, 0, img.width, img.height).data;

    let waypoints = []
    let waypointInd = 0

    let pointArray = Array(img.height).fill(0).map(() => Array(img.width).fill(0));
    for (let i = 0; i < pixelData.length; i += 4) {
      let x = i / 4 % img.width;
      let y = Math.floor(i / 4 / img.width);
      // Check if pixel is #2121de (blue)
      if (pixelData[i] === 33 && pixelData[i + 1] === 33 && pixelData[i + 2] === 222) {
        pointArray[y][x] = 1;
      }

      // Look for coins (2x2 grid of color #ffb897, RGB(255, 184, 151))
      if (pixelData[i + 2] === 151 && pixelData[i + 1] === pixelData[i + 4 + 1] && pixelData[i + 1] === pixelData[i + img.width * 4 + 1]) {
        let coin = new Coin(x, y)
        addBounds(coin)
        objects.push(coin);
        scene.add(coin);

      }

      // Look for powerups dots, brown RGB(185, 122, 87)
      if (pixelData[i] === 185 && pixelData[i + 1] === 122 && pixelData[i + 2] === 87) {
        let powerup = new Powerup(x, y)
        addBounds(powerup)
        objects.push(powerup);
        scene.add(powerup);
      }

      // Look for waypoints, violet RGB(128, 0, 255)
      if (pixelData[i] === 128 && pixelData[i + 1] === 0 && pixelData[i + 2] === 255) {
        let waypoint = { id: waypointInd++, x : x, y : y, dir: [] }
        waypoints.push(waypoint)

        // Look for directions from waypoint, baby purple RGB(200, *191*, 231)
        if (pixelData[i + 1 + img.width * 4 * 2] === 191) {
          waypoint.dir.push('down')
        }
        if (pixelData[i + 1 - img.width * 4 * 2] === 191) {
          waypoint.dir.push('up')
        }
        if (pixelData[i + 1 + 4 * 2] === 191) {
          waypoint.dir.push('right')
        }
        if (pixelData[i + 1 - 4 * 2] === 191) {
          waypoint.dir.push('left')
        }


      }
    }

    // Create waypoints
    for (let wp of waypoints) {
      let wdir = wp.dir
      for (let i in wdir) {
        let dir = wdir[i]
        // Find waypoint in direction
        let bestLink = null
        let bestDist = Infinity
        if (dir === 'down') {
          for (let wp2 of waypoints) {
            if (wp.x === wp2.x && wp2.y > wp.y && wp2.y - wp.y < bestDist) {
              bestLink = wp2
              bestDist = wp2.y - wp.y
            }
          }
        } else if (dir === 'up') {
          for (let wp2 of waypoints) {
            if (wp.x === wp2.x && wp2.y < wp.y && wp.y - wp2.y < bestDist) {
              bestLink = wp2
              bestDist = wp.y - wp2.y
            }
          }
        } else if (dir === 'right') {
          for (let wp2 of waypoints) {
            if (wp.y === wp2.y && wp2.x > wp.x && wp2.x - wp.x < bestDist) {  
              bestLink = wp2
              bestDist = wp2.x - wp.x
            }
          }
        } else if (dir === 'left') {
          for (let wp2 of waypoints) {
            if (wp.y === wp2.y && wp2.x < wp.x && wp.x - wp2.x < bestDist) {
              bestLink = wp2
              bestDist = wp.x - wp2.x
            }
          }
        }
        if (bestLink) {
          wdir[i] = bestLink.id
        } else {
          console.log('No waypoint found for', wp.id, dir)
        }
      }
    }
    console.log(JSON.stringify(waypoints))


    // Create walls
    let rects = convertPointsToRectangles(pointArray)
    rects.forEach(rectangle => {
      createBox(rectangle[0], 0, rectangle[1], rectangle[2], 10, rectangle[3])
    })


  });

}

function ghostFactory(scene, objects, geometry) {
  let ghostColors = [ // Ghost colors from pacman
    0xff0000,
    0x00ffff,
    0xffb8de,
    0xffb847
  ]
  let ghostCoords = [
    [112, 117],
    [96, 140],
    [113, 140],
    [129, 140]
  ]
  const ghostArr = []
  let textureMatcap = new THREE.TextureLoader().load(`asset/matghost.png`)
  for (let i = 0; i < ghostColors.length; i++) {
    let [x, z] = ghostCoords[i]
    let color = ghostColors[i]
    const ghost = new Ghost(x, z, color, geometry, textureMatcap)
    addBounds(ghost)
    scene.add(ghost);
    objects.push(ghost);
    ghostArr.push(ghost);
  }
  return ghostArr

}

export { floorFactory, wallFactory, ghostFactory };