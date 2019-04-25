/* port */
var PORT = process.env.PORT || 3000;

/* setting */
var express = require("express");
var exphbs = require("express-handlebars");
//var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db=require("./models");
var app = express();

/* static content in "public" directory */
app.use(express.static("public"));

/* parse request body as JSON */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* remain log */
//app.use(logger("dev"));

/* handlebars */
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scrapeDB", { useNewUrlParser: true });

app.get("/", function(req, res) {
  db.Article.find({}).then(function(dbArticle) {
    //console.log(dbArticle);
      res.render("index", {dbArticle:dbArticle});
    })
    .catch(function(err) {
      throw err;
    });
});

// app.get("/scrape", function(req, res) {
//   axios.get("http://www.echojs.com/").then(function(response) {
//     var $ = cheerio.load(response.data);

//     $("article h2").each(function(i, element) {
//       var result = {};

//       result.title = $(this).children("a").text();
//       result.link = $(this).children("a").attr("href");

//       db.Article.create(result)
//         .then(function(dbArticle) {
//           console.log(dbArticle);
//         })
//         .catch(function(err) {
//           console.log(err);
//         });
//     });
//     res.send("Scrape Complete");
//   });
// });
app.get("/scrap", function(req, res) {
  axios.get("https://www.bbc.com/news/").then(function(response) {
    var $ = cheerio.load(response.data);
    $(".gs-c-promo").each(function(i,element) {
      var result = {};
      result.headline=$(element).find("h3").text();
      result.summary=$(element).find("p.gs-c-promo-summary").text();
      if($(element).find("a").attr("href").indexOf("http")<0) {
        result.url="https://www.bbc.com/news"+$(element).find("a").attr("href");
      } else {
        result.url=$(element).find("a").attr("href");
      }
      if(result.summary!=="") {
        db.Article.create(result).then(function(dbArticle) {
          //console.log(dbArticle);
        })
        .catch(function(err) {
          throw err;
        });
      }
      //console.log($(element).find("h3").text());
      //console.log(result);
    });
    res.redirect("/");
  });
});

app.get("/clear", function(req, res) {
  db.Article.deleteMany({}).then(function() {
    //console.log(dbArticle);
    res.redirect("/");
  })
  .catch(function(err) {
    throw err;
  });
});




/* listener */
app.listen(PORT, function() {
  console.log("I remain " + PORT + " lifes left!");
});