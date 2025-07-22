import { FC, useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import AnalogiesList from '../../components/analogies/AnalogiesList';
import { Analogy, PaginatedResponse } from '../../types';
import { getAllAnalogies } from '../../api/analogy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './styles/Inbox.css';

const Inbox: FC = () => {
  const [analogies, setAnalogies] = useState<Analogy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadAnalogies = async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<Analogy[]> = await getAllAnalogies();
      
      // Flatten the array if needed
      const extractedAnalogies = Array.isArray(response.content)
        ? response.content.flat()
        : Array.isArray(response.data)
          ? response.data.flat()
          : [];
  
      setAnalogies(extractedAnalogies);
      setError(null);
    } catch (err) {
      setError('Error loading analogies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalogies();
  }, []);

  const filteredAnalogies = analogies.filter(analogy => 
    analogy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    analogy.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <MainLayout>
      <div className="inbox-container">
        <div className="inbox-header">
          <h1>Analogy Inbox</h1>
          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search analogies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading analogies...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <AnalogiesList analogies={filteredAnalogies} />
        )}
      </div>
    </MainLayout>
  );
};

export default Inbox;