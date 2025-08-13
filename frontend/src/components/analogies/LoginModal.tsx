import React, { useState, useEffect } from "react";
import {
  checkEmailRegistration,
  updateUserName,
} from "../../api/emailVerification";
import "./styles/LoginModal.css";
import { Trans, useTranslation } from "react-i18next";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, email: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [usernameRequired, setUsernameRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [finalUsername, setFinalUsername] = useState("");

  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen && !showSuccess) {
      setUsername("");
      setEmail("");
      setError("");
      setEmailExists(null);
      setUsernameRequired(false);
      setLoading(false);
      setFinalUsername("");
    }
  }, [isOpen, showSuccess]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailExists(null);

    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return;
    }

    setLoading(true);

    try {
      const userData = await checkEmailRegistration(email);

      if (!userData.registered) {
        setError(t("login.email_unauthorized"));
        setEmailExists(false);
        setLoading(false);
        return;
      }

      setEmailExists(true);

      if (!userData.username) {
        setUsernameRequired(true);
        setLoading(false);
        return;
      }

      onLogin(userData.username, email);
      setFinalUsername(userData.username);
      setShowSuccess(true);
      setLoading(false);
      setShowSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(t("login.verification_error"));
      setLoading(false);
    }
  };

  const handleSetUsername = async () => {
    if (!username.trim()) {
      setError(t("login.username_error"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateUserName(email, username.trim());

      onLogin(username.trim(), email);
      setFinalUsername(username.trim());
      setShowSuccess(true);
      setLoading(false);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(t("login.saving_error"));
      setLoading(false);
    }
  };

  if (!isOpen && !showSuccess) return null;

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <div
          className={`login-modal-content ${
            showSuccess ? "success-message" : ""
          }`}
        >
          {showSuccess ? (
            <>
              <h2>{t("login.confirmation")}</h2>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <Trans
                  i18nKey="login.welcome"
                  values={{ username: finalUsername || "User" }}
                  components={[<strong />]}
                />
              </p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowSuccess(false);
                    onClose();
                  }}
                >
                  Continue
                </button>
              </div>
            </>
          ) : usernameRequired ? (
            <>
              <p className="verification-hint">
                <Trans
                  i18nKey="login.verification_hint.set_username"
                  components={[<br />, <strong />]}
                />
              </p>
              <div className="form-group">
                <label htmlFor="username">{t("login.label_username")}</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("login.choose_username")}
                  required
                  disabled={loading}
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSetUsername}
                  disabled={loading}
                >
                  {t("login.save_username")}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>{t("login.verify_access")}</h2>
              <p className="verification-hint">
                {t("login.verification_hint.check_email")}
              </p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  {emailExists === false && (
                    <p className="error-message">
                      {t("login.email_unauthorized")}
                    </p>
                  )}
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("login.enter_email")}
                    required
                    disabled={loading}
                  />
                </div>
                {error && emailExists !== false && (
                  <p className="error-message">{error}</p>
                )}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {t("verify")}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
