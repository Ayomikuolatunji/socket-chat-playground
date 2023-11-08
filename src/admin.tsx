import axios from "axios";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { studentId } from "./App";

export const adminUserId = "5497ce28-4f2a-4898-a767-08f8f9e7cfaf";

export const absAdminId = "fca86d2b-6568-452f-be4a-14247bfb0d78";

export const servicePortalId = "81dc862e-cfd0-4698-8c9f-8cc34f407222";

const userAdminToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9sYXR1bmppYXlvbWlrdUBnbWFpbC5jb20iLCJhdXRoSWQiOiJkMGM0MDMyYy1lMzg0LTRlYmEtYjkyMS04NWMwZGU5ZmUzZjQiLCJyb2xlIjoiQWJzVXNlckFkbWluIiwiaWF0IjoxNjk1MTIwMjIyLCJleHAiOjE2OTc3MTIyMjJ9.kNSuCPhyx_2Gm-V91ErHd7vKbx4MrCmOPYY56GqdBgQ";

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
      studentId: studentId,
      servicePortalId: servicePortalId,
      serviceStatus: "DONE",
      adminUserId: adminUserId,
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
        `https://abs-stanging-server.onrender.com/api/v1/absUserAdmin/upload_service_doc/${adminUserId}`,
        {
          method: "POST",
          params: {
            studentId: studentId,
            serviceId: servicePortalId,
            absAdminId: absAdminId,
          },
          headers: {
            Authorization: `Bearer ${userAdminToken}`,
          },
          data: formData,
        }
      );
      if (response.status === 200) {
        console.log("Document uploaded successfully");
        await axios(`https://abs-stanging-server.onrender.com/api/v1/absUserAdmin/request-service/${adminUserId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userAdminToken}`,
          },
          data: {
            studentId,
            // enum ServiceStatus {
            //   TODO
            //   In_PROGRESS
            //   REJECTED
            //   DONE
            // }
            serviceStatus: "DONE",
            servicePortalId,
          },
        });
      } else {
        console.error("Error uploading document");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };
  useEffect(() => {
    socket.current = io("https://abs-stanging-server.onrender.com", {
      query: {
        absAdminId: absAdminId,
        adminUserId: adminUserId,
        connectionType: "school",
      },
    });
    socket.current.on("connect", () => {
      console.log("Connected to the server");
      socket.current.emit("userLogin", adminUserId);
    });
    socket.current.on("newStudentRequestService", (data: unknown) => {
      console.log(data);
    });
    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const res = await axios(
        `https://abs-stanging-server.onrender.com/api/v1/absUserAdmin/services/${adminUserId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userAdminToken}`,
          },
        }
      );
      console.log(res);
    })();
  }, []);

  const updateServiceStatus = async () => {
    await axios(`https://abs-stanging-server.onrender.com/api/v1/absUserAdmin/request-service/${adminUserId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userAdminToken}`,
      },
      data: {
        studentId,
        // enum ServiceStatus {
        //   TODO
        //   In_PROGRESS
        //   REJECTED
        //   DONE
        // }
        serviceStatus: "In_PROGRESS",
        servicePortalId,
      },
    });
  };
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
        <button onClick={updateServiceStatus}>Reject</button>
      </div>
    </div>
  );
}
