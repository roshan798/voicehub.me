import { ACTIONS } from "../actions.js";
export const acceptRoomJoinRequest = (socket, userId, roomId) => {
    socket.current.emit(ACTIONS.JOIN_APPROVED, { userId, roomId });
}

export const cancelRoomJoinRequest = (socket, userId, roomId) => {
    socket.current.emit(ACTIONS.JOIN_CANCELLED, { userId, roomId });
}

