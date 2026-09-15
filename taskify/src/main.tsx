import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./redux/store";  
import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";

const isInjectedPerformanceError = (message: string) =>
  message.includes("reportAllChanges") && message.includes("startTime");

window.addEventListener("error", (event) => {
  if (isInjectedPerformanceError(event.message)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason as { message?: unknown } | undefined;
  const message = typeof reason?.message === "string" ? reason.message : String(event.reason ?? "");
  if (isInjectedPerformanceError(message)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <Provider store={store}>     
      <App />
    </Provider>
  </React.StrictMode>
);