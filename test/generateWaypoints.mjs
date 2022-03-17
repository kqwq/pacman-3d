

// 


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
      let waypoint = { id: waypointInd++, x: x, y: y, dir: [] }
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

