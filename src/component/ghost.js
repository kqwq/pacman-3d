import * as THREE from 'three';

import waypoints from '../asset/waypoints.json';


function Ghost(x, z, color, geometry, txtMatcap) {

  var ghostMaterial = new THREE.MeshMatcapMaterial({
    color: color,
    matcap: txtMatcap,
  })


  let ghost = new THREE.Mesh(geometry, ghostMaterial);
  ghost.name = 'ghost';
  ghost.size = 0.27
  ghost.scale.set(ghost.size, ghost.size, ghost.size); // scale down by 25%
  ghost.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  

  ghost.position.set(x, 6, z);

  // init
  ghost.init = function () {
    this.prevWaypoint = null
    this.nextWaypoint = waypoints[23 + Math.floor(Math.random() * 2)]
    this.speed = 36;
    console.log(this)
  }
  ghost.init()

  // update
  ghost.update = function (delta) {
    let gotoX = this.nextWaypoint.x
    let gotoZ = this.nextWaypoint.y
    let distance = Math.sqrt(Math.pow(gotoX - this.position.x, 2) + Math.pow(gotoZ - this.position.z, 2))
    if (distance < 1) {
      let possibleNextWaypoints = this.nextWaypoint.dir.filter(dir => dir !== this.prevWaypoint?.id)
      this.prevWaypoint = this.nextWaypoint
      let nextId
      if (possibleNextWaypoints.length > 0) {
        nextId = possibleNextWaypoints[Math.floor(Math.random() * possibleNextWaypoints.length)]
      } else {
        nextId = this.nextWaypoint.dir[0]
      }
      this.nextWaypoint = waypoints[nextId]

      // adjust the ghost's direction (rotation)
      this.rotation.z = Math.PI / 2 - Math.atan2(this.nextWaypoint.y - this.position.z, this.nextWaypoint.x - this.position.x)
    }
    let direction = new THREE.Vector3(gotoX - this.position.x, 0, gotoZ - this.position.z)
    direction.normalize()
    direction.multiplyScalar(this.speed * delta)
    this.position.add(direction)



    
  }
  return ghost;

}

export { Ghost };