/* eslint-disable react/prop-types */
import styles from "./RoomCard.module.css";
import chatIcon from "../../assets/Images/chatIcon.png";
import peopleVoiceIcon from "../../assets/Images/peopleVoice.png";
import { useNavigate } from "react-router-dom";
import MenuIcon from "../../assets/icons/MenuIcon";

export default function RoomCard({
    room,
    deleteRoom,
    showCardMenu,
    setCardShowMenu,
}) {
    const { topic: title, speakers, owner, id: roomId } = room;
    const { show, roomId: modalRoomId } = showCardMenu;
    const navigate = useNavigate();
    const handleMenuClick = (event) => {
        event.stopPropagation(); // Prevent navigation
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
                // add the toastify
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
                }`}
                aria-label={title}
            >
                <div
                    className={styles.cardLeft}
                    onClick={() => {
                        navigate(`/room/${roomId}`);
                    }}
                >
                    <p className={styles.title}>{title}</p>
                    <div className={styles.detailsContainer}>
                        <div className={styles.avatarContainer}>
                            <img
                                src={
                                    speakers.length
                                        ? speakers[0].avatar
                                        : owner.avatar
                                }
                                alt={
                                    speakers.length
                                        ? speakers[0].name
                                        : owner.name
                                }
                            />
                            {speakers.length >= 2 && (
                                <img
                                    src={speakers[1].avatar}
                                    alt=""
                                />
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
                            <MenuIcon />
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
