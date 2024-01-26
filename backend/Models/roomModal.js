import mongoose from "mongoose";;

const Schema = mongoose.Schema;

const roomSchema = new Schema({
    topic: {
        type: String,
        required: true
    },
    roomType: {
        type: String,
        required: true
    },

    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    speakers: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'user'
            },
        ],
        required: false
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }

},
    {
        timestamps: true
    }
)

export default mongoose.model('room', roomSchema, 'rooms');