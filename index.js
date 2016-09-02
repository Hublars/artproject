var express = require('express'),
    exphbs  = require('express-handlebars'),
    request = require('request'),
    asynchr = require('async'),
    fs      = require('fs'),
    app     = express(),
    konst   = require('./konst.json');

app.use('/static', express.static(__dirname + '/public'));

app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: 'hbs'
}));
app.set('view engine', '.hbs');
app.set('views', __dirname + '/views');

app.get('/', function (req, res) {

  // Collect addresses for the images in this array.
  var imageAddresses = [];
  for (var i = 0; i < konst.length; i++) {

    for (var j = 0; j < konst[i].media.length; j++) {

      imageAddresses.push(konst[i].media[j]);
    }
  }

  var logit = true;

  var q = asynchr.queue(function(task, done) {
    request(task.url, { encoding: 'binary' }, function(err, res, body) {
      if (err) return done(err);
      if (res.statusCode != 200) return done(res.statusCode);

      var arr = task.url.split("/");
      var imageName = arr[arr.length - 1];
      var saveName = './images/' + imageName;
      fs.writeFile(saveName, body, 'binary', function(err) {});
      done();
    });
  });

  //Only trying a few images at a time.
  //for (var i = 0; i < imageAddresses.length; i++) {
  for (var i = 0; i < 3; i++) {
    console.log(imageAddresses[i]);
    q.push({ url: imageAddresses[i]});
  }

  res.send(imageAddresses);
  //res.render('home');
});

app.get('/getimages', function (req, res) {

  console.log('test');
});

app.listen(3000, function() {
  console.log('App listening on port 3000');
});
