import { lazy, Suspense } from "react";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import Navigation from "./components/shared/Navigation/Navigation.jsx";
import { useSelector } from "react-redux";
import { useLoadingWithRefresh } from "./hooks/useLoadingWithRefresh.js";
import Loader from "./components/shared/Loader/Loader.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import SemiProtectedRoute from "./routes/SemiProtectedRoute.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";

const Home = lazy(() => import("./pages/Home/Home.jsx"));
const Authenticate = lazy(() =>
    import("./pages/Authenticate/Authenticate.jsx")
);
const Rooms = lazy(() => import("./pages/Rooms/Rooms.jsx"));
const Room = lazy(() => import("./pages/Room/Room.jsx"));
const Activate = lazy(() => import("./pages/Activate/Activate.jsx"));
const Profile = lazy(() => import("./pages/profile/Profile.jsx"));
const Error404 = lazy(() => import("./pages/Error/Error404.jsx"));

function App() {
    const { Loading } = useLoadingWithRefresh();

    if (Loading) {
        return <Loader message={"Loading, please wait..."} />;
    }

    return (
        <>
            <ToastContainer />
            <Navigation />
            <Suspense fallback={<Loader message={"Loading, please wait..."} />}>
                <Routes>
                    <Route element={<PublicRoute />}>
                        <Route
                            path="/"
                            element={<Home />}
                        />
                        <Route
                            path="/authenticate"
                            element={<Authenticate />}
                        />
                    </Route>
                    <Route element={<SemiProtectedRoute />}>
                        <Route
                            path="/activate"
                            element={<Activate />}
                        />
                    </Route>
                    <Route element={<ProtectedRoute />}>
                        <Route
                            path="/rooms"
                            element={<Rooms />}
                        />
                        <Route
                            path="/room/:roomId"
                            element={<Room />}
                        />
                        <Route
                            path="/profile"
                            element={<Profile />}
                        />
                    </Route>
                    <Route
                        path="*"
                        element={<Error404 />}
                    />
                </Routes>
            </Suspense>
        </>
    );
}

export default App;
