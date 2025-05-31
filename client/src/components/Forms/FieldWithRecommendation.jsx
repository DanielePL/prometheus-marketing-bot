// client/src/components/Forms/FieldWithRecommendations.jsx

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import './FieldWithRecommendations.css';

const FieldWithRecommendations = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  recommendations = [],
  type = 'text',
  className = '',
  helpText,
  isLoading = false
}) => {
  const [showRecommendations, setShowRecommendations] = useState(true);

  return (
    <div className={`field-with-recommendations ${className}`}>
      {label && (
        <label htmlFor={id}>{label}</label>
      )}

      <div className="input-container">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="form-input"
        />
      </div>

      {recommendations && recommendations.length > 0 && (
        <div className="recommendations-container">
          <div
            className="recommendations-header"
            onClick={() => setShowRecommendations(!showRecommendations)}
          >
            <div className="recommendations-avatar">M</div>
            <span>Marcus empfiehlt:</span>
            <button type="button">
              {showRecommendations ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {showRecommendations && (
            <div className="recommendations-list">
              {recommendations.map((rec, index) => (
                <button
                  key={index}
                  type="button"
                  className="recommendation-button"
                  onClick={() => onChange(rec)}
                >
                  <Check size={14} />
                  <span>{rec}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {helpText && (
        <div className="help-text">{helpText}</div>
      )}
    </div>
  );
};

export default FieldWithRecommendations;