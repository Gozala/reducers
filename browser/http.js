/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var XHR = require('./xhr')
var url = require('url')
var core = require('reducers/core'),
    convert = core.convert,
    accumulated = core.accumulated, end = core.end, error = core.error,
    take = core.take, drop = core.drop, map = core.map

var Method = require('method')

var read = Method()

var keys = Object.keys
var isArray = Array.isArray

// Based of https://mxr.mozilla.org/mozilla-central/source/content/base/src/nsXMLHttpRequest.cpp#3221
var unsupportedHeaders = [
  'accept-charset', 'accept-encoding', 'access-control-request-headers',
  'access-control-request-method', 'connection', 'content-length',
  'cookie', 'cookie2', 'content-transfer-encoding', 'date', 'expect',
  'host', 'keep-alive', 'origin', 'referer', 'te', 'trailer',
  'transfer-encoding',  'upgrade', 'user-agent', 'via'
]

function isHeaderSupported(name) {
  return unsupportedHeaders.indexOf(name) === -1
}

function setHeaders(xhr, headers) {
  keys(headers).forEach(function (name) {
    if (!isHeaderSupported(name)) {
      var value = headers[name]
        if (isArray(value))
          value.forEach(function(value) { xhr.setRequestHeader(name, value) })
        else
          xhr.setRequestHeader(name, value)
    }
  })
}

function incorporateHeader(headers, source) {
  if (source !== '') {
    var m = source.match(/^([^:]+):\s*(.*)/)
    if (m) {
      var name = m[1].toLowerCase()
      var value = m[2]
      if (headers[name] !== undefined) {
        if (isArray(headers[name])) headers[name].push(value)
        else headers[name] = [ headers[name], value ]
      } else {
        headers[name] = value
      }
    } else {
      headers[source] = true
    }
  }
  return headers
}

function parseHeaders(xhr) {
  try {
    var lines = xhr.getAllResponseHeaders().split(/\r?\n/)
    return lines.reduce(incorporateHeader, {})
  } catch(e) {
    return null
  }
}

var isStatus2Supported = true
var isStreamingSupported = true

function readChunk(xhr, position) {
  try { return xhr.responseText.substr(position) } catch(e) { return null }
}

function Request(options) {
  this.method = options.method ? options.method.toUpperCase() : 'GET'
  this.headers = options.headers || null
  this.protocol = options.protocol || 'http:'
  this.host = options.host
  this.port = options.port || null
  this.path = options.path || '/'
  this.hash = options.hash || ''
  this.query = options.query || ''
  this.body = options.body || ''
  this.type = options.type || null
  this.mimeType = options.mimeType || null
  this.credentials = options.credentials || null
  this.timeout = options.timeout || null
  this.uri = options.uri || url.format(options)
}
read.define(Request, function(request) {
  var uri = request.uri
  var method = request.method
  var type = request.type
  var headers = request.headers
  var mimeType = request.mimeType
  var credentials = request.credentials
  var timeout = request.timeout
  var body = request.body

  return convert(request, function(self, next, state) {
    var xhr = new XHR()
    if (credentials)
      xhr.open(method, uri, true, credentials.user, credentials.password)
    else
      xhr.open(request.method, request.uri, true)

    if (type) xhr.responseType = type
    if (headers) setHeaders(xhr, headers)
    if (mimeType) xhr.overrideMimeType(mimeType)
    if (credentials) xhr.withCredentials = true
    if (timeout) xhr.timeout = timeout

    var position = 0
    var responseHeaders = null
    var responseStatusCode = null
    var chunk = null

    xhr.onreadystatechange = function readyStateHandler(event) {
      if (!responseHeaders && (responseHeaders = parseHeaders(xhr))) {
        state = next({
          headers: responseHeaders,
          statusCode: xhr.status 
        }, state)
      } else if ((chunk = readChunk(xhr, position))) {
        position = position + chunk.length
        state = next(chunk, state)
      }

      if (xhr.readyState === 4) {
        xhr.onreadystatechange = null
        if (xhr.error) next(error(xhr.error), state)
        else next(end(), state)
      } else if (state && state.is === accumulated) {
        xhr.onreadystatechange = null
        xhr.abort()
        next(end(), state.value)
      }
    }

    xhr.send(body)
  })
})

function request(options) { return new Request(options) }
exports.request = request

read.define(String, function(uri) { return read(request({ uri: uri })) })
exports.read = read

function readHead(request) {
  return take(read(request), 1)
}
exports.readHead = readHead

function readHeaders(request) {
  return map(readHead(request), function(head) { return head.headers })
}
exports.readHeaders = readHeaders

function readBody(request) {
  return drop(read(request), 1)
}
exports.readBody = readBody
