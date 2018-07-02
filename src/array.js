import { curryN } from "./helpers";

export const is = x => {
  if (x != null && Array.isArray(x)) {
    return true;
  } else {
    return false;
  }
};

export const id = x => {
  if (!is(x)) {
    throw new TypeError(x + " is not an array");
  } else {
    return x;
  }
};

export const map = curryN(2, (fn, xs) => {
  return id(xs).map(x => fn(x));
});

export const join = curryN(2, (sep, xs) => {
  return id(xs).join(sep);
});
