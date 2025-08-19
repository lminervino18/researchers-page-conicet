// src/layouts/MainLayout.tsx
import { FC, ReactNode } from "react";
import Navbar from "../components/common/Navbar";
import "./styles/MainLayout.css";
import { useTranslation } from "react-i18next";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  return (
    <div className="layout-container">
      <Navbar />
      <main className="main-content">{children}</main>
      <footer className="footer">
        <div className="footer-content">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            {`Analogy Research Group. ${t("main_layout.rights")}`}
          </p>
          <p>{t("main_layout.uba_psychology")}</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
