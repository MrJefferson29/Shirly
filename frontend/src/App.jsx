import React from "react";
import "react-toastify/dist/ReactToastify.css";
import { Index as Route } from "./routes/index";
import { Footer } from "./components";
import "./custom.styles.css";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <ToastContainer hideProgressBar theme="dark" autoClose={2000} />
      <div className="flex-grow w-full">
        <Route />
      </div>
      <Footer />
    </div>
  );
};

export default App;
