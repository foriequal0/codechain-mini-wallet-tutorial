import { SDK } from "codechain-sdk";

import { Tracer } from "../tracer";

export default async function init(sdk: SDK, tracer: Tracer) {
  let addresses = tracer.state.addresses;
  if (addresses === undefined) {
    const platform = await sdk.key.createPlatformAddress();
    const asset = await sdk.key.createAssetAddress();
    addresses = { platform, asset };
    tracer.state.addresses = addresses;

    console.log("Created new accounts.");
  }

  console.log("Platform address:", addresses.platform.toString());
  console.log("Asset address:", addresses.asset.toString());
}
