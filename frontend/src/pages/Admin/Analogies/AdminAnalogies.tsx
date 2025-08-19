import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

import { Analogy } from "../../../types";
import { getAllAnalogies, deleteAnalogy } from "../../../api/analogy";
import { deleteFileByUrl } from "../../../api/firebaseFileManager";
import "./styles/AdminAnalogies.css";

const AdminAnalogys: React.FC = () => {
  const navigate = useNavigate();

  const [analogies, setAnalogies] = useState<Analogy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAnalogies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllAnalogies(0, 100);

      const extractAnalogies = (data: unknown): Analogy[] => {
        if (Array.isArray(data)) {
          return data.every(
            (item) =>
              item &&
              typeof item === "object" &&
              "id" in item &&
              "title" in item
          )
            ? (data as Analogy[])
            : [];
        }
        if (data && typeof data === "object") {
          if ("content" in data) {
            const content = (data as { content?: unknown }).content;
            if (
              Array.isArray(content) &&
              content.every(
                (item) =>
                  item &&
                  typeof item === "object" &&
                  "id" in item &&
                  "title" in item
              )
            ) {
              return content as Analogy[];
            }
          }
          if ("data" in data) {
            const innerData = (data as { data?: unknown }).data;
            if (
              Array.isArray(innerData) &&
              innerData.every(
                (item) =>
                  item &&
                  typeof item === "object" &&
                  "id" in item &&
                  "title" in item
              )
            ) {
              return innerData as Analogy[];
            }
          }
        }
        return [];
      };

      const extractedAnalogies = extractAnalogies(response);
      setAnalogies(extractedAnalogies);
    } catch (error) {
      console.error("Error loading analogies:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load analogies. Please try again.";
      setError(errorMessage);
      setAnalogies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalogies();
  }, [loadAnalogies]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      // Grab the target analogy to know which media to delete
      const target = analogies.find((a) => a.id === id);
      const mediaUrls: string[] =
        (target?.mediaLinks ?? []).map((m: any) => m.url).filter(Boolean);

      // Delete from backend first
      await deleteAnalogy(id);

      // Optimistically update UI
      setAnalogies((prev) => prev.filter((analogy) => analogy.id !== id));
      setDeleteConfirm(null);

      // Delete files from Firebase Storage (ignore individual failures)
      if (mediaUrls.length > 0) {
        await Promise.allSettled(mediaUrls.map((u) => deleteFileByUrl(u)));
      }
    } catch (error) {
      console.error("Error deleting analogy:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete analogy. Please try again.";
      setError(errorMessage);
    }
  }, [analogies]);

  const renderAnalogiesList = () => {
    if (loading) return <div className="loading">Loading analogies...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (analogies.length === 0)
      return <div className="no-analogies">No analogies available</div>;

    return analogies.map((analogy) => (
      <AnalogiesListItem
        key={analogy.id}
        analogy={analogy}
        deleteConfirm={deleteConfirm}
        onEditClick={() => navigate(`/admin/analogies/edit/${analogy.id}`)}
        onDeleteConfirmToggle={() =>
          setDeleteConfirm(deleteConfirm === analogy.id ? null : analogy.id)
        }
        onDeleteConfirm={() => handleDelete(analogy.id)}
      />
    ));
  };

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="back-button"
        >
          Back to Dashboard
        </button>
        <h1>Analogies Management</h1>
        <button
          onClick={() => navigate("/admin/analogies/add")}
          className="add-button"
        >
          Add New Analogy
        </button>
      </header>

      <main className="admin-page-content">
        <div className="admin-analogies-list">{renderAnalogiesList()}</div>
      </main>
    </div>
  );
};

interface AnalogiesListItemProps {
  analogy: Analogy;
  deleteConfirm: number | null;
  onEditClick: () => void;
  onDeleteConfirmToggle: () => void;
  onDeleteConfirm: () => void;
}

const AnalogiesListItem: React.FC<AnalogiesListItemProps> = React.memo(
  ({
    analogy,
    deleteConfirm,
    onEditClick,
    onDeleteConfirmToggle,
    onDeleteConfirm,
  }) => (
    <div className="admin-analogy-card">
      <div className="analogy-info">
        <p className="analogy-admin-title">
          {analogy.title.length > 100 ? analogy.title.slice(0, 100) + "..." : analogy.title}
        </p>
        <p className="analogy-authors">Authors: {analogy.authors.join(", ")}</p>
        {analogy.links.length > 0 && (
          <p className="analogy-links">Links: {analogy.links.length}</p>
        )}
      </div>
      <div className="analogy-actions">
        <button onClick={onEditClick} className="action-button" title="Edit">
          <FontAwesomeIcon icon={faEdit} />
        </button>
        {deleteConfirm === analogy.id ? (
          <div className="delete-confirm">
            <p>Are you sure?</p>
            <button onClick={onDeleteConfirm} className="confirm-button">
              Yes
            </button>
            <button onClick={onDeleteConfirmToggle} className="cancel-button">
              No
            </button>
          </div>
        ) : (
          <button
            onClick={onDeleteConfirmToggle}
            className="action-button delete"
            title="Delete"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        )}
      </div>
    </div>
  )
);

export default AdminAnalogys;
