import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useWebRTC } from "../../hooks/useWebRTC";
import { getRoom } from "../../http/index.js";
import ArrowForward from "../../assets/Images/Arrow forward.png";
import muteIcon from "../../assets/Images/mute.png";
import unmuteIcon from "../../assets/Images/unmute.png";
import styles from "./Room.module.css";
export default function Room() {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const [room, setRoom] = useState(null);
    const [isMute, setMute] = useState(true);
    const { user } = useSelector((state) => state.authSlice);
    const { clients, handleMute, provideRef } = useWebRTC(roomId, user);
    const handleManualLeave = () => {
        navigate("/rooms");
    };

    const handleMuteClick = (clientId, clientMute) => {
        // console.log("unmute", clientMute, isMute);
        if (clientId != user.id) return;
        setMute((isMuted) => !isMuted);
    };

    useEffect(() => {
        handleMute(isMute, user.id);
        console.log("djobject");
    }, [isMute]);

    useEffect(() => {
        const fetchRoom = async () => {
            const { data } = await getRoom(roomId);
            setRoom(data);
        };
        fetchRoom();
    }, [roomId]);
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
                        <button className={`${styles.btn} transition`}>
                            <span className={styles.handIcons}>✋</span>
                        </button>
                        <button
                            onClick={handleManualLeave}
                            className={`${styles.btnWithIcon} ${styles.btn} transition`}>
                            <span className={styles.handIcons}>✌️</span>
                            <span>Leave quitly</span>
                        </button>
                    </div>
                </div>
                <div className={styles.clientsList}>
                    {clients.length > 0
                        ? clients.map((client) => {
                              return (
                                  <div
                                      key={client.id}
                                      className={styles.clientWrapper}>
                                      <div className={styles.avatarWrapper}>
                                          <img
                                              src={client.avatar}
                                              alt={`${client.name} avatar`}
                                              className={styles.avatar}
                                          />
                                          {client.muted ? (
                                              <button
                                                  className={
                                                      styles.muteUnmuteBtn
                                                  }
                                                  onClick={() => {
                                                      handleMuteClick(
                                                          client.id,
                                                          client.muted
                                                      );
                                                  }}>
                                                  {/*place the mute and unmute here */}
                                                  <img
                                                      src={muteIcon}
                                                      alt=""
                                                  />
                                                  {/* Unmute */}
                                              </button>
                                          ) : (
                                              <button
                                                  className={
                                                      styles.muteUnmuteBtn
                                                  }
                                                  onClick={() => {
                                                      handleMuteClick(
                                                          client.id,
                                                          client.muted
                                                      );
                                                  }}>
                                                  <img
                                                      src={unmuteIcon}
                                                      alt=""
                                                  />
                                                  {/* Mute */}
                                              </button>
                                          )}
                                      </div>
                                      <audio
                                          ref={(instance) => {
                                              provideRef(instance, client.id);
                                          }}
                                      />

                                      <h4>{client.name}</h4>
                                  </div>
                              );
                          })
                        : ""}
                </div>
            </div>
        </div>
    );
}
