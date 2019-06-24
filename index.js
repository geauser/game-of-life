class Game {

  constructor() {

    this.canvas = document.getElementById('grid-of-existence');
    this.ctx    = this.canvas.getContext('2d');

    this.cellSize = 2;
    this.planeOfExistence = [];

    this.isRunning = false;
  }

  /**
   * Modify the size of the canvas to have
   * the maximum even dimensions.
   *
   * @param {Number} width
   * @param {Number} height
   */
  initiliazeCanvasSize(width, height) {
    this.canvas.width  = width  - (width % 2);
    this.canvas.height = height - (height % 2);
  }

  /**
   * Launch listeners.
   */
  initialiazeListeners() {
    const { innerWidth, innerHeight } = window;

    window.addEventListener('resize', this.initiliazeCanvasSize.bind(this, innerWidth, innerHeight));

    this.canvas.addEventListener('click', this.toggleCellOnClick.bind(this));
  }

  initiliazePlaneOfExistence() {
    const { width, height } = this.canvas;

    this.numberOfCol = (width  / this.cellSize);
    this.numberOfRow = (height / this.cellSize);

    for (let c = 0; c < this.numberOfCol; c++) {

      this.planeOfExistence[c] = [];

      for (let r = 0; r < this.numberOfRow; r++) {

        this.planeOfExistence[c][r] = {
          x: c * this.cellSize,
          y: r * this.cellSize,
          c,
          r,
          alive: !!Math.round(Math.random()),
          // alive: false,
        };

      }

    }
  }

  initiliazeGame() {
    this.initiliazeCanvasSize(window.innerWidth, window.innerHeight);
    this.initiliazePlaneOfExistence();
    this.initialiazeListeners();
  }

  getCellAt(c, r) {
    const ec = c < 0 ? 0 : c > this.numberOfCol - 1 ? this.numberOfCol - 1 : c;
    const er = r < 0 ? 0 : r > this.numberOfRow - 1 ? this.numberOfRow - 1 : r;

    try {

      return this.planeOfExistence[ec][er];

    } catch (err) {
      // console.log('ec', ec, 'er', er);
    }
  }

  findCellAliveNeighboors(cell) {

    const { c, r } = cell;

    return [
      this.getCellAt(c - 1, r - 1),
      this.getCellAt(c, r - 1),
      this.getCellAt(c + 1, r - 1),
      this.getCellAt(c - 1, r),
      this.getCellAt(c + 1, r),
      this.getCellAt(c - 1, r + 1),
      this.getCellAt(c, r + 1),
      this.getCellAt(c + 1, r + 1),
    ].filter((cell) => {
      return (cell || {}).alive
    });

  }

  toggleCellOnClick(event) {
    const { x, y } = event;

    const c = Math.trunc(x / this.cellSize);
    const r = Math.trunc(y / this.cellSize);

    const cell = this.getCellAt(c, r);

    cell.alive = !cell.alive;

    console.log(this.findCellAliveNeighboors(cell));
  }

  parseCells(callback) {
    for (let c = 0; c < this.numberOfCol; c++) {
      for (let r = 0; r < this.numberOfRow; r++) {
        callback(this.planeOfExistence[c][r], this.planeOfExistence);
      }
    }
  }

  executeLife() {

    const cellsDying  = [];
    const cellsLiving = [];

    this.parseCells((cell) => {

      const aliveCellNeighboors = this.findCellAliveNeighboors(cell);

      if (!cell.alive && aliveCellNeighboors.length === 3) {
        cellsLiving.push(cell);
        return;
      }

      if (cell.alive && (aliveCellNeighboors.length === 2 || aliveCellNeighboors.length === 3)) {
        return;
      } else {
        cellsDying.push(cell);
        return;
      }

    });

    cellsLiving.forEach((cell) => {
      this.planeOfExistence[cell.c][cell.r].alive = true;
    });

    cellsDying.forEach((cell) => {
      this.planeOfExistence[cell.c][cell.r].alive = false;
    });

  }

  renderLoop() {

    setInterval(() => {
      this.renderPlaneOfExistence();
    }, 1000 / 30);  // For 30fps

  }

  lifeLoop() {
    setInterval(() => {
      this.executeLife();
    }, 200);
  }

  renderPlaneOfExistence() {

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.parseCells((cell) => {

      const { x, y, alive } = cell

      if (alive) {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
      }


    });

  }

}

const game = new Game();
game.initiliazeGame();
game.renderLoop();
