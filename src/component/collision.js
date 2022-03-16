import * as THREE from 'three';





/**
 * Calculates collision detection parameters.
 */
 function calculateCollisionPoints( mesh, scale, type = 'collision' ) { 
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
  };
 
  collisions.push( bounds );
}

function collisionFrame(controls) {
  // Detect collisions.
  if ( collisions.length > 0 ) {
    detectCollisions(controls);
  }
}

/**
 * Collision detection for every solid object.
 */
 function detectCollisions(controls) {
  // Get the user's current collision area.
  let rotationPoint = controls.getObject().position.clone();
  let playerSize = 0.2;
  var bounds = {
    xMin: rotationPoint.position.x - playerSize,
    xMax: rotationPoint.position.x + playerSize,
    yMin: rotationPoint.position.y - playerSize,
    yMax: rotationPoint.position.y + playerSize,
    zMin: rotationPoint.position.z - playerSize,
    zMax: rotationPoint.position.z + playerSize,
  };
 
  // Run through each object and detect if there is a collision.
  for ( var index = 0; index < collisions.length; index ++ ) {
 
    if (collisions[ index ].type == 'collision' ) {
      if ( ( bounds.xMin <= collisions[ index ].xMax && bounds.xMax >= collisions[ index ].xMin ) &&
         ( bounds.yMin <= collisions[ index ].yMax && bounds.yMax >= collisions[ index ].yMin) &&
         ( bounds.zMin <= collisions[ index ].zMax && bounds.zMax >= collisions[ index ].zMin) ) {
        // We hit a solid object! Stop all movements.
        stopMovement();
 
        // Move the object in the clear. Detect the best direction to move.
        if ( bounds.xMin <= collisions[ index ].xMax && bounds.xMax >= collisions[ index ].xMin ) {
          // Determine center then push out accordingly.
          var objectCenterX = ((collisions[ index ].xMax - collisions[ index ].xMin) / 2) + collisions[ index ].xMin;
          var playerCenterX = ((bounds.xMax - bounds.xMin) / 2) + bounds.xMin;
          var objectCenterZ = ((collisions[ index ].zMax - collisions[ index ].zMin) / 2) + collisions[ index ].zMin;
          var playerCenterZ = ((bounds.zMax - bounds.zMin) / 2) + bounds.zMin;
 
          // Determine the X axis push.
          if (objectCenterX > playerCenterX) {
            rotationPoint.position.x -= 1;
          } else {
            rotationPoint.position.x += 1;
          }
        }
        if ( bounds.zMin <= collisions[ index ].zMax && bounds.zMax >= collisions[ index ].zMin ) {
          // Determine the Z axis push.
          if (objectCenterZ > playerCenterZ) {
          rotationPoint.position.z -= 1;
          } else {
            rotationPoint.position.z += 1;
          }
        }
      }
    }
  }
}


export { collisionFrame, calculateCollisionPoints };
