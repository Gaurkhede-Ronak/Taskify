import Router from "./router/Router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <>
      <style>{`
        /* Position all toast notifications directly below the header */
        .Toastify__toast-container {
          top: 76px !important;
          z-index: 99999 !important;
        }

        @media (max-width: 767.98px) {
          .Toastify__toast-container {
            top: 70px !important;
            padding: 0 14px !important;
            width: 100% !important;
            max-width: 440px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
          }
        }
      `}</style>
      <Router />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

export default App;