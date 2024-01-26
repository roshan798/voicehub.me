import Jimp from "jimp";
import path from 'path'
import userService from "../services/userService.js";
import UserDto from "../dtos/userDtos.js";

//
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ActivateController {
    async activate(req, res) {
        const { name, avatar } = req.body;
        if (!name || !avatar) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        let imagePath = "default.png";
        // if the avater is not selected then
        if (avatar !== '/src/assets/Images/avatar.jpeg') {
            const buffer = Buffer.from(avatar.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''), 'base64');
            imagePath = `${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}.png`

            try {
                const jimpResponse = await Jimp.read(buffer);
                const storagePath = path.resolve(__dirname, '../storage', imagePath);

                jimpResponse.resize(150, Jimp.AUTO).write(storagePath)
            } catch (error) {
                // console.log(error);
                return res.status(500).json({
                    message: "could not process the image"
                });
            }
        }
        // update user
        try {

            const userId = req.user._id;
            const user = await userService.findUser({
                _id: userId
            });
            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }
            user.activated = true;
            user.name = name;
            user.avatar = `/storage/${imagePath}`;
            user.save();
            res.json({
                auth: true,
                user: new UserDto(user)
            })
        } catch (error) {
            return res.status(500).json({
                message: "something went wrong"
            })
        }
    }

}

export default new ActivateController();