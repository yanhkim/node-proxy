/*
 Copyright (c) 2010 Peter Sanford

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

const PORT = process.env.PORT || 8000;
const DEBUG = process.env.NODE_DEBUG ? true : false;

var log = DEBUG ? require('./log').logger('proxy', { timestamp: true }) : function() {};

var http = require('http')
  , url = require('url');

var server = http.createServer(function(req, res) {
    log('<<< [' + req.url + '] begin');
    // parse request to proxy
    var purl = url.parse(req.url);

    var options = purl;
    options.headers = req.header;
    options.method = req.method;

    // create remote request
    var rreq = http.request(options, function(rres) {
        log('>>> [' + req.url + '] begin');
        // deliver remote server's header, data, end event to proxy user
        res.writeHead(rres.statusCode, rres.headers);

        rres.on('data', function(chunk) {
            log('>>> [' + req.url + '] body received:', chunk.length);
            res.write(chunk);
        });

        rres.on('end', function() {
            log('>>> [' + req.url + '] end');
            res.end();
        });
    });

    // if receive http body or end sign, pass it to remote server
    req.on('data', function(chunk) {
        log('<<< [' + req.url + '] body received:', chunk.length);
        rreq.write(chunk);
    });

    req.on('end', function() {
        log('<<< [' + req.url + '] end');
        rreq.end();
    });
});

server.listen(PORT, function() {
    log('proxy server running on port:', PORT);
});
