import { useState } from "react";
import styles from "./RequestApprovalPage.module.css";
import socketInit from "../../socket";
import { ACTIONS } from "../../actions";
const socket = socketInit();
const RequestApprovalPage = ({ roomId, user, room }) => {
    const [requestSent, setRequestSent] = useState(false);

    const requestApproval = () => {
        socket.emit(ACTIONS.JOIN_REQUEST, { roomId, user });
        setRequestSent(true);
    };

    return (
        <div className={styles.requestApprovalPage}>
            <h1>{room?.topic || "Loading room information..."}</h1>
            <p>You need permission to enter this room.</p>
            {!requestSent ? (
                <button
                    onClick={requestApproval}
                    className={styles.requestButton}>
                    Request to Join
                </button>
            ) : (
                <p>Request sent. Waiting for approval...</p>
            )}
        </div>
    );
};

export default RequestApprovalPage;
