import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLoadingWithRefresh } from "../hooks/useLoadingWithRefresh.js";

export default function ProtectedRoute() {
    const { isAuth, user } = useSelector((state) => state.authSlice);
    const { Loading } = useLoadingWithRefresh();

    if (Loading) {
        return <div>Loading...</div>; // or a Loader component
    }

    if (!isAuth) {
        return <Navigate to="/authenticate" />;
    }

    if (isAuth && !user.activated) {
        return <Navigate to="/activate" />;
    }

    return <Outlet />;
}
