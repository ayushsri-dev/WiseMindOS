import express from 'express';
import authUser from '../middlewares/auth.js';
import { loginUser, registerUser, updateUser } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/update', authUser, updateUser);

export default userRouter;