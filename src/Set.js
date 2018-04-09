export function equals(xs, ys) {
  return includes(ys, xs) && includes(xs, ys);
}

export function includes(ys, xs) {
  return all(y => contains(y, xs), ys);
}

export function contains(x, xs) {
  return xs.includes(x);
}

function all(fn, xs) {
  return xs.reduce((acc, x) => acc && fn(x));
}
