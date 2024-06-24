import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLoadingWithRefresh } from "../hooks/useLoadingWithRefresh.js";

export default function PublicRoute() {
    const { isAuth } = useSelector((state) => state.authSlice);
    const { Loading } = useLoadingWithRefresh();

    if (Loading) {
        return <div>Loading...</div>; // or a Loader component
    }

    return isAuth ? <Navigate to="/rooms" /> : <Outlet />;
}
