// src/pages/research/ViewResearch.tsx
import { FC, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import axios from 'axios';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './styles/ViewResearch.css';

// Configurar el worker usando CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

const ViewResearch: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<Blob | null>(null);

  useEffect(() => {
    const fetchPdf = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/api/researches/view/${id}`, {
          responseType: 'blob',
          headers: {
            'Accept': 'application/pdf'
          }
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        setPdfData(blob);
        setError(null);
      } catch (err) {
        console.error('Error fetching PDF:', err);
        setError('Failed to load PDF');
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();
  }, [id]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading document:', error);
    setError('Failed to load PDF');
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || prev));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const rotateClockwise = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const rotateCounterClockwise = () => {
    setRotation(prev => (prev - 90 + 360) % 360);
  };

  return (
    <div className="pdf-viewer-container">
      <div className="pdf-toolbar">
        <div className="toolbar-section navigation-controls">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="toolbar-button"
            title="Previous page"
          >
            ←
          </button>
          <span className="page-info">
            Page {pageNumber} of {numPages || '?'}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 0)}
            className="toolbar-button"
            title="Next page"
          >
            →
          </button>
        </div>

        <div className="toolbar-section zoom-controls">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="toolbar-button"
            title="Zoom out"
          >
            -
          </button>
          <span className="zoom-info">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            disabled={scale >= 2.0}
            className="toolbar-button"
            title="Zoom in"
          >
            +
          </button>
        </div>

        <div className="toolbar-section rotation-controls">
          <button
            onClick={rotateCounterClockwise}
            className="toolbar-button"
            title="Rotate counterclockwise"
          >
            ↺
          </button>
          <button
            onClick={rotateClockwise}
            className="toolbar-button"
            title="Rotate clockwise"
          >
            ↻
          </button>
        </div>
      </div>

      <div className="pdf-content">
        {loading ? (
          <div className="pdf-loading">
            <div className="loading-spinner"></div>
            <p>Loading PDF...</p>
          </div>
        ) : error ? (
          <div className="pdf-error">
            <p>{error}</p>
            <button 
              className="retry-button" 
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : pdfData && (
          <Document
            file={pdfData}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="pdf-loading">
                <div className="loading-spinner"></div>
                <p>Loading PDF...</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              loading={
                <div className="page-loading">
                  <div className="loading-spinner"></div>
                </div>
              }
            />
          </Document>
        )}
      </div>
    </div>
  );
};

export default ViewResearch;