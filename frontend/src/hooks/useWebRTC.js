/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import freeice from 'freeice';
import { useStateWithCallback } from './useStateWithCallback';
import socketInit from '../socket/index.js';
import { ACTIONS } from '../actions.js';
import showToastMessage from "../utils/showToastMessage.js"

export function useWebRTC(roomId, user) {
    const socket = useRef(null);
    const audioElements = useRef({});
    const connections = useRef({});
    const localMediaStream = useRef(null);
    const clientsRef = useRef([]);
    const navigate = useNavigate();

    const [clients, setClients] = useStateWithCallback([]);
    const [joinRequests, setJoinRequests] = useStateWithCallback([]);

    // Add a new client to the list
    const addNewClient = useCallback(
        (newClient, cb) => {
            setClients((existingClients) => {
                const isClientAlreadyPresent = existingClients.some(
                    (client) => client.id === newClient.id
                );

                if (isClientAlreadyPresent) {
                    return existingClients;
                }
                return [...existingClients, newClient];
            }, cb);
        },
        [setClients]
    );

    // start Capture
    const startCapture = async () => {
        try {
            localMediaStream.current = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            addNewClient({ ...user, muted: true }, () => {
                const localElement = audioElements.current[user.id];
                if (localElement) {
                    localElement.srcObject = localMediaStream.current;
                }
                localMediaStream.current.getAudioTracks().forEach((track) => {
                    track.enabled = false;
                });

                socket.current.emit(ACTIONS.JOIN, { roomId, user });
            });
        } catch (error) {
            console.error('Error accessing user media:', error);
            showToastMessage("error", "Failed to access media devices. Please check your permissions.");
        }
    };

    // Stop Capture local media stream
    const stopCaptureAndLeave = () => {
        if (localMediaStream.current && localMediaStream.current.getTracks) {
            localMediaStream.current.getTracks().forEach((track) => {
                track.stop();
            });
        }
        socket.current.emit(ACTIONS.LEAVE, { roomId, userId: user.id });
    };

    // Initialize WebRTC and Socket
    useEffect(() => {
        const initializeWebRTC = async () => {
            try {
                Object.values(connections.current).forEach(connection => connection.close());
                connections.current = {};

                socket.current = socketInit();

                const handleNewPeer = async ({ peerId, createOffer, user: remoteUser }) => {
                    if (!remoteUser) return;
                    if (peerId in connections.current) {
                        return console.warn(`Already Connected with ${peerId} ${user.name}`);
                    }

                    connections.current[peerId] = new RTCPeerConnection({
                        iceServers: freeice(),
                    });

                    connections.current[peerId].onicecandidate = (event) => {
                        socket.current.emit(ACTIONS.RELAY_ICE, {
                            peerId,
                            icecandidate: event.candidate,
                        });
                    };

                    connections.current[peerId].ontrack = ({ streams: [remoteStream] }) => {
                        addNewClient({ ...remoteUser, muted: true }, () => {
                            if (audioElements.current[remoteUser.id]) {
                                audioElements.current[remoteUser.id].srcObject = remoteStream;
                                audioElements.current[remoteUser.id].volume = 0.8;
                                audioElements.current[remoteUser.id].play();
                            } else {
                                let settled = false;
                                const interval = setInterval(() => {
                                    if (audioElements.current[remoteUser.id]) {
                                        audioElements.current[remoteUser.id].srcObject = remoteStream;
                                        audioElements.current[remoteUser.id].volume = 0.8;
                                        audioElements.current[remoteUser.id].play();
                                        settled = true;
                                    }
                                    if (settled === true) {
                                        clearInterval(interval);
                                    }
                                }, 1000);
                            }
                        });
                    };

                    localMediaStream.current.getTracks().forEach((track) => {
                        connections.current[peerId].addTrack(track, localMediaStream.current);
                    });

                    if (createOffer === true) {
                        const offer = await connections.current[peerId].createOffer();
                        await connections.current[peerId].setLocalDescription(offer);
                        socket.current.emit(ACTIONS.RELAY_SDP, {
                            peerId,
                            sessionDescription: offer,
                        });
                    }
                };

                const handleIceCandidate = ({ peerId, icecandidate }) => {
                    if (icecandidate) {
                        connections.current[peerId].addIceCandidate(icecandidate);
                    }
                };

                const handleRemoteSDP = async ({ peerId, sessionDescription: remoteSessionDescription }) => {
                    connections.current[peerId].setRemoteDescription(new RTCSessionDescription(remoteSessionDescription));

                    if (remoteSessionDescription.type === 'offer') {
                        const connection = connections.current[peerId];
                        const answer = await connection.createAnswer();
                        connection.setLocalDescription(answer);
                        socket.current.emit(ACTIONS.RELAY_SDP, {
                            peerId,
                            sessionDescription: answer,
                        });
                    }
                };

                const handleRemovePeer = async ({ peerId, userId }) => {
                    if (connections.current[peerId]) {
                        connections.current[peerId].close();
                    }
                    delete connections.current[peerId];
                    delete audioElements.current[peerId];

                    setClients((existingClients) => {
                        return existingClients.filter((client) => client.id !== userId);
                    });
                };

                const setMute = (mute, userId) => {
                    const clientsIdx = clientsRef.current.map((client) => client.id).indexOf(userId);
                    const connectedClients = JSON.parse(JSON.stringify(clientsRef.current));
                    if (clientsIdx > -1) {
                        connectedClients[clientsIdx].muted = mute;
                        setClients(connectedClients);
                    }
                };

                const setupEventListeners = (connection, peerId, userId) => {
                    socket.current.on(ACTIONS.ADD_PEER, handleNewPeer);
                    socket.current.on(ACTIONS.ICE_CANDIDATE, handleIceCandidate);
                    socket.current.on(ACTIONS.SESSION_DESCRIPTION, handleRemoteSDP);
                    socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer);
                    socket.current.on(ACTIONS.MUTE, ({ peerId, userId }) => {
                        setMute(true, userId);
                    });
                    socket.current.on(ACTIONS.UNMUTE, ({ peerId, userId }) => {
                        setMute(false, userId);
                    });
                    socket.current.on(ACTIONS.USER_NOT_ALLOWED, ({ roomId, user }) => {
                        navigate(`/room/request/${roomId}`, { state: { requestFlag: false } });
                        stopCaptureAndLeave();
                        return;
                    });

                    socket.current.on(ACTIONS.APPROVE_JOIN_REQUEST, ({ roomId, user }) => {
                        setJoinRequests(requests => {
                            return [...requests, user];
                        });
                    });

                    socket.current.on(ACTIONS.JOIN_REQUEST_PENDING, (data) => {
                        stopCaptureAndLeave();
                        navigate(`/room/request/${roomId}`, { state: { requestFlag: false } });
                    });

                    socket.current.on(ACTIONS.YOU_ARE_REMOVED, ({ roomId }) => {
                        navigate(`/room/request/${roomId}`, { state: { requestFlag: false } });
                        stopCaptureAndLeave();
                        showToastMessage("error", "You are removed from the room");
                    });
                };

                setupEventListeners(connections.current, socket.current, user.id);

                return () => {
                    socket.current.off(ACTIONS.ADD_PEER, handleNewPeer);
                    socket.current.off(ACTIONS.ICE_CANDIDATE, handleIceCandidate);
                    socket.current.off(ACTIONS.SESSION_DESCRIPTION, handleRemoteSDP);
                    socket.current.off(ACTIONS.REMOVE_PEER, handleRemovePeer);
                    socket.current.off(ACTIONS.MUTE);
                    socket.current.off(ACTIONS.UNMUTE);
                    socket.current.off(ACTIONS.USER_NOT_ALLOWED);
                    socket.current.off(ACTIONS.APPROVE_JOIN_REQUEST);
                    socket.current.off(ACTIONS.JOIN_REQUEST_PENDING);
                    socket.current.off(ACTIONS.YOU_ARE_REMOVED);
                };
            } catch (error) {
                console.error('Error initializing WebRTC:', error);
            }
        };

        initializeWebRTC();
    }, [addNewClient, setClients]);

    useEffect(() => {
        startCapture();
        return stopCaptureAndLeave;
    }, []);

    useEffect(() => {
        clientsRef.current = clients;
    }, [clients]);

    const provideRef = (instance, userId) => {
        audioElements.current[userId] = instance;
    };

    const handleMute = (isMute, userId) => {
        let settled = false;
        const interval = setInterval(() => {
            if (localMediaStream.current) {
                const audioTrack = localMediaStream.current.getTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = !isMute;
                }
                if (isMute === true) socket.current.emit(ACTIONS.MUTE, { roomId, userId });
                else socket.current.emit(ACTIONS.UNMUTE, { roomId, userId });
                settled = true;
            }
            if (settled) clearInterval(interval);
        }, 200);
    };

    return { socket, clients, provideRef, handleMute, joinRequests, setJoinRequests };
}
