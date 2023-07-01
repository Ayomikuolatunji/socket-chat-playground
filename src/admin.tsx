import axios from "axios";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import io from "socket.io-client";

export default function Admin() {
  const socket = useRef<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const updateService = () => {
    socket.current.emit("updateService", {
      studentId: "1de3c231-7738-492d-9211-c1be05d09d8e",
      servicePortalId: "1721fae0-a1af-4211-9907-3a6be89e11b5",
      serviceStatus: "DONE",
      adminUserId: "6b761993-1827-4365-9f3b-15dd1eacdba5",
    });
  };

  const handleUpload = async () => {
    try {
      if (!selectedFile) {
        return;
      }
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await axios(
        `http://localhost:8080/api/v1/upload_service_doc/6b761993-1827-4365-9f3b-15dd1eacdba5/`,
        {
          method: "POST",
          params: {
            studentId: "1de3c231-7738-492d-9211-c1be05d09d8e",
            servicePortalId: "1721fae0-a1af-4211-9907-3a6be89e11b5",
            absAdminId: "507033b8-46f7-4b88-af1f-40c34e49e454",
          },
          data: formData,
        }
      );
      console.log(response);
      if (response.status === 200) {
        console.log("Document uploaded successfully");
        updateService();
      } else {
        console.error("Error uploading document");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };
  useEffect(() => {
    socket.current = io("http://localhost:8080", {
      query: {
        absAdminId: "20a32688-386a-482e-81ac-967015377480",
        adminUserId: "6b761993-1827-4365-9f3b-15dd1eacdba5",
      },
    });
    socket.current.on("connect", () => {
      console.log("Connected to the server");
      socket.current.emit("userLogin", "6b761993-1827-4365-9f3b-15dd1eacdba5");
    });
    socket.current.emit("fetchServices", {
      userFetchType: "school",
      userFetchId: "6b761993-1827-4365-9f3b-15dd1eacdba5",
    });

    socket.current.on("serviceHistory", (data: any) => {
      console.log(data);
    });
    socket.current.on("newService", (data: unknown) => {
      console.log(data);
    });
    socket.current.on("updatedService", (data: any) => {
      console.log(data);
    });
    return () => {
      socket.current.disconnect();
    };
  }, []);



  return (
    <div className="App">
      <h1>Admin</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile}>
        Update
      </button>
  
    </div>
  );
}
