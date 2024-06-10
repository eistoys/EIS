import { Bounce, ToastContainer as ToastContainerBase } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const ToastContainer = () => (
  <ToastContainerBase
    stacked
    bodyClassName='text-black'
    position='bottom-center'
    transition={Bounce}
  />
);
