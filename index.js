var express = require('express'),
    exphbs  = require('express-handlebars'),
    request = require('request'),
    asynchr = require('async'),
    fs      = require('fs'),
    clone   = require('clone'),
    app     = express(),
    konst   = require('./konst.json');

var post_options = {
  url: 'https://api.artworksapp.com/staging/artworks/',
  headers: {
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1N2IzMDNiNTE4MjM2MDYyNGYwZGNmOWEiLCJpYXQiOjE0NzI3Mzg0Mjh9.LZ2IqfUKA6kSJnR2OYIiJ-OA6NdAJFV_se9Y22vDoz4',
    'Content-Type': 'application/json'
  },
  json: {
    'user._id': '57b303b5182360624f0dcf9a'
  }
}

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

  // Uncomment this to post artworks to the api.
  //postData();

  // Uncomment this to write all artworks with multiple images to their own file ( flerabilder.json ).
  //writeMultipleImageArtworks();

  res.send(konst);
  //res.render('home');
});

app.listen(3000, function() {
  console.log('App listening on port 3000');
});

function downloadImages() {

    // Collect addresses for the images in this array.
    var imageAddresses = [];
    for (var i = 0; i < konst.length; i++) {

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

function postData() {

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

    for (var i = 0; i < konst.length; i++) {

      var p_options = clone(post_options);

      var artist = 'Namn saknas';

      if (konst[i].konstnar) {

        nameArray = konst[i].konstnar.split(',');

        // If konst[i].konstnar konsists of two parts divided by a ',' we'll assume it's the artists first and last name.
        if (nameArray.length == 2) {

          artist = nameArray[1].trim() + " " + nameArray[0];
        }
        else {
          artist = konst[i].konstnar;
        }
      }

      p_options.json.artist = { name: artist };
      p_options.json.title = konst[i].titel;
      p_options.json.year = konst[i].ar;
      p_options.json.medium = konst[i].material;

      p_options.json.framed = false;
      p_options.json.purchasable = false;
      p_options.json.status = 'not-for-sale';
      p_options.json.gallery = { '$oid': '57b303b5182360624f0dcf9b' };
      p_options.json.shows = [];

      p_options.json.about = null;
      p_options.json.price = null;
      p_options.json.priceCurrency = null;
      p_options.json.width = null;
      p_options.json.height = null;
      p_options.json.style = null;

      // Take only the first image in media.
      var arr = konst[i].media[0].split('/');
      var imageName = arr[arr.length - 1];
      var uploadName = './images/' + imageName;

      var encodedImage = base64_encode(uploadName);

      arr = imageName.split('.');
      var pictureFormat = arr[arr.length - 1];

      p_options.json.image = {
        contentType: 'image/' + pictureFormat,
        URI: 'data:image/jpg;base64,' + encodedImage,
        fileName: imageName
      }

      q.push({ options: p_options });
    }
}

function base64_encode(file) {

  var bitmap = fs.readFileSync(file);

  return new Buffer(bitmap).toString('base64');
}

function writeMultipleImageArtworks() {

  var art = [];

  for (var i = 0; i < konst.length; i++) {

    if(konst[i].media.length > 1) {
      art.push(konst[i]);
    }
  }

  fs.writeFile('./flerabilder.json', JSON.stringify(art), function(err) {

    if (err) return console.log(err);
  });
}
