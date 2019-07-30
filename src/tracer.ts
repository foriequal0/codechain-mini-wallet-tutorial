import * as fs from "fs";

const SAVE_FILE = "./state.json";

export type State = {
  nickname: string;
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

    return new Tracer({
      nickname,
    });
  }

  public save() {
    const json = JSON.stringify(this.state, null, 4);
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
