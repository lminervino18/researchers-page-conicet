import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDownload, 
  faFilePdf, 
  faArrowLeft,
  faChevronLeft,
  faChevronRight,
  faMinus,
  faPlus,
  faRotateLeft,
  faRotateRight
} from '@fortawesome/free-solid-svg-icons';
import { getResearchById, viewPdf, downloadPdf } from '../../api/research';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './styles/ViewResearch.css';
import { Research } from '../../types';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ViewResearch: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [research, setResearch] = useState<Research | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<Blob | null>(null);

  useEffect(() => {
    const fetchResearch = async () => {
      if (!id) return;
      
      try {
        setLoadingData(true);
        const researchData = await getResearchById(Number(id));
        setResearch(researchData);
        setLoadingData(false);

        setLoadingPdf(true);
        const pdfData = await viewPdf(Number(id));
        const blob = new Blob([pdfData], { type: 'application/pdf' });
        setPdfData(blob);
        setError(null);
        setLoadingPdf(false);
      } catch (err) {
        console.error('Error fetching research:', err);
        setError('Failed to load research');
        setLoadingData(false);
        setLoadingPdf(false);
      }
    };

    fetchResearch();
  }, [id]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading document:', error);
    setError('Failed to load PDF');
  };

  const handleDownload = async () => {
    if (!id || !research) return;
    
    try {
      const pdfData = await downloadPdf(Number(id));
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', research.pdfName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF');
    }
  };

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || prev));
  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const rotateClockwise = () => setRotation(prev => (prev + 90) % 360);
  const rotateCounterClockwise = () => setRotation(prev => (prev - 90 + 360) % 360);

  return (
    <div className="pdf-viewer-container">
      <div className="pdf-header">
        <button 
          onClick={() => navigate('/')} 
          className="back-button"
          title="Back to home"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <div className="pdf-info">
          <div className="pdf-title">
            <FontAwesomeIcon icon={faFilePdf} className="pdf-icon" />
            {!loadingData && research?.researchAbstract && (
              <p className="abstract-text">{research.researchAbstract}</p>
            )}
          </div>
        </div>
        <button 
          onClick={handleDownload} 
          className="download-button"
          title="Download PDF"
          disabled={!pdfData || loadingPdf}
        >
          <FontAwesomeIcon icon={faDownload} /> Download
        </button>
      </div>

      <div className="pdf-toolbar">
        <div className="toolbar-section navigation-controls">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="toolbar-button"
            title="Previous page"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
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
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        <div className="toolbar-section zoom-controls">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="toolbar-button"
            title="Zoom out"
          >
            <FontAwesomeIcon icon={faMinus} />
          </button>
          <span className="zoom-info">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            disabled={scale >= 2.0}
            className="toolbar-button"
            title="Zoom in"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        <div className="toolbar-section rotation-controls">
          <button
            onClick={rotateCounterClockwise}
            className="toolbar-button"
            title="Rotate counterclockwise"
          >
            <FontAwesomeIcon icon={faRotateLeft} />
          </button>
          <button
            onClick={rotateClockwise}
            className="toolbar-button"
            title="Rotate clockwise"
          >
            <FontAwesomeIcon icon={faRotateRight} />
          </button>
        </div>
      </div>

      <div className="pdf-content">
        {loadingPdf ? (
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