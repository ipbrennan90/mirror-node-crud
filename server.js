var fs = require("fs"),
    http = require("http"),
    mongoose = require("mongoose"),
    jade = require('jade');
    url = require('url')

// load Car model
var carAttrs = require("./car.js"),
    carSchema = mongoose.Schema(carAttrs);

var Car = mongoose.model('Car', carSchema);
mongoose.connect('mongodb://localhost/crud_sans_frameworks');

var generateParams = function(data){
  var params={}
  var array = data.toString().split(/[&?]/);
  array.forEach(function(string){
    tinyArray = string.split("=");
    params[tinyArray[0]]= tinyArray[1];
  });
  return params
}
var handleRequest = function(req, res) {

  if(req.url === '/favicon.ico'){
    res.end('');
    return;
  }

  var urlArray= req.url.split("/")
  var carId = urlArray[urlArray.length-1]

  if (req.url == '/') {
    res.writeHead(301, {Location: 'http://localhost:1337/cars'})
    res.end();
  }

  if (carId === 'cars' && req.method == "GET") {
    var index = fs.readFileSync('index.jade', 'utf8');

    compiledIndex = jade.compile(index, { pretty: true, filename: 'index.jade' });

    Car.find({}, function(err, cars){
      var rendered = compiledIndex({cars:cars});
      res.end(rendered)
    })
  } else if(carId === 'cars' && req.method == "POST"){

    var postParams;
    req.on('data', function(data){
      postParams = generateParams(data)
      var car = new Car(postParams)
      car.save(function(err, car){
        if (err) return console.error(err);
        console.log("CAR SAVED!!")
      })
    });

    res.writeHead(301, {Location: 'http://localhost:1337/cars'})

    res.end()
  }else if (carId === 'new') {
    var newTemplate = fs.readFileSync('new.jade', 'utf8');
    compiledNewTemplate = jade.compile(newTemplate, {pretty: true, filename: 'new.jade'});
    res.end(compiledNewTemplate())
  }else if (carId.match(/\d+/g) !== null && req.method == "POST"){
    var putParams;
    req.on('data', function(data){
      putParams = generateParams(data)
      updateObject = {}
      if (putParams["_method"] === "put"){
        for(var key in putParams){
          if(putParams[key]) updateObject[key]= putParams[key]
        }

        console.log(updateObject)
        Car.update({ _id: carId }, { $set: updateObject}, function(err, car){
          if(err) return console.error(err)
          console.log(car)
        })

      } else {
        Car.find({_id: carId}).remove().exec()
      }


    })

    res.writeHead(301, {Location: 'http://localhost:1337/cars'})

    res.end()

  }else if (carId.match(/\d+/g) !== null && req.method == "GET"){
    var show = fs.readFileSync('show.jade', 'utf8');
    compiledShow = jade.compile(show, {pretty:true, filename: 'show.jade'});
    Car.findOne({_id: carId}, function(err, car){
      var rendered = compiledShow({car: car});
      res.end(rendered);
    })

  }else if(carId === 'edit'){
    var edit = fs.readFileSync('edit.jade', 'utf8');
    compiledEdit = jade.compile(edit, {pretty:true, filename: 'show.jade'});
    Car.findOne({_id: urlArray[urlArray.length-2]}, function(err, car){
      var rendered = compiledEdit({car: car});
      res.end(rendered);
    })
  }else {
    res.writeHead(200);
    res.end('A new programming journey awaits');
  }
};

var server = http.createServer(handleRequest);
server.listen(1337);
