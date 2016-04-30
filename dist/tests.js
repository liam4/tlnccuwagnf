'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _taggedTemplateLiteral2 = require('babel-runtime/helpers/taggedTemplateLiteral');

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _templateObject = (0, _taggedTemplateLiteral3.default)(['hello!'], ['hello!']),
    _templateObject2 = (0, _taggedTemplateLiteral3.default)(['single quoted'], ['single quoted']),
    _templateObject3 = (0, _taggedTemplateLiteral3.default)(['foobar'], ['foobar']),
    _templateObject4 = (0, _taggedTemplateLiteral3.default)(['7'], ['7']),
    _templateObject5 = (0, _taggedTemplateLiteral3.default)(['-1'], ['-1']),
    _templateObject6 = (0, _taggedTemplateLiteral3.default)(['12'], ['12']),
    _templateObject7 = (0, _taggedTemplateLiteral3.default)(['0.75'], ['0.75']),
    _templateObject8 = (0, _taggedTemplateLiteral3.default)(['3.005'], ['3.005']),
    _templateObject9 = (0, _taggedTemplateLiteral3.default)(['good'], ['good']),
    _templateObject10 = (0, _taggedTemplateLiteral3.default)(['false'], ['false']),
    _templateObject11 = (0, _taggedTemplateLiteral3.default)(['true'], ['true']),
    _templateObject12 = (0, _taggedTemplateLiteral3.default)(['100'], ['100']),
    _templateObject13 = (0, _taggedTemplateLiteral3.default)(['0'], ['0']),
    _templateObject14 = (0, _taggedTemplateLiteral3.default)(['thisisawesome'], ['thisisawesome']);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var equal = require('deep-equal');
var chalk = require('chalk');
var run = require('../req.js');
var oldLog = console.log;

var passed = 0;
var tests = 0;

var test = function test(code, assume) {
  tests++;
  var out = [];
  var o = chalk.yellow('[out]');
  console.log = function () {
    var args = [].slice.call(arguments, 0);
    out.push(args);
    oldLog.apply(undefined, [o].concat((0, _toConsumableArray3.default)(args)));
  };
  chalk.enabled = false;
  var promise = run(code);
  promise.then(function () {
    chalk.enabled = true;
    console.log = oldLog;
    if (!assume(out)) {
      oldLog(chalk.red('[err]'), 'Test failed!\n      ' + chalk.cyan(code) + '\n');
    } else {
      passed++;
      oldLog(chalk.green('[yay]'), 'Test passed!');
    }
  });
  return promise;
};

var checkOut = function checkOut(compare) {
  // this should be called like this:
  // test(code, checkOut`compareThis`)
  // or like this:
  // test(code, checkOut(compareThese))

  return function (result) {
    return equal(result[0], compare);
  };
};

console.time('Total tests time')((0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;

          console.log('Basic printing ---');

          // Test print output
          _context.next = 4;
          return test('print("hello!");', checkOut(_templateObject));

        case 4:
          _context.next = 6;
          return test('print("hello", "world");', checkOut(['hello', 'world']));

        case 6:
          _context.next = 8;
          return test('print(\'single quoted\');', checkOut(_templateObject2));

        case 8:
          _context.next = 10;
          return test('print(concat("foo", "bar"));', checkOut(_templateObject3));

        case 10:

          console.log('Math ---');
          // Test basic math operator functions
          _context.next = 13;
          return test('print(+(3, 4));', checkOut(_templateObject4));

        case 13:
          _context.next = 15;
          return test('print(-(3, 4));', checkOut(_templateObject5));

        case 15:
          _context.next = 17;
          return test('print(*(3, 4));', checkOut(_templateObject6));

        case 17:
          _context.next = 19;
          return test('print(/(3, 4));', checkOut(_templateObject7));

        case 19:
          _context.next = 21;
          return test('print(+(1.25, 1.755));', checkOut(_templateObject8));

        case 21:

          console.log('If/else ---');
          // Test basic if
          _context.next = 24;
          return test('\n    if(true, {\n      print("good");\n    });', checkOut(_templateObject9));

        case 24:
          _context.next = 26;
          return test('\n    ifel(false, {\n      print("bad");\n    }, {\n      print("good");\n    });', checkOut(_templateObject9));

        case 26:
          _context.next = 28;
          return test('\n    if(false, {\n      print("bad");\n    }, {\n      print("good");\n    });', checkOut(_templateObject9));

        case 28:

          console.log('Logic and comparison ---');
          // Test logic operator functions
          _context.next = 31;
          return test('print(and(true, false));', checkOut(_templateObject10));

        case 31:
          _context.next = 33;
          return test('print(or(true, false));', checkOut(_templateObject11));

        case 33:
          _context.next = 35;
          return test('print(not(true));', checkOut(_templateObject10));

        case 35:
          _context.next = 37;
          return test('print(not(false));', checkOut(_templateObject11));

        case 37:
          _context.next = 39;
          return test('print(eq(10, 20));', checkOut(_templateObject10));

        case 39:
          _context.next = 41;
          return test('print(eq(45, 45));', checkOut(_templateObject11));

        case 41:
          _context.next = 43;
          return test('print(lt(10, 20));', checkOut(_templateObject11));

        case 43:
          _context.next = 45;
          return test('print(lt(70, 30));', checkOut(_templateObject10));

        case 45:
          _context.next = 47;
          return test('print(lt(45, 45));', checkOut(_templateObject10));

        case 47:
          _context.next = 49;
          return test('print(gt(10, 20));', checkOut(_templateObject10));

        case 49:
          _context.next = 51;
          return test('print(gt(70, 30));', checkOut(_templateObject11));

        case 51:
          _context.next = 53;
          return test('print(gt(45, 45));', checkOut(_templateObject10));

        case 53:

          console.log('Surround functions ---');
          _context.next = 56;
          return test('print((true and false))', checkOut(_templateObject10));

        case 56:
          _context.next = 58;
          return test('print((true & true))', checkOut(_templateObject11));

        case 58:
          _context.next = 60;
          return test('print((99 + 1))', checkOut(_templateObject12));

        case 60:
          _context.next = 62;
          return test('print((20 > 1))', checkOut(_templateObject11));

        case 62:
          _context.next = 64;
          return test('print((1 - 1))', checkOut(_templateObject13));

        case 64:
          _context.next = 66;
          return test('print((\'this\' concat \'is\' \'awesome\'))', checkOut(_templateObject14));

        case 66:
          _context.next = 73;
          break;

        case 68:
          _context.prev = 68;
          _context.t0 = _context['catch'](0);

          console.log = oldLog;
          console.log('\x1b[31m[Errored!]\x1b[0m Error in JS:');
          console.error(_context.t0);

        case 73:
          console.timeEnd('Total tests time');
          console.log(chalk.bold(passed + '/' + tests + ' passed.'));

        case 75:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, this, [[0, 68]]);
}))());