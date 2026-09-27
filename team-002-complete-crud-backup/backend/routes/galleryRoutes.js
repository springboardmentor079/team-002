const express=require("express"); const router=express.Router();
const {getGallery,createGalleryItem,updateGalleryItem,deleteGalleryItem}=require("../controllers/galleryController");
const {protect,authorize}=require("../middleware/authMiddleware");
router.use(protect);
router.get("/",authorize("admin","client","project_manager","site_engineer"),getGallery);
router.post("/",authorize("admin","project_manager","site_engineer"),createGalleryItem);
router.put("/:id",authorize("admin","project_manager","site_engineer"),updateGalleryItem);
router.delete("/:id",authorize("admin","project_manager","site_engineer"),deleteGalleryItem);
module.exports=router;
