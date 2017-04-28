const fs = require("fs");
const exec = require("child_process").exec;

console.log("Watching ..");
fs.watch("./src", (eventType, filename) => {
    console.log(eventType, filename);
    if (!filename.endsWith(".js")) return;
    exec("browserify src/app.js -o bundle.js", () => {
        console.log("done browserify");
    });
});