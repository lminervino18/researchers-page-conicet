// src/pages/Lab/Lab.tsx
import { FC, useState, useRef } from "react";
import MainLayout from "../../layouts/MainLayout";
import "./styles/Lab.css";
import { useTranslation } from "react-i18next";

const Lab: FC = () => {
  const [activeDescription, setActiveDescription] = useState<string | null>(
    null
  );
  const timerRef = useRef<number | undefined>(undefined);

  const { t } = useTranslation();

  const handleMouseEnter = (areaId: string) => {
    timerRef.current = window.setTimeout(() => {
      setActiveDescription(areaId);
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    setActiveDescription(null);
  };

  const researchAreas = [
    {
      id: "analogical",
      title: t("lab.areas.analogical.title"),
      shortDescription: t("lab.areas.analogical.short"),
      fullDescription: t("lab.areas.analogical.full"),
    },
    {
      id: "memory",
      title: t("lab.areas.memory.title"),
      shortDescription: t("lab.areas.memory.short"),
      fullDescription: t("lab.areas.memory.full"),
    },
    {
      id: "cognitive",
      title: t("lab.areas.cognitive.title"),
      shortDescription: t("lab.areas.cognitive.short"),
      fullDescription: t("lab.areas.cognitive.full"),
    },
  ];

  return (
    <MainLayout>
      <div className="lab-container">
        <section className="lab-hero">
          <h1>{t("lab.hero.title")}</h1>
          <p>{t("lab.hero.subtitle")}</p>
        </section>

        <section className="research-areas">
          <h2>{t("lab.areas.title")}</h2>
          <div className="areas-grid">
            {researchAreas.map((area) => (
              <div
                key={area.id}
                className="area-card"
                onMouseEnter={() => handleMouseEnter(area.id)}
                onMouseLeave={handleMouseLeave}
              >
                <h3>{area.title}</h3>
                <p>{area.shortDescription}</p>
                {activeDescription === area.id && (
                  <div className="area-description">
                    <p>{area.fullDescription}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="lab-methodology">
          <h2>{t("lab.methodology.title")}</h2>
          <p>{t("lab.methodology.text")}</p>
        </section>
      </div>
    </MainLayout>
  );
};

export default Lab;
