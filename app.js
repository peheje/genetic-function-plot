// Peter Helstrup Jensen https://github.com/peheje

const ui = require('./ui');
const rd = require('./readDOM'), ge = rd.getElement, gi = rd.getInput, gin = rd.getInputNumber, gij = rd.getInputJson, si = rd.setInput;
const gen = require('./genetics_poly');
const random = require('./random');

const PR_MUTATE = 0.25;         // Chance one coefficient-set genetics_poly.mutates 1 of its coefficients
const MUTATE_DAMPER = 20;        // How much mutation allowed in either direction, but it is decreased with best error
const MAX_CROSSOVER = 0.1;      // In crossing over, how much potential mix is a son of also his mother.  
const POOL_REDUCTION = 0.005;
const MAX_POOL_REDUCTION = 0.5;

/*const CORRECT = [1, 1, 1];
const DATA = [[-2.64, 5.35], [-2.16, 3.51], [-1.61, 1.98], [-0.9, 0.91], [-0.13, 0.88], [0.28, 1.36], [0.84, 2.55], [1.46, 4.62]];
const ORDER = 2;*/

/*const CORRECT = [-2.6, 8.1, 6.9, 1.3]; -2.6+8.1*x+6.9*x^2+1.3*x^3
const DATA = [[-3.73, -4.29], [-3.3, -0.89], [-2.78, 0.28], [-1.81, -2.35], [-0.45, -4.96], [0.6, 5.11]];
const ORDER = 3;*/

const ORIG_POOL_SIZE = gin("poolsize");
console.log("ORIG_POOL_SIZE", ORIG_POOL_SIZE);
ui.activate(initLoop, mainLoop);

function initLoop({ order: N, poolsize: PS, minguess: min, maxguess: max }) {
  let pool = [];
  for (let i = 0; i < PS; i++) {
    pool.push(gen.seed(N + 1, min, max));
  }
  return pool;
}

function mainLoop(i, order, data, pool) {
  setTimeout(() => {
    let best = gen.findBest(pool, data).slice();

    if (i % gin("updrate") === 0) {
      ui.draw(best, i);
    }
    if (i % 2 === 0) {
      let stop = ge("stop");
      if (stop.checked) {
        stop.checked = false;
        return;
      }
    }

    let newPool = [];

    newPool.push(best);
    const movingMutate = (10 / gen.fitness(best, data)) / MUTATE_DAMPER;

    while (newPool.length < pool.length * (1 - POOL_REDUCTION) || newPool.length < ORIG_POOL_SIZE * MAX_POOL_REDUCTION) {
      let parents = gen.resampleTwo(pool, data);
      let p1 = parents[0].slice(); // Remember to slice / cpy, as we want to be able to re-sample original values
      let p2 = parents[1].slice();

      let children = gen.crossover(p1, p2);
      let c1 = children[0];
      let c2 = children[1];
      if (Math.random() < PR_MUTATE) {
        c1 = gen.mutate(c1, movingMutate);
      }
      if (Math.random() < PR_MUTATE) {
        c2 = gen.mutate(c2, movingMutate);
      }
      newPool.push(c1, c2);
    }
    pool = newPool;

    // Call loop again
    if (--i) {
      mainLoop(i, order, data, pool);
    }
  }, 0);
}