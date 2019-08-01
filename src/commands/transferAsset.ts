import { H256, AssetAddress } from "codechain-primitives/lib";
import { SDK } from "codechain-sdk";

import { Tracer } from "../tracer";

export default async function transferAsset(
  sdk: SDK,
  tracer: Tracer,
  args: string[],
) {
  const { platform, asset: myAssetAddress } = tracer.getAccounts();
  const tracker = H256.ensure(args[0]);
  const index = parseInt(args[1], 10);
  const recipient = AssetAddress.ensure(args[2]);
  const quantity = parseInt(args[3], 10);

  const asset = await sdk.rpc.chain.getAsset(tracker, index, 0);
  if (asset === null) {
    throw new Error("Asset does not exist");
  }

  const trasferTx = sdk.core
    .createTransferAssetTransaction()
    .addInputs(asset)
    .addOutputs(
      {
        recipient: myAssetAddress,
        assetType: asset.assetType,
        quantity: asset.quantity.minus(quantity),
        shardId: 0,
      },
      {
        recipient,
        assetType: asset.assetType,
        quantity,
        shardId: 0,
      },
    );

  await sdk.key.signTransactionInput(trasferTx, 0);
  const signedTx = await sdk.key.signTransaction(trasferTx, {
    account: platform,
    fee: 1234,
    seq: await sdk.rpc.chain.getSeq(platform),
  });

  const txHash = await sdk.rpc.chain.sendSignedTransaction(signedTx);

  console.log("TransferAsset:", txHash.toString());
}
