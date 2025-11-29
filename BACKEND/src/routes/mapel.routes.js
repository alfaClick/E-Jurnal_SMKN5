import express from "express";
import { getAllMapel } from "../controllers/mapel.controllers.js";

const router = express.Router();

router.get("/mapel", getAllMapel); // Nanti diakses lewat: /api/mapel

export default router;