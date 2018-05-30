(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.uniontype = {})));
}(this, (function (exports) { 'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

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

  function mapAsPairs(fn, x) {
    return pipe(x, toPairs, function (y) {
      return y.map(fn);
    }, fromPairs);
  }

  function difference(xs, ys) {
    return xs.filter(function (x) {
      return !ys.includes(x);
    });
  }

  function pipe(x) {
    for (var _len3 = arguments.length, fns = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      fns[_key3 - 1] = arguments[_key3];
    }

    return fns.reduce(function (acc, fn) {
      return fn(acc);
    }, x);
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

  var toString = function toString(x) {
    if (x.__burk) {
      if (x.args.length) {
        return x.name + "." + x.kind + "(" + x.args.map(toString).join(", ") + ")";
      } else {
        return x.name + "." + x.kind;
      }
    } else {
      if (x != null && Array.isArray(x)) {
        return x.map(toString);
      } else if (x != null && (typeof x === "undefined" ? "undefined" : _typeof(x)) === "object") {
        return Object.keys(x).reduce(function (acc, key) {
          return _extends({}, acc, defineProperty({}, key, toString(x[key])));
        }, {});
      } else {
        return x.toString();
      }
    }
  };

  function define(name, definitions) {
    var constructors = mapAsPairs(function (_ref) {
      var _ref2 = slicedToArray(_ref, 2),
          kind = _ref2[0],
          guards = _ref2[1];

      var fnOrObj = guards.length > 0 ? curryN(guards.length, function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return {
          __burk: true,
          name: name,
          kind: kind,
          args: args.map(function (x, i) {
            return guards[i](x);
          })
        };
      }) : { __burk: true, name: name, kind: kind, args: [] };

      return [kind, fnOrObj];
    }, definitions);

    return _extends({}, constructors, {
      id: function id(x) {
        if (x.name === name) {
          return x;
        } else {
          throw new TypeError(toString(x) + "is not of type " + name);
        }
      },
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

  var isObject = function isObject(x) {
    if (x == null || (typeof x === "undefined" ? "undefined" : _typeof(x)) !== "object") {
      throw new TypeError(x + " is not an object");
    } else {
      return x;
    }
  };

  var isArray = function isArray(x) {
    if (x == null || !Array.isArray(x)) {
      throw new TypeError(x + " is not an array");
    } else {
      return x;
    }
  };

  var notNull = function notNull(x) {
    if (x == null) {
      throw new TypeError(x + " can not be null");
    } else {
      return x;
    }
  };

  var id = function id(x) {
    return x;
  };

  var int = function int(x) {
    if (Number(x) === x && x % 1 === 0) {
      return x;
    } else {
      throw new TypeError(x + " is not an int");
    }
  };

  var float = function float(x) {
    if (Number(x) === x && x % 1 !== 0) {
      return x;
    } else {
      throw new TypeError(x + " is not a float");
    }
  };

  var string = function string(x) {
    if (typeof x !== "string") {
      throw new TypeError(x + " is not a string");
    } else {
      return x;
    }
  };

  var object = function object(x) {
    return function (y) {
      var safeY = isObject(notNull(y));
      var xKeys = Object.keys(x);
      return xKeys.reduce(function (acc, key) {
        try {
          return _extends({}, acc, defineProperty({}, key, x[key](safeY[key])));
        } catch (e) {
          throw new TypeError("{ " + key + ": '" + e.message + "', ... }");
        }
      }, {});
    };
  };

  var list = function list(x) {
    return function (y) {
      var safeY = isArray(notNull(y));
      return safeY.reduce(function (acc, val) {
        try {
          return [].concat(toConsumableArray(acc), [x(val)]);
        } catch (e) {
          throw new TypeError("['" + e.message + "', ...]");
        }
      }, []);
    };
  };

  var pipe$1 = function pipe(first) {
    for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      rest[_key2 - 1] = arguments[_key2];
    }

    return rest.reduce(function (acc, fn) {
      return fn(acc);
    }, first);
  };

  var piper = function piper() {
    for (var _len3 = arguments.length, rest = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      rest[_key3] = arguments[_key3];
    }

    return function (first) {
      return pipe$1.apply(undefined, [first].concat(rest));
    };
  };

  exports.toString = toString;
  exports.define = define;
  exports.id = id;
  exports.int = int;
  exports.float = float;
  exports.string = string;
  exports.object = object;
  exports.list = list;
  exports.pipe = pipe$1;
  exports.piper = piper;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
