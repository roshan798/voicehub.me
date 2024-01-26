/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { getAllRooms } from "../../http/index.js";
import styles from "./Rooms.module.css";
import searchIcon from "../../assets/Images/search.png";
import peopleVoiceIcon from "../../assets/Images/peopleVoice.png";
import RoomCard from "../../components/RoomCard/RoomCard";
import AddRoomModal from "../../components/AddRoomModal/AddRoomModal";

// add menu in this page

const Menu = () => {
    return <div className="menu">Manu Modal</div>;
};
export default function Rooms() {
    const [showModal, setShowModal] = useState(false);
    const [showEditMenu, closeEditMenu] = useState(true);
    const [currentEditRoom, setCurrentSetRoom] = useState(-1);
    const [rooms, setRooms] = useState([]);
    useEffect(() => {
        const fetchRooms = async () => {
            const { data } = await getAllRooms();
            setRooms(data.allRooms);
            console.log(data);
        };
        fetchRooms();
    }, []);
    const toggleModal = () => {
        setShowModal((state) => !state);
    };
    return (
        <>
            <div className={styles.roomsContainer}>
                {showEditMenu && <Menu />}
                <div className={styles.headingWrapper}>
                    <div className={styles.left}>
                        <p className={styles.headingText}>All voice rooms</p>
                        <div className={styles.searchBox}>
                            <label htmlFor="search-box">
                                <img
                                    src={searchIcon}
                                    alt=""
                                    className={styles.searchIcon}
                                />
                            </label>
                            <input
                                type="text"
                                id="search-box"
                            />
                        </div>
                    </div>
                    <div className={styles.right}>
                        <button
                            className={`${styles.startRoomBtn} transition`}
                            onClick={toggleModal}>
                            <img
                                src={peopleVoiceIcon}
                                alt=""
                            />
                            Start a room
                        </button>
                    </div>
                </div>
                <div className={styles.roomsCardsWrapper}>
                    {rooms.length > 0 ? (
                        rooms.map((room, index) => {
                            return (
                                <RoomCard
                                    roomId={room.id}
                                    title={room.topic}
                                    speakers={room.speakers}
                                    key={index}
                                />
                            );
                        })
                    ) : (
                        <div>No rooms found</div>
                    )}
                </div>
            </div>
            {showModal && <AddRoomModal toggleModal={toggleModal} />}
        </>
    );
}

/*
{
    "id": "65aa214823c8a038342b9ffe",
    "topic": "JavaScript is Awesome",
    "roomType": "open",
    "speakers": [
        {
            "_id": "65aa211a23c8a038342b9fea",
            "email": "6205980916",
            "activated": true,
            "createdAt": "2024-01-19T07:13:30.507Z",
            "updatedAt": "2024-01-19T07:13:52.067Z",
            "__v": 0,
            "avatar": "http://localhost:8000/storage/1705648431861-828821986.png",
            "name": "Roshan Kumar",
            "id": "65aa211a23c8a038342b9fea"
        }
    ],
    "ownerId": {
        "_id": "65aa211a23c8a038342b9fea",
        "email": "6205980916",
        "activated": true,
        "createdAt": "2024-01-19T07:13:30.507Z",
        "updatedAt": "2024-01-19T07:13:52.067Z",
        "__v": 0,
        "avatar": "http://localhost:8000/storage/1705648431861-828821986.png",
        "name": "Roshan Kumar",
        "id": "65aa211a23c8a038342b9fea"
    },
    "createdAt": "2024-01-19T07:14:16.170Z"
}
*/
