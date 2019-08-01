import * as fs from "fs";

import {
  AssetAddress,
  H256,
  PlatformAddress,
  U64,
} from "codechain-primitives/lib";

const SAVE_FILE = "./state.json";

export type State = {
  nickname: string;
  addresses?: {
    platform: PlatformAddress;
    asset: AssetAddress;
  };
  lastWatch?: number;
  payLogs: PayLog[];
};

export type PayLog =
  | {
      type: "send";
      receiver: PlatformAddress;
      quantity: U64;
      txHash: H256;
    }
  | {
      type: "receive";
      sender: PlatformAddress;
      quantity: U64;
      txHash: H256;
    }
  | {
      type: "fee";
      quantity: U64;
      txHash: H256;
    };

export class Tracer {
  public state: State;

  private constructor(state: State) {
    this.state = state;
  }

  public getAccounts() {
    if (this.state.addresses === undefined) {
      throw new Error("You should've run 'init'");
    }
    return this.state.addresses;
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
    const lastWatch = obj.lastWatch;
    const payLogs: PayLog[] = [];
    if (obj.payLogs) {
      for (const log of obj.payLogs) {
        if (log.type === "send") {
          payLogs.push({
            type: "send",
            receiver: PlatformAddress.ensure(log.receiver),
            quantity: U64.ensure(log.quantity),
            txHash: H256.ensure(log.txHash),
          });
        } else if (log.type == "receive") {
          payLogs.push({
            type: "receive",
            sender: PlatformAddress.ensure(log.sender),
            quantity: U64.ensure(log.quantity),
            txHash: H256.ensure(log.txHash),
          });
        } else {
          payLogs.push({
            type: "fee",
            quantity: U64.ensure(log.quantity),
            txHash: H256.ensure(log.txHash),
          });
        }
      }
    }

    return new Tracer({
      nickname,
      addresses,
      lastWatch,
      payLogs,
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
      lastWatch: this.state.lastWatch,
      payLogs: this.state.payLogs.map(log => {
        if (log.type === "send") {
          return {
            type: "send",
            receiver: log.receiver.toString(),
            quantity: log.quantity.toJSON(),
            txHash: log.txHash.toJSON(),
          };
        } else if (log.type === "receive") {
          return {
            type: "receive",
            sender: log.sender.toString(),
            quantity: log.quantity.toJSON(),
            txHash: log.txHash.toJSON(),
          };
        } else {
          return {
            type: "fee",
            quantity: log.quantity.toJSON(),
            txHash: log.txHash.toJSON(),
          };
        }
      }),
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
