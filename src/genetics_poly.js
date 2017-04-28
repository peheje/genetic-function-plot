require("./extensions");
const bs = require("binary-search");
const random = require('./random');
const PD = require("probability-distributions");

function evalPolynomial(coefficients, x) {
  // "a0 + a1*x + a2*x^2 .. an*x^n" , coefficients go from a0, a1 ... an
  const terms = coefficients.length;
  let sum = 0;
  let p = 1;
  for (let i = 0; i < terms; i++) {
    sum += coefficients[i] * p;
    p *= x; // Multiply p with x, so it continually is x^1 .. x^2 .. x^3 etc. Faster than Math.pow, not as accurate.
    //sum += coefficients[i] * Math.pow(x, i);
  }
  return sum;
}

function seed(n, min, max) {
  let seeds = [];
  for (let i = 0; i < n; i++) {
    seeds.push(random.getRandomArbitrary(min, max));
  }
  return seeds;
}

function fitness(coefficients, data) {
  // data assumed to be [[x1, y1], [x2, y2] .. [xn, yn]]
  let sumSqErr = 0;
  for (let i = 0; i < data.length; i++) {
    const xy = data[i];
    sumSqErr += Math.pow(evalPolynomial(coefficients, xy[0]) - xy[1], 2);
  }
  return 1 / sumSqErr;
}

function mutate(coefficients, delta) {
  //const toMutate = random.getRandomInt(0, coefficients.length);
  // This beta distribution favors closer to only 1 mutation. 
  // http://statisticsblog.com/probability-distributions/#beta
  const toMutate = Math.floor(PD.rbeta(1, 1, 3)[0] * coefficients.length) + 1;
  //console.log("toMutate", toMutate);

  if (toMutate > 1) {
    // Only mutate a coefficient once
    let idxs = [];
    for (let i = 0; i < toMutate; i++) {
      let candidate = 0;
      do {
        candidate = random.getRandomInt(0, coefficients.length);
      } while (idxs.indexOf(candidate) !== -1);
      idxs.push(candidate);
    }
    for (let i = 0; i < idxs.length; i++) {
      const drift = random.getRandomArbitrary(-delta, delta);
      coefficients[idxs[i]] += drift;
    }
  } else {
    const drift = random.getRandomArbitrary(-delta, delta);
    const idx = random.getRandomInt(0, coefficients.length);
    coefficients[idx] += drift;
  }
  return coefficients;
}

function lerp(a, b, p) {
  return a + (b - a) * p;
}

function crossover2(mom, dad, rate = 0.1) {
  let son = [];
  let daughter = [];
  for (let i = 0; i < mom.length; i++) {
    son[i] = dad[i] * rate + mom[i] * (1 - rate);
    daughter[i] = mom[i] * rate + dad[i] * (1 - rate);
  }
  return [daughter, son];
}

function crossover(mom, dad, maxCrossover = 0.1) {
  let son = [].concat(dad);
  let daughter = [].concat(mom);

  for (let i = 0; i < son.length; i++) {
    const p1 = random.getRandomArbitrary(0, maxCrossover);
    const p2 = random.getRandomArbitrary(0, maxCrossover);
    son[i] = lerp(dad[i], mom[i], p1);
    daughter[i] = lerp(mom[i], dad[i], p2);
  }
  return [daughter, son];
}

function resampleTwo(coefficientSets, data) {
  const n = coefficientSets.length;
  const w = [];
  for (let i = 0; i < n; i++) {
    const fit = fitness(coefficientSets[i], data);
    w.push(fit);
  }

  // Binary resampling
  let wheel = [];
  let sum = 0;
  for (let i = 0; i < w.length; i++) {
    sum += w[i];
    wheel.push(sum);
  }

  let pair = [];
  for (let i = 0; i < 2; i++) {
    const r = random.getRandomArbitrary(0, sum);
    let idx = bs(wheel, r, (a, b) => a - b);
    if (idx < 0) {
      idx = -idx - 1;
    }
    pair.push(coefficientSets[idx]);
  }

  return pair;
}

function resampleTwo2(coefficientSets, data) {
  // E.g. a 2 order coefficientSets would look like [[9, 2, 3], [5, -1, 6] ...]
  const n = coefficientSets.length;
  const w = [];
  for (let i = 0; i < n; i++) {
    const fit = fitness(coefficientSets[i], data);
    w.push(fit);
  }

  // Beta resampling
  let pair = [];
  let index = random.getRandomInt(0, n);
  let beta = 0;
  let mw = w.reduce((a, b) => Math.max(a, b));
  for (let i = 0; i < 2; i++) {
    beta += Math.random() * 2 * mw;
    while (beta > w[index]) {
      beta -= w[index];
      index = (index + 1) % n;
    }
    pair.push(coefficientSets[index]);
  }

  return pair;
}

function findBest(pool, DATA) {
  let best_fit = -Number.MAX_VALUE;
  let best_idx = -1;
  for (let i = 0; i < pool.length; i++) {
    let fit = fitness(pool[i], DATA);
    if (fit > best_fit) {
      best_fit = fit;
      best_idx = i;
    }
  }
  return pool[best_idx];
}

function coefficientsToEquation(coefficients) {
  let str = "";
  for (let i = 0; i < coefficients.length; i++) {
    if (i === 0) {
      str += coefficients[i].toFixed(4);
    } else {
      if (coefficients[i] > 0) {
        str += "+";
      }
      str += coefficients[i].toFixed(4) + "*x^" + i;
    }
  }
  return str;
}

exports.evalPolynomial = evalPolynomial;
exports.seed = seed;
exports.fitness = fitness;
exports.mutate = mutate;
exports.crossover = crossover;
exports.resampleTwo = resampleTwo;
exports.findBest = findBest;
exports.coefficientsToEquation = coefficientsToEquation;