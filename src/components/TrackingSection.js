import React, { useState } from 'react';
import './TrackingSection.css';
import Downshift from 'downshift';

const commonSubmissions = [
  'Triangle Choke',
  'Armbar',
  'Ezekiel Choke',
  'Kimura',
  'Guillotine Choke',
  'Rear Naked Choke',
  'Cross Collar Choke',
  'Omoplata',
  'Americana',
  'Bow and Arrow Choke',
  'North South Choke',
  'Paper Cutter Choke',
  'Arm Triangle',
  'Anaconda Choke',
  'D\'Arce Choke',
  'Peruvian Necktie',
  'Gogoplata',
  'Calf Slicer',
  'Heel Hook',
  'Ankle Lock',
  'Kneebar',
  'Straight Ankle Lock',
  'Achilles Lock',
  'Inside Heel Hook',
  'Outside Heel Hook',
  'Calf Slicer',
  'Other'
];

const commonSweeps = [
  'Scissor Sweep',
  'Hip Bump Sweep',
  'Flower Sweep',
  'Lumberjack Sweep',
  'Pendulum Sweep',
  'X-Guard Sweep',
  'Tripod Sweep',
  'Sit-up Sweep',
  'Tornado Sweep',
  'Butterfly Sweep',
  'Tomiya Sweep',
  'Balloon Sweep',
  'Other'
];

const commonPositions = [
  'Mount',
  'Back Control',
  'Side Control',
  'Knee on Belly',
  'North-South',
  'Closed Guard',
  'Open Guard',
  'Half Guard',
  'Turtle',
  'Crucifix',
  '50/50',
  'De La Riva',
  'Spider Guard',
  'Other'
];

