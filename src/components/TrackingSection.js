import React, { useState } from 'react';
import './TrackingSection.css';

const commonSubmissions = [
  'Triangle Choke',
  'Armbar',
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

const TrackingSection = ({ trackingData, onAddEntry }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    matHours: '',
    submissionsGot: [],
    submissionsReceived: [],
    notes: ''
  });
  const [newSubmission, setNewSubmission] = useState('');
  const [newSubmissionReceived, setNewSubmissionReceived] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.matHours || formData.submissionsGot.length > 0 || formData.submissionsReceived.length > 0 || formData.notes) {
      if (editingEntry) {
        // Update existing entry
        const updatedData = trackingData.map(entry => 
          entry.id === editingEntry.id ? { ...formData, id: entry.id } : entry
        );
        onAddEntry(updatedData);
        setEditingEntry(null);
      } else {
        // Add new entry
        onAddEntry(formData);
      }
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        matHours: '',
        submissionsGot: [],
        submissionsReceived: [],
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

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      matHours: entry.matHours || '',
      submissionsGot: entry.submissionsGot || [],
      submissionsReceived: entry.submissionsReceived || [],
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
      notes: ''
    });
  };

  const handleDelete = (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const updatedData = trackingData.filter(entry => entry.id !== entryId);
      onAddEntry(updatedData);
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
              <select
                value={newSubmission}
                onChange={(e) => setNewSubmission(e.target.value)}
                className="submission-select"
              >
                <option value="">Select submission...</option>
                {commonSubmissions.map(submission => (
                  <option key={submission} value={submission}>
                    {submission}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addSubmissionGot}
                className="add-submission-btn"
                disabled={!newSubmission}
              >
                Add
              </button>
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
              <select
                value={newSubmissionReceived}
                onChange={(e) => setNewSubmissionReceived(e.target.value)}
                className="submission-select"
              >
                <option value="">Select submission...</option>
                {commonSubmissions.map(submission => (
                  <option key={submission} value={submission}>
                    {submission}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addSubmissionReceived}
                className="add-submission-btn"
                disabled={!newSubmissionReceived}
              >
                Add
              </button>
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