import { Tracer } from "../tracer";

export default function hello(tracer: Tracer, args: string[]) {
  console.log(`Hello, ${tracer.state.nickname}!`);
  if (args.length > 0) {
    console.log(`Your name has been changed to ${args[0]}`);
    tracer.state.nickname = args[0];
  }
}
