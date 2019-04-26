var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  headline: {
    type: String,
    trim:true,
    required: true
  },
  summary: {
    type: String,
    trim:true,
    required: true
  },
  imageUrl : {
    type:String,
    trim:true,
    required:true
  },
  url: {
    type: String,
    trim:true,
    required:true
  },
  saved: {
    type: String,
    default: "false"
  },
  notes: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
