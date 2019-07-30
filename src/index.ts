import * as process from "process";

import hello from "./commands/hello";

// console.log(process.argv);
const [command, ...args] = process.argv.slice(2);

switch (command) {
  case "hello":
    hello(args);
    break;
  default:
    throw new Error(`Invalid command ${command}`);
}
