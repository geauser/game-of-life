class Game {

  constructor() {

    this.canvas = document.getElementById('canvas');
    this.ctx    = this.canvas.getContext('2d');

    this.planeOfExistence = [];

    // The number of columns and rows in the plane of existence.
    this.cols = 0;
    this.rows = 0;

    // 2px size for the cell
    this.cellSize = 4;
    this.aliveCellsTotal = 0;

    this.runLife      = false;
    this.runRendering = false;

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    this.initializeCanvasSize();
    this.initializePlaneOfExistence();
    this.initializeVirtualDom();
    this.initializeReactiveDom();
    this.initializeListeners();

    console.log(`${this.cols}x${this.rows} plane of existence`);
    console.log(`${this.cols * this.rows} cells`);
  }

  /**
   * Get the corresponding cell at the
   * given column `c` and row `r` number.
   *
   * @param {Number} col
   * @param {Number} row
   * @returns {Object}
   */
  getCellAt(col, row) {

    const safeCol = col < 0 ? 0 : col > (this.cols - 1) ? this.cols - 1 : col;
    const safeRow = row < 0 ? 0 : row > (this.rows - 1) ? this.rows - 1 : row;

    return this.planeOfExistence[safeCol][safeRow];
  }

  /**
   * Find all the cells that are alive around
   * a given cell.
   *
   * @param {Object} cell
   * @return {Object[]}
   */
  getAliveNeighboors(cell) {

    const { col, row } = cell;
    const neighboors   = [];
    const positions    = [
      { col: col - 1, row: row - 1 }, // top left
      { col: col    , row: row - 1 }, // top
      { col: col + 1, row: row - 1 }, // top right
      { col: col - 1, row: row     }, // left
      { col: col + 1, row: row     }, // right
      { col: col - 1, row: row + 1 }, // bottom left
      { col: col    , row: row + 1 }, // bottom
      { col: col + 1, row: row + 1 }, // bottom right
    ];

    for (let i = 0; i < positions.length; i++) {

      try {

        const pos       = positions[i];
        const neighboor = this.getCellAt(pos.col, pos.row);

        if (neighboor.isAlive) { neighboors.push(neighboor); }

      } catch (err) {
        this.runLife = false;
        this.runRendering = false;
      }

    }

    return neighboors;
  }

  /**
   * Brings to life or kill the cell on which we
   * clicked.
   *
   * @param {Number} x
   * @param {Number} y
   */
  toggleCell(x, y) {

    /**
     * @todo Explain this
     */
    const col = Math.trunc(x / this.cellSize);
    const row = Math.trunc((y - 22) / this.cellSize);

    const cell = this.getCellAt(col, row);
    cell.isAlive = !cell.isAlive;
  }

  /**
   * Modify the size of the canvas to have
   * the maximum even dimensions.
   */
  initializeCanvasSize() {

    const { innerWidth, innerHeight } = window;

    this.canvas.width  = innerWidth  - (innerWidth % 2);
    this.canvas.height = innerHeight - (innerHeight % 2) - 22;
  }

  /**
   * Initialize the listeners.
   */
  initializeListeners() {
    window.addEventListener('resize', this.initializeCanvasSize.bind(this));
    this.canvas.addEventListener('click', (event) => {
      event.stopPropagation();
      const { x, y } = event;
      this.toggleCell(x, y);
    });
    document.addEventListener('keypress', this.shortcutHandler.bind(this));
  }

  /**
   * Initialize the content of the plane of existence
   * and the variable linked to it.
   *
   * @param {Boolean} random
   */
  initializePlaneOfExistence(random = false) {

    const { width, height } = this.canvas;

    this.cols = Math.round(width  / this.cellSize);
    this.rows = Math.round(height / this.cellSize);

    for (let col = 0; col < this.cols; col++) {

      this.planeOfExistence[col] = [];

      for (let row = 0; row < this.rows; row++) {

        const cell = {

          /**
           * `x` and `y` are the on screen coordonitates
           * of the cell.
           */
          x: col * this.cellSize,
          y: row * this.cellSize,

          col,
          row,

          isAlive: random ? !!Math.round(Math.random()) : false,

          epoch: 0,
        };

        this.planeOfExistence[col][row] = cell;

        if (cell.isAlive) this.state.aliveCellsTotal++;

      }

    }

  }

  /**
   * Remove all the cells from the plane of existence.
   */
  resetPlaneOfExistence() {
    this.planeOfExistence = [];
    this.initializePlaneOfExistence();
    this.resetState();
  }

  resetState() {
    this.state.aliveCellsTotal = 0;
    this.state.currentEpoch = 0;
  }

  /**
   * Retrieve and assign to `dom` attribute all the
   * DOM that that will be manipulated.
   */
  initializeVirtualDom() {
    this.dom = {
      cellsAmount:  document.querySelector('.cells-amount'),
      currentEpoch: document.querySelector('.epochs-amount'),
      runningState: document.querySelector('.running-state'),
    };
  }

  /**
   * Initialiaze the reactive DOM system that will change
   * dynamically the HTML values when modified.
   */
  initializeReactiveDom() {

    const that = this;

    this.privateState = {
      aliveCellsTotal: 0,
      currentEpoch: 0,
      isPaused: true,
    };

    this.state = {

      get aliveCellsTotal() {
        return that.privateState.aliveCellsTotal;
      },

      set aliveCellsTotal(val) {
        that.privateState.aliveCellsTotal = val;
        that.dom.cellsAmount.innerHTML = val;
      },

      get currentEpoch() {
        return that.privateState.currentEpoch;
      },

      set currentEpoch(val) {
        that.privateState.currentEpoch = val;
        that.dom.currentEpoch.innerHTML = val;
      },

      get isPaused() {
        return that.privateState.isPaused;
      },

      set isPaused(val) {
        that.privateState.isPaused = val;

        if (val) {
          console.log('here 1');
          that.dom.currentRunningState.classList.add('is-paused');
          that.dom.currentRunningState.classList.remove('is-playing');
        } else {
          console.log('here 2');
          that.dom.currentRunningState.classList.remove('is-paused');
          that.dom.currentRunningState.classList.add('is-playing');
        }

      }

    };

  }

  /**
   * Handle keyboard shortcuts
   *
   * @param {Object} event
   */
  shortcutHandler(event) {

    const { keyCode } = event;

    switch (keyCode) {

      // space bar
      case 32:
        this.toggleSimulation();
        this.state.isPaused = !this.state.isPaused;
        break;

      case 114:
        this.resetState();
        this.initializePlaneOfExistence(true);
        break;

      case 99:
        this.resetPlaneOfExistence();
        break;

    }

  }

  /**
   * Render all the cells that changed status.
   */
  render() {

    const { width, height } = this.canvas;

    this.ctx.clearRect(0, 0, width, height);

    for (let col = 0; col < this.cols; col++) {

      for (let row = 0; row < this.rows; row++) {

        const cell = this.planeOfExistence[col][row];

        if (cell.isAlive) {
          this.ctx.fillStyle = 'white';
          this.ctx.fillRect(cell.x, cell.y, this.cellSize, this.cellSize);
        }

      }

    }

  }

  /**
   * Run the game of life rules to kill or ressucitate
   * cells.
   */
  live() {

    const cellsDying  = [];
    const cellsLiving = [];
    let aliveCellsTotal = 0;

    for (let col = 0; col < this.cols; col++) {

      for (let row = 0; row < this.rows; row++) {

        const cell = this.planeOfExistence[col][row];
        const aliveNeighboors = this.getAliveNeighboors(cell);

        if (cell.isAlive) aliveCellsTotal++;

        if (!cell.isAlive && aliveNeighboors.length === 3) {
          cellsLiving.push(cell);
        }

        if (cell.isAlive && (aliveNeighboors.length === 2 || aliveNeighboors.length === 3)) {
          cellsLiving.push(cell);
        } else {
          cellsDying.push(cell);
        }
      }

    }

    for (let i = 0; i < cellsDying.length; i++) {
      const { col, row } = cellsDying[i];
      const dyingCell = this.getCellAt(col, row);
      dyingCell.isAlive = false;
      dyingCell.epoch = 0;
    }

    for (let i = 0; i < cellsLiving.length; i++) {
      const { col, row } = cellsLiving[i];
      this.getCellAt(col, row).isAlive = true;
    }

    this.state.currentEpoch++;
    this.state.aliveCellsTotal = aliveCellsTotal;
  }

  /**
   * Rendering cycling
   */
  lifeLoop() {
    setInterval(() => {
      if (this.runLife) {
        this.live();
      }
    }, 100);
  }

  /**
   * Rendering cycling
   */
  renderingLoop() {
    setInterval(() => {
      if (this.runRendering) {
        this.render();
      }
    }, 1000 / 30);
  }

  /**
   * Run the simulation rendering loop
   * and life loop
   */
  run() {
    this.runRendering = true;

    this.lifeLoop();
    this.renderingLoop();
  }

  /**
   * Stop/Start the simulation.
   */
  toggleSimulation() {
    this.runLife = !this.runLife;
  }

}

const game = new Game();
game.run();
