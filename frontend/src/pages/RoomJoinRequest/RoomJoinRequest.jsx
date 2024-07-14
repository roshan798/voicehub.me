import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./main.module.css";
import socketInit from "../../socket/index.js";
import { ACTIONS } from "../../actions.js";
import showToastMessage from "../../utils/showToastMessage.js";

// eslint-disable-next-line react/prop-types
const RoomJoinRequest = ({ requestFlag = true }) => {
    const { roomId } = useParams();
    const { user } = useSelector((state) => state.authSlice);
    const [requestSent, setRequestSent] = useState(false);
    const [requestPending, setRequestPending] = useState(false);
    const socketRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        socketRef.current = socketInit();

        const handleJoinApproved = ({ roomId }) => {
            showToastMessage("success", "Room join request approved!", "dark");
            socketRef.current.disconnect();
            navigate(`/room/${roomId}`);
        };

        const handleJoinRejected = () => {
            showToastMessage(
                "error",
                "Request to join room was rejected by host",
                "dark"
            );
            socketRef.current.disconnect();
            navigate(`/rooms`);
        };

        const handleRequestPending = () => {
            console.log("request pending for approval");
            setRequestPending(true);
            setRequestSent(true);
        };

        const handleUserAlreadyInRoom = () => {
            navigate(`/room/${roomId}`);
        };

        const handleUserNotInRoom = () => {
            setRequestSent(false);
            setRequestPending(false);
        };

        socketRef.current.on(ACTIONS.JOIN_APPROVED, handleJoinApproved);
        socketRef.current.on(ACTIONS.JOIN_CANCELLED, handleJoinRejected);
        socketRef.current.on(
            ACTIONS.JOIN_REQUEST_PENDING,
            handleRequestPending
        );
        socketRef.current.on(
            ACTIONS.USER_ALREADY_IN_ROOM,
            handleUserAlreadyInRoom
        );
        socketRef.current.on(ACTIONS.USER_NOT_ALLOWED, handleUserNotInRoom);
        if (requestFlag === true) {
            socketRef.current.emit(ACTIONS.CHECK_USER_IN_ROOM, {
                roomId,
                user,
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.JOIN_APPROVED, handleJoinApproved);
            socketRef.current.off(ACTIONS.JOIN_CANCELLED, handleJoinRejected);
            socketRef.current.off(
                ACTIONS.JOIN_REQUEST_PENDING,
                handleRequestPending
            );
            socketRef.current.off(
                ACTIONS.USER_ALREADY_IN_ROOM,
                handleUserAlreadyInRoom
            );
            socketRef.current.off(
                ACTIONS.USER_NOT_IN_ROOM,
                handleUserNotInRoom
            );
        };
    }, []);

    const sendRequest = () => {
        setRequestSent(true);
        socketRef.current.emit(ACTIONS.JOIN_REQUEST, { roomId, user });
    };

    const discoverRooms = () => {
        navigate("/rooms");
    };

    return (
        <div className={styles.requestApprovalPage}>
            <div>
                <p>You need permission to enter this room.</p>
                {!requestSent ? (
                    <button
                        onClick={sendRequest}
                        className={styles.requestButton}>
                        Request to Join
                    </button>
                ) : requestPending ? (
                    <div>
                        <p>Request sent. Waiting for approval...</p>
                        {
                            <button
                                onClick={discoverRooms}
                                className={styles.discoverButton}>
                                Discover Rooms
                            </button>
                        }
                    </div>
                ) : (
                    <p>Request sent. Waiting for approval...</p>
                )}
            </div>
        </div>
    );
};

export default RoomJoinRequest;
