import { useSocket } from '@/context/SocketContext';
import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { Button } from '../ui/button';
import { Phone, PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, Loader2 } from 'lucide-react'; // Added Loader2
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slices/userSlice';
import { toast } from 'sonner';

const VideoCall = ({ otherUser, onCallEnded, startCall = false }) => {
    const [stream, setStream] = useState(null);
    const [call, setCall] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    
    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    
    const socket = useSocket();
    const currentUser = useSelector(selectCurrentUser);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }
            }).catch(err => {
                console.error("Failed to get media stream:", err);
                toast.error("Could not access camera/microphone. Please check permissions.");
                onCallEnded();
            });

        const handleIncomingCall = (data) => {
            setCall({ isReceivingCall: true, from: data.from, signal: data.signal });
        };
        socket.on("callIncoming", handleIncomingCall);

        const handleCallAccepted = (signal) => {
            setCallAccepted(true);
            if (connectionRef.current) {
                connectionRef.current.signal(signal);
            }
        };
        socket.on("callAccepted", handleCallAccepted);

        return () => {
            socket.off("callIncoming", handleIncomingCall);
            socket.off("callAccepted", handleCallAccepted);
        };
    }, [socket]);
    
    useEffect(() => {
        if (startCall && stream) {
            const peer = new Peer({ initiator: true, trickle: false, stream });

            peer.on("signal", (data) => {
                socket.emit("callUser", {
                    userToCall: otherUser._id,
                    signalData: data,
                    from: currentUser._id,
                });
            });

            peer.on("stream", (currentStream) => {
                if (userVideo.current) {
                    userVideo.current.srcObject = currentStream;
                }
            });

            connectionRef.current = peer;
        }
    }, [startCall, stream]);

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new Peer({ initiator: false, trickle: false, stream });

        peer.on("signal", (data) => {
            socket.emit("answerCall", { signal: data, to: call.from });
        });
        
        peer.on("stream", (currentStream) => {
            if (userVideo.current) userVideo.current.srcObject = currentStream;
        });
        
        peer.signal(call.signal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        if (connectionRef.current) connectionRef.current.destroy();
        if (stream) stream.getTracks().forEach(track => track.stop());
        onCallEnded();
    };

    const toggleMic = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsMicOn(audioTrack.enabled);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOn(videoTrack.enabled);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-between p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-6xl flex-grow items-center">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video shadow-2xl">
                    <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded-md text-sm">You</div>
                </div>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video shadow-2xl">
                    {callAccepted ? (
                        <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-gray-900/50">
                            <Loader2 className="h-8 w-8 animate-spin mb-4"/>
                            <p>{call?.isReceivingCall ? "Incoming call..." : `Connecting to ${otherUser?.fullName}...`}</p>
                        </div>
                    )}
                    <p className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded-md text-sm">{otherUser?.fullName}</p>
                </div>
            </div>

            <div className="flex flex-col items-center gap-4 p-4">
                 {call?.isReceivingCall && !callAccepted && (
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <p className="text-white text-lg animate-pulse">{otherUser?.fullName || 'Someone'} is calling...</p>
                        <div className="flex gap-4">
                            <Button onClick={leaveCall} variant="destructive" size="lg" className="rounded-full"><PhoneOff /></Button>
                            <Button onClick={answerCall} size="lg" className="rounded-full bg-green-600 hover:bg-green-700"><Phone /></Button>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-4">
                    <Button onClick={toggleVideo} variant="outline" size="icon" className="rounded-full h-12 w-12 bg-white/10 text-white border-white/20 hover:bg-white/20">
                        {isVideoOn ? <VideoIcon /> : <VideoOff />}
                    </Button>
                    {(startCall || callAccepted) && (
                         <Button variant="destructive" size="icon" className="rounded-full h-14 w-14" onClick={leaveCall}>
                            <PhoneOff />
                        </Button>
                    )}
                    <Button onClick={toggleMic} variant="outline" size="icon" className="rounded-full h-12 w-12 bg-white/10 text-white border-white/20 hover:bg-white/20">
                        {isMicOn ? <Mic /> : <MicOff />}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default VideoCall;