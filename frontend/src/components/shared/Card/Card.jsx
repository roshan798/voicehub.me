/* eslint-disable react/prop-types */
import { useState, useRef } from "react";
import styles from "./Card.module.css";

export default function Card({ emoji, title, children = "" }) {
    const cardRef = useRef(null);
    const [circleStyle, setCircleStyle] = useState({
        visibility: "hidden",
        top: 0,
        left: 0,
    });

    const handleMouseMove = (e) => {
        const cardRect = cardRef.current.getBoundingClientRect();
        const { clientX, clientY } = e;

        setCircleStyle({
            visibility: "visible",
            top: clientY - cardRect.top,
            left: clientX - cardRect.left,
        });
    };

    const handleMouseLeave = () => {
        setCircleStyle({
            visibility: "hidden",
            top: 0,
            left: 0,
        });
    };

    return (
        <div
            className={styles.wrapper}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            ref={cardRef}>
            <div
                className={styles.circle}
                style={{
                    visibility: circleStyle.visibility,
                    top: circleStyle.top,
                    left: circleStyle.left,
                }}></div>
            <div className={styles.heading}>
                <img
                    src={emoji}
                    alt="emoji"
                />
                <span>{title}</span>
            </div>
            {children}
        </div>
    );
}
