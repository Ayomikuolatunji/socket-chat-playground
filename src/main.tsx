import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ChatAI from "./chatAI.tsx";
import App from "./App.tsx";
import "./index.css";
import Admin from "./admin.tsx";
import Chat1 from "./chat1.tsx";
import Chat2 from "./chat2.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/chat",
    element: <ChatAI />,
  },
  { path: "/message-chat1", element: <Chat1 /> },
  { path: "/message-chat2", element: <Chat2 /> },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
