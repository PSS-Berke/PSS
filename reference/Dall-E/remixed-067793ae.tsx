import React, { useState } from 'react';
import { Download, Settings, MoreHorizontal, Plus, Image } from 'lucide-react';

export default function InfographicStudio() {
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    style: 'professional',
    mood: 'modern',
    colors: 'vibrant',
    details: '',
    size: '1024x1024',
  });

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const styles = [
    { value: 'professional', label: 'Professional & Clean' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'colorful', label: 'Colorful & Bold' },
    { value: 'illustrated', label: 'Hand-Illustrated' },
    { value: 'modern', label: 'Modern & Sleek' },
    { value: 'vintage', label: 'Vintage' },
  ];

  const moods = [
    { value: 'modern', label: 'Modern' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'playful', label: 'Playful' },
    { value: 'serious', label: 'Serious' },
    { value: 'elegant', label: 'Elegant' },
  ];

  const colorSchemes = [
    { value: 'vibrant', label: 'Vibrant Colors' },
    { value: 'pastel', label: 'Pastel' },
    { value: 'monochrome', label: 'Monochrome' },
    { value: 'blue', label: 'Blue Tones' },
    { value: 'warm', label: 'Warm Colors' },
    { value: 'cool', label: 'Cool Colors' },
  ];

  const sizes = [
    { value: '1024x1024', label: 'Square (1024x1024)' },
    { value: '1024x1792', label: 'Portrait (1024x1792)' },
    { value: '1792x1024', label: 'Landscape (1792x1024)' },
  ];

  const buildPrompt = () => {
    const { topic, style, mood, colors, details } = formData;

    let prompt = `Create a high-quality infographic image about "${topic}". `;
    prompt += `Style: ${style} design with a ${mood} feel. `;
    prompt += `Use a ${colors} color scheme. `;
    prompt += `The image should be suitable for professional use, with clear visual hierarchy and good composition. `;

    if (details) {
      prompt += `Additional requirements: ${details}. `;
    }

    prompt += `Make it visually appealing, well-balanced, and easy to understand.`;

    return prompt;
  };

  const generateImage = async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic for your infographic');
      return;
    }

    if (!apiKey.trim()) {
      setError('Please configure your OpenAI API key first');
      setShowKeyInput(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const prompt = buildPrompt();
      const [width, height] = formData.size.split('x').map(Number);

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: formData.size,
          quality: 'hd',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.data && data.data[0] && data.data[0].url) {
        const newCampaign = {
          id: Date.now(),
          name: formData.topic,
          imageUrl: data.data[0].url,
          prompt: prompt,
          timestamp: new Date().toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit',
          }),
          fullTimestamp: new Date().toLocaleString(),
          ...formData,
        };

        setCampaigns([newCampaign, ...campaigns]);
        setSelectedCampaign(newCampaign);
        setShowModal(false);
      } else {
        throw new Error('No image URL in response');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(`Failed to generate image: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (imageUrl) => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `infographic-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  const createNewCampaign = () => {
    setFormData({
      topic: '',
      style: 'professional',
      mood: 'modern',
      colors: 'vibrant',
      details: '',
      size: '1024x1024',
    });
    setError('');
    setShowModal(true);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <div
        className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
      >
        {/* Header */}
        {!sidebarCollapsed ? (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <div className="flex-1">
                  <h1 className="text-base font-semibold text-gray-900">AI Infographic Studio</h1>
                  <p className="text-xs text-gray-500">AI-powered content creation</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <MoreHorizontal size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-gray-200 flex justify-center">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <MoreHorizontal size={20} className="text-white" />
            </button>
          </div>
        )}

        {/* Campaigns Section */}
        <div className="flex-1 overflow-y-auto">
          <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Campaigns
                </span>
                <button
                  onClick={createNewCampaign}
                  className="w-6 h-6 bg-gray-900 text-white rounded flex items-center justify-center hover:bg-gray-800"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}

            {sidebarCollapsed && (
              <div className="flex justify-center mb-3">
                <button
                  onClick={createNewCampaign}
                  className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center hover:bg-gray-800"
                  title="Create new campaign"
                >
                  <Plus size={18} />
                </button>
              </div>
            )}

            <div className="space-y-1">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  onClick={() => setSelectedCampaign(campaign)}
                  className={`group flex items-start gap-3 ${sidebarCollapsed ? 'p-2 justify-center' : 'p-3'} rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedCampaign?.id === campaign.id ? 'bg-gray-50' : ''
                  }`}
                  title={sidebarCollapsed ? campaign.name : ''}
                >
                  {!sidebarCollapsed && <span className="text-gray-400 mt-0.5">›</span>}
                  {sidebarCollapsed ? (
                    <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                      <Image size={16} className="text-white" />
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 truncate">{campaign.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            1
                          </span>
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Settings size={14} className="text-gray-400" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-full">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Active Session
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Image size={14} />
              {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Configure API Key"
          >
            <Settings size={18} className="text-gray-600" />
          </button>
        </div>

        {/* API Key Configuration */}
        {showKeyInput && (
          <div className="bg-amber-50 border-b border-amber-200 p-4">
            <div className="max-w-3xl">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-amber-900 mb-1">
                    OpenAI API Key Required
                  </h3>
                  <p className="text-xs text-amber-700 mb-3">
                    ⚠️ Security Note: Your API key is stored only in browser memory and is never
                    saved. You'll need to re-enter it each session.
                  </p>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 border border-amber-300 rounded text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowKeyInput(false)}
                  className="text-amber-600 hover:text-amber-800 text-sm font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {selectedCampaign ? (
            // View Campaign
            <div className="max-w-4xl mx-auto p-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedCampaign.name}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedCampaign.timestamp} - {selectedCampaign.style} design
                      </p>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <MoreHorizontal size={18} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-gray-50">
                  <div className="bg-white rounded border border-gray-200 overflow-hidden mb-4">
                    <img
                      src={selectedCampaign.imageUrl}
                      alt={selectedCampaign.name}
                      className="w-full h-auto"
                    />
                  </div>

                  <button
                    onClick={() => downloadImage(selectedCampaign.imageUrl)}
                    className="w-full bg-gray-900 text-white py-2.5 rounded font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download Image
                  </button>

                  <div className="mt-4 p-4 bg-white rounded border border-gray-200">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Generated Prompt
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedCampaign.prompt}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Empty State
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image size={40} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Campaign Selected</h2>
                <p className="text-gray-500 mb-4">Create a new campaign to get started</p>
                <button
                  onClick={createNewCampaign}
                  className="bg-gray-900 text-white px-6 py-2.5 rounded font-medium hover:bg-gray-800 transition-all inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create Campaign
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Create New Campaign</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic / Subject *
                    </label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="e.g., AI sales and marketing tools"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                      <select
                        value={formData.style}
                        onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      >
                        {styles.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mood / Tone
                      </label>
                      <select
                        value={formData.mood}
                        onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      >
                        {moods.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color Scheme
                      </label>
                      <select
                        value={formData.colors}
                        onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      >
                        {colorSchemes.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Size
                      </label>
                      <select
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      >
                        {sizes.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Details (Optional)
                    </label>
                    <textarea
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      placeholder="Any specific elements or requirements..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={generateImage}
                    disabled={loading || !formData.topic.trim()}
                    className="w-full bg-gray-900 text-white py-3 rounded font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Generating...' : 'Generate Infographic'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
