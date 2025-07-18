import React, { useState, useEffect } from 'react';
import { 
  getSupportCount, 
  checkUserSupport, 
  addSupport, 
  removeSupport 
} from '../../api/analogy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import './styles/SupportAnalogyButton.css';

interface SupportAnalogyButtonProps {
  analogyId: number;
  userEmail?: string;
  onLoginRequired?: () => void;
}

const SupportAnalogyButton: React.FC<SupportAnalogyButtonProps> = ({ 
  analogyId, 
  userEmail, 
  onLoginRequired 
}) => {
  const [supportCount, setSupportCount] = useState(0);
  const [userHasSupported, setUserHasSupported] = useState(false);

  const fetchSupportCount = async () => {
    try {
      const count = await getSupportCount(analogyId);
      setSupportCount(count);
    } catch (error) {
      console.error('Error fetching support count:', error);
    }
  };

  const checkCurrentUserSupport = async () => {
    if (!userEmail) {
      setUserHasSupported(false);
      return;
    }

    try {
      const hasSupported = await checkUserSupport(analogyId, userEmail);
      setUserHasSupported(hasSupported);
    } catch (error) {
      console.error('Error checking user support:', error);
    }
  };

  useEffect(() => {
    fetchSupportCount();
    checkCurrentUserSupport();
  }, [analogyId, userEmail]);

  const handleAddSupport = async () => {
    if (!userEmail) {
      onLoginRequired?.();
      return;
    }

    try {
      if (userHasSupported) {
        await removeSupport(analogyId, userEmail);
      } else {
        await addSupport(analogyId, userEmail);
      }
      
      await checkCurrentUserSupport();
      await fetchSupportCount();
    } catch (error) {
      console.error('Error toggling support:', error);
    }
  };

  return (
    <button
      className={`support-btn ${userHasSupported ? 'supported' : ''}`}
      onClick={handleAddSupport}
    >
      <FontAwesomeIcon icon={faThumbsUp} />
      <span className="support-count-inline">{supportCount}</span>
    </button>
  );
};

export default SupportAnalogyButton;