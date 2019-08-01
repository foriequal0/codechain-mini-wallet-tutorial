import { SDK } from "codechain-sdk";
import {
  AssetAddress,
  Block,
  H160,
  MintAsset,
  PlatformAddress,
  U64,
  Asset,
} from "codechain-sdk/lib/core/classes";

import { P2PKH } from "codechain-sdk/lib/key/P2PKH";
import { Tracer } from "../tracer";
import { sleep } from "../util";

export default async function watch(sdk: SDK, tracer: Tracer, args: string[]) {
  const { platform, asset: myAssetAddress } = tracer.getAccounts();

  let from: number;
  if (args.length > 0) {
    from = parseInt(args[0], 10);
    if (isNaN(from)) {
      throw new Error("Invalid block number");
    }
  } else if (tracer.state.lastWatch === undefined) {
    from = await sdk.rpc.chain.getBestBlockNumber();
  } else {
    from = tracer.state.lastWatch + 1;
  }

  for (let blockNumber = from; ; blockNumber++) {
    const block = await eventallyGetBlock(sdk, blockNumber);
    console.group("Block", blockNumber, block.hash.toString());

    for (const tx of block.transactions) {
      const sender = tx.getSignerAddress({ networkId: sdk.networkId });
      if (sender.toString() === platform.toString()) {
        tracer.state.payLogs.push({
          type: "fee",
          quantity: tx.unsigned.fee()!,
          txHash: tx.hash(),
        });
      }

      if (tx.unsigned.type() === "pay") {
        const {
          receiver,
          quantity,
        }: { receiver: PlatformAddress; quantity: U64 } = tx.unsigned as any;

        if (sender.toString() === platform.toString()) {
          console.log("Pay transaction from me");
          tracer.state.payLogs.push({
            type: "send",
            receiver,
            quantity,
            txHash: tx.hash(),
          });
        }
        if (receiver.toString() === platform.toString()) {
          console.log("Pay transaction to me");
          tracer.state.payLogs.push({
            type: "receive",
            sender,
            quantity,
            txHash: tx.hash(),
          });
        }
        console.group("Transaction", "pay", tx.hash().toString());
        console.log("Sender:", sender.toString());
        console.log("Receiver:", receiver.toString());
        console.log("Quantity:", quantity.toLocaleString());
        console.groupEnd();
      } else if (tx.unsigned.type() === "mintAsset") {
        const unsigned = tx.unsigned as MintAsset;
        const asset = unsigned.getMintedAsset();
        if (isAssetMine(sdk, asset, myAssetAddress)) {
          console.log("MintAsset by me");
          tracer.state.assets.push(asset);
        }
        console.group("Transaction", "mintAsset", tx.hash().toString());
        console.log(
          "Tracker:",
          asset.outPoint.tracker.toString(),
          asset.outPoint.index,
        );
        console.log("AssetType:", asset.assetType.toString());
        console.log("Quantity:", asset.quantity.toLocaleString());
        console.groupEnd();
      } else {
        console.log("Transaction", tx.unsigned.type(), tx.hash().toString());
      }
    }
    console.groupEnd();

    tracer.state.lastWatch = blockNumber;
    tracer.save();
  }
}

function isAssetMine(sdk: SDK, asset: Asset, myAssetAddress: AssetAddress) {
  const assetJSON = asset.toJSON();
  if (
    asset.lockScriptHash.toString() === P2PKH.getLockScriptHash().toString() &&
    assetJSON.parameters.length === 1 &&
    H160.check(assetJSON.parameters[0])
  ) {
    const assetAddress = AssetAddress.fromTypeAndPayload(
      1,
      H160.ensure(assetJSON.parameters[0]),
      { networkId: sdk.networkId },
    );
    if (assetAddress.toString() === myAssetAddress.toString()) {
      return true;
    }
  }
  return false;
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