const TrackingSection = ({ trackingData, onAddEntry, onDeleteEntry }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    matHours: '',
    submissionsGot: [],
    submissionsReceived: [],
    sweeps: [],
    dominantPositions: [],
    notes: ''
  });
  const [newSubmission, setNewSubmission] = useState('');
  const [newSubmissionReceived, setNewSubmissionReceived] = useState('');
  const [newSweep, setNewSweep] = useState('');
  const [newPosition, setNewPosition] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.matHours || formData.submissionsGot.length > 0 || formData.submissionsReceived.length > 0 || formData.notes) {
      if (editingEntry) {
        // Update existing entry
        await onAddEntry({ ...formData, id: editingEntry.id });
        setEditingEntry(null);
      } else {
        // Add new entry
        await onAddEntry(formData);
      }
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        matHours: '',
        submissionsGot: [],
        submissionsReceived: [],
        sweeps: [],
        dominantPositions: [],
        notes: ''
      });
      setShowAddForm(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSubmissionGot = () => {
    if (newSubmission && !formData.submissionsGot.includes(newSubmission)) {
      setFormData(prev => ({
        ...prev,
        submissionsGot: [...prev.submissionsGot, newSubmission]
      }));
      setNewSubmission('');
    }
  };

  const removeSubmissionGot = (submission) => {
    setFormData(prev => ({
      ...prev,
      submissionsGot: prev.submissionsGot.filter(s => s !== submission)
    }));
  };

  const addSubmissionReceived = () => {
    if (newSubmissionReceived && !formData.submissionsReceived.includes(newSubmissionReceived)) {
      setFormData(prev => ({
        ...prev,
        submissionsReceived: [...prev.submissionsReceived, newSubmissionReceived]
      }));
      setNewSubmissionReceived('');
    }
  };

  const removeSubmissionReceived = (submission) => {
    setFormData(prev => ({
      ...prev,
      submissionsReceived: prev.submissionsReceived.filter(s => s !== submission)
    }));
  };

  const addSweep = () => {
    if (newSweep && !formData.sweeps.includes(newSweep)) {
      setFormData(prev => ({
        ...prev,
        sweeps: [...prev.sweeps, newSweep]
      }));
      setNewSweep('');
    }
  };
  const removeSweep = (sweep) => {
    setFormData(prev => ({
      ...prev,
      sweeps: prev.sweeps.filter(s => s !== sweep)
    }));
  };
  const addPosition = () => {
    if (newPosition && !formData.dominantPositions.includes(newPosition)) {
      setFormData(prev => ({
        ...prev,
        dominantPositions: [...prev.dominantPositions, newPosition]
      }));
      setNewPosition('');
    }
  };
  const removePosition = (pos) => {
    setFormData(prev => ({
      ...prev,
      dominantPositions: prev.dominantPositions.filter(p => p !== pos)
    }));
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      matHours: entry.matHours || '',
      submissionsGot: entry.submissionsGot || [],
      submissionsReceived: entry.submissionsReceived || [],
      sweeps: entry.sweeps || [],
      dominantPositions: entry.dominantPositions || [],
      notes: entry.notes || ''
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingEntry(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      matHours: '',
      submissionsGot: [],
      submissionsReceived: [],
      sweeps: [],
      dominantPositions: [],
      notes: ''
    });
  };

  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await onDeleteEntry(entryId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const groupedData = trackingData.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="tracking-section">
      <div className="tracking-header">
        <h2>Training Log</h2>
        <button 
          className="add-entry-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '✕' : '+'} Add Entry
        </button>
      </div>

      {showAddForm && (
        <form className="add-entry-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h3>{editingEntry ? 'Edit Entry' : 'Add New Entry'}</h3>
            {editingEntry && (
              <span className="edit-indicator">Editing entry from {formatDate(editingEntry.date)}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="matHours">Mat Hours:</label>
            <input
              type="number"
              id="matHours"
              name="matHours"
              value={formData.matHours}
              onChange={handleInputChange}
              placeholder="e.g., 1.5"
              step="0.5"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Submissions You Got:</label>
            <div className="submission-input-group">
              <Downshift
                inputValue={newSubmission}
                onInputValueChange={setNewSubmission}
                onSelect={selection => {
                  setNewSubmission(selection);
                  addSubmissionGot();
                }}
                itemToString={item => item || ''}
              >
                {({ getInputProps, getItemProps, getMenuProps, isOpen, inputValue, highlightedIndex, selectedItem }) => (
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      {...getInputProps({
                        placeholder: 'Type or select submission...'
                      })}
                      className="submission-select"
                      style={{ width: '100%' }}
                    />
                    <button
                      type="button"
                      onClick={addSubmissionGot}
                      className="add-submission-btn"
                      disabled={!newSubmission}
                    >
                      Add
                    </button>
                    <ul {...getMenuProps()} className="autocomplete-menu">
                      {isOpen &&
                        commonSubmissions
                          .filter(item =>
                            !inputValue || item.toLowerCase().includes(inputValue.toLowerCase())
                          )
                          .slice(0, 8)
                          .map((item, index) => (
                            <li
                              {...getItemProps({
                                key: item,
                                index,
                                item,
                                style: {
                                  backgroundColor:
                                    highlightedIndex === index ? '#eee' : 'white',
                                  fontWeight: selectedItem === item ? 'bold' : 'normal',
                                  padding: '0.5rem',
                                  cursor: 'pointer'
                                }
                              })}
                            >
                              {item}
                            </li>
                          ))}
                    </ul>
                  </div>
                )}
              </Downshift>
            </div>
            {formData.submissionsGot.length > 0 && (
              <div className="submissions-list">
                {formData.submissionsGot.map((submission, index) => (
                  <div key={index} className="submission-tag">
                    <span>{submission}</span>
                    <button
                      type="button"
                      onClick={() => removeSubmissionGot(submission)}
                      className="remove-submission-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Submissions Done On You:</label>
            <div className="submission-input-group">
              <Downshift
                inputValue={newSubmissionReceived}
                onInputValueChange={setNewSubmissionReceived}
                onSelect={selection => {
                  setNewSubmissionReceived(selection);
                  addSubmissionReceived();
                }}
                itemToString={item => item || ''}
              >
                {({ getInputProps, getItemProps, getMenuProps, isOpen, inputValue, highlightedIndex, selectedItem }) => (
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      {...getInputProps({
                        placeholder: 'Type or select submission...'
                      })}
                      className="submission-select"
                      style={{ width: '100%' }}
                    />
                    <button
                      type="button"
                      onClick={addSubmissionReceived}
                      className="add-submission-btn"
                      disabled={!newSubmissionReceived}
                    >
                      Add
                    </button>
                    <ul {...getMenuProps()} className="autocomplete-menu">
                      {isOpen &&
                        commonSubmissions
                          .filter(item =>
                            !inputValue || item.toLowerCase().includes(inputValue.toLowerCase())
                          )
                          .slice(0, 8)
                          .map((item, index) => (
                            <li
                              {...getItemProps({
                                key: item,
                                index,
                                item,
                                style: {
                                  backgroundColor:
                                    highlightedIndex === index ? '#eee' : 'white',
                                  fontWeight: selectedItem === item ? 'bold' : 'normal',
                                  padding: '0.5rem',
                                  cursor: 'pointer'
                                }
                              })}
                            >
                              {item}
                            </li>
                          ))}
                    </ul>
                  </div>
                )}
              </Downshift>
            </div>
            {formData.submissionsReceived.length > 0 && (
              <div className="submissions-list">
                {formData.submissionsReceived.map((submission, index) => (
                  <div key={index} className="submission-tag received">
                    <span>{submission}</span>
                    <button
                      type="button"
                      onClick={() => removeSubmissionReceived(submission)}
                      className="remove-submission-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="sweeps">Sweeps:</label>
            <div className="submission-input-group">
              <Downshift
                inputValue={newSweep}
                onInputValueChange={setNewSweep}
                onSelect={selection => {
                  setNewSweep(selection);
                  addSweep();
                }}
                itemToString={item => item || ''}
              >
                {({ getInputProps, getItemProps, getMenuProps, isOpen, inputValue, highlightedIndex, selectedItem }) => (
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      {...getInputProps({
                        placeholder: 'Type or select sweep...'
                      })}
                      className="submission-select"
                      style={{ width: '100%' }}
                    />
                    <button
                      type="button"
                      className="add-submission-btn"
                      onClick={addSweep}
                      disabled={!newSweep}
                    >
                      Add
                    </button>
                    <ul {...getMenuProps()} className="autocomplete-menu">
                      {isOpen &&
                        commonSweeps
                          .filter(item =>
                            !inputValue || item.toLowerCase().includes(inputValue.toLowerCase())
                          )
                          .slice(0, 8)
                          .map((item, index) => (
                            <li
                              {...getItemProps({
                                key: item,
                                index,
                                item,
                                style: {
                                  backgroundColor:
                                    highlightedIndex === index ? '#eee' : 'white',
                                  fontWeight: selectedItem === item ? 'bold' : 'normal',
                                  padding: '0.5rem',
                                  cursor: 'pointer'
                                }
                              })}
                            >
                              {item}
                            </li>
                          ))}
                    </ul>
                  </div>
                )}
              </Downshift>
            </div>
            <div className="submissions-list">
              {formData.sweeps.map(sweep => (
                <span className="submission-tag" key={sweep}>
                  {sweep}
                  <button
                    type="button"
                    className="remove-submission-btn"
                    onClick={() => removeSweep(sweep)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dominantPositions">Dominant Positions:</label>
            <div className="submission-input-group">
              <Downshift
                inputValue={newPosition}
                onInputValueChange={setNewPosition}
                onSelect={selection => {
                  setNewPosition(selection);
                  addPosition();
                }}
                itemToString={item => item || ''}
              >
                {({ getInputProps, getItemProps, getMenuProps, isOpen, inputValue, highlightedIndex, selectedItem }) => (
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      {...getInputProps({
                        placeholder: 'Type or select position...'
                      })}
                      className="submission-select"
                      style={{ width: '100%' }}
                    />
                    <button
                      type="button"
                      className="add-submission-btn"
                      onClick={addPosition}
                      disabled={!newPosition}
                    >
                      Add
                    </button>
                    <ul {...getMenuProps()} className="autocomplete-menu">
                      {isOpen &&
                        commonPositions
                          .filter(item =>
                            !inputValue || item.toLowerCase().includes(inputValue.toLowerCase())
                          )
                          .slice(0, 8)
                          .map((item, index) => (
                            <li
                              {...getItemProps({
                                key: item,
                                index,
                                item,
                                style: {
                                  backgroundColor:
                                    highlightedIndex === index ? '#eee' : 'white',
                                  fontWeight: selectedItem === item ? 'bold' : 'normal',
                                  padding: '0.5rem',
                                  cursor: 'pointer'
                                }
                              })}
                            >
                              {item}
                            </li>
                          ))}
                    </ul>
                  </div>
                )}
              </Downshift>
            </div>
            <div className="submissions-list">
              {formData.dominantPositions.map(pos => (
                <span className="submission-tag" key={pos}>
                  {pos}
                  <button
                    type="button"
                    className="remove-submission-btn"
                    onClick={() => removePosition(pos)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes:</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Training notes, techniques worked on, etc."
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editingEntry ? 'Update Entry' : 'Save Entry'}
            </button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="entries-list">
        {sortedDates.length === 0 ? (
          <div className="empty-state">
            <p>No training entries yet. Add your first entry to start tracking!</p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="date-group">
              <h3 className="date-header">{formatDate(date)}</h3>
              {groupedData[date].map(entry => (
                <div key={entry.id} className="entry-card">
                  <div className="entry-header">
                    <div className="entry-info">
                      {entry.matHours && (
                        <span className="mat-hours">
                          ⏱️ {entry.matHours}h
                        </span>
                      )}
                    </div>
                    <div className="entry-actions">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="edit-btn"
                        title="Edit entry"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="delete-btn"
                        title="Delete entry"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {entry.submissionsGot && entry.submissionsGot.length > 0 && (
                    <div className="entry-section">
                      <h4>✅ Submissions You Got:</h4>
                      <div className="submissions-display">
                        {entry.submissionsGot.map((submission, index) => (
                          <span key={index} className="submission-badge got">
                            {submission}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {entry.submissionsReceived && entry.submissionsReceived.length > 0 && (
                    <div className="entry-section">
                      <h4>❌ Submissions Done On You:</h4>
                      <div className="submissions-display">
                        {entry.submissionsReceived.map((submission, index) => (
                          <span key={index} className="submission-badge received">
                            {submission}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="entry-section">
                    <h4>🔄 Sweeps:</h4>
                    <div className="submissions-display">
                      {(entry.sweeps && entry.sweeps.length > 0)
                        ? entry.sweeps.map((sweep, index) => (
                            <span key={index} className="submission-badge got">{sweep}</span>
                          ))
                        : <span className="submission-badge sweep empty">None</span>
                      }
                    </div>
                  </div>
                  <div className="entry-section">
                    <h4>👊 Dominant Positions:</h4>
                    <div className="submissions-display">
                      {(entry.dominantPositions && entry.dominantPositions.length > 0)
                        ? entry.dominantPositions.map((pos, index) => (
                            <span key={index} className="submission-badge got">{pos}</span>
                          ))
                        : <span className="submission-badge dominant-position empty">None</span>
                      }
                    </div>
                  </div>
                  
                  {entry.notes && (
                    <div className="entry-section">
                      <h4>Notes:</h4>
                      <p>{entry.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrackingSection; 