import { Bounce, ToastContainer as ToastContainerBase } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ToastContainer = () => (
  <ToastContainerBase
    stacked
    position="top-right"
    theme="colored"
    transition={Bounce}
  />
);
