import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useWebRTC } from "../../hooks/useWebRTC";
import { getRoom } from "../../http/index.js";
import ArrowForward from "../../assets/Images/Arrow forward.png";
import muteIcon from "../../assets/Images/mute.png";
import unmuteIcon from "../../assets/Images/unmute.png";
import shareIcon from "../../assets/shareIcon.svg";
import styles from "./Room.module.css";
import Tooltip from "../../components/shared/Tooltip/Tooltip.jsx";
import MenuIcon from "../../assets/icons/MenuIcon.jsx";
import LeaveIcon from "../../assets/icons/LeaveIcon.jsx";
import RequestApprovalPage from "../RequestApprovalPage/RequestApprovalPage.jsx";
import RequestsMenu from "./RequestsMenu.jsx";

export default function Room() {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const [room, setRoom] = useState(null);
    const [isMute, setMute] = useState(true);
    const { user } = useSelector((state) => state.authSlice);
    const {
        clients,
        handleMute,
        provideRef,
        approvedTojoin,
        joinRequests,
        setJoinRequests,
    } = useWebRTC(roomId, user);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const handleManualLeave = () => {
        navigate("/rooms");
    };

    const handleMuteClick = (clientId) => {
        if (clientId !== user.id) return;
        setMute((isMuted) => !isMuted);
    };

    useEffect(() => {
        handleMute(isMute, user.id);
    }, [isMute]);

    useEffect(() => {
        try {
            const fetchRoom = async () => {
                const { data } = await getRoom(roomId);
                if (data.error) {
                    return navigate(`/error`, {
                        state: { error: data.error, to: "/rooms" },
                    });
                }
                setRoom(data);
            };
            fetchRoom();
        } catch (error) {
            console.error("Error fetching room:", error);
            navigate("/error", {
                state: {
                    error:
                        error.message ||
                        "The Room you are looking for is currently not availble",
                    to: "/rooms",
                },
            });
        }
    }, [navigate, roomId]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: room?.topic || "Join my voice room",
                    text: "Join me in this voice room!",
                    url: window.location.href,
                });
                // add the toastify
                // console.log("Share successful!");
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            console.warn("Web Share API not supported in this browser.");
        }
    };
    // console.log(approvedTojoin);
    if (!approvedTojoin) {
        return (
            <RequestApprovalPage
                roomId={roomId}
                user={user}
                room={room}
            />
        );
    }

    return (
        <div className={styles.mainContainer}>
            <div>
                <button
                    className={styles.backBtn}
                    onClick={handleManualLeave}>
                    <img
                        src={ArrowForward}
                        alt="back"
                    />
                    <span>All voice rooms</span>
                </button>
            </div>
            <div className={styles.clientsContainer}>
                <div className={styles.topContainer}>
                    <div
                        className={`${styles.leftContainer} ${styles.roomTitle}`}>
                        {room?.topic}
                    </div>
                    <div className={`${styles.topRight} ${styles.actions}`}>
                        <Tooltip
                            position="bottom"
                            text="Add others">
                            <button
                                onClick={handleShare}
                                className={`${styles.btn} transition`}
                                title="Send an invite"
                                style={{
                                    display: "grid",
                                    placeItems: "center",
                                    padding: "8px",
                                }}>
                                <img
                                    style={{
                                        filter: "invert(1)",
                                    }}
                                    src={shareIcon}
                                    alt="share"
                                />
                            </button>
                        </Tooltip>
                        <Tooltip
                            position="bottom"
                            text="Leave room">
                            <button
                                onClick={handleManualLeave}
                                className={`${styles.btnWithIcon} ${styles.btn} transition`}>
                                <span className={styles.handIcons}>✌️</span>
                            </button>
                        </Tooltip>
                    </div>
                </div>
                <div className={styles.clientsList}>
                    {clients.length > 0
                        ? clients.map((client) => (
                              <div
                                  key={client.id}
                                  className={`${styles.clientWrapper} ${
                                      room.owner.id === client.id
                                          ? styles.owner
                                          : ""
                                  }`}>
                                  <div className={styles.avatarWrapper}>
                                      <img
                                          src={client.avatar}
                                          alt={`${client.name} avatar`}
                                          className={styles.avatar}
                                      />
                                  </div>
                                  <audio
                                      ref={(instance) => {
                                          provideRef(instance, client.id);
                                      }}
                                      muted={client.muted}
                                  />
                                  <h4>{client.name.split(" ")[0]}</h4>
                              </div>
                          ))
                        : ""}
                </div>
            </div>
            <div
                id="options"
                className={styles.optionsContainer}>
                <Tooltip
                    text={!isMute ? "Mute" : "Unmute"}
                    position="top">
                    <button
                        onClick={() => handleMuteClick(user.id)}
                        className={styles.optionBtn}>
                        <img
                            src={isMute ? muteIcon : unmuteIcon}
                            alt={isMute ? "Mute" : "Unmute"}
                        />
                    </button>
                </Tooltip>
                <Tooltip
                    text="Leave room"
                    position="top">
                    <button
                        onClick={handleManualLeave}
                        className={styles.optionBtn}>
                        <LeaveIcon />
                    </button>
                </Tooltip>
            </div>

            {joinRequests.length > 0 && (
                <div className={styles.requestsContainer}>
                    <div
                        className={`${
                            joinRequests.length > 0 ? styles.newRequest : ""
                        }`}
                        style={{
                            position: "relative",
                        }}>
                        <div className={styles.requestsHeader}>
                            <button
                                onClick={() => {
                                    // console.log(isMenuOpen);
                                    setIsMenuOpen(!isMenuOpen);
                                }}
                                className={styles.menuBtn}>
                                <MenuIcon />
                            </button>
                        </div>
                        {isMenuOpen && (
                            <RequestsMenu
                                styles={styles}
                                joinRequests={joinRequests}
                                setJoinRequests={setJoinRequests}
                                roomId={room.id}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
