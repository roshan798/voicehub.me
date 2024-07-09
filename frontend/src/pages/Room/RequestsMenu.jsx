/* eslint-disable react/prop-types */

import {
    acceptRoomJoinRequest,
    cancelRoomJoinRequest,
} from "../../socket/utils.js";
export default function RequestsMenu({
    styles,
    joinRequests,
    setJoinRequests,
    roomId,
    socket,
}) {
    const handleAccept = (userId, roomId) => {
        acceptRoomJoinRequest(socket, userId, roomId);
        setJoinRequests((request) => {
            return request.filter((req) => req.id != userId);
        });
    };
    const handleDecline = (userId, roomId) => {
        cancelRoomJoinRequest(socket, userId, roomId);
        setJoinRequests((request) => {
            return request.filter((req) => req.id != userId);
        });
    };
    return (
        <>
            <div className={styles.requestInnerContainer}>
                {joinRequests.map((request) => (
                    <div
                        key={request.id}
                        className={styles.requestItem}>
                        <div className={styles.avatarWrapperRequest}>
                            <img
                                src={request.avatar}
                                alt={`${request.name} avatar`}
                                className={styles.avatar}
                            />
                        </div>
                        <div className={styles.requestDetails}>
                            <h4>{request.name}</h4>
                            <div className={styles.requestActions}>
                                <button
                                    className={styles.acceptBtn}
                                    onClick={() =>
                                        handleAccept(request.id, roomId)
                                    }>
                                    Accept
                                </button>
                                <button
                                    className={styles.declineBtn}
                                    onClick={() =>
                                        handleDecline(request.id, roomId)
                                    }>
                                    Decline
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
