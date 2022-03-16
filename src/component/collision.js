import * as THREE from 'three';



let collisions = []

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
    isHorizontal: bbox.max.x - bbox.min.x > bbox.max.z - bbox.min.z,
  };
  console.log('add ')
 
  collisions.push( bounds );
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
  for ( var index = 0; index < collisions.length; index ++ ) {
 
    if (collisions[ index ].type == 'collision' ) {
      if ( ( bounds.xMin <= collisions[ index ].xMax && bounds.xMax >= collisions[ index ].xMin ) &&
         ( bounds.yMin <= collisions[ index ].yMax && bounds.yMax >= collisions[ index ].yMin) &&
         ( bounds.zMin <= collisions[ index ].zMax && bounds.zMax >= collisions[ index ].zMin) ) {
        
        // If player on top of the object, freeze its y position.
        if ( velocity.y < 0 &&  Math.abs( bounds.yMin - collisions[ index ].yMax ) < 1 ) {
          controls.getObject().position.y = lastSafePosition.y;
          return true;
        }

        // Slide the player horizontally or vertically
        if ( collisions[index].isHorizontal ) {
          controls.getObject().position.z = lastSafePosition.z;
        } else {
          controls.getObject().position.x = lastSafePosition.x;
        }
        break
        
      }
    }
  }
  return false
}


export { detectCollisions, calculateCollisionPoints };
