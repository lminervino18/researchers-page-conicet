import { useTranslation } from "react-i18next";
import "./styles/LanguageSelector.css";

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select onChange={handleChange} value={i18n.language}>
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
};

export default LanguageSelector;
