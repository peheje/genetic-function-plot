// Peter Helstrup Jensen https://github.com/peheje

const ui = require('./ui');
const rd = require('./readDOM'), ge = rd.getElement, gi = rd.getInput, gin = rd.getInputNumber, gij = rd.getInputJson, si = rd.setInput;
const gen = require('./genetics_poly');
const random = require('./random');

const PR_MUTATE = 0.5;         // Chance one coefficient-set genetics_poly.mutates 1 of its coefficients
const MUTATE_INTENSITY = 0.4;        // How much mutation allowed in either direction, but it is decreased with best error
const MAX_CROSSOVER = 0.3;      // In crossing over, how much potential mix is a son of also his mother.  
const POOL_REDUCTION = 0.001;
const MAX_POOL_REDUCTION = 0.5;
const DELAY_MS = 0;

const ORIG_POOL_SIZE = gin("poolsize");
console.log("ORIG_POOL_SIZE", ORIG_POOL_SIZE);
ui.activate(initLoop, mainLoop);

function initLoop({ order: N, poolsize: PS, minguess: min, maxguess: max }) {
  console.time("run");
  let pool = [];
  for (let i = 0; i < PS; i++) {
    pool.push(gen.seed(N + 1, min, max));
  }
  return pool;
}

function mainLoop(i, order, data, pool) {
  setTimeout(() => {
    let best = gen.findBest(pool, data).slice();
    let bestFitness = gen.fitness(best, data);
    const movingMutate = Math.max(0.1, MUTATE_INTENSITY/bestFitness);

    if (i % gin("updrate") === 0) {
      //console.log("movingMutate", movingMutate);
      ui.draw(best, i, 1/bestFitness);  // 1/bestFitness is the error squared
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
    while (newPool.length < pool.length * (1 - POOL_REDUCTION) || newPool.length < ORIG_POOL_SIZE * MAX_POOL_REDUCTION) {
      let parents = gen.resampleTwo(pool, data);
      let p1 = parents[0];
      let p2 = parents[1];

      let children = gen.crossover(p1, p2, MAX_CROSSOVER);
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
    } else {
      console.timeEnd("run");
    }
  }, DELAY_MS);
}