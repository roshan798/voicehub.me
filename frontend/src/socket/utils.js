import socketInit from "./index.js";
import { ACTIONS } from "../actions";
export const acceptRoomJoinRequest = (userId, roomId) => {
    console.log("sending accept message");
    const socket = socketInit();
    socket.emit(ACTIONS.JOIN_APPROVED, { userId, roomId });
}
export const cancelRoomJoinRequest = (userId, roomId) => {
    console.log("sending cancel message");
    const socket = socketInit();
    socket.emit(ACTIONS.JOIN_CANCELLED, { userId, roomId });
}

