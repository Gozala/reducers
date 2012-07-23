/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

//var Stream = require('stream').Stream
//var Socket = require('net').Socket
var fsbinding = process.binding('fs')
var flags = process.binding('constants');
var fs = require('fs')
var path = require('path')

var Buffer = require('buffer').Buffer

var core = require('./core'),
    convert = core.convert, end = core.end, error = core.error,
    accumulate = core.accumulate, capture = core.capture,
    append = core.append, transform = core.transform,
    accumulated = core.accumulated, drop = core.drop

var eventuals = require('eventual/eventual'),
    defer = eventuals.defer, deliver = eventuals.deliver,
    when = eventuals.when
var eventual = require('eventual/core').eventual

var accumulators = require('./accumulator'),
    expand = accumulators.expand, reduce = accumulators.reduce,
    sequential = accumulators.sequential

var Box = require('./box')

var channel = require('./channel').channel
var queue = require('./queue')
var cache = require('./cache')

var pause = Box('Indicator that source has to be paused')

// Define a shortcut for `Array.prototype.slice.call`.
var unbind = Function.call.bind(Function.bind, Function.call)
var slice = Array.slice || unbind(Array.prototype.slice)

var isWindows = process.platform === 'win32'
var makePath = path._makeLong
function makeMode(value) {
  return typeof(value) === 'string' ? parseInt(value, 8) :
                                      value
}

function Exception(code, syscall) {
  var error = Error(syscall + ' ' + code);
  error.errno = error.code = code;
  error.syscall = syscall;
  return error;
}

var O_EXCL = flags.O_EXCL

var FLAGS = {
  'r'   :     flags.O_RDONLY,
  'rs'  :     flags.O_RDONLY | flags.O_SYNC,
  'r+'  :     flags.O_RDWR,
  'rs+' :     flags.O_RDWR | flags.O_SYNC,

  'w'   :     flags.O_TRUNC | flags.O_CREAT | flags.O_WRONLY,
  'wx'  :     flags.O_TRUNC | flags.O_CREAT | flags.O_WRONLY | flags.O_EXCL,
  'xw'  :     flags.O_TRUNC | flags.O_CREAT | flags.O_WRONLY | flags.O_EXCL,

  'w+'  :     flags.O_TRUNC | flags.O_CREAT | flags.O_RDWR,
  'wx+' :     flags.O_TRUNC | flags.O_CREAT | flags.O_RDWR,
  'xw+' :     flags.O_TRUNC | flags.O_CREAT | flags.O_RDWR | flags.O_EXCL,

  'a'   :     flags.O_APPEND | flags.O_CREAT | flags.O_WRONLY,
  'ax'  :     flags.O_APPEND | flags.O_CREAT | flags.O_WRONLY,
  'xa'  :     flags.O_APPEND | flags.O_CREAT | flags.O_WRONLY | flags.O_EXCL,

  'a+'  :     flags.O_APPEND | flags.O_CREAT | flags.O_RDWR,
  'ax+' :     flags.O_APPEND | flags.O_CREAT | flags.O_RDWR | flags.O_EXCL,
  'xa+' :     flags.O_APPEND | flags.O_CREAT | flags.O_RDWR | flags.O_EXCL
}

function makeFlags(flag) {
  // Only mess with strings
  if (typeof(flag) !== 'string') return flag;

  // O_EXCL is mandated by POSIX, Windows supports it too.
  // Let's add a check anyway, just in case.
  if (!O_EXCL && ~flag.indexOf('x'))
    throw Exception('ENOSYS', 'fs.open(O_EXCL)')

  if (flag in FLAGS) return FLAGS[flag]

  throw new Error('Unknown file open flag: ' + flag)
}

var DEFAULT_DIR_MODE = makeMode('0777')
var DEFAULT_FILE_MODE = makeMode('0666')

function AsyncAccumulator() {}
accumulate.define(AsyncAccumulator, function(self, next, initial) {
  self.lambda.apply(self, self.arguments.concat(function(e, value) {
    return e ? next(end(), next(error(e), initial)) :
               Array.isArray(value) ? accumulate(value, next, initial) :
               next(end(), next(value, initial))
  }))
})

function SyncAccumulator() {}
accumulate.define(SyncAccumulator, function(self, next, initial) {
  try {
    var value = self.lambda.apply(self, self.arguments)
    if (Array.isArray(value)) accumulate(value, next, initial)
    else next(end(), next(value, initial))
  } catch (e) {
    next(end(), next(error(e), initial))
  }
})

function accumulator(lambda) {
  return function decodated() {
    var args = slice(arguments)
    var options = args.pop()
    var value = options && options.sync ? new SyncAccumulator() :
                                          new AsyncAccumulator()
    value.lambda = lambda
    value.arguments = args
    return value
  }
}

var _stat = accumulator(fsbinding.stat)
function stat(path, options) {
  return _stat(makePath(path), options)
}
exports.stat = stat

var _lstat = accumulator(fsbinding.lstat)
function lstat(path, options) {
  return _lstat(makePath(path, options))
}
exports.lstat = lstat

var _exists = accumulator(function(path, callback) {
  try {
    fsbinding.stat(path, callback && function(e) {
      callback(null, e ? false : true)
    })
    return true
  } catch (error) {
    return false
  }
})

