import { length, difference, mapAsPairs, curryN } from "./helpers";

export const toString = x => {
  if (x.__burk) {
    if (x.args.length) {
      return `${x.name}.${x.kind}(${x.args.map(toString).join(", ")})`;
    } else {
      return `${x.name}.${x.kind}`;
    }
  } else {
    if (x != null && Array.isArray(x)) {
      return x.map(toString);
    } else if (x != null && typeof x === "object") {
      return Object.keys(x).reduce((acc, key) => {
        return { ...acc, [key]: toString(x[key]) };
      }, {});
    } else {
      return x.toString();
    }
  }
};

export function define(name, definitions) {
  const constructors = mapAsPairs(([kind, guards]) => {
    const fnOrObj =
      guards.length > 0
        ? curryN(guards.length, (...args) => ({
            __burk: true,
            name,
            kind,
            args: args.map((x, i) => guards[i](x)),
          }))
        : { __burk: true, name, kind, args: [] };

    return [kind, fnOrObj];
  }, definitions);

  return {
    ...constructors,
    id: x => {
      if (x.name === name) {
        return x;
      } else {
        throw new TypeError(toString(x) + "is not of type " + name);
      }
    },
    fold: curryN(2, function fold(cases, x) {
      const defKeys = Object.keys(definitions);
      const caseKeys = Object.keys(cases);

      if (name !== x.name) {
        throw new Error(`'${name}.fold' received the wrong type`);
      } else if (caseKeys.includes("_")) {
        const unknownKeys = difference(caseKeys, [...defKeys, "_"]);
        if (unknownKeys.length > 0) {
          throw new Error(
            `'${name}.fold' contains unknown cases '${unknownKeys.join(", ")}'`,
          );
        }
        return caseKeys.includes(x.kind)
          ? cases[x.kind](...x.args)
          : cases["_"]();
      } else {
        const missingKeys = difference(defKeys, caseKeys);
        if (missingKeys.length > 0) {
          throw new Error(
            `'${name}.fold' is missing cases '${missingKeys.join(", ")}'`,
          );
        }
        const unknownKeys = difference(caseKeys, defKeys);
        if (unknownKeys.length > 0) {
          throw new Error(
            `'${name}.fold' contains unknown cases '${unknownKeys.join(", ")}'`,
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

export const int = x => {
  if (Number(x) === x && x % 1 === 0) {
    return x;
  } else {
    throw new TypeError(x + " is not an int");
  }
};

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
