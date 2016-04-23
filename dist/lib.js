'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.toJString = toJString;
exports.toJBoolean = toJBoolean;
exports.toJNumber = toJNumber;
exports.toLString = toLString;
exports.toLBoolean = toLBoolean;
exports.toLNumber = toLNumber;
exports.toLObject = toLObject;
exports.call = call;
exports.defaultCall = defaultCall;
exports.has = has;
exports.get = get;
exports.defaultGet = defaultGet;
exports.set = set;
exports.defaultSet = defaultSet;

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var interp = require('./interp');
var C = require('./constants');

var StringPrim = exports.StringPrim = function () {
  function StringPrim(str) {
    _classCallCheck(this, StringPrim);

    this.str = str;
  }

  _createClass(StringPrim, [{
    key: 'toString',
    value: function toString() {
      return this.str;
    }
  }, {
    key: 'str',
    set: function set(str) {
      this._str = String(str);
    },
    get: function get() {
      return String(this._str);
    }
  }]);

  return StringPrim;
}();

var BooleanPrim = exports.BooleanPrim = function () {
  function BooleanPrim(bool) {
    _classCallCheck(this, BooleanPrim);

    this.bool = bool;
  }

  _createClass(BooleanPrim, [{
    key: 'valueOf',
    value: function valueOf() {
      return this.bool;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '<Boolean ' + this.bool + '>';
    }
  }, {
    key: 'bool',
    set: function set(bool) {
      this._bool = Boolean(bool);
    },
    get: function get() {
      return Boolean(this._bool);
    }
  }]);

  return BooleanPrim;
}();

var NumberPrim = exports.NumberPrim = function () {
  function NumberPrim(num) {
    _classCallCheck(this, NumberPrim);

    this.num = num;
  }

  _createClass(NumberPrim, [{
    key: 'valueOf',
    value: function valueOf() {
      return this.num;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return this.num;
    }
  }, {
    key: 'num',
    set: function set(num) {
      this._num = Number(num);
    },
    get: function get() {
      return Number(this._num);
    }
  }]);

  return NumberPrim;
}();

// Converting language primatives to JS prims ---------------------------------

function toJString(str) {
  if (str instanceof StringPrim) {
    return str.str;
  } else {
    return String(str);
  }
}

function toJBoolean(bool) {
  if (bool instanceof BooleanPrim && bool.bool === true) {
    return true;
  } else {
    return false;
  }
}

function toJNumber(num) {
  if (num instanceof NumberPrim) {
    return num.num;
  } else {
    return Number(num);
  }
}

// Converting JS prims to language primitives ---------------------------------

function toLString(str) {
  return new StringPrim(str);
}

function toLBoolean(bool) {
  return new BooleanPrim(bool);
}

function toLNumber(num) {
  return new NumberPrim(num);
}

function toLObject(data) {
  var obj = new LObject();
  for (var key in data) {
    set(obj, key, data[key]);
  }
  return obj;
}

// Call function --------------------------------------------------------------

function call(fn, args) {
  return fn['__call__'](args);
}

function defaultCall(fnToken, args) {
  if (fnToken.fn instanceof Function) {
    // it's a javascript function so just call it
    return fnToken.fn(args.map(function (arg) {
      return interp.evaluateExpression(arg, fnToken.argumentScope);
    }));
  } else {
    var scope = Object.assign({}, fnToken.scopeVariables);
    var returnValue = null;
    scope.return = new Variable(new LFunction(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 1);

      var val = _ref2[0];

      returnValue = val;
    }));
    var paramaters = fnToken.paramaterList;

    var _loop = function _loop(i) {
      var value = args[i];
      var paramater = paramaters[i];
      if (paramater.type === 'normal') {
        var evaluatedValue = interp.evaluateExpression(value);
        scope[paramater.name] = new Variable(evaluatedValue);
      } else if (paramater.type === 'unevaluated') {
        scope[paramater.name] = new Variable(new LFunction(function () {
          return interp.evaluateExpression(value, fnToken.argumentScope);
        }));
      }
    };

    for (var i = 0; i < paramaters.length; i++) {
      _loop(i);
    }
    interp.evaluateEachExpression(scope, fnToken.fn);
    return returnValue;
  }
}

