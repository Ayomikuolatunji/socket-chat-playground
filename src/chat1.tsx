import axios from "axios";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

function formatTimestamp(timestamp: any) {
  const date = new Date(timestamp);
  const options: any = { hour: "numeric", minute: "numeric", hour12: true };
  return date.toLocaleString("en-US", options);
}

const Chat2 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState("");
  const hiddenImageFile = useRef<any>(null);
  const socket = useRef<any>(null);
  const [messages, setMessages] = useState<any>([]);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectImage] = useState<any>("");
  const [offline, setOffline] = useState(false);
  const [user1, setUser] = useState<any>(null);
  const [isRead, setIsRead] = useState(false);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9sYXR1bmppQGdtYWlsLmNvbSIsImF1dGhJZCI6ImM1YWVkZWZjLTVkZGYtNGY4NS04YTIwLTk1ODFkMDlhODQ3YSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNjg4MjIxMjA4LCJleHAiOjE2OTA4MTMyMDh9.eq7HQ4Y4KUP8gKxYNathGqSTjKKBA9bmm8xP_SVlgls";
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(
          `http://localhost:8080/api/v1/student/${"c5aedefc-5ddf-4f85-8a20-9581d09a847a"}`,
          config
        );
        setUser(response.data.data);
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [offline]);

  useEffect(() => {
    socket.current = io("http://localhost:8080", {
      query: {
        absAdminId: "937b5d78-8248-44f2-bb82-af4fa18a1efd",
        adminUserId: "053d5b9b-9ed8-4186-b3ba-c2957959e759",
        studentId: "87b473da-e45c-475d-bd87-d9bd3e001ac4",
      },
    });
    socket.current.on("connect", () => {
      console.log("Connected to the server");
      setOffline(false);
      socket.current.emit("userLogin", "87b473da-e45c-475d-bd87-d9bd3e001ac4");
      socket.current.on("messageDelivered", (data: any) => {
        setMessages((prev: any) => [...prev, data]);
           console.log(data);
      });
      socket.current.emit("fetchUserMessages", {
        senderId: "87b473da-e45c-475d-bd87-d9bd3e001ac4",
        receiverId: "c5aedefc-5ddf-4f85-8a20-9581d09a847a",
      });
      socket.current.on("chatFetched", (data: any) => {
        setMessages(data);
      });
    });
    socket.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });
    socket.current.on("userOffline", (studentId: string) => {
      if (studentId === "c5aedefc-5ddf-4f85-8a20-9581d09a847a") {
        console.log(`Student ${studentId} went offline.`);
        setOffline(true);
      }
    });
    socket.current.on("userOnline", (studentId: string) => {
      if (studentId === "c5aedefc-5ddf-4f85-8a20-9581d09a847a") {
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
      senderId: "87b473da-e45c-475d-bd87-d9bd3e001ac4",
      receiverId: "c5aedefc-5ddf-4f85-8a20-9581d09a847a",
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

  const createChat = (e: any) => {
    e.preventDefault();
    if (!input) {
      return;
    }
    socket.current.emit("sendMessage", {
      from: "87b473da-e45c-475d-bd87-d9bd3e001ac4",
      to: "c5aedefc-5ddf-4f85-8a20-9581d09a847a",
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
        "http://localhost:8080/api/v1/upload_chat_image/",
        formData,
        {
          params: {
            from: "87b473da-e45c-475d-bd87-d9bd3e001ac4",
            to: "c5aedefc-5ddf-4f85-8a20-9581d09a847a",
            type: "media",
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

  console.log(messages);

  return (
    <div style={{ width: "100%" }}>
      <div className="header">
        <h1>
          User 2{" "}
          {!offline ? (
            <div className="isOnline">user is online</div>
          ) : (
            "offline"
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
              message.senderId === "87b473da-e45c-475d-bd87-d9bd3e001ac4"
                ? "sent"
                : "received"
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
