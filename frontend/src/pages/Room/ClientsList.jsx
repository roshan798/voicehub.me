/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import styles from "./Room.module.css";
import muteIcon from "../../assets/Images/mute.png";
import unmuteIcon from "../../assets/Images/unmute.png";

const ClientsList = ({
    clients,
    room,
    user,
    provideRef,
    removeUser,
    children,
}) => {
    const navigate = useNavigate();
    const handleManualLeave = () => {
        navigate("/rooms");
    };
    return (
        <div className={styles.clientsContainer}>
            {children}
            <div className={styles.clientsList}>
                {clients &&
                    clients.length > 0 &&
                    clients.map((client) => (
                        <div
                            key={client.id}
                            className={`${styles.clientWrapper} ${
                                room?.owner?.id === client?.id
                                    ? styles.owner
                                    : ""
                            } `}
                            onDoubleClick={() => {
                                if (room?.owner?.id === user.id) {
                                    removeUser(client.id);
                                }
                            }}>
                            <div className={styles.avatarWrapper}>
                                {room?.owner?.id !== client?.id &&
                                room.owner.id === user.id ? (
                                    <span
                                        className={styles.removeUserMask}
                                        onClick={() => {
                                            removeUser(client.id);
                                        }}>
                                        Remove
                                    </span>
                                ) : null}
                                <img
                                    src={client.avatar}
                                    alt={`${client.name} avatar`}
                                    className={styles.avatar}
                                />
                                <img
                                    src={client.muted ? muteIcon : unmuteIcon}
                                    className={styles.muteUnmuteImage}
                                    alt="mute/unmute-icon"
                                />
                            </div>
                            <audio
                                ref={(instance) => {
                                    provideRef(instance, client.id);
                                }}
                                muted={client.muted}
                            />
                            <h4 title={client.name}>
                                {client.name.split(" ")[0]}
                            </h4>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default ClientsList;
