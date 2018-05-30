import * as T from "./index";

const MaybeOf = x => {
  const Maybe = T.define("Maybe", {
    Just: [x],
    Nothing: [],
  });
  Maybe.from = x => (x == null ? Maybe.Nothing : Maybe.Just(x));
  Maybe.map = fn =>
    Maybe.fold({
      Just: x => Maybe.Just(fn(x)),
      Nothing: () => Maybe.Nothing,
    });
  Maybe.withDefault = y =>
    Maybe.fold({
      Just: x => x,
      Nothing: () => y,
    });
  return Maybe;
};

const json1 = {
  firstName: "Viktor",
  lastName: "Fröberg",
  nickNames: ["vik", "snow", "fröet"],
};

const json2 = {
  firstName: "Viktor",
  nickNames: [],
};

const MaybeString = MaybeOf(T.string);

const decoder = T.object({
  firstName: T.string,
  lastName: MaybeString.from,
  nickNames: T.list(T.string),
});

const decoder2 = T.piper(
  T.object({
    firstName: T.string,
    lastName: MaybeString.from,
    nickNames: T.list(T.string),
  }),
  result => ({
    name: T.pipe(
      result.lastName,
      MaybeString.map(lastName => result.firstName + " " + lastName),
      MaybeString.withDefault(result.firstName),
    ),
  }),
);

console.log([decoder(json1), decoder(json2)]);
console.log("---");
console.log([decoder2(json1), decoder2(json2)]);
