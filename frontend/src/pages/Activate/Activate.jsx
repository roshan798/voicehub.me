import StepAvatar from "../Steps/StepAvatar/StepAvatar.jsx";
import StepName from "../Steps/StepName/StepName.jsx";
import { useState } from "react";
export default function Activate() {
    //
    const steps = {
        1: StepName,
        2: StepAvatar,
    };

    const [step, setStep] = useState(1);
    const Step = steps[step];
    const onNext = () => {
        setStep(step + 1);
    };
    //
    return (
        <div>
            <Step onNext={onNext} />
        </div>
    );
}
