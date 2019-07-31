import * as fs from "fs";

import { AssetAddress, PlatformAddress } from "codechain-primitives/lib";

const SAVE_FILE = "./state.json";

export type State = {
  nickname: string;
  addresses?: {
    platform: PlatformAddress;
    asset: AssetAddress;
  };
};

export class Tracer {
  public state: State;

  private constructor(state: State) {
    this.state = state;
  }

  public static load(): Tracer {
    let obj: { [key in keyof State]?: any };
    try {
      const json = fs.readFileSync(SAVE_FILE, "utf-8");
      obj = JSON.parse(json);
    } catch (_) {
      obj = {};
    }

    const nickname = ensureString(obj.nickname, "World");
    const addresses =
      obj.addresses === undefined
        ? undefined
        : {
            platform: PlatformAddress.ensure(obj.addresses.platform),
            asset: AssetAddress.ensure(obj.addresses.asset),
          };

    return new Tracer({
      nickname,
      addresses,
    });
  }

  public save() {
    const obj: { [key in keyof State]: any } = {
      nickname: this.state.nickname,
      addresses:
        this.state.addresses === undefined
          ? undefined
          : {
              platform: this.state.addresses.platform.toString(),
              asset: this.state.addresses.asset.toString(),
            },
    };
    const json = JSON.stringify(obj, null, 4);
    fs.writeFileSync(SAVE_FILE, json, "utf-8");
  }
}

function ensureString(value: any, defaultValue: string) {
  if (typeof value === "string") {
    return value;
  }
  if (value === undefined && defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error("Not a string");
}
