import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) //can later add some tweaks to the filename
    } 
})

export const upload = multer({
    storage: storage, //since both the key and value are same so we can diretly write `storage` and give comma instead op a dict type structure.
})