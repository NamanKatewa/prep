import "./Modal.scss";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      {isOpen && (
        <div className="overlay" onClick={onClose}>
          <div className="content" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={onClose}>
              ×
            </button>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
