import * as process from "process";

import { SDK } from "codechain-sdk";

import hello from "./commands/hello";
import { Tracer } from "./tracer";

async function asyncMain() {
  // console.log(process.argv);
  const [command, ...args] = process.argv.slice(2);

  const tracer = Tracer.load();

  const sdk = new SDK({
    server: "https://corgi-rpc.codechain.io",
    networkId: "wc",
  });

  switch (command) {
    case "hello":
      await hello(sdk, tracer, args);
      break;
    default:
      throw new Error(`Invalid command ${command}`);
  }
  tracer.save();
}

asyncMain().catch(e => {
  console.error(e);
});
