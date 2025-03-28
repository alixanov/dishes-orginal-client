import { useEffect } from "react";

export const CloseModal = (props) => {
  const { modalRef = null, onClose = null } = props;

  useEffect(() => {
    // Close modal by click outside the modal
    const heandlerMouse = (e) => {
      if (!modalRef?.current?.contains(e.target)) return onClose();
    };

    // Close modal by click on the ESC button
    const heandlerKey = (e) => {
      if (e.keyCode === 27) return onClose();
    };

    // Add event listeners
    document.addEventListener("mousedown", heandlerMouse);
    document.addEventListener("keydown", heandlerKey);

    // Remove event listeners
    return () => {
      document.removeEventListener("mousedown", heandlerMouse);
      document.removeEventListener("keydown", heandlerKey);
    };
  });
  return null;
};
