import  { useState } from "react";
import axios from "axios";

function App() {
//   const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleMessageChange = (event:any) => {
    setInputMessage(event.target.value);
  };

  const handleSendMessage = async (event:any) => {
    event.preventDefault();

    if (inputMessage.trim() === "") return;

    try {
      const response = await axios.post("http://localhost:8080/api/v1/chat-with-ai", {
        message: inputMessage,
      });
      console.log(response);
      
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h1>Chat App</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {/* {messages.map((message, index) => (
          <div
            key={index}
            style={{
              alignSelf: message.sender === "user" ? "flex-end" : "flex-start",
              maxWidth: "70%",
              background: message.sender === "user" ? "#e0e0e0" : "#f5f5f5",
              padding: "10px",
              margin: "10px",
              borderRadius: "5px",
            }}
          >
            <span>{message.content}</span>
          </div>
        ))} */}
      </div>
      <form onSubmit={handleSendMessage} style={{ marginTop: "20px" }}>
        <input
          type="text"
          value={inputMessage}
          onChange={handleMessageChange}
          style={{ marginRight: "10px" }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
