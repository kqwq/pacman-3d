import * as THREE from 'three';



function Ghost(x, z, color, geometry, txtMatcap) {

  var ghostMaterial = new THREE.MeshMatcapMaterial({
    color: color,
    matcap: txtMatcap,
  })


  let ghost = new THREE.Mesh(geometry, ghostMaterial);
  ghost.name = 'ghost';
  ghost.scale.set(0.25, 0.25, 0.25); // scale down by 25%
  ghost.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  

  ghost.position.set(x, 5, z);

  // init
  ghost.init = function () {
    this.gotoPosition = this.position.clone();
    this.speed = 16;
    this.mode = 'seek'; // seek, turn, move
  }
  ghost.init()

  // update
  ghost.update = function (delta) {
    //this.position.add(this.direction.clone().multiplyScalar(this.speed * delta));


    if (this.position.distanceTo(this.gotoPosition) < 0.1) {
      this.gotoPosition.x = Math.random() * 100
      this.gotoPosition.z = Math.random() * 100

    }
    
  }
  return ghost;

}

export { Ghost };