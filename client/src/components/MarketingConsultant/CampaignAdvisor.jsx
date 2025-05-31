// client/src/components/MarketingConsultant/CampaignAdvisor.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, ArrowRight, DollarSign, Users, Calendar, Target } from 'lucide-react';
import { addAuthHeader } from '../../utils/devAuthUtil';
import './CampaignAdvisor.css';

const CampaignAdvisor = ({
  currentStep,
  campaignData,
  onRecommendationSelect,
  isVisible = true
}) => {
  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const guidanceRef = useRef(null);

  useEffect(() => {
    if (isVisible && currentStep) {
      fetchGuidance(currentStep);
    }
  }, [currentStep, campaignData, isVisible]);

  const fetchGuidance = async (step) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-consultant/campaign-guidance', {
        method: 'POST',
        headers: addAuthHeader({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          step,
          currentData: campaignData
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setGuidance(data.guidance);
      } else {
        throw new Error(data.message || 'Failed to get guidance');
      }

    } catch (error) {
      console.error('Campaign advisor error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationClick = (recommendation) => {
    if (onRecommendationSelect) {
      onRecommendationSelect(currentStep, recommendation);
    }
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 'name': return <Target size={18} />;
      case 'budget': return <DollarSign size={18} />;
      case 'audience': return <Users size={18} />;
      case 'duration': return <Calendar size={18} />;
      default: return <ArrowRight size={18} />;
    }
  };

  // Formatiere Markdown-Text für HTML-Rendering
  const formatMarkdown = (text) => {
    if (!text) return '';
    // Einfache Markdown-zu-HTML Konvertierung
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br/><br/>');
  };

  if (!isVisible) return null;

  return (
    <div className={`campaign-advisor ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="advisor-header" onClick={() => setExpanded(!expanded)}>
        <div className="advisor-title">
          <div className="advisor-avatar">M</div>
          <h3>Marcus</h3>
          <span className="advisor-subtitle">Kampagnen-Berater</span>
        </div>
        <button className="toggle-button">
          {expanded ? '⌄' : '⌃'}
        </button>
      </div>

      {expanded && (
        <div className="advisor-content" ref={guidanceRef}>
          <div className="step-indicator">
            <span className="step-icon">{getStepIcon(currentStep)}</span>
            <span className="step-name">
              {currentStep === 'name' && 'Kampagnenname'}
              {currentStep === 'budget' && 'Budget'}
              {currentStep === 'audience' && 'Zielgruppe'}
              {currentStep === 'duration' && 'Laufzeit'}
              {currentStep === 'creatives' && 'Anzeigen'}
            </span>
          </div>

          {loading ? (
            <div className="loading-state">
              <Loader className="spin" size={24} />
              <p>Marcus denkt nach...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>Entschuldigung, ich kann momentan nicht helfen.</p>
              <button onClick={() => fetchGuidance(currentStep)}>
                Erneut versuchen
              </button>
            </div>
          ) : guidance ? (
            <div className="guidance-content">
              {/* Hauptratschlag */}
              <div
                className="main-advice"
                dangerouslySetInnerHTML={{__html: formatMarkdown(guidance.mainAdvice)}}
              />

              {/* Empfehlungen */}
              {guidance.recommendations && guidance.recommendations.length > 0 && (
                <div className="recommendations">
                  <h4>Empfehlungen</h4>
                  <ul>
                    {guidance.recommendations.map((rec, i) => (
                      <li
                        key={i}
                        className="recommendation-item"
                        onClick={() => handleRecommendationClick(rec)}
                      >
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Geschätzte Ergebnisse */}
              {guidance.estimations && (
                <div className="estimations">
                  <h4>Geschätzte Ergebnisse</h4>
                  <p>{guidance.estimations.description}</p>

                  {guidance.estimations.metrics && (
                    <div className="metrics-grid">
                      {Object.entries(guidance.estimations.metrics).map(([key, value]) => (
                        <div className="metric-item" key={key}>
                          <span className="metric-label">{key}</span>
                          <span className="metric-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Optionen */}
              {guidance.options && guidance.options.length > 0 && (
                <div className="options">
                  <h4>Mögliche Optionen</h4>
                  {guidance.options.map((option, i) => (
                    <div className="option-card" key={i}>
                      <h5>{option.name}</h5>
                      <p>{option.description}</p>

                      <div className="option-details">
                        <div>
                          <h6>Vorteile</h6>
                          <ul>
                            {option.pros.map((pro, j) => (
                              <li key={j}>{pro}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h6>Nachteile</h6>
                          <ul>
                            {option.cons.map((con, j) => (
                              <li key={j}>{con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <p>Ich helfe dir bei diesem Schritt. Bitte warte kurz...</p>
            </div>
          )}

          {guidance && guidance.nextSteps && (
            <div className="next-steps">
              <h4>Nächste Schritte</h4>
              <ul>
                {guidance.nextSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignAdvisor;