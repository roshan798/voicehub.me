import { Router } from "express";
import authController from "./controllers/authController.js";
import activateController from "./controllers/activateController.js";
import roomsController from "./controllers/roomsController.js";
import authMiddleware from "./Middlewares/authMiddleware.js";
const router = Router();

router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/activate', authMiddleware, activateController.activate);
router.post('/logout', authMiddleware, authController.logout);
router.post('/rooms', authMiddleware, roomsController.create);

router.get('/refresh', authController.refreshAccessToken);
router.get('/rooms', authMiddleware, roomsController.index);
router.get('/rooms/search', authMiddleware, roomsController.search);
router.get('/rooms/:roomId', authMiddleware, roomsController.show);

router.put('/users', authMiddleware, authController.updateProfile);
router.delete('/rooms/:roomId',authMiddleware,roomsController.deleteRoom)

export default router;