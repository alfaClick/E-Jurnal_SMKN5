import express from "express";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import guruRoutes from "./routes/guru.routes.js";
import kepsekRoutes from "./routes/kepsek.routes.js";
import swaggerSpec from "./config/swaggerConfig.js";
import swaggerUi from "swagger-ui-express";
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes)
router.use("/guru", guruRoutes);
router.use("/kepsek", kepsekRoutes);
router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;
