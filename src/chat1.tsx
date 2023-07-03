import axios from "axios";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

function formatTimestamp(timestamp: any) {
  const date = new Date(timestamp);
  const options: any = { hour: "numeric", minute: "numeric", hour12: true };
  return date.toLocaleString("en-US", options);
}

const senderId = "983037b8-ce88-49dd-9a67-95be0043d829";
const receiverId = "736bfb79-0098-4f37-a4a9-fcccab610d52";

const absAdminId = "6e009c0c-c859-4794-81d0-51be0a7cdfd0";
const adminUserId = "10d0e172-5ec2-4eaa-8b09-7c3387b33134";

const Chat2 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState("");
  const hiddenImageFile = useRef<any>(null);
  const socket = useRef<any>(null);
  const [messages, setMessages] = useState<any>([]);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectImage] = useState<any>("");
  const [offline, setOffline] = useState(true);
  const [user1, setUser] = useState<any>(null);
  const [isRead, setIsRead] = useState(false);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9sYXR1bmppYXlvbWlrdUBnbWFpbC5jb20iLCJhdXRoSWQiOiI3MzZiZmI3OS0wMDk4LTRmMzctYTRhOS1mY2NjYWI2MTBkNTIiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTY4ODMwNDM3NSwiZXhwIjoxNjkwODk2Mzc1fQ.-vyLXdV6hsXZHZwMrKZ03BPWeW858xpA0ImDSgLGsRU";
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(
          `http://localhost:8080/api/v1/student/${receiverId}`,
          config
        );
        setUser(response.data.data);
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [offline]);


  const createChat = (e: any) => {
    e.preventDefault();
    if (!input) {
      return;
    }
    socket.current.emit("sendMessage", {
      from: senderId,
      to: receiverId,
      message: input,
      type: "text",
    });
    setInput("");
  };
  const handleImageUpload = async () => {
    setIsOpen(false);
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await axios.post(
        "http://localhost:8080/api/v1/upload_chat_image/studentId",
        formData,
        {
          params: {
            from: senderId,
            to: receiverId,
            type: "media",
          },
          headers: {
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImF5b21pa3VAZ21haWwuY29tIiwiYXV0aElkIjoiOTgzMDM3YjgtY2U4OC00OWRkLTlhNjctOTViZTAwNDNkODI5Iiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE2ODgzMDMxMTIsImV4cCI6MTY5MDg5NTExMn0.AR3i0Jy4cy9CptmdWiuW9FHC5SzM9a8rnsM2VKRGX28",
          },
        }
      );
      if (response.data.message === "Sent") {
        setImage("");
        setIsOpen(false);
        setSelectImage("");
      }
    } catch (error) {
      setImage("");
      setIsOpen(false);
      setSelectImage("");
    }
  };

  const onImageChange = async (event: any) => {
    try {
      if (event.target.files && event.target.files[0]) {
        setImage(URL.createObjectURL(event.target.files[0]));
        setSelectImage(event.target.files[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleImage = (event: any) => {
    hiddenImageFile.current.click();
  };

  useEffect(() => {
    if (image) {
      setIsOpen(true);
    }
  }, [image]);

  const onClose = () => {
    setImage("");
    setIsOpen(false);
    setSelectImage("");
  };

    useEffect(() => {
      socket.current = io("http://localhost:8080", {
        query: {
          absAdminId,
          adminUserId,
          studentId: senderId,
          connectType: "student",
        },
      });
      socket.current.on("connect", () => {
        console.log("Connected to the server");
        socket.current.emit("userLogin", senderId);
        socket.current.on("messageDelivered", (data: any) => {
          setMessages((prev: any) => [...prev, data]);
          console.log(data);
        });
        socket.current.emit("fetchUserMessages", {
          senderId: senderId,
          receiverId: receiverId,
        });
        socket.current.on("chatFetched", (data: any) => {
          setMessages(data);
        });
      });
      socket.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });
      socket.current.on("userOffline", (studentId: string) => {
        if (studentId === receiverId) {
          console.log(`Student ${studentId} went offline.`);
          setOffline(true);
        }
      });
      socket.current.on("userOnline", (studentId: string) => {
        if (studentId === receiverId) {
          setOffline(false);
          console.log(`Student ${studentId} came online.`);
        }
      });
      socket.current.emit("set", "is_it_ok", function (response: any) {
        if (response === "ok") {
          setIsRead(true);
        } else {
          setIsRead(false);
        }
      });
      socket.current.emit("markMessagesAsRead", {
        senderId: senderId,
        receiverId: receiverId,
      });
      return () => {
        socket.current.disconnect();
      };
    }, []);

    useEffect(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }, [messages]);

  console.log(messages);

  return (
    <div style={{ width: "100%" }}>
      <div className="header">
        <h1>
          {!offline ? (
            <div className="isOnline">user2 is online</div>
          ) : (
            "User 2 offline"
          )}
        </h1>
        <h4>
          {user1?.firstName} {user1?.lastName}
        </h4>
      </div>
      <div style={{ width: "100%", marginBottom: "100px", marginTop: "130px" }}>
        {messages?.map((message: any) => (
          <div
            className={`message ${
              message.senderId === senderId ? "sent" : "received"
            }`}
            key={message.messageId}
          >
            <div style={{ margin: "0 10px" }}>
              {message.picture ? (
                <div>
                  <img src={message.picture} />
                </div>
              ) : (
                <div>{message.message}</div>
              )}
              <span className="timestamp">
                {formatTimestamp(message.timestamp)}
              </span>
              {message.senderId === "a803b759-9055-4f3a-a438-2889d6802ef1" ? (
                <div style={{ color: "red" }}>{isRead ? "seen" : ""}</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div className="input-div">
        <div>
          <label className="file" htmlFor="file">
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              ref={hiddenImageFile}
              id="file"
              style={{ display: "none" }}
            />
          </label>
          <button className="file" onClick={handleImage}>
            Upload
          </button>
        </div>
        <form className="field" onSubmit={createChat}>
          <input
            value={input}
            type="text"
            onChange={(e: any) => setInput(e.target.value)}
            style={{ width: "90%", padding: "10px" }}
            placeholder="Type message"
          />
          <button className="send" type="submit">
            Send
          </button>
        </form>
        <button className="send" onClick={createChat}>
          Send
        </button>
      </div>
      <Modal
        isOpen={isOpen}
        image={image}
        onClose={onClose}
        handleImageUpload={handleImageUpload}
      />
    </div>
  );
};

export default Chat2;

const Modal = ({ isOpen, onClose, image, handleImageUpload }: any) => {
  return (
    <div
      style={{
        display: isOpen ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          flexDirection: "column",
          width: "250px",
        }}
        onClick={(e: any) => e.stopPropagation()}
      >
        <img src={image} style={{ width: "100%", height: "200px" }} />
        <div style={{ display: "flex", marginTop: "20px", gap: "10px" }}>
          <button onClick={onClose}>Close</button>
          <button onClick={handleImageUpload}>Send</button>
        </div>
      </div>
    </div>
  );
};
