import { useFlutterwave } from "flutterwave-react-v3";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { absAdminId, adminUserId } from "./admin";
import axios from "axios";

const studentToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImF5b21pa3VvbGF0dW5qaUBnbWFpbC5jb20iLCJhdXRoSWQiOiI1MTE1NGIzNS01ZGQyLTQ5ZGEtYTJlZi1kZWRjODFmNDUwMTAiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTY5NTEyMDQxNywiZXhwIjoxNjk3NzEyNDE3fQ.RqINA8LYocJqNez4S7pH_7FJARZ04RhNIR9IpmllWH4";

// Create service
export const studentId = "51154b35-5dd2-49da-a2ef-dedc81f45010";

export default function App() {
  const socket: any = useRef(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const handleFileChange = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  const [isRendered, setIsRendered] = useState(false);
  const [onSuccess, setOnSuccess] = useState(false);
  console.log(onSuccess);

  const queryParams = new URLSearchParams(window.location.search);
  const parameter1 = queryParams.get("status");
  const parameter2 = queryParams.get("transaction_id");

  useEffect(() => {
    setIsRendered(true);
  }, []);

  const payment = async (amount: number, payment_type: string) => {
    await axios(
      `https://stanging-server.onrender.com/api/v1/request-service/${studentId}/?absAdminId=${absAdminId}&adminUserId=${adminUserId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${studentToken}`,
        },
        data: {
          ...{
            studentId: studentId,
            servicePortal: {
              serviceName: "School fees",
              serviceStatus: "TODO",
              comment: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
              serviceType: "Payment",
            },
            credentialDetails: {
              password: "Password",
              matNumber: "Mat Number",
            },
          },
          transactionDetails: {
            paymentId: parameter2,
            serviceTransactionAmount: Number(amount),
            transactionStatus: "DONE",
            serviceTransactionsMethod: payment_type,
            currency: "NAIRA",
          },
        },
      }
    );
  };

  const printing = async (amount: number) => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", "gn2sjg6g");

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dm15rdmsj/image/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("File uploaded:", response.data);
    if (response.data) {
      await axios(
        `https://stanging-server.onrender.com/api/v1/request-service/${studentId}/?absAdminId=${absAdminId}&adminUserId=${adminUserId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${studentToken}`,
          },
          data: {
            parameter1,
            ...{
              studentId: studentId,
              servicePortal: {
                serviceName: "School fees",
                serviceStatus: "TODO",
                comment: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
                serviceType: "Printing",
              },
            },
            transactionDetails: {
              paymentId: parameter2,
              serviceTransactionAmount: Number(amount),
              transactionStatus: "DONE",
              serviceTransactionsMethod: "DEBIT_CARD",
              currency: "NAIRA",
            },
          },
        }
      );
    }
  };

  useEffect(() => {
    if (isRendered) {
      socket.current = io("https://stanging-server.onrender.com");
      socket.current.on("updatedService", (data: any) => {
        console.log(data);
      });
      socket.current.on("connect", () => {
        console.log("Connected to the server");
        socket.current.emit("userLogin", studentId);
      });
      socket.current.on("notification", (data: unknown) => {
        console.log(data);
      });
      socket.current.on("userOnline", (id: string) => {
        if (id === studentId) {
          console.log(`Student ${id} came online.`);
        }
      });
      if (parameter1 === "successful") {
        fetch(
          `https://stanging-server.onrender.com/api/v1/verify-service-transaction/${studentId}?serviceTransactionId=${parameter2}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${studentToken}`,
            },
          }
        )
          .then((js) => js.json())
          .then(async (res) => {
            if (res.message === "Payment verified successfully") {
              await payment(res.data.amount, res.data.payment_type);
            }
            window.history.replaceState({}, document.title, window.location.pathname);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }, [parameter1, parameter2, isRendered]);


   useEffect(() => {
     (async () => {
       const res = await axios(
         `https://stanging-server.onrender.com/api/v1/request-service/${studentId}`,
         {
           method: "GET",
           headers: {
             Authorization: `Bearer ${studentToken}`,
           },
         }
       );
       console.log(res);
     })();
   }, []);

  const fwConfig = {
    public_key: "FLWPUBK_TEST-32f1f9f960f0fc1a267cbd381986bc10-X",
    tx_ref: `student-${Math.random() * 10}`,
    amount: 100,
    currency: "NGN",
    country: "NG",
    payment_options: "card",
    redirect_url: "http://localhost:5173/",
    customer: {
      email: "ayomikuolatunji@gmail.com",
      phone_number: "09088098622",
      name: "Olatunji Olubisi",
    },
    callback: function (data: unknown) {
      console.log(data);
    },
    onClose: function () {
      // close modal
    },
    customizations: {
      title: "Flutterwave Demo",
      description: "Flutterwave Payment Demo",
      logo: "https://cdn.iconscout.com/icon/premium/png-256-thumb/payment-2193968-1855546.png",
    },
    text: "Pay for the service",
  };

  const handleFlutterPayment = useFlutterwave(fwConfig);

  return (
    <div className="App">
      <h1>Hello Test user</h1>
      <button
        onClick={() => {
          handleFlutterPayment({
            callback: (response) => {
              console.log(response);
              if (response.status === "successful") {
                setOnSuccess(true);
              }
            },
            onClose: () => {
              setOnSuccess(false);
            },
          });
        }}
      >
        Payment with React hooks
      </button>
      <input onChange={handleFileChange} name="" className="" placeholder="" />
    </div>
  );
}
