// src/components/common/Navbar.tsx
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import "./styles/Navbar.css";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "react-i18next";

const Navbar: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const sections = [
    { id: "lab", title: t("nav.lab"), path: "/lab" },
    { id: "members", title: t("nav.members"), path: "/members" },
    { id: "publications", title: t("nav.publications"), path: "/publications" },
    { id: "news", title: t("nav.news"), path: "/news" },
    {
      id: "participation",
      title: t("nav.participation"),
      path: "/participation",
    },
    { id: "inbox", title: t("nav.inbox"), path: "/inbox" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div
          className="navbar-brand"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <FontAwesomeIcon icon={faLightbulb} className="navbar-logo" />
          <h1>Analogy Research Group</h1>
        </div>
        <div className="navbar-links">
          {sections.map((section) => (
            <button
              key={section.id}
              className="navbar-link"
              onClick={() => navigate(section.path)}
            >
              {section.title}
            </button>
          ))}
        </div>
        <LanguageSelector />
      </div>
    </nav>
  );
};

export default Navbar;
