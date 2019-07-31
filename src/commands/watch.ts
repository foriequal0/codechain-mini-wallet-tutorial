import { SDK } from "codechain-sdk";
import { Block } from "codechain-sdk/lib/core/classes";

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
      console.log("Transaction", tx.unsigned.type(), tx.hash().toString());
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
