import React, { memo, useRef } from "react";
import "./modal.css";
import { IoClose } from "react-icons/io5";
import { CloseModal } from "../../utils/closemodal";

export const Modal = memo(({ title, children, onClose }) => {
  const modalRef = useRef();

  CloseModal(modalRef, onClose);
  return (
    <div className="modal">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h1>{title}</h1>
          <button className="close">
            <IoClose />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
});
