// client/src/components/MarketingConsultant/InlineRecommendation.jsx

import React, { useState } from 'react';
import { CheckCircle, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import './InlineRecommendation.css';

const InlineRecommendation = ({
  recommendations,
  onSelect,
  title = "Marcus empfiehlt:",
  expanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="inline-recommendation">
      <div
        className="recommendation-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="recommendation-avatar">M</div>
        <h4>{title}</h4>
        <button className="toggle-button">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div className="recommendation-options">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="recommendation-item"
              onClick={() => onSelect && onSelect(rec)}
            >
              <div className="recommendation-content">
                <CheckCircle size={16} className="check-icon" />
                <span>{rec}</span>
              </div>
              <Plus size={16} className="apply-icon" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InlineRecommendation;