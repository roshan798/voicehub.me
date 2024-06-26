import PropTypes from "prop-types";
import styles from "./Tooltip.module.css";

const Tooltip = ({ text, position, children }) => {
    return (
        <div className={styles.tooltipContainer}>
            {children}
            <div className={`${styles.tooltipText} ${styles[position]}`}>
                {text}
            </div>
        </div>
    );
};

Tooltip.propTypes = {
    text: PropTypes.string.isRequired,
    position: PropTypes.oneOf(["top", "right", "bottom", "left"]).isRequired,
    children: PropTypes.node.isRequired,
};

export default Tooltip;
