import { greet } from "../index";

const result = greet("world");
if (result !== "hello world") {
  throw new Error(`expected "hello world", got ${result}`);
}
