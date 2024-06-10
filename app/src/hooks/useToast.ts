import { TypeOptions, toast } from 'react-toastify';

export const useToast = () => {
  const showToast = (message: string, type: TypeOptions) => {
    toast(message, { type });
  };

  return { showToast };
};
