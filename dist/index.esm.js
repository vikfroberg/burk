var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

function curryN(length, fn) {
  function curryFn() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length > length) {
      throw new Error("Too many arguments");
    } else if (args.length < length) {
      return curryN(length - args.length, function () {
        for (var _len2 = arguments.length, _args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          _args[_key2] = arguments[_key2];
        }

        return fn.apply(undefined, [].concat(args, _args));
      });
    } else {
      return fn.apply(undefined, args);
    }
  }
  return curryFn;
}

function pipe(x, fns) {
  return fns.reduce(function (acc, fn) {
    return fn(acc);
  }, x);
}

function mapAsPairs(fn, x) {
  return pipe(x, [toPairs, function (y) {
    return y.map(fn);
  }, fromPairs]);
}

function difference(xs, ys) {
  return xs.filter(function (x) {
    return !ys.includes(x);
  });
}

function fromPairs(xs) {
  return xs.reduce(function (acc, _ref) {
    var _ref2 = slicedToArray(_ref, 2),
        key = _ref2[0],
        val = _ref2[1];

    return _extends({}, acc, defineProperty({}, key, val));
  }, {});
}

function toPairs(x) {
  return Object.keys(x).reduce(function (acc, key) {
    return [].concat(toConsumableArray(acc), [[key, x[key]]]);
  }, []);
}

function Type(name, definitions) {
  var constructors = mapAsPairs(function (_ref) {
    var _ref2 = slicedToArray(_ref, 2),
        kind = _ref2[0],
        keys = _ref2[1];

    var fnOrObj = keys.length > 0 ? curryN(keys.length, function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return {
        name: name,
        kind: kind,
        args: args
      };
    }) : { name: name, kind: kind, args: [] };

    return [kind, fnOrObj];
  }, definitions);

  return _extends({}, constructors, {
    fold: curryN(2, function fold(cases, x) {
      var defKeys = Object.keys(definitions);
      var caseKeys = Object.keys(cases);

      if (name !== x.name) {
        throw new Error("'" + name + ".fold' received the wrong type");
      } else if (caseKeys.includes("_")) {
        var unknownKeys = difference(caseKeys, [].concat(toConsumableArray(defKeys), ["_"]));
        if (unknownKeys.length > 0) {
          throw new Error("'" + name + ".fold' contains unknown cases '" + unknownKeys.join(", ") + "'");
        }
        return caseKeys.includes(x.kind) ? cases[x.kind].apply(cases, toConsumableArray(x.args)) : cases["_"]();
      } else {
        var missingKeys = difference(defKeys, caseKeys);
        if (missingKeys.length > 0) {
          throw new Error("'" + name + ".fold' is missing cases '" + missingKeys.join(", ") + "'");
        }
        var _unknownKeys = difference(caseKeys, defKeys);
        if (_unknownKeys.length > 0) {
          throw new Error("'" + name + ".fold' contains unknown cases '" + _unknownKeys.join(", ") + "'");
        }
        return cases[x.kind].apply(cases, toConsumableArray(x.args));
      }
    })
  });
}

export { Type };
