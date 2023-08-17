const multer=require('multer');
const path=require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) =>{
     cb(null,"/home/bl1001/Desktop/Saikamal/Backend/Files/");
  },
  filename: (req, file, cb) => {
      return cb(null, file.originalname)
  }
})
const upload = multer({ storage: storage });

module.exports = upload;