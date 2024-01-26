import mongoose from "mongoose";;

const Schema = mongoose.Schema;
const userSchema = new Schema({
    phone: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    name: {
        type: String,
        require: false
    },
    avatar: {
        type: String,
        require: false,
        get: (avatar) => {
            return `${process.env.BASE_URL}${avatar}`;
        }
    },

    activated: {
        type: Boolean,
        required: false,
        default: false
    },
}, {
    timestamps: true,
    toJSON: { getters: true }
})

export default mongoose.model('user', userSchema, 'users');