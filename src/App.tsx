import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

// Create service
export const studentId = "12b0f968-0be9-427b-a339-1980b0eb3e07";

export default function App() {
  const socket: any = useRef(null);
  const [isRendered, setIsRendered] = useState(false);



  useEffect(() => {
    setIsRendered(true);
  }, []);


  useEffect(() => {
    if (isRendered) {
      socket.current = io("https://abs-stanging-server.onrender.com");
      socket.current.on("connect", () => {
        console.log("Connected to the server");
        socket.current.emit("userLogin", studentId);
      });
      socket.current.on("userOnline", (id: string) => {
        if (id === studentId) {
          console.log(`Student ${id} came online.`);
        }
      });
      socket.current.on("notification", (data:any) => {
        console.log(data);
      });
    }
  }, [isRendered]);

  return (
    <div className="App">
      <h1>Hello Test user</h1>
    </div>
  );
}
