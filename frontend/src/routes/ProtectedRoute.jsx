import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLoadingWithRefresh } from "../hooks/useLoadingWithRefresh.js";

export default function ProtectedRoute() {
    const { isAuth, user } = useSelector((state) => state.authSlice);
    const { Loading } = useLoadingWithRefresh();
    const location = useLocation();

    if (Loading) {
        return <div>Loading...</div>; // or a Loader component
    }

    if (!isAuth) {
        // Save the current location they were trying to go to.
        localStorage.setItem("redirectAfterLogin", location.pathname);
        return <Navigate to="/authenticate" />;
    }

    if (isAuth && !user.activated) {
        return <Navigate to="/activate" />;
    }

    return <Outlet />;
}
