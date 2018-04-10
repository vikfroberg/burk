import { length, difference, mapAsPairs, pipe, curryN } from "./helpers";

export function Type(name, definitions) {
  const constructors = mapAsPairs(([kind, keys]) => {
    const fnOrObj =
      keys.length > 0
        ? curryN(keys.length, (...args) => ({
            name,
            kind,
            args,
          }))
        : { name, kind, args: [] };

    return [kind, fnOrObj];
  }, definitions);

  return {
    ...constructors,
    fold: curryN(2, (cases, x) => {
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
