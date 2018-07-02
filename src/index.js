import { difference, mapAsPairs, curryN } from "./helpers";
import * as _Array from "./array";
import * as _Object from "./object";

export const is = x => x.__burk;

export const toString = x => {
  if (is(x)) {
    if (x.args.length) {
      return `${x.name}.${x.kind}(${pipe(
        x.args,
        _Array.map(toString),
        _Array.join(", "),
      )})`;
    } else {
      return `${x.name}.${x.kind}`;
    }
  } else {
    if (_Array.is(x)) {
      return pipe(x, _Array.map(toString));
    } else if (_Object.is(x)) {
      return pipe(x, _Object.map(toString));
    } else {
      return x.toString();
    }
  }
};

export function define(name, definitions) {
  const constructors = _Object.mapKeyed((kind, guards) => {
    return guards.length > 0
      ? curryN(guards.length, (...args) => {
          try {
            return {
              __burk: true,
              name,
              kind,
              args: args.map((x, i) => guards[i](x)),
            };
          } catch (e) {
            throw new TypeError(`${name}.${kind}(${e.message})`);
          }
        })
      : { __burk: true, name, kind, args: [] };
  }, definitions);

  const keysToString = xs => `{ ${xs.join(", ")} }`;

  return {
    ...constructors,
    id: x => {
      if (x.name === name) {
        return x;
      } else {
        throw new TypeError(toString(x) + " is not of type " + name);
      }
    },
    fold: curryN(2, function fold(cases, x) {
      const defKeys = Object.keys(definitions);
      const caseKeys = Object.keys(cases);

      if (name !== x.name) {
        throw new TypeError(toString(x) + " is not of type " + name);
      } else if (caseKeys.includes("_")) {
        const unknownKeys = difference(caseKeys, [...defKeys, "_"]);
        if (unknownKeys.length > 0) {
          throw new TypeError(
            `${keysToString(caseKeys)} contains unknown cases ${keysToString(
              unknownKeys,
            )}`,
          );
        }
        return caseKeys.includes(x.kind)
          ? cases[x.kind](...x.args)
          : cases["_"]();
      } else {
        const missingKeys = difference(defKeys, caseKeys);
        if (missingKeys.length > 0) {
          throw new TypeError(
            `${keysToString(caseKeys)} is missing cases ${keysToString(
              missingKeys,
            )}`,
          );
        }
        const unknownKeys = difference(caseKeys, defKeys);
        if (unknownKeys.length > 0) {
          throw new TypeError(
            `${keysToString(caseKeys)} contains unknown cases ${keysToString(
              unknownKeys,
            )}`,
          );
        }
        return cases[x.kind](...x.args);
      }
    }),
  };
}

const isObject = x => {
  if (x == null || typeof x !== "object") {
    throw new TypeError(x + " is not an object");
  } else {
    return x;
  }
};

const isArray = x => {
  if (x == null || !Array.isArray(x)) {
    throw new TypeError(x + " is not an array");
  } else {
    return x;
  }
};

const notNull = x => {
  if (x == null) {
    throw new TypeError(x + " can not be null");
  } else {
    return x;
  }
};

export const id = x => x;

// TODO: typecast into int when string too
export const int = x => {
  if (Number(x) === x && x % 1 === 0) {
    return x;
  } else {
    throw new TypeError(x + " is not an int");
  }
};

// TODO: typecast into int when string too
export const float = x => {
  if (Number(x) === x && x % 1 !== 0) {
    return x;
  } else {
    throw new TypeError(x + " is not a float");
  }
};

export const string = x => {
  if (typeof x !== "string") {
    throw new TypeError(x + " is not a string");
  } else {
    return x;
  }
};

export const object = x => y => {
  const safeY = isObject(notNull(y));
  const xKeys = Object.keys(x);
  return xKeys.reduce((acc, key) => {
    try {
      return { ...acc, [key]: x[key](safeY[key]) };
    } catch (e) {
      throw new TypeError("{ " + key + ": '" + e.message + "', ... }");
    }
  }, {});
};

export const list = x => y => {
  const safeY = isArray(notNull(y));
  return safeY.reduce((acc, val) => {
    try {
      return [...acc, x(val)];
    } catch (e) {
      throw new TypeError("['" + e.message + "', ...]");
    }
  }, []);
};

export const pipe = (first, ...rest) => {
  return rest.reduce((acc, fn) => fn(acc), first);
};

export const piper = (...rest) => first => {
  return pipe(first, ...rest);
};
