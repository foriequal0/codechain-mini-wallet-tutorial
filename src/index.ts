import * as process from "process";

import { SDK } from "codechain-sdk";

import account from "./commands/account";
import hello from "./commands/hello";
import init from "./commands/init";
import mintAsset from "./commands/mintAsset";
import sendCCC from "./commands/sendCCC";
import watch from "./commands/watch";
import { Tracer } from "./tracer";

async function asyncMain() {
  // console.log(process.argv);
  const [command, ...args] = process.argv.slice(2);

  const tracer = Tracer.load();

  const sdk = new SDK({
    server: "https://corgi-rpc.codechain.io",
    networkId: "wc",
    keyStoreType: {
      type: "local",
      path: "./keystore.db",
    },
  });

  switch (command) {
    case "hello":
      await hello(sdk, tracer, args);
      break;
    case "init":
      await init(sdk, tracer);
      break;
    case "account":
      await account(sdk, tracer, args);
      break;
    case "sendCCC":
      await sendCCC(sdk, tracer, args);
      break;
    case "watch":
      await watch(sdk, tracer, args);
      break;
    case "mintAsset":
      await mintAsset(sdk, tracer, args);
      break;
    default:
      throw new Error(`Invalid command ${command}`);
  }
  tracer.save();
}

asyncMain().catch(e => {
  console.error(e);
});
