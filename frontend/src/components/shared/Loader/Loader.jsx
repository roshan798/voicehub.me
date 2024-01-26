import styles from "./Loader.module.css";

export default function Loader({ message }) {
    return (
        <>
            <div className="card-wrapper">
                <div className={styles.wrapper}>
                    <div className={styles.loader}></div>
                    <span className={styles.message}>{message}</span>
                </div>
            </div>
        </>
    );
}
