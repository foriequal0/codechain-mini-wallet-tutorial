import { PlatformAddress } from "codechain-primitives/lib";
import { SDK } from "codechain-sdk";

import { Tracer } from "../tracer";

export default async function account(
  sdk: SDK,
  tracer: Tracer,
  args: string[],
) {
  if (args.length === 0) {
    const { platform, asset: assetAddress } = tracer.getAccounts();
    const ccc = await sdk.rpc.chain.getBalance(platform);

    console.log("Your platform address:", platform.toString());
    console.log("Balance:", ccc.toLocaleString(), "CCC");

    console.group("History");
    for (let i = tracer.state.payLogs.length - 1; i >= 0; i--) {
      const log = tracer.state.payLogs[i];

      if (log.type === "send") {
        console.group("Send:", "-", log.quantity.toLocaleString(), "CCC");
        console.log("Receiver:", log.receiver.toString());
        console.log("TxHash:", log.txHash.toString());
        console.groupEnd();
      } else if (log.type === "receive") {
        console.group("Receive:", "+", log.quantity.toLocaleString(), "CCC");
        console.log("Sender:", log.sender.toString());
        console.log("TxHash:", log.txHash.toString());
        console.groupEnd();
      } else {
        console.group("Fee:", "-", log.quantity.toLocaleString(), "CCC");
        console.log("TxHash:", log.txHash.toString());
        console.groupEnd();
      }
    }
    console.groupEnd();

    console.group("Your Asset address:", assetAddress.toString());
    for (const asset of tracer.state.assets) {
      console.group("AssetType:", asset.assetType.toString());
      console.log("Quantity:", asset.quantity.toLocaleString());
      console.log("Tracker:", asset.outPoint.tracker.toString());
      console.log("Index:", asset.outPoint.index);
      console.groupEnd();
    }
    console.groupEnd();
  } else {
    const platform = PlatformAddress.ensure(args[0]);
    const ccc = await sdk.rpc.chain.getBalance(platform);

    console.log("Platform address:", platform.toString());
    console.log("Balance:", ccc.toLocaleString(), "CCC");
  }
}