// Has function ---------------------------------------------------------------

function has(obj, key) {
  return key in obj;
}

// Get function ---------------------------------------------------------------

function get(obj, key) {
  return obj['__get__'](key);
}

function defaultGet(obj, key) {
  var keyString = toJString(key);
  if (keyString in obj.data) {
    return obj.data[keyString];
  } else {
    var _constructor = obj['__constructor__'];
    var prototype = _constructor['__prototype__'];
    var current = _constructor;
    while (current && prototype && !(key in prototype)) {
      current = current['__super__'];
      prototype = current ? current['__prototype__'] : null;
    }
    if (current) {
      var _ret2 = function () {
        var value = prototype[keyString];
        if (value instanceof LFunction) {
          // I was going to just bind to obj, but that generally involves using
          // the oh so terrible `this`.
          // Instead it returns a function that calls the given function with
          // obj as the first paramater.
          return {
            v: new LFunction(function () {
              for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              return value.fn.apply(value, [obj].concat(args));
            })
          };
        }
        return {
          v: value
        };
      }();

      if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
    }
  }
}

// Set function ---------------------------------------------------------------

function set(obj, key, value) {
  return obj['__set__'](key, value);
}

function defaultSet(obj, key, value) {
  return obj.data[toJString(key)] = value;
}

// Variable class -------------------------------------------------------------
// * this should never *ever* be accessed through anywhere except set/get
//   Variable functions
// * takes one paramater, value, which is stored in inst.value and represents
//   the value of the Variable

var Variable = exports.Variable = function () {
  function Variable(value) {
    _classCallCheck(this, Variable);

    this.value = value;
  }

  _createClass(Variable, [{
    key: 'toString',
    value: function toString() {
      return '<Variable>';
    }
  }]);

  return Variable;
}();

// Base token class -----------------------------------------------------------
// * doesn't do anything on its own
// * use x instanceof Token to check if x is any kind of token

var Token = exports.Token = function Token() {
  _classCallCheck(this, Token);
};

// Object token class ---------------------------------------------------------

var LObject = exports.LObject = function (_Token) {
  _inherits(LObject, _Token);

  function LObject() {
    _classCallCheck(this, LObject);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LObject).call(this));

    _this.data = {};
    _this['__constructor__'] = LObject;
    return _this;
  }

  _createClass(LObject, [{
    key: '__get__',
    value: function __get__(key) {
      return defaultGet(this, key);
    }
  }, {
    key: '__set__',
    value: function __set__(key, value) {
      return defaultSet(this, key, value);
    }
  }]);

  return LObject;
}(Token);

var LArray = exports.LArray = function (_LObject) {
  _inherits(LArray, _LObject);

  function LArray() {
    _classCallCheck(this, LArray);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(LArray).call(this));

    _this2['__constructor__'] = LArray;
    _this2.data.length = 0;
    return _this2;
  }

  return LArray;
}(LObject);

// Function token class -------------------------------------------------------
// [[this needs to be rewritten]]
// * takes one paramater, fn, which is stored in inst.fn and represents the
//     function that will be called
// * you can also set scopeVariables (using setScopeVariables), which is
//     generally only used for internal creation of function expressions; it
//     represents the closure Variables that can be accessed from within the
//     function
// * you can also set fnArguments (using setArguments), which is generally also
//     only used for internal creation of function expressions; it tells what
//     call arguments should be mapped to in the Variables context of running
//     the code block
// * use inst.__call__ to call the function (with optional arguments)

var LFunction = exports.LFunction = function (_LObject2) {
  _inherits(LFunction, _LObject2);

  function LFunction(fn) {
    _classCallCheck(this, LFunction);

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(LFunction).call(this));

    _this3['__constructor__'] = LFunction;
    _this3.fn = fn;
    _this3.scopeVariables = null;

    _this3.unevaluatedArgs = [];
    _this3.normalArgs = [];
    return _this3;
  }

  _createClass(LFunction, [{
    key: '__call__',
    value: function __call__(args) {
      // Call this function. By default uses defaultCall, but can be overriden
      // by subclasses.
      return defaultCall(this, args);
    }
  }, {
    key: 'setScopeVariables',
    value: function setScopeVariables(scopeVariables) {
      this.scopeVariables = scopeVariables;
    }
  }, {
    key: 'setParamaters',
    value: function setParamaters(paramaterList) {
      this.paramaterList = paramaterList;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '<Object Function>';
    }
  }]);

  return LFunction;
}(LObject);

