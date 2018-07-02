import { curryN } from "./helpers";

export const is = x => {
  if (x != null && typeof x === "object") {
    return true;
  } else {
    return false;
  }
};

export const id = x => {
  if (!is(x)) {
    throw new TypeError(x + " is not an object");
  } else {
    return x;
  }
};

export const map = curryN(2, (fn, x) => {
  return Object.keys(id(x)).reduce(
    (acc, key) => ({ ...acc, [key]: fn(x[key]) }),
    {},
  );
});

export const mapKeyed = curryN(2, (fn, x) => {
  return Object.keys(id(x)).reduce(
    (acc, key) => ({ ...acc, [key]: fn(key, x[key]) }),
    {},
  );
});
