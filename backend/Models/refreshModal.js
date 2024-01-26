import mongoose from "mongoose";;

const Schema = mongoose.Schema;

const refreshSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
},
    {
        timestamps: true
    }
)

export default mongoose.model('refresh', refreshSchema, 'tokens');