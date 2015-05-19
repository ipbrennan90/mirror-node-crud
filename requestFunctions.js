var path = require('path'),
    // reqFunctions = module.exports = {},
    Server = require('./server');

var Routes = module.exports = {getHandlers: {}, postHandlers: {}};

Routes.get = function get(routePath, handler) {
  Routes.getHandlers[routePath] = handler;
};

Routes.post = function post(routePath, request, response) {
  Routes.postHandlers[routePath] = handler;
};

Routes.init = function init() {
  Routes.get('index', Routes.index);
  Routes.get('redirect', Routes.redirect);
  Routes.get('', Routes.index);
};

Routes.createNew = function createNew(req, res) {
  Server.pageDisplay(res, path.join('.', 'views', 'index.jade'), {}, 'cars');
};

Routes.getRoute = function getRoute(routePath) {
  return Routes.getHandlers[routePath];
};

Routes.postRoute = function postRoute(routePath) {
  return Routes.postHandlers[routePath];
}

// reqFunctions['redirect'] = function(res){
//   res.writeHead(301, {Location: 'http://localhost:1337/cars'});
//   res.end();
// };

// reqFunctions['/favicon.ico'] = function(res){
//   reqFunctions.redirect(res);
// };

Routes.index = function index(req, res) {
  // console.log('hi', res);
  if (req.method == 'GET') {
    Server.pageDisplay(res, path.join(__dirname, 'views', 'index.jade'), {}, 'cars');
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
};

// reqFunctions['cars']:{
//     func: function(req, res){
//       if(req.method == 'GET') pageDisplay(res, 'index.jade', {}, 'cars')
//       var postParams;
//       req.on('data', function(data){
//         postParams = generateParams(data);
//         var car = new Car(postParams);
//         car.save(function(err, car){
//           if (err) return console.error(err);
//           reqFunctions.redirect(res);
//         })
//       });

//     }
//   },

//   'carId':{
//     func: function(req,res){
//       var id = urlArray(req)[urlArray(req).length-1];
//       if(req.method === 'GET') pageDisplay(res, 'show.jade', {_id: id }, 'car');
//       var putParams;
//       req.on('data', function(data){
//         putParams = generateParams(data);
//         updateObject = {};

//         for(var key in putParams){
//           if(putParams[key]) updateObject[key]= putParams[key];
//         }

//         Car.update({ _id: id }, { $set: updateObject}, function(err, car){
//           if(err) return console.error(err);
//         })
//         reqFunctions.redirect(res);
//       })
//     }
//   },

//   'delete':{
//     func: function(req, res){
//       Car.find({_id: urlArray(req)[urlArray(req).length-2]}).remove().exec();
//       reqFunctions.redirect(res);
//     }
//   },

//   'edit':{
//     func: function(req, res){
//       var edit = fs.readFileSync('edit.jade', 'utf8');
//       compiledEdit = jade.compile(edit, {pretty:true, filename: 'show.jade'});
//       Car.findOne({_id: urlArray(req)[urlArray(req).length-2]}, function(err, car){
//         var rendered = compiledEdit({car: car});
//         res.end(rendered);
//       })
//     }
//   }
// };
