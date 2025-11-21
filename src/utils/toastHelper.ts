type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastLike {
  showTost: (message: string, type?: ToastType) => void;
}

const toastHelper: ToastLike = {
  showTost(message: string, type: ToastType = 'info') {
    if (typeof window !== 'undefined') {
      const toastApi =
        (window as any).toastHelper ||
        (window as any).toast ||
        (window as any).toastr;

      const toastMethod =
        toastApi?.[type] ||
        toastApi?.show ||
        (typeof toastApi === 'function' ? toastApi : undefined);

      if (typeof toastMethod === 'function') {
        toastMethod(message);
        return;
      }
    }

    const fallback =
      type === 'error'
        ? console.error
        : type === 'warning'
        ? console.warn
        : console.log;
    fallback(`[${type.toUpperCase()}] ${message}`);
  },
};

export default toastHelper;

