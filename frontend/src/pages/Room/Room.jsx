import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { useWebRTC } from "../../hooks/useWebRTC";
import { getRoom } from "../../http/index.js";

import ArrowForward from "../../assets/Images/Arrow forward.png";
import muteIcon from "../../assets/Images/mute.png";
import unmuteIcon from "../../assets/Images/unmute.png";
import shareIcon from "../../assets/shareIcon.svg";
import CrossIcon from "../../assets/icons/CrossIcon.jsx";
import MenuIcon from "../../assets/icons/MenuIcon.jsx";
import LeaveIcon from "../../assets/icons/LeaveIcon.jsx";

import Tooltip from "../../components/shared/Tooltip/Tooltip.jsx";
import RequestApprovalPage from "../RequestPages/RequestApprovalPage.jsx";
import RequestPendingPage from "../RequestPages/RequestPendingPage.jsx";
import RequestsMenu from "./RequestsMenu.jsx";
import ClientsList from "./ClientsList.jsx";

import { ACTIONS } from "../../actions.js";
import showToastMessage from "../../utils/showToastMessage.js";

import styles from "./Room.module.css";

export default function Room() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.authSlice);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMute, setMute] = useState(true);
    const [room, setRoom] = useState(null);

    const {
        socket,
        clients,
        handleMute,
        provideRef,
        approvedToJoin,
        joinRequests,
        setJoinRequests,
    } = useWebRTC(roomId, user);

    useEffect(() => {
        handleMute(isMute, user.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                const { joinRequests, ...withOutJoinRequest } = data;
                setRoom(withOutJoinRequest);
                setJoinRequests(joinRequests);
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
    }, [roomId]);

    const handleMuteClick = (clientId) => {
        if (clientId !== user.id) return;
        setMute((isMuted) => !isMuted);
    };

    const removeUser = async (userId) => {
        // send socket message to the server to remove him from every where
        socket.current.emit(ACTIONS.REMOVE_USER, {
            senderId: user.id,
            userId,
            roomId,
        });
    };

    const handleShare = async () => {
        navigator.clipboard.writeText(window.location.href);
        showToastMessage("success", "Link copied to clipboard!");
    };

    const handleManualLeave = () => {
        navigate("/rooms");
    };

    return (
        <main className={styles.mainContainer}>
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
            {approvedToJoin == 0 ? (
                <RequestApprovalPage
                    roomId={roomId}
                    user={user}
                    room={room}
                    socket={socket}
                />
            ) : approvedToJoin == 2 ? (
                <RequestPendingPage
                    roomId={roomId}
                    user={user}
                    room={room}
                />
            ) : (
                <>
                    <ClientsList
                        clients={clients}
                        room={room}
                        user={user}
                        provideRef={provideRef}
                        removeUser={removeUser}>
                        <div
                            className={styles.topContainer}
                            style={{
                                borderBottom: "1px solid #e0e0e040",
                                padding: "0 16px",
                                paddingBottom: "8px",
                            }}>
                            <div
                                className={`${styles.leftContainer} ${styles.roomTitle}`}
                                title={room?.topic}>
                                {room?.topic}
                            </div>
                            <div
                                className={`${styles.topRight} ${styles.actions}`}>
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
                                        <span className={styles.handIcons}>
                                            ✌️
                                        </span>
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    </ClientsList>
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
                </>
            )}

            {joinRequests && joinRequests.length > 0 && (
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
                                    setIsMenuOpen(!isMenuOpen);
                                }}
                                className={styles.menuBtn}>
                                {isMenuOpen ? <CrossIcon /> : <MenuIcon />}
                            </button>
                        </div>
                        {isMenuOpen && (
                            <RequestsMenu
                                styles={styles}
                                joinRequests={joinRequests}
                                setJoinRequests={setJoinRequests}
                                roomId={room.id}
                                socket={socket}
                            />
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
