import { Router } from "express";
import {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";
import { checkAuth, checkAuthOptional } from "../middlewares/auth.js";

const router = Router();

// Public routes
router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);

// Authenticated routes
router.post("/", checkAuth, createBlog);
router.put("/:slug", checkAuth, updateBlog);
router.delete("/:slug", checkAuth, deleteBlog);

export default router;
