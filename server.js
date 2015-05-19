var carAttrs = require('./models/car.js'),
    fs = require('fs'),
    http = require('http'),
    mongoose = require('mongoose'),
    jade = require('jade'),
    reqFunctions = require('./requestFunctions'),
    url = require('url');

var carSchema = mongoose.Schema(carAttrs),
    Car = mongoose.model('Car', carSchema);

    // console.log(reqFunctions)

// mongoose.connect('mongodb://localhost/crud_sans_frameworks');

var Server = module.exports;

Server.generateParams = function generateParams(data){
  var params={}
  var array = data.toString().split(/[&?]/);
  array.forEach(function(string){
    tinyArray = string.split('=');
    params[tinyArray[0]]= tinyArray[1];
  });
  return params
};

Server.pageDisplay = function pageDisplay(res, fileName, queryObject, displayName){
  console.log(fileName);
  fs.readFile(fileName, 'utf8', function(err, data){
    if(err) throw err;
    compiledFile = jade.compile(data, {pretty:true, filename: fileName});
    if(displayName === 'cars'){
      // Car.find(queryObject, function(err, cars){
      //   res.end(compiledFile({cars:cars}))
      // })
      res.end(compiledFile({cars: []}));
    }else{
      // Car.find(queryObject, function(err, car){
      //   res.end(compiledFile({car:car[0]}))
      // })
      res.end(compiledFile({car: {}}));
    }
  });
};

Server.urlArray = function urlArray(req){
  return req.url.split('/');
};

Server.reqId = function reqId(req){
  array = Server.urlArray(req);
  if(array[array.length-1].match(/\d+/g) !== null) return 'carId';
  return array[array.length-1];
};

Server.handleRequest = function handleRequest(req, res) {
  var route = Server.reqId(req),
      handler;

  console.log('Attempting to reach route: "', route, '"', req.method);

  if (req.method == 'GET') {
    handler = reqFunctions.getRoute(route);
  } else if (req.method == 'POST') {
    handler = reqFunctions.postRoute(route);
  }

  console.log('Handler for request:', handler);

  try {
    if (handler) {
      console.log('Dispatching to handler');
      return handler(req, res);
    } else {
      res.writeHead(200);
      res.end('No route matched your search');
    }
  } catch (ex) {
    console.log('Something went wrong - log it here.');
    console.log(ex, ex.stack);
  }
  // res.end(reqFunctions);
};

Server.start = function start(port) {
  var server = http.createServer(Server.handleRequest);
  server.listen(port);
};
