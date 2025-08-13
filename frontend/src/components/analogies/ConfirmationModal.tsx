import React from "react";
import "./styles/ConfirmationModal.css";
import { useTranslation } from "react-i18next";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onConfirm} className="confirm-btn">
            {t("confirm")}
          </button>
          <button onClick={onClose} className="cancel-btn">
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
