import * as THREE from 'three';

/**
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @return {THREE.Mesh}
 */
function Coin(x, y) {
  // Create a new mesh with coin geometry and material
  let geometry = new THREE.BoxGeometry(1, 1, 1);
  let material = new THREE.MeshBasicMaterial({ 
    color: 0xeeeeee ,
  });
  let coin = new THREE.Mesh(geometry, material);
  coin.position.set(x+1/2, 5, y+1/2);
  coin.name = 'coin';
  return coin;
}

function Powerup(x, y) {
    // Create a new mesh with powerup geometry and material
    let geometry = new THREE.SphereGeometry(2, 8, 8);
    let material = new THREE.MeshBasicMaterial({
        color: 0xffa8b7,
    });
    let powerup = new THREE.Mesh(geometry, material);
    powerup.position.set(x+1/2, 5, y+1/2);
    powerup.name = 'powerup';
    return powerup;
}


export { Coin, Powerup };