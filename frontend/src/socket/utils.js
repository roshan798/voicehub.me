import socketInit from "./index.js";
const socket = socketInit();
import { ACTIONS } from "../actions";
export const acceptRoomJoinRequest = (userId, roomId) => {
    console.log("sending accept message");
    socket.emit(ACTIONS.JOIN_APPROVED, { userId,roomId });
}
export const cancelRoomJoinRequest = (userId, roomId) => {
    console.log("sending cancel message");
    socket.emit(ACTIONS.JOIN_CANCELLED, { userId ,roomId});
}

