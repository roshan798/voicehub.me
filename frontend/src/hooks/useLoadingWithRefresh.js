import { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/authSlice';
export function useLaodingWithRefresh() {
    const [Loading, setLoading] = useState(true)
    const dispatch = useDispatch();

    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.get(
                    `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/refresh`,
                    {
                        withCredentials: true,
                    });
                // console.log(data);
                dispatch(setAuth({ data: data }))
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }

        })();
    }, [])
    
    return {Loading};
}