import * as THREE from 'three';
const loader = new THREE.ImageLoader();




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
      // Check if pixel is #2121de (blue)
      if (pixelData[i] === 33 && pixelData[i + 1] === 33 && pixelData[i + 2] === 222) {
        let x = i / 4 % img.width;
        let y = Math.floor(i / 4 / img.width);
        // Set pixel to white
        pixelData[i] = 255;
        pixelData[i + 1] = 255;
        pixelData[i + 2] = 255;
        pointArray[y][x] = 1;
      }
    }
    canvas.getContext('2d').putImageData(new ImageData(pixelData, img.width, img.height), 0, 0);
    //document.body.appendChild(canvas);

    //
    let rects = convertPointsToRectangles(pointArray)
    //console.log(pointArray.length, rects.length, pointArray, rects)
    rects.forEach(rectangle => {
      createBox(rectangle[0], 0, rectangle[1], rectangle[2], 10, rectangle[3])
    })


  });

}

export { floorFactory, wallFactory };