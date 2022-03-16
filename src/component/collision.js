import * as THREE from 'three';



let collisions = []

/**
 * Calculates collision detection parameters.
 */
function calculateCollisionPoints(mesh, type) {
  // Compute the bounding box after scale, translation, etc.
  var bbox = new THREE.Box3().setFromObject(mesh);

  var bounds = {
    type: type,
    xMin: bbox.min.x,
    xMax: bbox.max.x,
    yMin: bbox.min.y,
    yMax: bbox.max.y,
    zMin: bbox.min.z,
    zMax: bbox.max.z,
    type: type,
    mesh: mesh,
    isHorizontal: bbox.max.x - bbox.min.x > bbox.max.z - bbox.min.z,
  };
  console.log('add ')

  collisions.push(bounds);
}


/**
 * Collision detection for every solid object.
 * @return falling
 */
function detectCollisions(controls, lastSafePosition, velocity) {
  // Get the user's current collision area.
  let rotationPoint = controls.getObject()
  let playerSize = 2;
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
  for (var index = 0; index < collisions.length; index++) {

    let col = collisions[index];
    if ((bounds.xMin <= col.xMax && bounds.xMax >= col.xMin) &&
      (bounds.yMin <= col.yMax && bounds.yMax >= col.yMin) &&
      (bounds.zMin <= col.zMax && bounds.zMax >= col.zMin)) {

      if (col.type === 'wall') {
        // If player on top of the object, freeze its y position.
        if (velocity.y < 0 && Math.abs(bounds.yMin - col.yMax) < 1) {
          controls.getObject().position.y = lastSafePosition.y;
          return true;
        }

        // Slide the player horizontally or vertically
        if (collisions[index].isHorizontal) {
          controls.getObject().position.z = lastSafePosition.z;
        } else {
          controls.getObject().position.x = lastSafePosition.x;
        }
        break

      } else if (col.type === 'coin') {
        console.log('coin')
      }

    }
    return false
  }
}

  export { detectCollisions, calculateCollisionPoints }
