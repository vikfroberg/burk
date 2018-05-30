import * as T from "./index";

const MaybeOf = (name, guard) => {
  const Maybe = T.define("Maybe:" + name, {
    Just: [guard],
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

const MaybeString = MaybeOf("String", T.string);

const decoder = T.object({
  firstName: T.string,
  lastName: MaybeString.from,
  nickNames: T.list(T.string),
});

const decoder2 = T.piper(
  T.object({
    firstName: T.string,
    lastName: MaybeString.from,
  }),
  result => ({
    name: T.pipe(
      result.lastName,
      MaybeString.map(lastName => result.firstName + " " + lastName),
      MaybeString.withDefault(result.firstName),
    ),
  }),
);

// Test decoders
console.log("untoched", [
  T.toString(decoder(json1)),
  T.toString(decoder(json2)),
]);
console.log("modified", [
  T.toString(decoder2(json1)),
  T.toString(decoder2(json2)),
]);

// Test nested types
const MaybeMaybeString = MaybeOf("MaybeString", MaybeString.id);
const justString = MaybeString.Just("Viktor");
const justJustString = MaybeMaybeString.Just(justString);
console.log("nested:", T.toString(justJustString));
