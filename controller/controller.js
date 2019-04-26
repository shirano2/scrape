/* setting */
var express=require("express");
var db=require("../models");
var axios=require("axios");
var cheerio = require("cheerio");
var router = express.Router();

/* index site */
router.get("/", function(req, res) {
    db.Article.find({"saved":"false"}).then(function(dbArticle) {
        res.render("index", {dbArticle:dbArticle});
      })
      .catch(function(err) {
        res.json(err);
      });
  });
  
/* when click the button to scrape articles */
router.get("/scrape", function(req, res) {
    axios.get("https://www.bbc.com/news/").then(function(response) {
      var $ = cheerio.load(response.data);
      $(".gs-c-promo").each(function(i,element) {
        var result = {};
        result.headline=$(element).find("h3").text();
        result.summary=$(element).find("p.gs-c-promo-summary").text();
        if ($(element).children(".gs-c-promo-image").find("img").data("src")!==undefined) {
          result.imageUrl=$(element).children(".gs-c-promo-image").find("img").data("src").replace("{width}","320");
        } else {
          result.imageUrl="";
        }
        if($(element).find("a").attr("href").indexOf("http")<0) {
          result.url="https://www.bbc.com"+$(element).find("a").attr("href");
        } else {
          result.url=$(element).find("a").attr("href");
        }
        if(result.imageUrl!=="" && result.summary!=="") {
          db.Article.create(result).then(function(dbArticle) {
          })
          .catch(function(err) {
            res.json(err);
          });
        }
      });
      res.send("send ok!");
    });
});

/* when click the button to clear articles except for saved */
router.delete("/clear", function(req, res) {
    db.Article.deleteMany({"saved":"false"}).then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});
  
/* when click the button to see saved articles */
router.get("/saved", function(req,res){
    db.Article.find({saved:"true"})
    .populate("notes")
    .then(function(dbArticle) {
        res.render("save", {dbArticle:dbArticle});
    })
    .catch(function(err) {
        res.json(err);
    });
});

/* when click the button to save an article */  
router.put("/saved/:id", function(req,res){
    db.Article.findOneAndUpdate({_id:req.params.id}, { saved:req.body.saved }, { new: true })
    .then(function(dbArticle) {
        res.json(dbArticle);
      })
    .catch(function(err) {
        res.json(err);
    });
});

/* when click the button to save a note */   
router.post("/note",function(req,res){
    var note={
      title:req.body.title,
      body:req.body.body
    }
    db.Note.create(note)
    .then(function(dbNote) {
      db.Article.findOneAndUpdate({_id:req.body.id}, { notes: dbNote._id}, { new: true })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
    });
});

/* when click the button to remove saved article */ 
router.put("/deleted/:id", function(req,res){
    db.Article.findOneAndUpdate({_id:req.params.id}, { saved:"false"}, { new: true })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

module.exports = router;