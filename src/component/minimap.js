import * as THREE from 'three';

class Minimap {
  constructor(objects, direction) {
    this.objects = objects;
    this.direction = direction;

    // Create the minimap in canvas
    this.canvas = document.getElementById('minimap');
    this.canvas.width = 256;
    this.canvas.height = 256;
    this.ctx = this.canvas.getContext('2d');
    
  }

  update() {
    let px = this.direction.x
    let pz = this.direction.z
    let zoom = 0.5
    for (let obj of this.objects) {
      let col = obj.bounds
      let x1 = (col.xMin - px) * zoom + this.canvas.width / 2
      let z1 = (col.zMin - pz) * zoom + this.canvas.height / 2
      let w = (col.xMax - col.xMin) * zoom
      let h = (col.zMax - col.zMin) * zoom

      this.ctx.fillStyle = '#FF0000';
      this.ctx.fillRect(x1, z1, w, h);
    }

  }

}

export default Minimap;