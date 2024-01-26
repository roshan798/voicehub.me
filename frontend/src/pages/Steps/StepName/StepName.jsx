import { useState } from "react";
import namePageEmogi from "../../../assets/Images/name-page.png";
import styles from "./StepName.module.css";
import Button from "../../../components/shared/CardButton/Button";
import Card from "../../../components/shared/Card/Card";
import { useDispatch, useSelector } from "react-redux";
import { setName } from "../../../store/activateSlice.js";
// eslint-disable-next-line react/prop-types
export default function StepName({ onNext }) {
    const name = useSelector((state) => {
        return state.activateSlice.name;
    });
    const [fullName, setFullName] = useState(name);
    const dispatch = useDispatch();
    console.log("Step name page");
    const nextStep = () => {
        if (!fullName) return;
        dispatch(setName(fullName));
        console.log("clicked");
        onNext();
    };

    return (
        <div className="card-wrapper">
            <Card
                emoji={namePageEmogi}
                title={"What’s your full name?"}>
                <div className={styles.inputBox}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="John Doe"
                        id="name"
                        value={fullName}
                        onChange={(e)=>{
                            setFullName(e.target.value)
                        }}
                    />
                </div>
                <p className={styles.termsText}>
                    People use real name at coder’s house :)
                </p>
                <Button
                    text={"Next"}
                    onClick={nextStep}
                />
            </Card>
        </div>
    );
}
