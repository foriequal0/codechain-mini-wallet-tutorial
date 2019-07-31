import { SDK } from "codechain-sdk";
import { Block, PlatformAddress, U64 } from "codechain-sdk/lib/core/classes";

import { sleep } from "../util";

export default async function watch(sdk: SDK, args: string[]) {
  let from: number;
  if (args.length > 0) {
    from = parseInt(args[0], 10);
    if (isNaN(from)) {
      throw new Error("Invalid block number");
    }
  } else {
    from = await sdk.rpc.chain.getBestBlockNumber();
  }

  for (let blockNumber = from; ; blockNumber++) {
    const block = await eventallyGetBlock(sdk, blockNumber);
    console.group("Block", blockNumber, block.hash.toString());

    for (const tx of block.transactions) {
      if (tx.unsigned.type() === "pay") {
        const sender = tx.getSignerAddress({ networkId: sdk.networkId });
        const {
          receiver,
          quantity,
        }: { receiver: PlatformAddress; quantity: U64 } = tx.unsigned as any;

        console.group("Transaction", "pay", tx.hash().toString());
        console.log("Sender:", sender.toString());
        console.log("Receiver:", receiver.toString());
        console.log("Quantity:", quantity.toLocaleString());
        console.groupEnd();
      } else {
        console.log("Transaction", tx.unsigned.type(), tx.hash().toString());
      }
    }
    console.groupEnd();
  }
}

async function eventallyGetBlock(
  sdk: SDK,
  blockNumber: number,
): Promise<Block> {
  while (true) {
    const block = await sdk.rpc.chain.getBlock(blockNumber);
    if (block !== null) {
      return block;
    }
    await sleep(2000);
  }
}
