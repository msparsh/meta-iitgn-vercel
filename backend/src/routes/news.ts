import { Router } from "express";
import { checkAuth, protect } from "../middlewares/auth.js";
import { listNews, getNewsByIdOrSlug, createNews, updateNews, deleteNews } from "../controllers/news.controller.js";

const router = Router();

router.get("/", listNews);
router.get("/:idOrSlug", getNewsByIdOrSlug);
router.post("/", checkAuth, protect("admin", "moderator"), createNews);
router.patch("/:slug", checkAuth, protect("admin", "moderator"), updateNews);
router.delete("/:slug", checkAuth, protect("admin", "moderator"), deleteNews);

export default router;
