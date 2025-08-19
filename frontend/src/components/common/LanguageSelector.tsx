import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./styles/LanguageSelector.css";

const languages = [
  { code: "en", label: "En", flag: "🇺🇸" },
  { code: "es", label: "Es", flag: "🇦🇷" },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const current = languages.find((l) => l.code === i18n.language) ?? languages[0];

  return (
    <div className="lang-dropdown" ref={ref}>
      <button className="lang-button" onClick={() => setOpen((v) => !v)}>
        {current.flag} {current.label}
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
