import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useLoadingWithRefresh } from "./hooks/useLoadingWithRefresh.js";

// load components
import Loader from "./components/shared/Loader/Loader.jsx";
import Navigation from "./components/shared/Navigation/Navigation.jsx";
import Footer from "./components/shared/Footer/Footer.jsx";
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
const RoomJoinRequest = lazy(() =>
    import("./pages/RoomJoinRequest/RoomJoinRequest.jsx")
);
// load css 
import "./App.css";
import "react-toastify/dist/ReactToastify.css";


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
                            path="/room/request/:roomId"
                            element={<RoomJoinRequest />}
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
            <Footer></Footer>
        </>
    );
}

export default App;
