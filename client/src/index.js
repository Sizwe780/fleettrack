import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import './index.css';
//import 'leaflet/dist/leaflet.css';
//import 'leaflet.markercluster/dist/MarkerCluster.css';
//import 'leaflet.markercluster/dist/MarkerCluster.Default.css';


const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then(() => {
        console.log("✅ Service Worker registered for Firebase Messaging");
      })
      .catch((err) => {
        console.error("❌ Service Worker registration failed:", err);
      });
  });
}