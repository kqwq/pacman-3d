class Minimap {
  constructor(objects, controls) {
    this.objects = objects;
    this.controls = controls;

    // Create the minimap in canvas
    this.canvas = document.getElementById('minimap');
    let greater = Math.max(window.innerWidth, window.innerHeight)
    this.canvas.width = greater * 0.25;
    this.canvas.height = greater * 0.25;
    this.zoom = greater / 550;
    this.ctx = this.canvas.getContext('2d');

    this.followX = 0;
    this.followZ = 0;
    
    this.lastPx = 0
    this.lastPz = 0
    this.eatTime = 0
  }

  onResize() {
    
    let greater = Math.max(window.innerWidth, window.innerHeight)
    this.canvas.width = greater * 0.2;
    this.canvas.height = greater * 0.2;
    this.zoom = greater / 550;
  }

  X(x) {

    return(x - this.followX) * this.zoom + this.canvas.width / 2
  }
  Z(z) {

    return(z - this.followZ)  * this.zoom + this.canvas.height / 2
  }

  update(theta) {
    // Clear the canvas
    let ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let px = this.controls.getObject().position.x
    let pz = this.controls.getObject().position.z
    this.distanceTravelled = Math.sqrt(Math.pow(px - this.lastPx, 2) + Math.pow(pz - this.lastPz, 2))
    this.lastPx = px
    this.lastPz = pz
    this.followX = (px - this.followX) * 0.1 + this.followX;
    this.followZ = (pz - this.followZ) * 0.1 + this.followZ;
    for (let obj of this.objects) {
      let col = obj.bounds
      let x1 = this.X(col.xMin)
      let z1 = this.Z(col.zMin)
      let w = (col.xMax - col.xMin) * this.zoom
      let h = (col.zMax - col.zMin) * this.zoom

      ctx.fillStyle = obj.fillStyle
      ctx.fillRect(x1, z1, w, h)
    }

    // Draw the pac-man (player)
    let pmx = this.X(px)
    let pmz = this.Z(pz)
    ctx.beginPath();
    ctx.fillStyle = '#ffff00'
    ctx.moveTo(pmx, pmz)
    this.eatTime += this.distanceTravelled
    theta = (Math.PI/2 - theta)
    let nom = 0.5 + Math.sin(this.eatTime * 0.7) * Math.PI / 4
    ctx.arc(pmx, pmz, 4 * this.zoom, theta + nom , Math.PI * 2 + theta - nom, false)
    ctx.lineTo(pmx, pmz)
    ctx.fill()

  }

}

export default Minimap;