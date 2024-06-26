import mongoose from "mongoose";

const Schema = mongoose.Schema;

const roomSchema = new Schema({
    topic: {
        type: String,
        required: true
    },
    roomType: {
        type: String,
        required: true,
        enum: ['open', 'social', 'closed']
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
    approvedUsers: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'user'
            },
        ],
        required: false
    },
    joinRequests: {
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
    },
    ownerSocketId: {
        type: String, // Assuming ownerSocketId is a string (socket.io socket id)
        required: false
    }
}, {
    timestamps: true
});

export default mongoose.model('room', roomSchema, 'rooms');
