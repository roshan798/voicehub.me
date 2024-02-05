import UserModel from "../Models/UserModel.js";
import Jimp from "jimp";
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class UserService {
    async findUser(filter) {
        const user = await UserModel.findOne(filter);
        return user;
    }

    async createUser(data) {
        const user = await UserModel.create(data);
        return user;
    }

    async updateUserProfile(userId, updatedData) {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            Object.assign(user, updatedData);
            const updatedUser = await user.save();
            return updatedUser;
        } catch (error) {
            throw new Error(`Failed to update user profile: ${error.message}`);
        }
    }

    async setAvatar(avatar, avatarChanged, previousAvatar) {
        let imagePath = "default.png";
        if (avatar !== '/src/assets/Images/avatar.png') {
            const buffer = Buffer.from(avatar.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''), 'base64');
            imagePath = `${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}.png`
            const jimpResponse = await Jimp.read(buffer);
            const storagePath = path.resolve(__dirname, '../storage', imagePath);
            jimpResponse.resize(150, Jimp.AUTO).write(storagePath)
        }
        // delete previous avatar
        const previousAvatarPath = previousAvatar ? previousAvatar.split("/storage")[1] : undefined;
        if (avatarChanged === true && previousAvatarPath && previousAvatarPath !== "/default.png") {
            let resolvedPath = path.join(__dirname, "../storage", previousAvatarPath);
            if (fs.existsSync(resolvedPath)) {
                try {
                    await fs.promises.unlink(resolvedPath);
                } catch (error) {
                    throw error;
                }
            }
        }
        return imagePath;
    }
}

export default new UserService();