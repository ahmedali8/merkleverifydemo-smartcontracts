const { program } = require("commander");
const fs = require("fs");
const { parseAccountMap } = require("./parse-account-map");

program
  .version("0.0.0")
  .requiredOption(
    "-i, --input <path>",
    "input JSON file location containing a map of account addresses to string balances"
  );

program.parse(process.argv);

const json = JSON.parse(fs.readFileSync(program.input, { encoding: "utf8" }));

if (typeof json !== "object") throw new Error("Invalid JSON");

const data = JSON.stringify(parseAccountMap(json), null, 2);

console.log(data);
write("/generated", data);

function write(buildDir, data) {
  buildDir = `${process.cwd()}/${buildDir}`;
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
  fs.writeFileSync(`${buildDir}/data.json`, data);
}
