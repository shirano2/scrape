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
  db.Article.find({"saved":"false"}).then(function(dbArticle) {
    //console.log(dbArticle);
      res.render("index", {dbArticle:dbArticle});
    })
    .catch(function(err) {
      throw err;
    });
});

app.get("/scrape", function(req, res) {
  axios.get("https://www.bbc.com/news/").then(function(response) {
    var $ = cheerio.load(response.data);
    $(".gs-c-promo").each(function(i,element) {
      var result = {};
      result.headline=$(element).find("h3").text();
      result.summary=$(element).find("p.gs-c-promo-summary").text();
      // if($(element).find(".gs-o-responsive-image img").attr("src").indexOf("http")>=0) {
      //   result.img=$(element).find(".gs-o-responsive-image img").attr("src");
      // } else {
      //   result.img="";
      // }
      // console.log(result.img);
      //console.log($(element).children(".gs-c-promo-image").find("img").attr("src"));
      //  if($(element).children("div.gs-c-promo-image").find("img").attr("src").indexOf("http")>=0) {
      //   result.img=$(element).children(".gs-c-promo-image").find("img").attr("src");
      // } else {
      //   result.img="";
      // }
   if ($(element).children(".gs-c-promo-image").find("img").data("src")!==undefined) {
        result.imageUrl=$(element).children(".gs-c-promo-image").find("img").data("src").replace("{width}","320");
      } else {
        result.imageUrl="";
      }
      // console.log($(element).children(".gs-c-promo-image").find("img").attr("src").indexOf("http")>=0);
      // console.log(result.imageUrl);
      if($(element).find("a").attr("href").indexOf("http")<0) {
        result.url="https://www.bbc.com/news"+$(element).find("a").attr("href");
      } else {
        result.url=$(element).find("a").attr("href");
      }
      if(result.imageUrl!=="" && result.summary!=="") {
        db.Article.create(result).then(function(dbArticle) {
        })
        .catch(function(err) {
          console.log(err);
        });
      }
    });
    res.redirect("/");
  });
});

app.delete("/clear", function(req, res) {
  db.Article.deleteMany({"saved":"false"}).then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    throw err;
  });
});

app.get("/saved", function(req,res){
  db.Article.find({saved:"true"})
  .populate("note")
  .then(function(dbArticle) {
      res.render("save", {dbArticle:dbArticle});
    })
  .catch(function(err) {
      res.json(err);
  });
});

app.put("/saved/:id", function(req,res){
  db.Article.findOneAndUpdate({_id:req.params.id}, { saved:req.body.saved }, { new: true })
  .then(function(dbArticle) {
      res.json(dbArticle);
    })
  .catch(function(err) {
      res.json(err);
  });
});

app.post("/note",function(req,res){
  var note={
    title:req.body.title,
    body:req.body.body
  }
  db.Note.create(note)
  .then(function(dbNote) {
		db.Article.findOneAndUpdate({_id:req.body.id}, { note: dbNote._id }, { new: true }); 
	})
  .then(function() {
    res.redirect("/saved");
  })
  .catch(function(err) {
    res.json(err);
  });
});

app.put("/deleted/:id", function(req,res){
  db.Article.findOneAndUpdate({_id:req.params.id}, { saved:"false"}, { new: true })
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
      res.json(err);
  });
});

/* listener */
app.listen(PORT, function() {
  console.log("I remain " + PORT + " lifes left!");
});