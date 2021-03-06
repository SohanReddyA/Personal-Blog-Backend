const mongoose = require('mongoose');

const BlogSchema = mongoose.Schema({
    _id : String,
    title : {type:String,required:true},
    body : {type:String,required:true},
    imgUrl : String,
    created : String,
    lastUpdated : String,
    likes: Number,
    comments: Array

});

module.exports = mongoose.model('Blog',BlogSchema);