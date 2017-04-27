const gulp = require("gulp");
const exec = require('child_process').exec;

let run = false;

gulp.task("watch", () => {
  console.log("watching ..");
  gulp.watch("**/*.js", ["browserify"]);
});

gulp.task("browserify", () => {
  if (run) { return; }
  run = true;
  console.log("calling browserify");
  exec("browserify app.js -o bundle.js");
  setTimeout(() => {
    run = false;
  }, 2000);
});