var LEnvironment = exports.LEnvironment = function () {
  function LEnvironment(variables) {
    _classCallCheck(this, LEnvironment);

    this['__constructor__'] = LEnvironment;
    this.vars = variables;
  }

  _createClass(LEnvironment, [{
    key: '__set__',
    value: function __set__(variableName, value) {
      this.vars[variableName] = new Variable(value);
    }
  }, {
    key: '__get__',
    value: function __get__(variableName) {
      return this.vars[variableName].value;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return JSON.stringify(Object.keys(this.vars));
    }
  }]);

  return LEnvironment;
}();

// ETC. that requires above definitions ---------------------------------------

var LObjectPrototype = exports.LObjectPrototype = {};

var LArrayPrototype = exports.LArrayPrototype = {
  push: new LFunction(function (self, what) {
    self.data[self.data.length] = what;
    self.data.length = self.data.length + 1;
  }),
  pop: new LFunction(function (self) {
    delete self.data[self.data.length - 1];
    self.data.length = self.data.length - 1;
  })
};

var LFunctionPrototype = exports.LFunctionPrototype = {
  debug: new LFunction(function (self) {
    console.log('** DEBUG **');
    console.log(self.fn.toString());
  })
};

LObject['__prototype__'] = LObjectPrototype;
LObject['__super__'] = null;

LArray['__prototype__'] = LArrayPrototype;
LArray['__super__'] = LObject;

