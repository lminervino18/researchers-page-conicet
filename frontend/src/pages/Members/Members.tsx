import { FC } from "react";
import MainLayout from "../../layouts/MainLayout";
import MemberGrid from "../../components/members/MemberGrid";
import { authors } from "../../api/authors";
import "./styles/Members.css";
import { useTranslation } from "react-i18next";

const Members: FC = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <div className="members-container">
        <section className="members-hero">
          <h1>{t("members.hero.title")}</h1>
          <p>{t("members.hero.subtitle")}</p>
        </section>

        <section className="members-grid-section">
          <MemberGrid members={authors} />
        </section>
      </div>
    </MainLayout>
  );
};

export default Members;
