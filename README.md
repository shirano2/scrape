# Scrape

This app is for scraping the news from CNN Sites.

If you click "SCRAPE NEW ARTICLES!" button, then you can get many recent articles from CNN site.

If you like some articles, then you can save them, and add your notes to your saved articles.

If you want to get recent articles, then click the "CLEAR ARTICLES" button and click the "SCRAPE NEW ARTICLES!" button again.


## Site
https://scrape-22948.herokuapp.com/


### Technologies Used

* HTML5
* CSS3
* jQuery
* Javascript
* Node.JS
* MongoDB
* axios, cheerio, express, express-handlebars mongoose


### Home Page 

When a user comes to website, if you click "SCRAPE NEW ARTICLES" button, then sites show you the recent hot news from CNN site.
If CNN site updates its news, you can add recent articles more after you clicked "SCRAPE NEW ARTICLES" button again.
Also you can delete all news of current page by clicking "CLEAR ARTICLES".
If you like some articles, then you can save them. Saved articles can be found out in Saved Page.
Or if you want to go to the CNN site directly, just click "GO TO SITE" button.

#### Show articles

```
router.get("/", function(req, res) {
    db.Article.find({"saved":"false"}).then(function(dbArticle) {
        res.render("index", {dbArticle:dbArticle});
    })
    .catch(function(err) {
        res.json(err);
    });
});
```

#### Scrape articles

```
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
```

#### Clear Articles (Except for saved)

```
router.delete("/clear", function(req, res) {
    db.Article.deleteMany({"saved":"false"}).then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});
```

#### Save Articles 

```
router.put("/saved/:id", function(req,res){
    db.Article.findOneAndUpdate({_id:req.params.id}, { saved:req.body.saved }, { new: true })
    .then(function(dbArticle) {
        res.json(dbArticle);
      })
    .catch(function(err) {
        res.json(err);
    });
});
```


### Saved Page

User can find saved books from DB here. And also you can add your own note to books. Also user can delete saved books from DB

#### Show saved articles

```
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
```

#### Add notes

```
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
```


#### Delete articles

```
router.put("/deleted/:id", function(req,res){
    db.Article.findOneAndUpdate({_id:req.params.id}, { saved:"false"}, { new: true })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});
```

### Creator
This is made by Minseok Choi (https://github.com/shirano2)
