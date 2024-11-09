import React,{ useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { localHost } from "@/utils/localhost";
type Props = {
    children: React.ReactNode;
};
interface SocketContextType {
    socket: any;
    setSocket: (socket: any) => void;
    onlineUsers: any;
    setOnlineUsers: (onlineUsers: any) => void;
}
export const SocketContext = React.createContext<SocketContextType | undefined>(undefined);
export const useSocketContext = () => {
	return useContext(SocketContext);
};
export const SocketProvider = ({ children }:Props) => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
    useEffect(() => {
        const newSocket = io(localHost); // Replace with your server URL
        setSocket(newSocket);
        console.log('socket id: ', newSocket.id);

        return () => {
            newSocket.disconnect();
        };
    }, []);
	return (
		<SocketContext.Provider
			value={{ socket, setSocket, onlineUsers, setOnlineUsers }}>
			{children}
		</SocketContext.Provider>
	);
};

export default SocketContext;
