import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const studentId = "311be4af-5b37-4953-b403-699f4e9a0aaa";

  const handleMessageChange = (event: any) => {
    setInputMessage(event.target.value);
  };

  const codeKeywords = [
    "function",
    "var",
    "const",
    "if",
    "else",
    "for",
    "while",
    "class",
    "printf",
    "stdio.h",
    "int",
    "#include"
  ];
  const mathKeywords = ["integral", "derivative", "equation", "theorem"];
  const physicsKeywords = ["force", "gravity", "quantum", "relativity"];
  const chemistryKeywords = ["reaction", "compound", "molecule", "element"];

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/fetch_ai_chat/${studentId}`
      );
      setMessages(response.data.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSendMessage = async (event: any) => {
    event.preventDefault();

    if (inputMessage.trim() === "") return;

    try {
      await axios.post(
        `http://localhost:8080/api/v1/chat-with-ai/${studentId}`,
        {
          content: inputMessage,
          studentId: studentId,
          adminUserId: "fa250001-f587-46d9-aff4-34855b2e7f3a", // Replace with the actual userAdminAdminUserId
          absAdminId: "019d4e67-e6fb-4d57-8e42-86702a889062", // Replace with the actual absAdminId
        }
      );

      setInputMessage("");
      fetchChatHistory();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const isCode = (message: string) => {
    return codeKeywords.some((keyword) => message.includes(keyword));
  };

  const isMath = (message: string) => {
    return mathKeywords.some((keyword) => message.includes(keyword));
  };

  const isPhysics = (message: string) => {
    return physicsKeywords.some((keyword) => message.includes(keyword));
  };

  const isChemistry = (message: string) => {
    return chemistryKeywords.some((keyword) => message.includes(keyword));
  };

  return (
    <div>
      <h1>Chat App</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          marginBottom: "100px",
        }}
      >
        {messages.length &&
          messages.map((message: any, index) => (
            <div
              key={index}
              style={{
                alignSelf: message.senderIsAI ? "flex-start" : "flex-end",
                borderRadius: "5px",
                padding: message.senderIsAI ? "5px" : "10px",
                width: "auto",
                maxWidth: message.senderIsAI ? "100%" : "80%",
              }}
            >
              {isCode(message.message) ||
              isMath(message.message) ||
              isPhysics(message.message) ||
              isChemistry(message.message) ? (
                <>
                  {message.senderIsAI ? (
                    <pre>
                      <code
                        style={{
                          display: "block",
                          backgroundColor: "#e8e8e8",
                          padding: "10px",
                          borderRadius: "5px",
                        }}
                      >
                        {message.message}
                      </code>
                    </pre>
                  ) : (
                    <div>{message.message}</div>
                  )}
                </>
              ) : (
                message.message
              )}
            </div>
          ))}
      </div>
      <form
        onSubmit={handleSendMessage}
        style={{ marginTop: "20px" }}
        className="chat-ai-form"
      >
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