LFunction['__prototype__'] = LFunctionPrototype;
LFunction['__super__'] = LObject;
//# sourceMappingURL=data:application/json;base64,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LENBQWUsT0FBTyxJQUFQLENBQVksS0FBSyxJQUFMLENBQTNCLENBQVAsQ0FEUzs7OztTQWRBOzs7OztBQXFCTixJQUFJLDhDQUFtQixFQUFuQjs7QUFFSixJQUFJLDRDQUFrQjtBQUMzQixRQUFNLElBQUksU0FBSixDQUFjLFVBQVMsSUFBVCxFQUFlLElBQWYsRUFBcUI7QUFDdkMsU0FBSyxJQUFMLENBQVUsS0FBSyxJQUFMLENBQVUsTUFBVixDQUFWLEdBQThCLElBQTlCLENBRHVDO0FBRXZDLFNBQUssSUFBTCxDQUFVLE1BQVYsR0FBbUIsS0FBSyxJQUFMLENBQVUsTUFBVixHQUFtQixDQUFuQixDQUZvQjtHQUFyQixDQUFwQjtBQUlBLE9BQUssSUFBSSxTQUFKLENBQWMsVUFBUyxJQUFULEVBQWU7QUFDaEMsV0FBTyxLQUFLLElBQUwsQ0FBVSxLQUFLLElBQUwsQ0FBVSxNQUFWLEdBQW1CLENBQW5CLENBQWpCLENBRGdDO0FBRWhDLFNBQUssSUFBTCxDQUFVLE1BQVYsR0FBbUIsS0FBSyxJQUFMLENBQVUsTUFBVixHQUFtQixDQUFuQixDQUZhO0dBQWYsQ0FBbkI7Q0FMUzs7QUFXSixJQUFJLGtEQUFxQjtBQUM5QixTQUFPLElBQUksU0FBSixDQUFjLFVBQVMsSUFBVCxFQUFlO0FBQ2xDLFlBQVEsR0FBUixDQUFZLGFBQVosRUFEa0M7QUFFbEMsWUFBUSxHQUFSLENBQVksS0FBSyxFQUFMLENBQVEsUUFBUixFQUFaLEVBRmtDO0dBQWYsQ0FBckI7Q0FEUzs7QUFPWCxRQUFRLGVBQVIsSUFBMkIsZ0JBQTNCO0FBQ0EsUUFBUSxXQUFSLElBQXVCLElBQXZCOztBQUVBLE9BQU8sZUFBUCxJQUEwQixlQUExQjtBQUNBLE9BQU8sV0FBUCxJQUFzQixPQUF0Qjs7QUFFQSxVQUFVLGVBQVYsSUFBNkIsa0JBQTdCO0FBQ0EsVUFBVSxXQUFWLElBQXlCLE9BQXpCIiwiZmlsZSI6ImxpYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGludGVycCA9IHJlcXVpcmUoJy4vaW50ZXJwJylcbmNvbnN0IEMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpXG5cbmV4cG9ydCBjbGFzcyBTdHJpbmdQcmltIHtcbiAgY29uc3RydWN0b3Ioc3RyKSB7XG4gICAgdGhpcy5zdHIgPSBzdHJcbiAgfVxuXG4gIHNldCBzdHIoc3RyKSB7XG4gICAgdGhpcy5fc3RyID0gU3RyaW5nKHN0cilcbiAgfVxuXG4gIGdldCBzdHIoKSB7XG4gICAgcmV0dXJuIFN0cmluZyh0aGlzLl9zdHIpXG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5zdHJcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQm9vbGVhblByaW0ge1xuICBjb25zdHJ1Y3Rvcihib29sKSB7XG4gICAgdGhpcy5ib29sID0gYm9vbFxuICB9XG5cbiAgc2V0IGJvb2woYm9vbCkge1xuICAgIHRoaXMuX2Jvb2wgPSBCb29sZWFuKGJvb2wpXG4gIH1cblxuICBnZXQgYm9vbCgpIHtcbiAgICByZXR1cm4gQm9vbGVhbih0aGlzLl9ib29sKVxuICB9XG5cbiAgdmFsdWVPZigpIHtcbiAgICByZXR1cm4gdGhpcy5ib29sXG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gYDxCb29sZWFuICR7dGhpcy5ib29sfT5gXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE51bWJlclByaW0ge1xuICBjb25zdHJ1Y3RvcihudW0pIHtcbiAgICB0aGlzLm51bSA9IG51bVxuICB9XG5cbiAgc2V0IG51bShudW0pIHtcbiAgICB0aGlzLl9udW0gPSBOdW1iZXIobnVtKVxuICB9XG5cbiAgZ2V0IG51bSgpIHtcbiAgICByZXR1cm4gTnVtYmVyKHRoaXMuX251bSlcbiAgfVxuXG4gIHZhbHVlT2YoKSB7XG4gICAgcmV0dXJuIHRoaXMubnVtXG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5udW1cbiAgfVxufVxuXG4vLyBDb252ZXJ0aW5nIGxhbmd1YWdlIHByaW1hdGl2ZXMgdG8gSlMgcHJpbXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBmdW5jdGlvbiB0b0pTdHJpbmcoc3RyKSB7XG4gIGlmKHN0ciBpbnN0YW5jZW9mIFN0cmluZ1ByaW0pIHtcbiAgICByZXR1cm4gc3RyLnN0clxuICB9IGVsc2Uge1xuICAgIHJldHVybiBTdHJpbmcoc3RyKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b0pCb29sZWFuKGJvb2wpIHtcbiAgaWYoYm9vbCBpbnN0YW5jZW9mIEJvb2xlYW5QcmltICYmIGJvb2wuYm9vbCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiB0cnVlXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvSk51bWJlcihudW0pIHtcbiAgaWYobnVtIGluc3RhbmNlb2YgTnVtYmVyUHJpbSkge1xuICAgIHJldHVybiBudW0ubnVtXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIE51bWJlcihudW0pXG4gIH1cbn1cblxuLy8gQ29udmVydGluZyBKUyBwcmltcyB0byBsYW5ndWFnZSBwcmltaXRpdmVzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgZnVuY3Rpb24gdG9MU3RyaW5nKHN0cikge1xuICByZXR1cm4gbmV3IFN0cmluZ1ByaW0oc3RyKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9MQm9vbGVhbihib29sKSB7XG4gIHJldHVybiBuZXcgQm9vbGVhblByaW0oYm9vbClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvTE51bWJlcihudW0pIHtcbiAgcmV0dXJuIG5ldyBOdW1iZXJQcmltKG51bSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvTE9iamVjdChkYXRhKSB7XG4gIGxldCBvYmogPSBuZXcgTE9iamVjdCgpXG4gIGZvcihsZXQga2V5IGluIGRhdGEpIHtcbiAgICBzZXQob2JqLCBrZXksIGRhdGFba2V5XSlcbiAgfVxuICByZXR1cm4gb2JqXG59XG5cbi8vIENhbGwgZnVuY3Rpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGwoZm4sIGFyZ3MpIHtcbiAgcmV0dXJuIGZuWydfX2NhbGxfXyddKGFyZ3MpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0Q2FsbChmblRva2VuLCBhcmdzKSB7XG4gIGlmKGZuVG9rZW4uZm4gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgIC8vIGl0J3MgYSBqYXZhc2NyaXB0IGZ1bmN0aW9uIHNvIGp1c3QgY2FsbCBpdFxuICAgIHJldHVybiBmblRva2VuLmZuKGFyZ3MubWFwKFxuICAgICAgYXJnID0+IGludGVycC5ldmFsdWF0ZUV4cHJlc3Npb24oYXJnLCBmblRva2VuLmFyZ3VtZW50U2NvcGUpKSlcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBzY29wZSA9IE9iamVjdC5hc3NpZ24oe30sIGZuVG9rZW4uc2NvcGVWYXJpYWJsZXMpXG4gICAgbGV0IHJldHVyblZhbHVlID0gbnVsbFxuICAgIHNjb3BlLnJldHVybiA9IG5ldyBWYXJpYWJsZShuZXcgTEZ1bmN0aW9uKGZ1bmN0aW9uKFt2YWxdKSB7XG4gICAgICByZXR1cm5WYWx1ZSA9IHZhbFxuICAgIH0pKVxuICAgIGNvbnN0IHBhcmFtYXRlcnMgPSBmblRva2VuLnBhcmFtYXRlckxpc3RcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgcGFyYW1hdGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgdmFsdWUgPSBhcmdzW2ldXG4gICAgICBjb25zdCBwYXJhbWF0ZXIgPSBwYXJhbWF0ZXJzW2ldXG4gICAgICBpZihwYXJhbWF0ZXIudHlwZSA9PT0gJ25vcm1hbCcpIHtcbiAgICAgICAgY29uc3QgZXZhbHVhdGVkVmFsdWUgPSBpbnRlcnAuZXZhbHVhdGVFeHByZXNzaW9uKHZhbHVlKVxuICAgICAgICBzY29wZVtwYXJhbWF0ZXIubmFtZV0gPSBuZXcgVmFyaWFibGUoZXZhbHVhdGVkVmFsdWUpXG4gICAgICB9IGVsc2UgaWYocGFyYW1hdGVyLnR5cGUgPT09ICd1bmV2YWx1YXRlZCcpIHtcbiAgICAgICAgc2NvcGVbcGFyYW1hdGVyLm5hbWVdID0gbmV3IFZhcmlhYmxlKG5ldyBMRnVuY3Rpb24oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGludGVycC5ldmFsdWF0ZUV4cHJlc3Npb24odmFsdWUsIGZuVG9rZW4uYXJndW1lbnRTY29wZSlcbiAgICAgICAgfSkpXG4gICAgICB9XG4gICAgfVxuICAgIGludGVycC5ldmFsdWF0ZUVhY2hFeHByZXNzaW9uKHNjb3BlLCBmblRva2VuLmZuKVxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG59XG5cbi8vIEhhcyBmdW5jdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhcyhvYmosIGtleSkge1xuICByZXR1cm4ga2V5IGluIG9ialxufVxuXG4vLyBHZXQgZnVuY3Rpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXQob2JqLCBrZXkpIHtcbiAgcmV0dXJuIG9ialsnX19nZXRfXyddKGtleSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRHZXQob2JqLCBrZXkpIHtcbiAgbGV0IGtleVN0cmluZyA9IHRvSlN0cmluZyhrZXkpXG4gIGlmKGtleVN0cmluZyBpbiBvYmouZGF0YSkge1xuICAgIHJldHVybiBvYmouZGF0YVtrZXlTdHJpbmddXG4gIH0gZWxzZSB7XG4gICAgbGV0IGNvbnN0cnVjdG9yID0gb2JqWydfX2NvbnN0cnVjdG9yX18nXVxuICAgIGxldCBwcm90b3R5cGUgPSBjb25zdHJ1Y3RvclsnX19wcm90b3R5cGVfXyddXG4gICAgbGV0IGN1cnJlbnQgPSBjb25zdHJ1Y3RvclxuICAgIHdoaWxlKGN1cnJlbnQgJiYgcHJvdG90eXBlICYmICEoa2V5IGluIHByb3RvdHlwZSkpIHtcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50WydfX3N1cGVyX18nXVxuICAgICAgcHJvdG90eXBlID0gY3VycmVudCA/IGN1cnJlbnRbJ19fcHJvdG90eXBlX18nXSA6IG51bGxcbiAgICB9XG4gICAgaWYoY3VycmVudCkge1xuICAgICAgbGV0IHZhbHVlID0gcHJvdG90eXBlW2tleVN0cmluZ11cbiAgICAgIGlmKHZhbHVlIGluc3RhbmNlb2YgTEZ1bmN0aW9uKSB7XG4gICAgICAgIC8vIEkgd2FzIGdvaW5nIHRvIGp1c3QgYmluZCB0byBvYmosIGJ1dCB0aGF0IGdlbmVyYWxseSBpbnZvbHZlcyB1c2luZ1xuICAgICAgICAvLyB0aGUgb2ggc28gdGVycmlibGUgYHRoaXNgLlxuICAgICAgICAvLyBJbnN0ZWFkIGl0IHJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGNhbGxzIHRoZSBnaXZlbiBmdW5jdGlvbiB3aXRoXG4gICAgICAgIC8vIG9iaiBhcyB0aGUgZmlyc3QgcGFyYW1hdGVyLlxuICAgICAgICByZXR1cm4gbmV3IExGdW5jdGlvbihmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlLmZuKG9iaiwgLi4uYXJncylcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgfVxufVxuXG4vLyBTZXQgZnVuY3Rpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQob2JqLCBrZXksIHZhbHVlKSB7XG4gIHJldHVybiBvYmpbJ19fc2V0X18nXShrZXksIHZhbHVlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdFNldChvYmosIGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIG9iai5kYXRhW3RvSlN0cmluZyhrZXkpXSA9IHZhbHVlXG59XG5cbi8vIFZhcmlhYmxlIGNsYXNzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vICogdGhpcyBzaG91bGQgbmV2ZXIgKmV2ZXIqIGJlIGFjY2Vzc2VkIHRocm91Z2ggYW55d2hlcmUgZXhjZXB0IHNldC9nZXRcbi8vICAgVmFyaWFibGUgZnVuY3Rpb25zXG4vLyAqIHRha2VzIG9uZSBwYXJhbWF0ZXIsIHZhbHVlLCB3aGljaCBpcyBzdG9yZWQgaW4gaW5zdC52YWx1ZSBhbmQgcmVwcmVzZW50c1xuLy8gICB0aGUgdmFsdWUgb2YgdGhlIFZhcmlhYmxlXG5leHBvcnQgY2xhc3MgVmFyaWFibGUge1xuICBjb25zdHJ1Y3Rvcih2YWx1ZSkge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuICc8VmFyaWFibGU+JztcbiAgfVxufVxuXG4vLyBCYXNlIHRva2VuIGNsYXNzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyAqIGRvZXNuJ3QgZG8gYW55dGhpbmcgb24gaXRzIG93blxuLy8gKiB1c2UgeCBpbnN0YW5jZW9mIFRva2VuIHRvIGNoZWNrIGlmIHggaXMgYW55IGtpbmQgb2YgdG9rZW5cblxuZXhwb3J0IGNsYXNzIFRva2VuIHtcbiAgY29uc3RydWN0b3IoKSB7fVxufVxuXG4vLyBPYmplY3QgdG9rZW4gY2xhc3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBjbGFzcyBMT2JqZWN0IGV4dGVuZHMgVG9rZW4ge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5kYXRhID0ge31cbiAgICB0aGlzWydfX2NvbnN0cnVjdG9yX18nXSA9IExPYmplY3RcbiAgfVxuXG4gIF9fZ2V0X18oa2V5KSB7XG4gICAgcmV0dXJuIGRlZmF1bHRHZXQodGhpcywga2V5KVxuICB9XG5cbiAgX19zZXRfXyhrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRTZXQodGhpcywga2V5LCB2YWx1ZSlcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTEFycmF5IGV4dGVuZHMgTE9iamVjdCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzWydfX2NvbnN0cnVjdG9yX18nXSA9IExBcnJheVxuICAgIHRoaXMuZGF0YS5sZW5ndGggPSAwXG4gIH1cbn1cblxuLy8gRnVuY3Rpb24gdG9rZW4gY2xhc3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gW1t0aGlzIG5lZWRzIHRvIGJlIHJld3JpdHRlbl1dXG4vLyAqIHRha2VzIG9uZSBwYXJhbWF0ZXIsIGZuLCB3aGljaCBpcyBzdG9yZWQgaW4gaW5zdC5mbiBhbmQgcmVwcmVzZW50cyB0aGVcbi8vICAgICBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgY2FsbGVkXG4vLyAqIHlvdSBjYW4gYWxzbyBzZXQgc2NvcGVWYXJpYWJsZXMgKHVzaW5nIHNldFNjb3BlVmFyaWFibGVzKSwgd2hpY2ggaXNcbi8vICAgICBnZW5lcmFsbHkgb25seSB1c2VkIGZvciBpbnRlcm5hbCBjcmVhdGlvbiBvZiBmdW5jdGlvbiBleHByZXNzaW9uczsgaXRcbi8vICAgICByZXByZXNlbnRzIHRoZSBjbG9zdXJlIFZhcmlhYmxlcyB0aGF0IGNhbiBiZSBhY2Nlc3NlZCBmcm9tIHdpdGhpbiB0aGVcbi8vICAgICBmdW5jdGlvblxuLy8gKiB5b3UgY2FuIGFsc28gc2V0IGZuQXJndW1lbnRzICh1c2luZyBzZXRBcmd1bWVudHMpLCB3aGljaCBpcyBnZW5lcmFsbHkgYWxzb1xuLy8gICAgIG9ubHkgdXNlZCBmb3IgaW50ZXJuYWwgY3JlYXRpb24gb2YgZnVuY3Rpb24gZXhwcmVzc2lvbnM7IGl0IHRlbGxzIHdoYXRcbi8vICAgICBjYWxsIGFyZ3VtZW50cyBzaG91bGQgYmUgbWFwcGVkIHRvIGluIHRoZSBWYXJpYWJsZXMgY29udGV4dCBvZiBydW5uaW5nXG4vLyAgICAgdGhlIGNvZGUgYmxvY2tcbi8vICogdXNlIGluc3QuX19jYWxsX18gdG8gY2FsbCB0aGUgZnVuY3Rpb24gKHdpdGggb3B0aW9uYWwgYXJndW1lbnRzKVxuXG5leHBvcnQgY2xhc3MgTEZ1bmN0aW9uIGV4dGVuZHMgTE9iamVjdCB7XG4gIGNvbnN0cnVjdG9yKGZuKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXNbJ19fY29uc3RydWN0b3JfXyddID0gTEZ1bmN0aW9uXG4gICAgdGhpcy5mbiA9IGZuXG4gICAgdGhpcy5zY29wZVZhcmlhYmxlcyA9IG51bGxcblxuICAgIHRoaXMudW5ldmFsdWF0ZWRBcmdzID0gW11cbiAgICB0aGlzLm5vcm1hbEFyZ3MgPSBbXVxuICB9XG5cbiAgX19jYWxsX18oYXJncykge1xuICAgIC8vIENhbGwgdGhpcyBmdW5jdGlvbi4gQnkgZGVmYXVsdCB1c2VzIGRlZmF1bHRDYWxsLCBidXQgY2FuIGJlIG92ZXJyaWRlblxuICAgIC8vIGJ5IHN1YmNsYXNzZXMuXG4gICAgcmV0dXJuIGRlZmF1bHRDYWxsKHRoaXMsIGFyZ3MpXG4gIH1cblxuICBzZXRTY29wZVZhcmlhYmxlcyhzY29wZVZhcmlhYmxlcykge1xuICAgIHRoaXMuc2NvcGVWYXJpYWJsZXMgPSBzY29wZVZhcmlhYmxlc1xuICB9XG5cbiAgc2V0UGFyYW1hdGVycyhwYXJhbWF0ZXJMaXN0KSB7XG4gICAgdGhpcy5wYXJhbWF0ZXJMaXN0ID0gcGFyYW1hdGVyTGlzdFxuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuICc8T2JqZWN0IEZ1bmN0aW9uPidcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTEVudmlyb25tZW50IHtcbiAgY29uc3RydWN0b3IodmFyaWFibGVzKSB7XG4gICAgdGhpc1snX19jb25zdHJ1Y3Rvcl9fJ10gPSBMRW52aXJvbm1lbnQ7XG4gICAgdGhpcy52YXJzID0gdmFyaWFibGVzO1xuICB9XG5cbiAgX19zZXRfXyh2YXJpYWJsZU5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy52YXJzW3ZhcmlhYmxlTmFtZV0gPSBuZXcgVmFyaWFibGUodmFsdWUpO1xuICB9XG5cbiAgX19nZXRfXyh2YXJpYWJsZU5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy52YXJzW3ZhcmlhYmxlTmFtZV0udmFsdWU7XG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoT2JqZWN0LmtleXModGhpcy52YXJzKSk7XG4gIH1cbn1cblxuLy8gRVRDLiB0aGF0IHJlcXVpcmVzIGFib3ZlIGRlZmluaXRpb25zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgbGV0IExPYmplY3RQcm90b3R5cGUgPSB7fVxuXG5leHBvcnQgbGV0IExBcnJheVByb3RvdHlwZSA9IHtcbiAgcHVzaDogbmV3IExGdW5jdGlvbihmdW5jdGlvbihzZWxmLCB3aGF0KSB7XG4gICAgc2VsZi5kYXRhW3NlbGYuZGF0YS5sZW5ndGhdID0gd2hhdFxuICAgIHNlbGYuZGF0YS5sZW5ndGggPSBzZWxmLmRhdGEubGVuZ3RoICsgMVxuICB9KSxcbiAgcG9wOiBuZXcgTEZ1bmN0aW9uKGZ1bmN0aW9uKHNlbGYpIHtcbiAgICBkZWxldGUgc2VsZi5kYXRhW3NlbGYuZGF0YS5sZW5ndGggLSAxXVxuICAgIHNlbGYuZGF0YS5sZW5ndGggPSBzZWxmLmRhdGEubGVuZ3RoIC0gMVxuICB9KVxufVxuXG5leHBvcnQgbGV0IExGdW5jdGlvblByb3RvdHlwZSA9IHtcbiAgZGVidWc6IG5ldyBMRnVuY3Rpb24oZnVuY3Rpb24oc2VsZikge1xuICAgIGNvbnNvbGUubG9nKCcqKiBERUJVRyAqKicpXG4gICAgY29uc29sZS5sb2coc2VsZi5mbi50b1N0cmluZygpKVxuICB9KVxufVxuXG5MT2JqZWN0WydfX3Byb3RvdHlwZV9fJ10gPSBMT2JqZWN0UHJvdG90eXBlXG5MT2JqZWN0WydfX3N1cGVyX18nXSA9IG51bGxcblxuTEFycmF5WydfX3Byb3RvdHlwZV9fJ10gPSBMQXJyYXlQcm90b3R5cGVcbkxBcnJheVsnX19zdXBlcl9fJ10gPSBMT2JqZWN0XG5cbkxGdW5jdGlvblsnX19wcm90b3R5cGVfXyddID0gTEZ1bmN0aW9uUHJvdG90eXBlXG5MRnVuY3Rpb25bJ19fc3VwZXJfXyddID0gTE9iamVjdFxuIl19