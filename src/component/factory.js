import * as THREE from 'three';
const loader = new THREE.ImageLoader();
import { Coin, Powerup } from './collectable.js';



const vertex = new THREE.Vector3();
const color = new THREE.Color();

/**
 * 
 * @param {Array[y][x]=(true|false)} pointArray 
 */
function convertPointsToRectangles(pointArray) {
  let rectangles = [];

  // Detect horizontal lines
  for (let y = 0; y < pointArray.length; y ++) {
    for (let x = 0; x < pointArray[y].length; x ++) {
      if (pointArray[y][x]) {
        let x1 = x;
        let x2 = x;
        while (pointArray[y][x2]===1) {
          x2 ++;
        }
        if (x2 - x1 > 1) {
          // Mark as visited
          for (let i = x1; i <= x2; i ++) {
            pointArray[y][i] = 2;
          }
          rectangles.push([x1, y, x2 - x1, 1])
        }
        x = x2;
      }
    }
  }

  // Detect vertical lines
  for (let x = 0; x < pointArray[0].length; x ++) {
    for (let y = 0; y < pointArray.length; y ++) {
      if (pointArray[y][x]) {
        let y1 = y;
        let y2 = y;
        while (pointArray[y2][x]===1) {
          y2 ++;
        }
        if (y2 - y1 > 1) {
          // Mark as visited
          for (let i = y1; i <= y2; i ++) {
            pointArray[i][x] = 2;
          }
          rectangles.push([x, y1, 1, y2 - y1])
        }
        y = y2;
      }
    }
  }

  // Add all remaining 1x1 points as rectangles
  for (let y = 0; y < pointArray.length; y ++) {
    for (let x = 0; x < pointArray[y].length; x ++) {
      if (pointArray[y][x] === 1) {
        rectangles.push([x, y, 1, 1])
      }
    }
  }


  return rectangles;
}


function floorFactory(scene) {
    // floor

    let floorGeometry = new THREE.PlaneGeometry( 300, 300, 16, 16);
    floorGeometry.rotateX( - Math.PI / 2 );
    // move floor

  
    // vertex displacement
  
    let position = floorGeometry.attributes.position;
  
    for ( let i = 0, l = position.count; i < l; i ++ ) {
  
      vertex.fromBufferAttribute( position, i );
  
      vertex.x += Math.random() * 20 + 100;
      vertex.y += Math.random() * 0.1;
      vertex.z += Math.random() * 20 + 150;
  
      position.setXYZ( i, vertex.x, vertex.y, vertex.z );
  
    }
  
    floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices
  
    position = floorGeometry.attributes.position;
    const colorsFloor = [];
  
    for ( let i = 0, l = position.count; i < l; i ++ ) {
  
      color.setHSL( Math.random() * 0.1 + 0.6, 0.25, Math.random() * 0.2 );
      colorsFloor.push( color.r, color.g, color.b );
  
    }
  
    floorGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colorsFloor, 3 ) );
  
    const floorMaterial = new THREE.MeshBasicMaterial( { vertexColors: true } );
  
    const floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.name = 'floor';
    scene.add( floor )
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
    texture.repeat.set(longestSide , 1)





    box.position.set(x + w / 2, y + h / 2, z + d / 2);
    objects.push(box);
    scene.add(box);
  }

    // const boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, vertexColors: true } );
    // boxMaterial.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

    // const box = new THREE.Mesh( boxGeometry, boxMaterial );


  const boxGeometry = new THREE.BoxGeometry( 1, 1, 1 ).toNonIndexed();

  let position = boxGeometry.attributes.position;
  const colorsBox = [];

  for ( let i = 0, l = position.count; i < l; i ++ ) {

    color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
    colorsBox.push( color.r, color.g, color.b );
  }

  boxGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colorsBox, 3 ) );



  loader.load("asset/maze.png", function (img) {


    let canvas = document.createElement("canvas")
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    var pixelData = canvas.getContext('2d').getImageData(0, 0, img.width, img.height).data;
    
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

        scene.add(coin);
        
      }

      // Look for powerups dots, brown RGB(185, 122, 87)
      if (pixelData[i] === 185 && pixelData[i + 1] === 122 && pixelData[i + 2] === 87) {
        let powerup = new Powerup(x, y)

        scene.add(powerup);
        
      }
    }

    

    //
    let rects = convertPointsToRectangles(pointArray)
    //console.log(pointArray.length, rects.length, pointArray, rects)
    rects.forEach(rectangle => {
      createBox(rectangle[0], 0, rectangle[1], rectangle[2], 10, rectangle[3])
    })


  });

}

function ghostFactory(scene, objects, geometry, ind) {
  let ghostColors = [ // Ghost colors from pacman
    0xff0000,
    0x00ffff,
    0xffb8de,
    0xffb847
  ]
  let ghostCoords = [
    [0, 0],
    [6, 0],
    [12, 0],
    [18, 0]
  ]
  let textureMatcap = new THREE.TextureLoader().load(`asset/matghost.png`)

  var ghostMaterial = new THREE.MeshMatcapMaterial({ 
    color: ghostColors[ind || 0],
    matcap: textureMatcap,
    

  });

  const ghost = new THREE.Mesh(geometry, ghostMaterial);
  ghost.name = 'ghost';
  ghost.scale.set(0.2, 0.2, 0.2);
  ghost.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  // scale down by 20%
  let [x, z] = ghostCoords[ind || 0]
  ghost.position.set(x, 5, z);
  scene.add(ghost);

}

export { floorFactory, wallFactory, ghostFactory };