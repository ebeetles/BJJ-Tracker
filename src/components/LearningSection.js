import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './LearningSection.css';

const bjjTechniques = {
  'Guard': {
    'Closed Guard': [
      'Triangle Choke',
      'Armbar from Guard',
      'Kimura from Guard',
      'Guillotine Choke',
      'Cross Collar Choke',
      'Omoplata',
      'Hip Bump Sweep',
      'Scissor Sweep'
    ],
    'Open Guard': [
      'Butterfly Guard Sweeps',
      'Spider Guard',
      'Lasso Guard',
      'De La Riva Guard',
      'Worm Guard',
      'X-Guard',
      'Single Leg X',
      'Half Guard Sweeps'
    ],
    'Half Guard': [
      'Lock Down',
      'Electric Chair Sweep',
      'Old School Sweep',
      'Plan B Sweep',
      'Half Guard Passes'
    ]
  },
  'Side Control': {
    'Escapes': [
      'Bridge and Roll',
      'Shrimp Escape',
      'Knee to Elbow Escape',
      'Trap and Roll'
    ],
    'Submissions': [
      'Americana',
      'Kimura',
      'Arm Triangle',
      'North South Choke',
      'Paper Cutter Choke'
    ]
  },
  'Mount': {
    'Escapes': [
      'Bridge and Roll',
      'Elbow Escape',
      'Trap and Roll'
    ],
    'Submissions': [
      'Cross Collar Choke',
      'Armbar from Mount',
      'Triangle from Mount',
      'Americana from Mount'
    ]
  },
  'Back Control': {
    'Submissions': [
      'Rear Naked Choke',
      'Bow and Arrow Choke',
      'Cross Collar Choke',
      'Armbar from Back',
      'Triangle from Back'
    ],
    'Control': [
      'Body Triangle',
      'Seat Belt Grip',
      'Hooks Control'
    ]
  },
  'Takedowns': {
    'Single Leg': [
      'Single Leg Takedown',
      'High Crotch',
      'Low Single'
    ],
    'Double Leg': [
      'Double Leg Takedown',
      'Blast Double'
    ],
    'Throws': [
      'Hip Toss',
      'Uchi Mata',
      'Seoi Nage',
      'Tai Otoshi'
    ]
  },
  'Leg Locks': {
    'Heel Hooks': [
      'Inside Heel Hook',
      'Outside Heel Hook',
      'Calf Slicer'
    ],
    'Ankle Locks': [
      'Straight Ankle Lock',
      'Achilles Lock'
    ],
    'Knee Bars': [
      'Kneebar from Guard',
      'Kneebar from Top'
    ]
  }
};

const LearningSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [activeTab, setActiveTab] = useState('techniques'); // 'techniques' or 'ai-assistant'
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Use your actual API key here
  const GEMINI_API_KEY = 'AIzaSyCqUAoSkqtmRAP1F9t3iASx8DHebSYtyUQ';

  // Enable chat if API key is set (not empty)
  const isApiKeyConfigured = !!GEMINI_API_KEY;

  const allTechniques = [];
  Object.entries(bjjTechniques).forEach(([category, subcategories]) => {
    Object.entries(subcategories).forEach(([subcategory, techniques]) => {
      techniques.forEach(technique => {
        allTechniques.push({
          name: technique,
          category,
          subcategory
        });
      });
    });
  });

  const filteredTechniques = searchTerm
    ? allTechniques.filter(technique =>
        technique.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        technique.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        technique.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(category);
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategoryClick = (subcategory) => {
    if (selectedSubcategory === subcategory) {
      setSelectedSubcategory(null);
    } else {
      setSelectedSubcategory(subcategory);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !isApiKeyConfigured) return;

    const userMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetchGeminiResponse(userInput, GEMINI_API_KEY);
      
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check the API key and try again.',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGeminiResponse = async (message, apiKey) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a Brazilian Jiu-Jitsu (BJJ) black belt and expert instructor. Provide helpful, accurate, and detailed advice about BJJ techniques, training, competition, and general BJJ knowledge. Keep responses informative but concise. Here's the user's question: ${message}`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to get response from AI assistant. Please try again.');
    }
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  return (
    <div className="learning-section">
      <div className="learning-header">
        <h2>BJJ Learning</h2>
        <div className="learning-tabs">
          <button 
            className={`learning-tab ${activeTab === 'techniques' ? 'active' : ''}`}
            onClick={() => setActiveTab('techniques')}
          >
            📚 Techniques
          </button>
          <button 
            className={`learning-tab ${activeTab === 'ai-assistant' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-assistant')}
          >
            🤖 AI Assistant
          </button>
        </div>
      </div>

      {activeTab === 'techniques' && (
        <>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search techniques..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {searchTerm && (
            <div className="search-results">
              <h3>Search Results</h3>
              {filteredTechniques.length === 0 ? (
                <p>No techniques found matching "{searchTerm}"</p>
              ) : (
                <div className="techniques-grid">
                  {filteredTechniques.map((technique, index) => (
                    <div key={index} className="technique-card">
                      <h4>{technique.name}</h4>
                      <p className="technique-category">
                        {technique.category} → {technique.subcategory}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!searchTerm && (
            <div className="categories-container">
              {Object.entries(bjjTechniques).map(([category, subcategories]) => (
                <div key={category} className="category-section">
                  <button
                    className={`category-header ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <span>{category}</span>
                    <span className="category-arrow">
                      {selectedCategory === category ? '▼' : '▶'}
                    </span>
                  </button>
                  
                  {selectedCategory === category && (
                    <div className="subcategories-container">
                      {Object.entries(subcategories).map(([subcategory, techniques]) => (
                        <div key={subcategory} className="subcategory-section">
                          <button
                            className={`subcategory-header ${selectedSubcategory === subcategory ? 'active' : ''}`}
                            onClick={() => handleSubcategoryClick(subcategory)}
                          >
                            <span>{subcategory}</span>
                            <span className="subcategory-arrow">
                              {selectedSubcategory === subcategory ? '▼' : '▶'}
                            </span>
                          </button>
                          
                          {selectedSubcategory === subcategory && (
                            <div className="techniques-list">
                              {techniques.map((technique, index) => (
                                <div key={index} className="technique-item">
                                  <span className="technique-name">{technique}</span>
                                  <button className="learn-btn">Learn</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'ai-assistant' && (
        <div className="ai-assistant-container">
          <div className="api-key-section">
            <h3>BJJ AI Assistant</h3>
            <p className="ai-description">
              Ask me anything about BJJ techniques, training advice, competition strategies, or general questions about Brazilian Jiu-Jitsu!
            </p>
            {!isApiKeyConfigured && (
              <div className="api-key-notice">
                <p>⚠️ API Key Required</p>
                <p>Please add your Gemini API key to the code to enable the AI assistant.</p>
                <p>Get your key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></p>
              </div>
            )}
          </div>

          <div className="chat-container">
            <div className="chat-header">
              <h4>Chat with BJJ AI</h4>
              <button onClick={clearChat} className="clear-chat-btn">
                Clear Chat
              </button>
            </div>
            
            <div className="chat-messages">
              {chatMessages.length === 0 ? (
                <div className="empty-chat">
                  <p>👋 Hi! I'm your BJJ AI assistant. Ask me anything about Brazilian Jiu-Jitsu!</p>
                  <p>Try asking:</p>
                  <ul>
                    <li>"How do I escape side control?"</li>
                    <li>"What's the best guard for beginners?"</li>
                    <li>"Explain the triangle choke step by step"</li>
                    <li>"How do I improve my takedowns?"</li>
                  </ul>
                </div>
              ) : (
                chatMessages.map((message, index) => (
                  <div key={index} className={`chat-message ${message.role} ${message.isError ? 'error' : ''}`}>
                    <div className="message-header">
                      <span className="message-role">
                        {message.role === 'user' ? 'You' : 'BJJ AI'}
                      </span>
                      <span className="message-time">{message.timestamp}</span>
                    </div>
                    <div className="message-content">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="chat-message assistant loading">
                  <div className="message-header">
                    <span className="message-role">BJJ AI</span>
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="chat-input-container">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isApiKeyConfigured ? "Ask me about BJJ..." : "API key required..."}
                className="chat-input"
                disabled={!isApiKeyConfigured || isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || !isApiKeyConfigured || isLoading}
                className="send-btn"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningSection; 