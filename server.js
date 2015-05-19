var fs = require("fs"),
    http = require("http"),
    mongoose = require("mongoose"),
    jade = require('jade');
    url = require('url')

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

var pageDisplay = function(res, fileName, queryObject, displayName){
  fs.readFile(fileName, 'utf8', function(err, data){
    if(err) throw err;
    compiledFile = jade.compile(data, {pretty:true, filename: fileName});
    if(displayName === 'cars'){
      Car.find(queryObject, function(err, cars){
        res.end(compiledFile({cars:cars}))
      })
    }else{
      Car.find(queryObject, function(err, car){
        res.end(compiledFile({car:car[0]}))
      })
    }
  })
}

var urlArray = function(req){
  return req.url.split("/")
}

var reqId = function(req){
  array = urlArray(req)
  if(array[array.length-1].match(/\d+/g) !== null) return 'carId'
  return array[array.length-1]
}

var reqFunctions = {
  redirect: function(res){
    res.writeHead(301, {Location: 'http://localhost:1337/cars'});
    res.end();
  },

  "/favicon.ico":{
    func: function(res){
      reqFunctions.redirect(res);
    }
  },

  "cars":{
    func: function(req, res){
      if(req.method == "GET") pageDisplay(res, 'index.jade', {}, 'cars')
      var postParams;
      req.on('data', function(data){
        postParams = generateParams(data);
        var car = new Car(postParams);
        car.save(function(err, car){
          if (err) return console.error(err);
          reqFunctions.redirect(res);
        })
      });

    }
  },

  'carId':{
    func: function(req,res){
      var id = urlArray(req)[urlArray(req).length-1];
      if(req.method === "GET") pageDisplay(res, 'show.jade', {_id: id }, 'car');
      var putParams;
      req.on('data', function(data){
        putParams = generateParams(data);
        updateObject = {};

        for(var key in putParams){
          if(putParams[key]) updateObject[key]= putParams[key];
        }

        Car.update({ _id: id }, { $set: updateObject}, function(err, car){
          if(err) return console.error(err);
        })
        reqFunctions.redirect(res);
      })
    }
  },

  'delete':{
    func: function(req, res){
      Car.find({_id: urlArray(req)[urlArray(req).length-2]}).remove().exec();
      reqFunctions.redirect(res);
    }
  },

  'edit':{
    func: function(req, res){
      var edit = fs.readFileSync('edit.jade', 'utf8');
      compiledEdit = jade.compile(edit, {pretty:true, filename: 'show.jade'});
      Car.findOne({_id: urlArray(req)[urlArray(req).length-2]}, function(err, car){
        var rendered = compiledEdit({car: car});
        res.end(rendered);
      })
    }
  }
};


var handleRequest = function(req, res) {

  if(reqFunctions.hasOwnProperty(reqId(req))) return reqFunctions[reqId(req)].func(req, res);
  res.writeHead(200);
  res.end('A new programming journey awaits');

};

var server = http.createServer(handleRequest);
server.listen(1337);
