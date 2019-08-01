import { PlatformAddress, U64 } from "codechain-primitives/lib";
import { SDK } from "codechain-sdk";

import { Tracer } from "../tracer";

export default async function sendCCC(
  sdk: SDK,
  tracer: Tracer,
  args: string[],
) {
  const { platform } = tracer.getAccounts();

  const recipient = PlatformAddress.ensure(args[0]);
  const quantity = U64.ensure(args[1]);

  const payTx = sdk.core.createPayTransaction({
    recipient,
    quantity,
  });

  const signedTx = await sdk.key.signTransaction(payTx, {
    account: platform,
    fee: 123,
    seq: await sdk.rpc.chain.getSeq(platform),
  });

  const txHash = await sdk.rpc.chain.sendSignedTransaction(signedTx);

  console.log("Pay:", txHash.toString());
}
