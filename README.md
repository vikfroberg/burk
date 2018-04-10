# uniontype
Union types in JS

Some similar packages are https://github.com/fantasyland/daggy and https://github.com/paldepind/union-type.

## Why did I create this?
We used both daggy and union-type at work and had problems with serializing the types and saving them in local storage. This package only work with plain js objects that can easily be serialized and instead of adding methods to the prototype it's only using pure functions.

## Usage

```js
const Maybe = Type("Maybe", {
  Just: ["x"],
  Nothing: [],
});

const justName = Maybe.Just("Viktor");

Maybe.fold({
  Just: x => console.log("Maybe.Just(" + x + ")"),
  Nothing: () => console.log("Maybe.Nothing"),
}, justName)
```
