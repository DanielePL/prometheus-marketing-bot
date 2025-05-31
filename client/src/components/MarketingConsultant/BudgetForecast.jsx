// client/src/components/MarketingConsultant/BudgetForecast.jsx

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader } from 'lucide-react';
import { addAuthHeader } from '../../utils/devAuthUtil';
import './BudgetForecast.css';

const BudgetForecast = ({ campaignData, onBudgetChange }) => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showingMetric, setShowingMetric] = useState('conversions');

  useEffect(() => {
    if (campaignData && campaignData.budget?.daily) {
      fetchForecast();
    }
  }, [campaignData]);

  const fetchForecast = async () => {
    if (!campaignData) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-consultant/forecast', {
        method: 'POST',
        headers: addAuthHeader({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          campaignData
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setForecast(data);
      } else {
        throw new Error(data.message || 'Failed to get forecast');
      }

    } catch (error) {
      console.error('Budget forecast error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Anpassen des Charts für verschiedene Metriken
  const getChartData = () => {
    if (!forecast?.budgetScenarios) return [];

    return forecast.budgetScenarios.map(scenario => ({
      name: `€${scenario.budget}`,
      [showingMetric]: scenario.daily[showingMetric]
    }));
  };

  if (loading) {
    return (
      <div className="budget-forecast loading">
        <Loader className="spin" size={24} />
        <p>Prognose wird berechnet...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="budget-forecast error">
        <p>Fehler bei der Prognoseberechnung</p>
        <button onClick={fetchForecast}>Erneut versuchen</button>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="budget-forecast empty">
        <p>Prognose wird generiert, sobald ein Budget festgelegt ist</p>
      </div>
    );
  }

  return (
    <div className="budget-forecast">
      <h3>Prognose für dein Kampagnenbudget</h3>

      <div className="forecast-summary">
        <div className="forecast-card">
          <h4>Tägliche Reichweite</h4>
          <div className="metric-value">
            {forecast.estimatedReach.daily.toLocaleString()}
          </div>
          <div className="metric-label">Personen/Tag</div>
        </div>

        <div className="forecast-card">
          <h4>Monatliche Conversions</h4>
          <div className="metric-value">
            {forecast.monthlyResults.conversions.toFixed(1)}
          </div>
          <div className="metric-label">{campaignData.objective === 'SALES' ? 'Verkäufe' : 'Conversions'}/Monat</div>
        </div>

        <div className="forecast-card">
          <h4>Erwarteter ROAS</h4>
          <div className="metric-value">
            {forecast.dailyResults.roas.toFixed(2)}x
          </div>
          <div className="metric-label">Return on Ad Spend</div>
        </div>

        <div className="forecast-card">
          <h4>Monatlicher Umsatz</h4>
          <div className="metric-value">
            €{forecast.monthlyResults.revenue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
          </div>
          <div className="metric-label">Geschätzt</div>
        </div>
      </div>

      <div className="budget-scenarios">
        <h4>Auswirkungen verschiedener Budgets</h4>

        <div className="metric-selector">
          <button
            className={showingMetric === 'impressions' ? 'active' : ''}
            onClick={() => setShowingMetric('impressions')}
          >
            Reichweite
          </button>
          <button
            className={showingMetric === 'clicks' ? 'active' : ''}
            onClick={() => setShowingMetric('clicks')}
          >
            Klicks
          </button>
          <button
            className={showingMetric === 'conversions' ? 'active' : ''}
            onClick={() => setShowingMetric('conversions')}
          >
            Conversions
          </button>
          <button
            className={showingMetric === 'revenue' ? 'active' : ''}
            onClick={() => setShowingMetric('revenue')}
          >
            Umsatz
          </button>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  `${value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}`,
                  showingMetric === 'revenue' ? 'EUR' : showingMetric
                ]}
              />
              <Bar
                dataKey={showingMetric}
                fill="#4f46e5"
                animationDuration={500}
                name={
                  showingMetric === 'impressions' ? 'Reichweite' :
                  showingMetric === 'clicks' ? 'Klicks' :
                  showingMetric === 'conversions' ? 'Conversions' : 'Umsatz'
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="budget-recommendations">
          <h4>Empfohlenes Budget</h4>
          <div className="budget-recommendation-buttons">
            <button
              className="minimum-budget"
              onClick={() => onBudgetChange(forecast.recommendedBudget.minimum)}
            >
              Minimum: €{forecast.recommendedBudget.minimum}/Tag
            </button>
            <button
              className="optimal-budget"
              onClick={() => onBudgetChange(forecast.recommendedBudget.optimal)}
            >
              Optimal: €{forecast.recommendedBudget.optimal}/Tag
            </button>
            <button
              className="aggressive-budget"
              onClick={() => onBudgetChange(forecast.recommendedBudget.aggressive)}
            >
              Aggressiv: €{forecast.recommendedBudget.aggressive}/Tag
            </button>
          </div>
        </div>
      </div>

      <div className="forecast-notes">
        <p>
          <strong>Hinweis:</strong> Diese Prognose basiert auf Branchendurchschnittswerten
          und kann je nach Produkt, Zielgruppe und Kreativleistung variieren.
          Tatsächliche Ergebnisse können abweichen.
        </p>

        <p>
          <strong>Empfehlung:</strong> {forecast.recommendedDuration.explanation}
        </p>
      </div>
    </div>
  );
};

export default BudgetForecast;