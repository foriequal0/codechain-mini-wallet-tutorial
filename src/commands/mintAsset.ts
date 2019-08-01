import { SDK } from "codechain-sdk";

import { Tracer } from "../tracer";

export default async function mintAsset(
  sdk: SDK,
  tracer: Tracer,
  args: string[],
) {
    const { platform, asset } = tracer.getAccounts();
    const name = args[0];
    const supply = parseInt(args[1], 10);
    const description = args[2];
    const cheetos = await sdk.core.createAssetScheme({
        shardId: 0,
        metadata: {
            name,
            description,
        },
        supply,
    });
    const assetMintTx = sdk.core.createMintAssetTransaction({
        scheme: cheetos,
        recipient: asset,
    });
    const signedTx = await sdk.key.signTransaction(assetMintTx, {
        account: platform,
        fee: 123_456,
        seq: await sdk.rpc.chain.getSeq(platform),
    });

    const txHash = await sdk.rpc.chain.sendSignedTransaction(signedTx);

    console.log("Mint Asset:", txHash.toString());
}
