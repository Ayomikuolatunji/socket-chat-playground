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

  const updateCompletedService = () => {
    socket.current.emit("updateService", {
      studentId: "736bfb79-0098-4f37-a4a9-fcccab610d52",
      servicePortalId: "89d7e09f-8438-46b6-a314-a1ac2f6cec62",
      serviceStatus: "DONE",
      adminUserId: "10d0e172-5ec2-4eaa-8b09-7c3387b33134",
    });
  };
  const completeService = async () => {
    try {
      if (!selectedFile) {
        return;
      }
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await axios(
        `http://localhost:8080/api/v1/upload_service_doc/10d0e172-5ec2-4eaa-8b09-7c3387b33134`,
        {
          method: "POST",
          params: {
            studentId: "736bfb79-0098-4f37-a4a9-fcccab610d52",
            servicePortalId: "89d7e09f-8438-46b6-a314-a1ac2f6cec62",
            absAdminId: "6e009c0c-c859-4794-81d0-51be0a7cdfd0",
          },
          headers: {
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9sYXR1bmppYXlvbWlrdUBnbWFpbC5jb20iLCJhdXRoSWQiOiIxMGQwZTE3Mi01ZWMyLTRlYWEtOGIwOS03YzMzODdiMzMxMzQiLCJyb2xlIjoiQWJzVXNlckFkbWluIiwiaWF0IjoxNjg4MzAwOTI0LCJleHAiOjE2OTA4OTI5MjR9.yBO41azG5umOytOiy_apujOFTBvpSJ7N2AcjSeNtVHI",
          },
          data: formData,
        }
      );
      console.log(response);
      if (response.status === 200) {
        console.log("Document uploaded successfully");
        updateCompletedService();
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
        absAdminId: "6e009c0c-c859-4794-81d0-51be0a7cdfd0",
        adminUserId: "10d0e172-5ec2-4eaa-8b09-7c3387b33134",
        connectionType: "school",
      },
    });
    socket.current.on("connect", () => {
      console.log("Connected to the server");
      socket.current.emit("userLogin", "10d0e172-5ec2-4eaa-8b09-7c3387b33134");
    });
    socket.current.emit("fetchServices", {
      userFetchType: "school",
      userFetchId: "10d0e172-5ec2-4eaa-8b09-7c3387b33134",
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

  const updateServiceStatus = () => {
    socket.current.emit("updateService", {
      studentId: "736bfb79-0098-4f37-a4a9-fcccab610d52",
      servicePortalId: "89d7e09f-8438-46b6-a314-a1ac2f6cec62",
      serviceStatus: "In_PROGRESS",
      adminUserId: "10d0e172-5ec2-4eaa-8b09-7c3387b33134",
    });
  };

  // enum ServiceStatus {
  // TODO
  // In_PROGRESS
  // REJECTED
  // DONE
// }
  return (
    <div className="App">
      <h1>Admin</h1>
      <input type="file" onChange={handleFileChange} />
      <div>
        <button onClick={completeService} disabled={!selectedFile}>
          Complete the service
        </button>
      </div>
      <div>
        <button onClick={updateServiceStatus}>update service status</button>
      </div>
    </div>
  );
}
