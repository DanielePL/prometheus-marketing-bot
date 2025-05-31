// Pfad: src/components/campaign/SmartKeywordSuggestions.jsx

import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, Target, Zap, Check, Plus } from 'lucide-react';

const SmartKeywordSuggestions = ({
  productName,
  category,
  price,
  currentKeywords,
  onAddKeywords,
  onUpdateKeywords
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [competitorKeywords, setCompetitorKeywords] = useState([]);
  const [trendingKeywords, setTrendingKeywords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedKeywords, setAddedKeywords] = useState(new Set());

  // Smart Keyword Generation basierend auf Produkt
  const generateSmartKeywords = (product, cat, pricePoint) => {
    const baseKeywords = [];
    const productLower = product.toLowerCase();

    // Basis Keywords
    baseKeywords.push(productLower);

    // Kategorie-spezifische Keywords
    if (cat === 'Gesundheit & Fitness') {
      if (productLower.includes('tracker')) {
        baseKeywords.push(
          `fitness ${productLower}`,
          `${productLower} test`,
          `beste ${productLower}`,
          `${productLower} kaufen`,
          `aktivitätstracker`,
          `smartwatch fitness`,
          `schritte zählen`,
          `herzfrequenz tracker`,
          `schlaf tracking`,
          `wasserdichte fitness tracker`
        );
      }
    }

    // Preis-basierte Keywords
    if (pricePoint <= 50) {
      baseKeywords.push(`günstige ${productLower}`, `${productLower} unter 50 euro`);
    } else if (pricePoint <= 100) {
      baseKeywords.push(`${productLower} mittelklasse`, `${productLower} preis leistung`);
    } else {
      baseKeywords.push(`premium ${productLower}`, `hochwertige ${productLower}`);
    }

    return baseKeywords.map((keyword, index) => ({
      id: `suggested_${index}`,
      text: keyword,
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
      searchVolume: Math.floor(Math.random() * 5000) + 1000,
      competition: ['Niedrig', 'Mittel', 'Hoch'][Math.floor(Math.random() * 3)],
      suggestedCPC: (Math.random() * 2 + 0.5).toFixed(2)
    }));
  };

  // Competitor Keywords (simuliert)
  const generateCompetitorKeywords = () => {
    return [
      { text: 'fitbit alternative', confidence: 95, source: 'Competitor Analysis' },
      { text: 'xiaomi band vergleich', confidence: 88, source: 'Market Gap' },
      { text: 'fitness tracker damen', confidence: 92, source: 'Trending' }
    ];
  };

  // Trending Keywords
  const generateTrendingKeywords = () => {
    return [
      { text: 'ki fitness coach', confidence: 89, trend: '+45%' },
      { text: 'stressüberwachung', confidence: 84, trend: '+32%' },
      { text: 'vo2 max tracker', confidence: 91, trend: '+67%' }
    ];
  };

  useEffect(() => {
    if (productName && category) {
      setIsLoading(true);

      // Simulate API delay
      setTimeout(() => {
        const smart = generateSmartKeywords(productName, category, price);
        const competitor = generateCompetitorKeywords();
        const trending = generateTrendingKeywords();

        setSuggestions(smart);
        setCompetitorKeywords(competitor);
        setTrendingKeywords(trending);
        setIsLoading(false);
      }, 1000);
    }
  }, [productName, category, price]);

  const handleAddKeyword = (keyword) => {
    onAddKeywords([keyword.text]);
    setAddedKeywords(prev => new Set([...prev, keyword.id]));
  };

  const handleAddAllSuggestions = () => {
    const allKeywords = suggestions.map(k => k.text);
    onAddKeywords(allKeywords);
    setAddedKeywords(prev => new Set([...prev, ...suggestions.map(k => k.id)]));
  };

  if (!productName) return null;

  return (
    <div className="bg-slate-800 rounded-lg p-6 mt-6 border border-slate-700">
      {/* Marcus Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">M</span>
        </div>
        <div>
          <h3 className="text-white font-semibold">Marcus' Keyword Intelligence</h3>
          <p className="text-slate-400 text-sm">KI-gestützte Keyword-Empfehlungen für maximale Performance</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 text-slate-400">
          <div className="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full"></div>
          <span>Marcus analysiert dein Produkt...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Smart Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-orange-500" />
                <h4 className="text-white font-medium">Smart Keyword Vorschläge</h4>
                <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs">
                  {suggestions.length} gefunden
                </span>
              </div>
              <button
                onClick={handleAddAllSuggestions}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Alle hinzufügen
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.slice(0, 8).map(keyword => (
                <div
                  key={keyword.id}
                  className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50 hover:border-orange-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{keyword.text}</span>
                    {addedKeywords.has(keyword.id) ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <button
                        onClick={() => handleAddKeyword(keyword)}
                        className="w-6 h-6 bg-orange-500 hover:bg-orange-600 rounded flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-400">
                      Suchvolumen: <span className="text-white">{keyword.searchVolume.toLocaleString()}</span>
                    </span>
                    <span className="text-slate-400">
                      CPC: <span className="text-white">€{keyword.suggestedCPC}</span>
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      keyword.confidence >= 90 ? 'bg-green-500/20 text-green-400' : 
                      keyword.confidence >= 80 ? 'bg-yellow-500/20 text-yellow-400' : 
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {keyword.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor Keywords */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-400" />
              <h4 className="text-white font-medium">Competitor Intelligence</h4>
            </div>
            <div className="space-y-2">
              {competitorKeywords.map((keyword, index) => (
                <div
                  key={index}
                  className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <span className="text-white font-medium">{keyword.text}</span>
                    <div className="text-xs text-blue-400 mt-1">{keyword.source}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400 text-sm">{keyword.confidence}% Match</span>
                    <button
                      onClick={() => handleAddKeyword(keyword)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Übernehmen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Keywords */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h4 className="text-white font-medium">Trending Keywords</h4>
            </div>
            <div className="space-y-2">
              {trendingKeywords.map((keyword, index) => (
                <div
                  key={index}
                  className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <span className="text-white font-medium">{keyword.text}</span>
                    <div className="text-xs text-green-400 mt-1">Trending {keyword.trend} diese Woche</div>
                  </div>
                  <button
                    onClick={() => handleAddKeyword(keyword)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Hinzufügen
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Marcus Tip */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <h5 className="text-orange-400 font-medium mb-1">Marcus' Pro-Tipp</h5>
                <p className="text-slate-300 text-sm">
                  Basierend auf deinem Produkt "tracker" und der Kategorie "Gesundheit & Fitness"
                  empfehle ich eine Mischung aus 60% Produkt-Keywords, 25% Konkurrenz-Keywords und
                  15% Trending-Keywords für optimale Performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartKeywordSuggestions;