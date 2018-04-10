import { Type } from "./Type";

const Maybe = Type("Maybe", {
  Just: ["x"],
  Nothing: [],
});

const justName = Maybe.Just("Viktor");

Maybe.fold(
  {
    Just: x => console.log("Maybe.Just(" + x + ")"),
    Nothing: () => console.log("Maybe.Nothing"),
  },
  justName,
);
