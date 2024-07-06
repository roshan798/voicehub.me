import { useEffect, useRef, useState, useCallback } from "react";
import { getAllRooms } from "../../http/index.js";
import debounce from "../../utils/debounceFunction.js";
import styles from "./Rooms.module.css";
import SearchIcon from "../../assets/icons/SearchIcon.jsx";
import CancelIcon from "../../assets/icons/CrossIcon.jsx";
import peopleVoiceIcon from "../../assets/Images/peopleVoice.png";
import RoomCard from "../../components/RoomCard/RoomCard";
import AddRoomModal from "../../components/AddRoomModal/AddRoomModal";
import { deleteRoom as deleteRoomAPI } from "../../http";
import showToastMessage from "../../utils/showToastMessage.js";

const RESULTS_PER_PAGE = 6;
const CACHE_SIZE = 5;

export default function Rooms() {
    const [showModal, setShowModal] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const roomsCopy = useRef([]);
    const [showCardMenu, setCardShowMenu] = useState({
        show: false,
        roomId: null,
    });
    const [searchValue, setSearchValue] = useState("");

    const queue = useRef([]);
    const roomsCache = useRef(new Map());

    const setData = (data) => {
        setRooms(data.allRooms);
        setTotalPages(data.totalPages);
        roomsCopy.current = data.allRooms;
    };

    useEffect(() => {
        const fetchRooms = async (page) => {
            setLoadingRooms(true);
            try {
                const roomType = ["open", "social"];
                if (roomsCache.current.has(page)) {
                    const data = roomsCache.current.get(page);
                    setData(data);
                } else {
                    const { data } = await getAllRooms(
                        page,
                        RESULTS_PER_PAGE,
                        roomType
                    );
                    setData(data);

                    if (queue.current.length >= CACHE_SIZE) {
                        const key = queue.current.shift();
                        roomsCache.current.delete(key);
                    }
                    roomsCache.current.set(page, data);
                    queue.current.push(page);
                }
            } catch (error) {
                console.error("Error fetching rooms:", error);
            } finally {
                setLoadingRooms(false);
            }
        };
        fetchRooms(page);
        
    }, [page]);

    const toggleModal = () => {
        setShowModal((state) => !state);
    };

    const debouncedSearch = useCallback(
        debounce((searchValue) => {
            console.log("object");
            const filteredRooms = roomsCopy.current.filter((room) => {
                return (
                    room.topic.toLowerCase().includes(searchValue) ||
                    room.owner.name.toLowerCase().includes(searchValue)
                );
            });
            setRooms(filteredRooms);
        }, 300),
        []
    );

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchValue(value);
        debouncedSearch(value);
    };

    const handlePrevPage = () => {
        setPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const handleNextPage = () => {
        setPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    const deleteRoom = async (roomId) => {
        if (confirm("Are you sure, you want to delete this room?") === false)
            return;
        try {
            const { data } = await deleteRoomAPI(roomId);
            if (data.success) {
                showToastMessage("success", "Room deleted successfully");
                setRooms((room) => {
                    return room.filter((r) => r.id !== roomId);
                });
            } else {
                throw new Error("Error happened in deleting room");
            }
        } catch (error) {
            showToastMessage(
                "error",
                "You are not allowed to delete this room"
            );
            console.error("Error deleting room:", error);
        } finally {
            setShowModal(false);
        }
    };

    return (
        <>
            <div className={styles.roomsContainer}>
                <div className={styles.headingWrapper}>
                    <div className={styles.left}>
                        <p className={styles.headingText}>All voice rooms</p>
                        <div className={styles.searchBox}>
                            <label htmlFor="search-box">
                                <SearchIcon />
                                {searchValue !== "" && (
                                    <CancelIcon
                                        className={styles.cancelIcon}
                                        onClick={() => {
                                            setSearchValue("");
                                            setRooms(roomsCopy.current);
                                        }}
                                    />
                                )}
                            </label>
                            <input
                                type="text"
                                id="search-box"
                                name="search-box"
                                placeholder="Type topic / name"
                                onChange={handleSearch}
                                value={searchValue}
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
                    {loadingRooms && <div>Loading rooms, please wait...</div>}
                    {!loadingRooms && rooms.length > 0
                        ? rooms.map((room, index) => (
                              <RoomCard
                                  room={room}
                                  deleteRoom={deleteRoom}
                                  key={index}
                                  showCardMenu={showCardMenu}
                                  setCardShowMenu={setCardShowMenu}
                              />
                          ))
                        : !loadingRooms && <div>No rooms found</div>}
                </div>
                {totalPages > 1 && (
                    <div className={styles.paginationWrapper}>
                        <button
                            className={styles.paginationButton}
                            onClick={handlePrevPage}
                            disabled={page === 1}>
                            Prev
                        </button>
                        <span className={styles.pageInfo}>
                            Page {page} of {totalPages}
                        </span>
                        <button
                            className={styles.paginationButton}
                            onClick={handleNextPage}
                            disabled={page === totalPages}>
                            Next
                        </button>
                    </div>
                )}
            </div>
            {showModal && <AddRoomModal toggleModal={toggleModal} />}
        </>
    );
}