function exists(path, options) {
  return _exists(makePath(path), options)
}
exports.exists = exists

var readdir = accumulator(fsbinding.readdir)
function list(path, options) {
  return readdir(makePath(path), options)
}
exports.list = list

var unlink = accumulator(fsbinding.unlink)
function remove(path, options) {
  return unlink(makePath(path), options)
}
exports.remove = remove

var mkdir = accumulator(fsbinding.mkdir)
function makeDirectory(path, options) {
  var mode = options && makeMode(options.mode) || DEFAULT_DIR_MODE
  return mkdir(makePath(path), mode, options)
}
exports.makeDirectory = makeDirectory

var rmdir = accumulator(fsbinding.rmdir)
function removeDirectory(path, options) {
  return rmdir(makePath(path), options)
}
exports.removeDirectory = rmdir

var _rename = accumulator(fsbinding.rename)
function rename(from, to, options) {
  return _rename(makePath(from), makePath(to), options)
}
exports.rename = rename

var truncate = accumulator(fsbinding.truncate)

var readlink = accumulator(fsbinding.readlink)
function readLink(path, options) {
  return readlink(makePath(path), options)
}
exports.readlink = readLink

var symlink = accumulator(fsbinding, symlink)
function preprocessSymlinkDestination(path, type) {
  return !isWindows ? path : // No preprocessing is needed on Unix.
         // Junctions paths need to be absolute and \\?\-prefixed.
         type === 'junction' ? makePath(path) :
         // Windows symlinks don't tolerate forward slashes.
         ('' + path).replace(/\//g, '\\')
}

function symbolicLink(destination, path, options) {
  var type = options && options.type || null
  var target = preprocessSymlinkDestination(destination)
  return symlink(target, makePath(path), type)
}
exports.symbolicLink = symbolicLink

var _link = accumulator(fsbinding.link)
function link(source, target) {
  return _link(makePath(source), makePath(target))
}
exports.link = link

var _chmod = accumulator(fsbinding.chmod)
function chmod(path, mode, options) {
  return _chmod(makePath(path), makeMode(mode), options)
}
exports.chmod = chmod

var _chown = accumulator(fsbinding.chown)
function chown(path, uid, gid, options) {
  return _chown(makePath(path), uid, gid, options)
}
exports.chown = chown

var _open = accumulator(fsbinding.open)
function open(path, options) {
  var flags = makeFlags(options && options.flags || 'r')
  var mode = makeMode(options && options.mode || DEFAULT_FILE_MODE)
  return cache(_open(makePath(path), flags, mode, options))
}
exports.open = open

var _close = accumulator(fsbinding.close)
function close(file, options) {
  return expand(file, function(fd) {
    console.log('<<< close')
    return drop(_close(fd, options), 1)
  })
}
exports.close = close

var _read = accumulator(fsbinding.read)

function readChunck(fd, buffer, start, size) {
  var promise = defer()
  fsbinding.read(fd, buffer, 0, size, start, function onread(error, count) {
    deliver(promise, error || count)
  })
  return promise
}

function reader(file, options) {
  var size = options && options.size || 64 * 1024
  var start = options && options.start >= 0 ? options.start : null
  var finish = options && options.end || Infinity
  var encoding = options && options.encoding || 'binary'
  var buffer = Buffer(size)

  return expand(file, function(fd) {
    return convert(file, function(self, next, state) {
      function onError(e) { next(error(e)) }
      function onChunk(count) {
        if (count === 0)
          return next(end(), state)

        start = start === null ? start : start + count
        when(next(buffer.slice(0, count), state), onNext, onError)
      }

      function onNext(value) {
        state = value
        if (state && state.is === accumulated)
          return next(end(), state.value)
        else if (start >= finish)
          return next(end(), state)

        if (state && state.is == pause)
          return state

        when(readChunck(fd, buffer, start, size), onChunk, onError)
      }

      onNext(state)
    })
  })
}
exports.reader = reader

function withOpen(path, f, options) {
  var file = open(path, options)
  // TODO: Close won't execute if part of the result is
  // consumed.
  return append(f(file, options), close(file))
}
exports.withOpen = withOpen

function read(file, options) {
  options = options || {}
  options.flags = options.flags || 'r'
  return typeof(file) === 'string' ? withOpen(file, reader, options) :
         typeof(file) === 'number' ? reader([ file ], options) :
         reader(file, options)
}
exports.read = read

function writeChunck(fd, chunk, start, offset) {
  var promise = defer()
  var position = start === null ? start : start + offset
  fsbinding.write(fd, chunk, 0, chunk.length, position, function(error, value) {
    deliver(promise, error || offset + value)
  })
  return promise
}

function writter(file, options) {
  options = options || {}
  var start = options.start || null
  var input = options.input
  return sequential(expand(file, function(fd) {
    return reduce(input, eventual(function(wrote, chunk) {
      return writeChunck(fd, chunk, start, wrote)
    }), 0)
  }))
}

function write(file, input, options) {
  options = options || {}
  options.flags = options.flags || 'w'
  options.input = input
  return typeof(file) === 'string' ? withOpen(file, writter, options) :
         typeof(file) === 'number' ? writter([ file ], options) :
         writter(file, options)
}
exports.write = write
