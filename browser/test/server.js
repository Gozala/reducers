/*jshint asi:true */

var http = require('http')
var server = http.createServer(function(request, response) {
  server.request = request
  server.response = response
  response.setHeader('Access-Control-Allow-Origin', '*')
  server.request.on('data', function(data) {
    console.log('request >>>', String(data))
  })
  server.request.on('close', function(data) {
    console.log('request <<<')
  })
})
server.listen(8080)

function writeHead() {
  server.response.writeHead(200, { 'Content-Type': 'application/json' })
}

function writeJSON(json) {
  server.response.write(JSON.stringify(json) + '\n')
}

function end(data) {
  server.response.end(data && JSON.stringify(data))
}
