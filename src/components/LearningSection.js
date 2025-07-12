import React, { useState } from 'react';
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

  return (
    <div className="learning-section">
      <div className="learning-header">
        <h2>BJJ Techniques</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search techniques..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
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
    </div>
  );
};

export default LearningSection; 