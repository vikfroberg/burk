import { pipe, curryN } from "./Function";
import * as Set from "./Set";

export function Type(typeName, definitions) {
  const constructors = mapAsPairs(([name, args]) => {
    function _typeFn(...args) {
      return {
        name: typeName,
        kind: name,
        args: args,
      };
    }
    const fnOrObj =
      args.length > 0
        ? curryN(args.length, _typeFn)
        : { name: typeName, kind: name, args: [] };

    return [name, fnOrObj];
  }, definitions);

  return {
    ...constructors,
    fold: curryN(2, (cases, x) => {
      const defKeys = Object.keys(definitions);
      const caseKeys = Object.keys(cases);

      if (typeName !== x.name) {
        throw new Error("'" + typeName + ".fold' received wrong type");
      }

      if (Set.contains("_", caseKeys)) {
        if (!Set.includes(caseKeys, [...defKeys, "_"])) {
          throw new Error("'" + typeName + ".fold' contains unknown types");
        }
        return Set.contains(x.kind, caseKeys)
          ? cases[x.kind](...x.args)
          : cases["_"]();
      } else {
        if (!Set.equals(defKeys, caseKeys)) {
          throw new Error("'" + typeName + ".fold' is missing cases");
        }
        return cases[x.kind](...x.args);
      }
    }),
  };
}

function mapAsPairs(fn, x) {
  return pipe(x, [toPairs, y => mapObj(fn, y), fromPairs]);
}

function fromPairs(xs) {
  return xs.reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});
}

function toPairs(x) {
  return Object.keys(x).reduce((acc, key) => [...acc, [key, x[key]]], []);
}

function mapObj(fn, x) {
  return x.map(fn);
}
