import { PlatformAddress } from "codechain-primitives/lib";
import { SDK } from "codechain-sdk";

import { Tracer } from "../tracer";

export default async function account(
  sdk: SDK,
  tracer: Tracer,
  args: string[],
) {
  if (args.length === 0) {
    const platform = tracer.getAccounts().platform;
    const ccc = await sdk.rpc.chain.getBalance(platform);

    console.log("Your platform address:", platform.toString());
    console.log("Balance:", ccc.toLocaleString(), "CCC");
  } else {
    const platform = PlatformAddress.ensure(args[0]);
    const ccc = await sdk.rpc.chain.getBalance(platform);

    console.log("Platform address:", platform.toString());
    console.log("Balance:", ccc.toLocaleString(), "CCC");
  }
}
