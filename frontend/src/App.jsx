import React, { lazy, Suspense } from "react";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import Navigation from "./components/shared/Navigation/Navigation.jsx";
import { useSelector } from "react-redux";
import { useLaodingWithRefresh } from "./hooks/useLoadingWithRefresh.js";
import Loader from "./components/shared/Loader/Loader.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = lazy(() => import("./pages/Home/Home.jsx"));
const Authenticate = lazy(() => import("./pages/Authenticate/Authenticate.jsx"));
const Rooms = lazy(() => import("./pages/Rooms/Rooms.jsx"));
const Room = lazy(() => import("./pages/Room/Room.jsx"));
const Activate = lazy(() => import("./pages/Activate/Activate.jsx"));
const Profile = lazy(() => import("./pages/profile/Profile.jsx"));

function App() {
    const { isAuth, user } = useSelector((state) => {
        return state.authSlice;
    });
    const { Loading } = useLaodingWithRefresh();
    if (Loading) {
        return <Loader message={"Loading, please wait..."} />;
    }
    return (
        <>
            <ToastContainer />
            <Navigation />
            <Suspense fallback={<Loader message={"Loading, please wait..."} />}>
                <Routes>
                    <Route
                        exact
                        path="/"
                        element={!isAuth ? <Home /> : <Navigate to={"/activate"} />}
                    />
                    <Route
                        path="/authenticate"
                        element={
                            !isAuth ? (
                                <Authenticate />
                            ) : (
                                <Navigate to={"/activate"} />
                            )
                        }
                    />
                    <Route
                        path="/activate"
                        element={
                            isAuth == true ? (
                                user.activated == false ? (
                                    <Activate />
                                ) : (
                                    <Navigate to={"/rooms"} />
                                )
                            ) : (
                                <Navigate to={"/authenticate"} />
                            )
                        }
                    />
                    <Route
                        exact
                        path="/rooms"
                        element={
                            isAuth == true ? (
                                user.activated == true ? (
                                    <Rooms />
                                ) : (
                                    <Navigate to={"/activate"} />
                                )
                            ) : (
                                <Navigate to={"/"} />
                            )
                        }
                    />
                    <Route
                        exact
                        path="/room/:roomId"
                        element={
                            isAuth == true ? (
                                user.activated == true ? (
                                    <Room />
                                ) : (
                                    <Navigate to={"/activate"} />
                                )
                            ) : (
                                <Navigate to={"/"} />
                            )
                        }
                    />
                    <Route
                        exact
                        path="/profile"
                        element={
                            isAuth == true ? (
                                user.activated == true ? (
                                    <Profile />
                                ) : (
                                    <Navigate to={"/activate"} />
                                )
                            ) : (
                                <Navigate to={"/"} />
                            )
                        }
                    />
                </Routes>
            </Suspense>
        </>
    );
}

export default App;
