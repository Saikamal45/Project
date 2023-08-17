const mongoose = require('mongoose');

const imageSchema=new mongoose.Schema({
  tagname:{type:String,required:true},
  fileName:{type:String},
  filePath:{type:String}
});

const Image=mongoose.model('Image',imageSchema);
module.exports=Image;