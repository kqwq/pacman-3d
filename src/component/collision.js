import * as THREE from 'three';



/**
 * Calculates collision detection parameters.
 */
function addBounds(obj) {
  // Compute the bounding box after scale, translation, etc.
  var bbox = new THREE.Box3().setFromObject(obj);
  obj.bounds = {
    xMin: bbox.min.x,
    xMax: bbox.max.x,
    yMin: bbox.min.y,
    yMax: bbox.max.y,
    zMin: bbox.min.z,
    zMax: bbox.max.z,
    isHorizontal: bbox.max.x - bbox.min.x > bbox.max.z - bbox.min.z,
  };
  obj.fillStyle = obj.fillStyle || obj.material.color?.getStyle() || obj.material[3].color.getStyle();
}


/**
 * Collision detection for every solid object.
 * @return falling
 */
function detectCollisions(controls, lastSafePosition, velocity, scene, game, objects) {
  // Get the user's current collision area.
  let rotationPoint = controls.getObject()
  let playerSize = 2.8;
  let px = rotationPoint.position.x;
  let py = rotationPoint.position.y;
  let pz = rotationPoint.position.z;
  var bounds = {
    xMin: px - playerSize,
    xMax: px + playerSize,
    yMin: py - playerSize,
    yMax: py + playerSize,
    zMin: pz - playerSize,
    zMax: pz + playerSize,
  };

  // Run through each object and detect if there is a collision.
  for (var index = objects.length -1; index >= 0; index --) {

    let obj = objects[index];
    let col = obj.bounds;
    if ((bounds.xMin <= col.xMax && bounds.xMax >= col.xMin) &&
      (bounds.yMin <= col.yMax && bounds.yMax >= col.yMin) &&
      (bounds.zMin <= col.zMax && bounds.zMax >= col.zMin)) {

      if (obj.name === 'wall') {
        // If player on top of the object, freeze its y position.
        if (velocity.y < 0 && Math.abs(bounds.yMin - col.yMax) < 1) {
          controls.getObject().position.y = lastSafePosition.y;
          return true;
        }

        // Slide the player horizontally or vertically
        if (col.isHorizontal) {
          controls.getObject().position.z = lastSafePosition.z;
        } else {
          controls.getObject().position.x = lastSafePosition.x;
        }
        break

      } else if (obj.name === 'coin') {
        objects.splice(index, 1);
        scene.remove(obj);
        game.addCoin();
      } else if (obj.name === 'powerup') {
        objects.splice(index, 1);
        scene.remove(obj);
        game.addPowerup();
      } else if (obj.name === 'ghost') {
        game.loseGame()
      } else if (obj.name === 'portal') {
        
      }


    }
  }
  return false
}

  export { detectCollisions, addBounds }
