import { Type } from "./Type";
import { pipe } from "./Function";

const Maybe = Type("Maybe", {
  Just: ["x"],
  Nothing: [],
});

const justName = Maybe.Just("Viktor");
const nothingName = Maybe.Nothing;

pipe(nothingName, [
  Maybe.fold({
    Just: x => console.log("Maybe.Just(" + x + ")"),
    Nothing: _ => console.log("Maybe.Nothing"),
  }),
]);
