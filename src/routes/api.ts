import express from "express";
import authController from "../controllers/auth.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { ROLES } from "../utils/constant.ts";

const router = express.Router();

// Auth system
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.patch(
  "/auth/approve/:id",
  authenticate,
  authorize([ROLES.PRINCIPAL, ROLES.STAFF]),
  authController.approve,
);
router.get("/auth/activation", authController.activate);

export default router;
