import React, { useState } from 'react';
import './TrackingSection.css';

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
  // Add state for side selection
  const [newSubmissionSide, setNewSubmissionSide] = useState('L');
  const [newSubmissionReceivedSide, setNewSubmissionReceivedSide] = useState('L');
  const [newSweepSide, setNewSweepSide] = useState('L');

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
    if (newSubmission && !formData.submissionsGot.includes(`${newSubmission} (${newSubmissionSide})`)) {
      setFormData(prev => ({
        ...prev,
        submissionsGot: [...prev.submissionsGot, `${newSubmission} (${newSubmissionSide})`]
      }));
      setNewSubmission('');
      setNewSubmissionSide('L');
    }
  };

  const removeSubmissionGot = (submission) => {
    setFormData(prev => ({
      ...prev,
      submissionsGot: prev.submissionsGot.filter(s => s !== submission)
    }));
  };

  const addSubmissionReceived = () => {
    if (newSubmissionReceived && !formData.submissionsReceived.includes(`${newSubmissionReceived} (${newSubmissionReceivedSide})`)) {
      setFormData(prev => ({
        ...prev,
        submissionsReceived: [...prev.submissionsReceived, `${newSubmissionReceived} (${newSubmissionReceivedSide})`]
      }));
      setNewSubmissionReceived('');
      setNewSubmissionReceivedSide('L');
    }
  };

  const removeSubmissionReceived = (submission) => {
    setFormData(prev => ({
      ...prev,
      submissionsReceived: prev.submissionsReceived.filter(s => s !== submission)
    }));
  };

  const addSweep = () => {
    if (newSweep && !formData.sweeps.includes(`${newSweep} (${newSweepSide})`)) {
      setFormData(prev => ({
        ...prev,
        sweeps: [...prev.sweeps, `${newSweep} (${newSweepSide})`]
      }));
      setNewSweep('');
      setNewSweepSide('L');
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
              <select
                value={newSubmissionSide}
                onChange={e => setNewSubmissionSide(e.target.value)}
                className="side-select"
              >
                <option value="L">L</option>
                <option value="R">R</option>
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
              <select
                value={newSubmissionReceivedSide}
                onChange={e => setNewSubmissionReceivedSide(e.target.value)}
                className="side-select"
              >
                <option value="L">L</option>
                <option value="R">R</option>
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
            <label htmlFor="sweeps">Sweeps:</label>
            <div className="submission-input-group">
              <select
                className="submission-select"
                id="sweeps"
                value={newSweep}
                onChange={e => setNewSweep(e.target.value)}
              >
                <option value="">Select sweep...</option>
                {commonSweeps.map(sweep => (
                  <option key={sweep} value={sweep}>{sweep}</option>
                ))}
              </select>
              <select
                value={newSweepSide}
                onChange={e => setNewSweepSide(e.target.value)}
                className="side-select"
              >
                <option value="L">L</option>
                <option value="R">R</option>
              </select>
              <button
                type="button"
                className="add-submission-btn"
                onClick={addSweep}
                disabled={!newSweep}
              >
                Add
              </button>
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
              <select
                className="submission-select"
                id="dominantPositions"
                value={newPosition}
                onChange={e => setNewPosition(e.target.value)}
              >
                <option value="">Select position...</option>
                {commonPositions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
              <button
                type="button"
                className="add-submission-btn"
                onClick={addPosition}
                disabled={!newPosition}
              >
                Add
              </button>
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