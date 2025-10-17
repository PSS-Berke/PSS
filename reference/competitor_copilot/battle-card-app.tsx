import React, { useState, useEffect } from 'react';
import {
  Target,
  TrendingUp,
  Users,
  AlertCircle,
  MessageSquare,
  Zap,
  ArrowRight,
  CheckSquare,
  Plus,
  Settings,
  Repeat,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';

// Xano Configuration
const XANO_BASE_URL = 'https://xnpm-iauo-ef2d.n7e.xano.io/api:qHvoMa2z';
const USER_ID = 1; // TODO: Replace with actual authenticated user ID

export default function BattleCardApp() {
  const [battleCards, setBattleCards] = useState([]);
  const [activeBattleCardId, setActiveBattleCardId] = useState(null);
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  const activeBattleCard = battleCards.find((card) => card.id === activeBattleCardId);

  // Load battle cards on mount
  useEffect(() => {
    loadBattleCards();
  }, []);

  const loadBattleCards = async () => {
    try {
      const response = await fetch(`${XANO_BASE_URL}/battle_card_main?user_id=${USER_ID}`);
      const data = await response.json();
      setBattleCards(data);

      // Set first card as active if available
      if (data.length > 0 && !activeBattleCardId) {
        setActiveBattleCardId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading battle cards:', error);
    }
  };

  const toggleCard = (cardName) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardName]: !prev[cardName],
    }));
  };

  const createNewBattleCard = async () => {
    if (!companyName || !serviceName) {
      alert('Please enter both company name and service');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${XANO_BASE_URL}/generate_battle_card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competitor_name: companyName,
          service_name: serviceName,
          user_id: USER_ID,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate battle card');
      }

      const newCard = await response.json();

      // Reload all battle cards to get the fresh data
      await loadBattleCards();

      // Set the new card as active
      setActiveBattleCardId(newCard.id);
      setShowNewCardModal(false);
      setCompanyName('');
      setServiceName('');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate battle card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteBattleCard = async (cardId, event) => {
    event.stopPropagation(); // Prevent selecting the card when clicking delete

    if (!confirm('Are you sure you want to delete this battle card?')) {
      return;
    }

    try {
      await fetch(`${XANO_BASE_URL}/battle_card_main/${cardId}`, {
        method: 'DELETE',
      });

      // Remove from local state
      setBattleCards((prev) => prev.filter((card) => card.id !== cardId));

      // If deleted card was active, select another
      if (activeBattleCardId === cardId) {
        const remaining = battleCards.filter((card) => card.id !== cardId);
        setActiveBattleCardId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (error) {
      console.error('Error deleting battle card:', error);
      alert('Failed to delete battle card');
    }
  };

  const CardSection = ({ title, content, cardKey }) => {
    const isExpanded = expandedCards[cardKey];
    const summary = content && content.length > 100 ? content.substring(0, 100) + '...' : content;

    return (
      <div
        onClick={() => toggleCard(cardKey)}
        className="bg-white rounded-2xl p-5 border-2 border-gray-900 cursor-pointer hover:shadow-lg transition-all h-full flex flex-col"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-600 flex-shrink-0 ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0 ml-2" />
          )}
        </div>
        <div className="text-xs text-gray-600 flex-1">
          <p className="font-medium mb-2">Summary:</p>
          <p className="leading-relaxed">
            {isExpanded ? content || 'No data available' : summary || 'No data available'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gray-800 p-2 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Battle Card Copilot</h1>
              <p className="text-xs text-gray-500">AI-powered competitive intelligence</p>
            </div>
          </div>
        </div>

        {/* Battle Cards Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Battle Cards</h2>
              <button
                onClick={() => setShowNewCardModal(true)}
                className="bg-black text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Battle Card List */}
            <div className="space-y-2">
              {battleCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => setActiveBattleCardId(card.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    activeBattleCardId === card.id
                      ? 'bg-gray-100 border border-gray-300'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 truncate">
                        {card.competitor_name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{card.competitor_service}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement regenerate
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Repeat className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => deleteBattleCard(card.id, e)}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {battleCards.length === 0 && (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No battle cards yet</p>
                <p className="text-xs text-gray-400">Click + to create one</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          {activeBattleCard ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {activeBattleCard.competitor_name}
                </h2>
                <span className="px-3 py-1 bg-black text-white text-xs font-medium rounded-md">
                  Active Session
                </span>
              </div>
              <p className="text-sm text-gray-500">{activeBattleCard.competitor_service}</p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900">Battle Card Copilot</h2>
              <p className="text-sm text-gray-500">Select or create a battle card to get started</p>
            </div>
          )}
          {activeBattleCard && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{battleCards.length} battle cards</span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-white p-8">
          {activeBattleCard ? (
            <div className="max-w-[1400px] mx-auto">
              {/* Company Name Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Name</h2>
              </div>

              {/* Battle Card Grid - 4 wide, 2 high */}
              <div className="grid grid-cols-4 grid-rows-2 gap-4">
                <CardSection
                  title="Company Background"
                  content={activeBattleCard.company_overview}
                  cardKey="companyBackground"
                />
                <CardSection
                  title="Key Decision Maker"
                  content={activeBattleCard.key_products_services}
                  cardKey="keyDecisionMaker"
                />
                <CardSection
                  title="Recent News"
                  content={activeBattleCard.recent_news}
                  cardKey="recentNews"
                />
                <CardSection
                  title="Potential Pain Points"
                  content={activeBattleCard.target_market_icp}
                  cardKey="potentialPainPoints"
                />
                <CardSection
                  title="Talking Points"
                  content={activeBattleCard.market_positioning}
                  cardKey="talkingPoints"
                />
                <CardSection
                  title="Differentiation"
                  content={activeBattleCard.weaknesses_gaps}
                  cardKey="differentiation"
                />
                <CardSection
                  title="Next Steps"
                  content={activeBattleCard.strengths}
                  cardKey="nextSteps"
                />
                <CardSection
                  title="Preparation Checklist"
                  content={activeBattleCard.customer_references}
                  cardKey="preparationChecklist"
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Target className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Battle Card Selected
                </h3>
                <p className="text-gray-500 mb-6">
                  Create a new battle card to get competitive intelligence
                </p>
                <button
                  onClick={() => setShowNewCardModal(true)}
                  className="bg-black text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800 transition-all shadow-sm inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Battle Card
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Battle Card Modal */}
      {showNewCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Battle Card</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competitor Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Glamsquad, Soothe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service/Product
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g., on-demand beauty services"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewCardModal(false);
                  setCompanyName('');
                  setServiceName('');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNewBattleCard}
                disabled={loading}
                className="flex-1 bg-black text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
