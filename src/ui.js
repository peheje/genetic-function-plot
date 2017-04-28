const rd = require('./readDOM'), gi = rd.getInput, gin = rd.getInputNumber, gij = rd.getInputJson, si = rd.setInput;

const gen = require('./genetics_poly');
const random = require('./random');

function activate(initLoop, mainLoop) {
  // Run listener
  document.getElementById("run").addEventListener("click", (e) => {
    const pool = initLoop({
      order: gin("order"),
      poolsize: gin("poolsize"),
      minguess: gin("minguess"),
      maxguess: gin("maxguess")
    });
    mainLoop(gin("iterations"),
      gin("order"),
      gij("data"),
      pool
    );
  });

  // Template listener
  function updateTemplate(e = null) {
    let t = gij("templates");
    let fx = t.fx;;
    let dp = t.dp;

    si("order", fx.length - 1);
    si("eq", gen.coefficientsToEquation(fx));
    si("data", JSON.stringify(dp));
  }
  updateTemplate();
  document.getElementById("templates").addEventListener("change", e => {
    updateTemplate();
  });
}

function draw(best, i) {
  if (typeof document == "undefined") {
    return;
  }
  let eq = gen.coefficientsToEquation(best);

  si("counter", i);
  si("eq1", eq);
  try {
    let instance = functionPlot({
      xAxis: {
        label: 'x - axis',
        domain: [-6, 2]
      },
      yAxis: {
        label: 'y - axis',
        domain: [-10, 10]
      },
      target: '#plot',
      data: [{
        fn: gi("eq"),
        sampler: 'builtIn',  // this will make function-plot use function the evaluator of math.js
        graphType: 'polyline'
      }, {
        fn: gi("eq1"),
        sampler: 'builtIn',  // this will make function-plot use the evaluator of math.js
        graphType: 'polyline'
      }, {
        fnType: "points",
        sampler: "builtIn",
        graphType: "scatter",
        points: JSON.parse(gi("data"))
      }]
    });
  }
  catch (err) {
    console.log(err);
    alert(err);
  }
}

exports.draw = draw;
exports.activate = activate;