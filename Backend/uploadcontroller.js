const express = require('express');
const router = express.Router();
const path=require('path');
const upload = require('./uploads');
const Image = require('./Image');
const cors=require('cors');
const app=express();

app.use(cors());

router.get("/get", async (req, res) => {
  const allPhotos = await Image.find();
  allPhotos.reverse();
  res.send(allPhotos);
});
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const image = new Image({
      tagname: req.body.tagname,
      fileName: req.file.originalname,
      filePath:req.body.filePath
    });
    await image.save();
    res.json(image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to save image.' });
  }
});


router.get('/search/tags', async (req, res) => {

  const searchTerm = req.query.tags;
  
  if(searchTerm !== '' && typeof searchTerm === 'string'){
    try{
      const searchResults = await Image.find({ tagname: { $regex: searchTerm, $options: 'i' } });
      
      if(searchResults.length === 0){
        console.log('enter api failure');
        res.status(404).json({message :"No Image found"})
        
      }
      else {
        console.log('searchResults :'+searchResults);
        return res.send(searchResults);
      }
      console.log('enter pre value');
    }
    catch(error){
      console.log(error);
      res.status(404).json({message :"No Image found"})
    }
  }
  else{
    res.status(404).json({message :"No Image found"})
  }
});


module.exports = router;
