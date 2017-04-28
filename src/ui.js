const rd = require('./readDOM'), gi = rd.getInput, gin = rd.getInputNumber, gij = rd.getInputJson, si = rd.setInput;

const gen = require('./genetics_poly');
const random = require('./random');

let mouseDown = false;
let mouseCursor = { x: null, y: null };
let mouseInGraph = false;

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

  // Click listeners
  document.body.onmousedown = function () {

    function round(x, dec) {
      return Number(x.toFixed(dec));
    }

    console.log("mouse down");
    if (!mouseInGraph || mouseCursor.x === null || mouseCursor.y === null) return;
    let data = gij("data") || [];
    data.push([round(mouseCursor.x, 2), round(mouseCursor.y, 2)]);
    si("data", JSON.stringify(data));
  }
}

function draw(best, i, errSq) {
  if (typeof document == "undefined") {
    return;
  }
  let eq = gen.coefficientsToEquation(best);
  si("eq1", eq);
  si("counter", i);
  si("sqerr", errSq);

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
    instance.on("mouseover", () => {
      console.log("mouseover");
      mouseInGraph = true;
    });
    instance.on("mouseout", () => {
      console.log("mouseout");
      mouseInGraph = false;
    });
    instance.on("mousemove", pos => {
      mouseCursor = pos;
    });
  }
  catch (err) {
    console.log(err);
    alert(err);
  }
}

exports.draw = draw;
exports.activate = activate;