var express = require('express'),
    exphbs  = require('express-handlebars'),
    request = require('request'),
    asynchr = require('async'),
    fs      = require('fs'),
    clone   = require('clone'),
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

  // Uncomment this to dowload images.
  //downloadImages();

  var post_options = {
    url: 'https://api.artworksapp.com/staging/artworks/',
    headers: {
      'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1N2IzMDNiNTE4MjM2MDYyNGYwZGNmOWEiLCJpYXQiOjE0NzI3Mzg0Mjh9.LZ2IqfUKA6kSJnR2OYIiJ-OA6NdAJFV_se9Y22vDoz4',
      'Content-Type': 'application/json'
    },
    json: {
      title: 'Hello Art',
      'user._id': '57b303b5182360624f0dcf9a',
      images: [
        {
          src: '',
          color: 'red',
          width: 500,
          height: 500
        }
      ]
    }
  }

  var q = asynchr.queue(function(task, done) {

    request.post(task.options, function(error, response, body) {

      if (!error && response.statusCode == 200) {
        console.log('Success!');
        console.log(body);
      }
      else {
        console.log('Error!');
        console.log(body);
      }

      done();
    });
  });

  //for (var i = 0; i < konst.length; i++) {
  for (var i = 0; i < 3; i++) { // Trying a few at a time.
    var p_options = clone(post_options);
    p_options.json.title = konst[i].titel;
    q.push({ options: p_options });
  }

  //res.send(imageAddresses);
  res.render('home');
});

function downloadImages() {

    // Collect addresses for the images in this array.
    var imageAddresses = [];
    //for (var i = 0; i < konst.length; i++) {
    for (var i = 0; i < 3; i++) { // Trying a few at a time.

      for (var j = 0; j < konst[i].media.length; j++) {

        imageAddresses.push(konst[i].media[j]);
      }
    }

    // Download all images.
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

    for (var i = 0; i < imageAddresses.length; i++) {
      q.push({ url: imageAddresses[i]});
    }
}

app.listen(3000, function() {
  console.log('App listening on port 3000');
});
