import { SDK } from "codechain-sdk";

import { Tracer } from "../tracer";

export default async function hello(sdk: SDK, tracer: Tracer, args: string[]) {
  console.log(`Hello, ${tracer.state.nickname}!`);
  if (args.length > 0) {
    console.log(`Your name has been changed to ${args[0]}`);
    tracer.state.nickname = args[0];
  }

  const bestBlockNumber = await sdk.rpc.chain.getBestBlockNumber();
  console.log("Best block number:", bestBlockNumber);
}
