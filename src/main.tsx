import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { runHandoverPatientCleanup } from "./utils/handoverStorage";

// Clear pre-handover patient/test records once without touching services or clinic setup
runHandoverPatientCleanup();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
