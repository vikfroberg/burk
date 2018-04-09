export function curryN(length, fn) {
  return function _curryN(...args) {
    if (args.length > length) {
      throw new Error("Too many arguments");
    } else if (args.length < length) {
      return curryN(length - args.length, (..._args) =>
        fn(...[...args, ..._args]),
      );
    } else {
      return fn(...args);
    }
  };
}

export function pipe(x, fns) {
  return fns.reduce((acc, fn) => fn(acc), x);
}
