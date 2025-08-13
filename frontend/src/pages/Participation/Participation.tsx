// src/pages/Participation/Participation.tsx
import { FC } from "react";
import MainLayout from "../../layouts/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFlask,
  faUsers,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import "./styles/Participation.css";
import { useTranslation } from "react-i18next";

const Participation: FC = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <div className="participation-container">
        <section className="participation-hero">
          <h1>{t("participation.title")}</h1>
          <p className="hero-subtitle">{t("participation.subtitle")}</p>
        </section>

        <section className="info-section">
          <div className="info-card">
            <FontAwesomeIcon icon={faFlask} className="info-icon" />
            <h2>{t("participation.current_studies")}</h2>
            <p>{t("participation.current_studies_text")}</p>
          </div>

          <div className="info-card">
            <FontAwesomeIcon icon={faUsers} className="info-icon" />
            <h2>{t("participation.who_can_participate")}</h2>
            <p>{t("participation.who_can_participate_text")}</p>
          </div>

          <div className="info-card">
            <FontAwesomeIcon icon={faClipboardCheck} className="info-icon" />
            <h2>{t("participation.how_to_get_involved")}</h2>
            <p>{t("participation.how_to_get_involved_text")}</p>
          </div>
        </section>

        <section className="coming-soon">
          <h2>{t("participation.coming_soon")}</h2>
          <p>{t("participation.coming_soon_text")}</p>
          <ul>
            <li>{t("participation.browse")}</li>
            <li>{t("participation.check")}</li>
            <li>{t("participation.sign_up")}</li>
            <li>{t("participation.track")}</li>
          </ul>
        </section>
      </div>
    </MainLayout>
  );
};

export default Participation;
