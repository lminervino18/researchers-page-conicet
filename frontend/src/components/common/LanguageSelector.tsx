import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./styles/LanguageSelector.css";

const languages = [
  { code: "en", label: "En", flag: "🇺🇸" },
  { code: "es", label: "Es", flag: "🇦🇷" },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="lang-dropdown">
      <button className="lang-button" onClick={() => setOpen(!open)}>
        {languages.find((l) => l.code === i18n.language)?.flag}{" "}
        {languages.find((l) => l.code === i18n.language)?.label}
        <span className="arrow">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <ul className="lang-menu">
          {languages.map((lang) => (
            <li
              key={lang.code}
              className="lang-item"
              onClick={() => changeLanguage(lang.code)}
            >
              <span className="flag">{lang.flag}</span> {lang.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSelector;
