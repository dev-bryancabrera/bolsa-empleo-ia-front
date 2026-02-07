import { AppRouter } from "./routes/AppRouter";
import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

export const App = () => {
  return (
    <>
      <AppRouter />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};
