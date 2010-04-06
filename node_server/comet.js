var sys = require('sys'), 
   http = require('http'),
   repl = require('repl');

messages = [];
message_queue = new process.EventEmitter();


addMessage = function(message) {
    messages.push({
        guid: messages.length,
        message: message,
        time: Date.now()
    });
    sys.puts("Message added " + message);
    message_queue.emit("newMessage");
};

getMessagesSince = function(lastTimeAsked) {
    if (!lastTimeAsked) {
      return messages;
    }
    return messages.filter(function(m) {
      // sys.puts("Message time "+ m.time + ", your time " + lastTimeAsked + " Will return " + (m.time > lastTimeAsked));
      return m.time > lastTimeAsked;
    });
};

routeToAction = function(route, req, res) {
  if (route === '/messages') {
    getMessagesAction(req, res);
  } else if (route === '/add') {
    addMesssageAction(req, res);
  }
};

addMesssageAction = function(req, res) {
  var message = req.url.split('?')[1];
  
  res.sendHeader(201, {'Content-Type': 'text/plain', "Connection": 'Close'});
  
  addMessage(message);
  res.finish();
  
};

getMessagesAction = function(req, res) {
  var lastTimeAsked = req.url.split('?')[1];
  
  res.sendHeader(200, {'Content-Type': 'text/plain', "Connection": 'Close'});
  var m = getMessagesSince(lastTimeAsked);
  if (m.length) {
      res.sendBody(JSON.stringify(m));
      res.finish();
  } else {
      var timeout = setTimeout(function() {
          res.sendBody(JSON.stringify([]));
          res.finish();
          message_queue.removeListener('newMessage', listener);
      }, 10000);
      var listener = message_queue.addListener("newMessage", function(e) {
          var m = getMessagesSince(lastTimeAsked);
          res.sendBody(JSON.stringify(m));
          res.finish();
          clearTimeout(timeout);
          message_queue.removeListener('newMessage', listener);
      });
  }
};


s = http.createServer(function (req, res) {
    // "/messages"
    // "/add"
    var route = req.url.split('?')[0];
    routeToAction(route, req, res);
});
s.addListener("connection", function(s) {
    sys.puts("somene has connected " + s);
});
s.listen(8000);
sys.puts('Server running at http://127.0.0.1:8000/');
repl.start('>');