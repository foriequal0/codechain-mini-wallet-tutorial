import * as process from "process";

import hello from "./commands/hello";
import { Tracer } from "./tracer";

// console.log(process.argv);
const [command, ...args] = process.argv.slice(2);

const tracer = Tracer.load();
switch (command) {
  case "hello":
    hello(tracer, args);
    break;
  default:
    throw new Error(`Invalid command ${command}`);
}
tracer.save();
