var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  headline: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  imageUrl : {
    type:String,
    required:true
  },
  url: {
    type: String,
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
