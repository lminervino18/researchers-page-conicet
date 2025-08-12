import React from "react";
import "./styles/LogoutConfirmModal.css";
import { useTranslation } from "react-i18next";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const { t } = useTranslation();

  return (
    <div className="logout-modal-overlay" onClick={onCancel}>
      <div
        className="logout-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{t("logout.confirmation.title")}</h2>
        <p>{t("logout.confirmation.asking")}</p>
        <div className="logout-modal-buttons">
          <button className="logout-confirm" onClick={onConfirm}>
            {t("logout.confirmation.confirm")}
          </button>
          <button className="logout-cancel" onClick={onCancel}>
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
