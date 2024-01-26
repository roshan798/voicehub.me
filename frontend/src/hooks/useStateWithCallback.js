import { useCallback, useEffect, useRef, useState } from "react"

export const useStateWithCallback = (initialState) => {
    const [state, setState] = useState(initialState);
    const callbackRef = useRef(null);

    const updateState = useCallback((newState, callback) => {
        // console.log("useCaallback-> updateState");

        callbackRef.current = callback;

        setState((prev) => {
            return (typeof newState === 'function')
                ? newState(prev)
                : newState
        });
    }, []);

    useEffect(() => {
        // console.log("useEffect-> useStateWithCallback");
        if (callbackRef.current) {
            // console.log("inside useStateWithCallback");
            callbackRef.current(state);
            callbackRef.current = null;
        }

    }, [state])

    return [state, updateState];

}