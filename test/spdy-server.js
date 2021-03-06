var fs = require('fs'),
    http = require('http'),
    spdy = require('../lib/spdy'),
    tls = require('tls'),
    buffer = require('buffer').Buffer,
    NPNProtocols = new Buffer(7);

if (!tls.NPN_ENABLED) throw 'You\'re using not NPN-enabled version of node.js';

// Don't crash on errors
process.on('uncaughtException', function (err) {
  console.log('Caught uncaughtException: ' + err.stack);
  console.log('Arg1 constructor: ' + err.arguments[1].constructor.toString());
});

var options = {
  key: fs.readFileSync(__dirname + '/../keys/spdy-key.pem'),
  cert: fs.readFileSync(__dirname + '/../keys/spdy-cert.pem'),
  ca: fs.readFileSync(__dirname + '/../keys/spdy-csr.pem'),
  NPNProtocols: ['spdy/2']
};

var static = require('connect').static(__dirname + '/../pub');

var bigBuffer = new Buffer(JSON.stringify({ok: true}));

var server = spdy.createServer(options, function(req, res) {
  if (req.method == 'POST') {
    res.writeHead(200);
    req.pipe(res);
    return;
  }
  if (req.streamID && req.url == '/') {
    req.url = '/index-spdy.html';
  }
  static(req, res, function() {
    res.writeHead(404);
    res.end();
  });
});
server.listen(8081, function() {
  console.log('TLS NPN Server is running on port : %d', 8081);
});
