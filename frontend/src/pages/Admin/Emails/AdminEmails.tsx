import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import { 
  getAllRegisteredEmails,
  removeAllEmails,
  registerMultipleEmails,
  removeEmail
} from '../../../api/emailVerification'
import './styles/AdminEmails.css';

const AdminEmails: React.FC = () => {
  const navigate = useNavigate();
  
  // State for managing emails
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmails, setNewEmails] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for email search
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const registeredEmails: string[] = await getAllRegisteredEmails();
      
      // Opción 1: Usar spread operator (recomendado)
      setEmails([...registeredEmails].reverse());
  
      setLoading(false);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Failed to load emails');
      setLoading(false);
    }
  };

  // Fetch emails on component mount
  useEffect(() => {
    fetchEmails();
  }, []);

  // Filtered emails based on search term
  const filteredEmails = useMemo(() => {
    return emails.filter(email => 
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [emails, searchTerm]);

  // Handle adding multiple emails
  const handleAddEmails = async () => {
    // Split and validate emails
    const emailList = newEmails
      .split('\n')
      .map(email => email.trim())
      .filter(email => email !== '');

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const invalidEmails = emailList.filter(email => !emailRegex.test(email));

    // Show error for invalid emails
    if (invalidEmails.length > 0) {
      setError(`Invalid email format for: ${invalidEmails.join(', ')}`);
      return;
    }

    try {
      // Register multiple emails
      const registeredEmails = await registerMultipleEmails(emailList);
      
      // Update state with newly registered emails
      const newEmailAddresses = registeredEmails.map(reg => reg.email);
      setEmails(prev => {
        // Add new emails to the beginning of the list
        return [...newEmailAddresses, ...prev];
      });
      
      // Clear textarea and reset error
      setNewEmails('');
      setError(null);

    } catch (error) {
      // Handle unexpected errors
      console.error('Unexpected error adding emails:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null 
          ? JSON.stringify(error)
          : 'An unexpected error occurred';

      setError(`Failed to add emails: ${errorMessage}`);
    }
  };

  // Handle deleting a single email
  const handleDelete = async (email: string) => {
    try {
      await removeEmail(email);
      setEmails(prev => prev.filter(e => e !== email));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting email:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete email');
    }
  };

  // Handle deleting all emails
  const handleDeleteAllEmails = async () => {
    try {
      await removeAllEmails();
      setEmails([]); // Clear email list
      setDeleteAllConfirm(false);
      setSearchTerm(''); // Reset search term
      setError(null);
    } catch (error) {
      console.error('Error deleting all emails:', error);
      setError('Failed to delete all emails');
      setDeleteAllConfirm(false);
    }
  };

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <button 
          onClick={() => navigate('/admin/dashboard')} 
          className="back-button"
        >
          Back to Dashboard
        </button>
        <h1>Email Management</h1>
      </header>
      
      <main className="admin-page-content">
        <div className="email-management-section">
          {/* Email Input Section */}
          <div className="email-input-container">
            <textarea
              value={newEmails}
              onChange={(e) => setNewEmails(e.target.value)}
              placeholder="Enter emails (one per line)
              Paste multiple emails here
              Each email on a new line
              Example: 
              john.doe@example.com
              jane.smith@university.edu
              research.team@institution.org"
              rows={8}
              className="email-textarea"
            />
            <div className="email-buttons-container">
              <button 
                onClick={handleAddEmails} 
                className="add-button"
                disabled={!newEmails.trim()}
              >
                Add Emails
              </button>
              {emails.length > 0 && (
                <button 
                  onClick={() => setDeleteAllConfirm(true)}
                  className="delete-all-button"
                >
                  <FontAwesomeIcon icon={faTrashAlt} /> Delete All Emails
                </button>
              )}
            </div>
          </div>

          {/* Delete All Confirmation */}
          {deleteAllConfirm && (
            <div className="delete-all-confirm">
              <p>Are you sure you want to delete ALL emails?</p>
              <div className="delete-all-confirm-actions">
                <button 
                  onClick={handleDeleteAllEmails}
                  className="confirm-button"
                >
                  Yes, Delete All
                </button>
                <button 
                  onClick={() => setDeleteAllConfirm(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Email Search Section */}
          <div className="email-search-container">
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search emails"
              className="email-search-input"
            />
          </div>

          {/* Error Display */}
          {error && <div className="error-message">{error}</div>}
          
          {/* Email List */}
          {loading ? (
            <div className="loading">Loading emails...</div>
          ) : (
            <div className="admin-emails-list">
              {filteredEmails.length === 0 ? (
                <div className="no-emails">
                  {emails.length === 0 
                    ? 'No emails registered' 
                    : 'No matching emails found'}
                </div>
              ) : (
                filteredEmails.map((email) => (
                  <div key={email} className="admin-email-card">
                    <div className="email-info">
                      <p className="email-address">{email}</p>
                    </div>
                    <div className="email-actions">
                      {deleteConfirm === email ? (
                        <div className="delete-confirm">
                          <p>Are you sure?</p>
                          <button
                            onClick={() => handleDelete(email)}
                            className="confirm-button"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="cancel-button"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(email)}
                          className="action-button delete"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminEmails;