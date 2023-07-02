import { useFlutterwave } from "flutterwave-react-v3";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

// Create service
const data = {
  studentId: "736bfb79-0098-4f37-a4a9-fcccab610d52",
  servicePortal: {
    serviceName: "New service",
    serviceStatus: "TODO",
  },
  credentialDetails: {
    password: "Password",
    jambNumber: "JAMB Number",
    matNumber: "Mat Number",
  },
};

export default function App() {
  const socket: any = useRef(null);
  const [isRendered, setIsRendered] = useState(false);
  const [onSuccess, setOnSuccess] = useState(false);
  console.log(onSuccess);

  const queryParams = new URLSearchParams(window.location.search);
  const parameter1 = queryParams.get("status");
  const parameter2 = queryParams.get("transaction_id");

  useEffect(() => {
    setIsRendered(true);
  }, []);

  useEffect(() => {
    if (isRendered) {
      socket.current = io("http://localhost:8080", {
        query: {
          absAdminId: "6e009c0c-c859-4794-81d0-51be0a7cdfd0",
          adminUserId: "10d0e172-5ec2-4eaa-8b09-7c3387b33134",
          studentId: "736bfb79-0098-4f37-a4a9-fcccab610d52",
          connectionType: "parent",
        },
      });
      socket.current.on("updatedService", (data: any) => {
        console.log(data);
      });
      socket.current.on("connect", () => {
        console.log("Connected to the server");
        socket.current.emit(
          "userLogin",
          "736bfb79-0098-4f37-a4a9-fcccab610d52"
        );
      });
      socket.current.on("newService", (data: unknown) => {
        console.log(data);
      });
      socket.current.emit("fetchServices", {
        userFetchType: "student",
        userFetchId: "736bfb79-0098-4f37-a4a9-fcccab610d52",
      });

      socket.current.on("serviceHistory", (data: any) => {
        console.log(data);
      });
      if (parameter1 === "successful") {
        fetch(
          `http://localhost:8080/api/v1/verify_service_transaction?serviceTransactionId=${parameter2}`,
          {
            method: "GET",
          }
        )
          .then((js) => js.json())
          .then((res) => {
            console.log(res);
            if (res.message === "Payment verified successfully") {
              socket.current.emit("CreateService", {
                parameter1,
                ...data,
                transactionDetails: {
                  paymentId: parameter2,
                  serviceTransactionAmount: res.data.amount.toString(),
                  transactionStatus: "DONE",
                  serviceTransactionsMethod: "DEBIT_CARD",
                  currency: "NAIRA",
                },
              });
            }
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }, [parameter1, parameter2, isRendered]);

  const fwConfig = {
    public_key: "FLWPUBK_TEST-36a812686cf2f832980130e983ba1662-X",
    tx_ref: `student-${Math.random() * 10}`,
    amount: 20000,
    currency: "NGN",
    country: "NG",
    payment_options: "card",
    redirect_url: "http://localhost:5173/",
    customer: {
      email: "demomail@gmail.com",
      phone_number: "08088098622",
      name: "Idris Olubisi",
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
    </div>
  );
}
