/* eslint-disable react/prop-types */
import styles from "./RoomCard.module.css";
import chatIcon from "../../assets/Images/chatIcon.png";
import peopleVoiceIcon from "../../assets/Images/peopleVoice.png";
import { useNavigate } from "react-router-dom";
import MenuIcon from "../../assets/icons/MenuIcon";
import CancelIcon from "../../assets/icons/CrossIcon";
import { getRelativeTime, formatDate } from "../../utils/timeUtils";
export default function RoomCard({
    room,
    deleteRoom,
    showCardMenu,
    setCardShowMenu,
}) {
    const {
        topic: title,
        speakers,
        owner,
        id: roomId,
        roomType,
        createdAt,
    } = room;
    const { show, roomId: modalRoomId } = showCardMenu;
    const navigate = useNavigate();
    const handleMenuClick = (event) => {
        event.stopPropagation();
        setCardShowMenu(() => {
            if (modalRoomId == roomId) {
                return {
                    show: !show,
                    roomId: null,
                };
            }
            return {
                show: true,
                roomId,
            };
        });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: room?.topic || "Join my voice room",
                    text: "Join me in this voice room!",
                    url: `${window.location.origin}/room/${roomId}`,
                });
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            console.warn("Web Share API not supported in this browser.");
        }
    };

    return (
        <>
            <div
                className={`${styles.card} transition ${
                    modalRoomId == roomId ? styles.activeCard : ""
                } ${styles[roomType]}`}
                aria-label={title}>
                <div
                    className={styles.cardLeft}
                    onClick={() => {
                        navigate(`/room/${roomId}`);
                    }}>
                    <div style={{ width: "100%" }}>
                        <p
                            className={styles.title}
                            title={title}>
                            {title}
                        </p>
                        <span
                            className={styles.relativeTime}
                            title={formatDate(createdAt)}>
                            {getRelativeTime(createdAt)}
                        </span>
                    </div>

                    <div
                        className={styles.detailsContainer}
                        title={`${
                            roomType[0].toUpperCase() + roomType.substring(1)
                        } room`}>
                        <div className={styles.avatarContainer}>
                            <div
                                style={{
                                    background: `url(${
                                        speakers.length
                                            ? speakers[0].avatar
                                            : owner.avatar
                                    }) no-repeat center center/cover`,
                                }}></div>
                            {speakers.length >= 2 && (
                                <div
                                    style={{
                                        background: `url(${speakers[1].avatar}) no-repeat center center/cover`,
                                    }}></div>
                            )}
                        </div>
                        <div className={styles.speakersNames}>
                            <div className={styles.names}>
                                <p>
                                    {speakers.length
                                        ? speakers[0].name
                                        : owner.name}
                                </p>
                                <img src={chatIcon} />
                            </div>
                            {speakers.length > 1 && (
                                <div className={styles.names}>
                                    <p>{speakers[1].name}</p>
                                    <img src={chatIcon} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles.right}>
                    <div style={{ position: "relative" }}>
                        <button
                            className={styles.menu}
                            onClick={handleMenuClick}>
                            {modalRoomId == roomId ? (
                                <CancelIcon />
                            ) : (
                                <MenuIcon />
                            )}
                        </button>
                        {show && modalRoomId == roomId && (
                            <div className={styles.roomCardModal}>
                                {/* Room details */}
                                <button
                                    className={styles.modalButton}
                                    onClick={() => {
                                        navigate(`/room/${roomId}`);
                                    }}>
                                    Go to Room
                                </button>
                                <button
                                    className={styles.modalButton}
                                    onClick={() => {
                                        handleShare();
                                        setCardShowMenu({
                                            roomId: null,
                                            show: false,
                                        });
                                    }}>
                                    Invite
                                </button>
                                <button
                                    className={styles.modalButton}
                                    onClick={() =>
                                        setCardShowMenu({
                                            roomId: null,
                                            show: false,
                                        })
                                    }>
                                    Close
                                </button>
                                <button
                                    className={`${styles.modalButton} ${styles.deleteButton}`}
                                    onClick={() => deleteRoom(room.id)}>
                                    Delete Room
                                </button>
                            </div>
                        )}
                    </div>
                    <div>
                        <span>{speakers.length}</span>
                        <img
                            src={peopleVoiceIcon}
                            alt=""
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
