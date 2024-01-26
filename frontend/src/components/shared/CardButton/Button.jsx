/* eslint-disable react/prop-types */
import styles from "./Button.module.css";
import arrowForward from "../../../assets/Images/Arrow forward.png";
export default function Button({ text, onClick, disabled, loading }) {
    return (
        <button
            className={`${styles.btn} transition`}
            onClick={onClick}
            disabled={disabled}>
            {loading ? (
                <span className={styles.loader}></span>
            ) : (
                <>
                    {text}{" "}
                    <img
                        src={arrowForward}
                        alt="arrow-forward"
                        className={styles.arrowForward}
                    />
                </>
            )}
        </button>
    );
}
