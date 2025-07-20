import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TagPickerModal from '../../components/TagPickerModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

type Entry = {
  id: string;
  date: string;
  matHours: string;
  submissionsGot: string[];
  submissionsReceived: string[];
  sweeps: string[];
  dominantPositions: string[];
  notes: string;
};

// Helper to create left/right variants
function withSides(arr) {
  return arr.flatMap(item => [`${item} (L)`, `${item} (R)`]);
}

const baseSubmissions = [
  'Triangle Choke', 'Armbar', 'Ezekiel Choke', 'Kimura', 'Guillotine Choke', 'Rear Naked Choke', 'Cross Collar Choke', 'Omoplata', 'Americana', 'Bow and Arrow Choke', 'North South Choke', 'Paper Cutter Choke', 'Arm Triangle', 'Anaconda Choke', "D'Arce Choke", 'Peruvian Necktie', 'Gogoplata', 'Calf Slicer', 'Heel Hook', 'Ankle Lock', 'Kneebar', 'Straight Ankle Lock', 'Achilles Lock', 'Inside Heel Hook', 'Outside Heel Hook', 'Calf Slicer', 'Other'
];
const baseSweeps = [
  'Scissor Sweep', 'Hip Bump Sweep', 'Flower Sweep', 'Lumberjack Sweep', 'Pendulum Sweep', 'X-Guard Sweep', 'Tripod Sweep', 'Sit-up Sweep', 'Tornado Sweep', 'Butterfly Sweep', 'Tomiya Sweep', 'Balloon Sweep', 'Other'
];
const basePositions = [
  'Mount', 'Back Control', 'Side Control', 'Knee on Belly', 'North-South', 'Closed Guard', 'Open Guard', 'Half Guard', 'Turtle', 'Crucifix', '50/50', 'De La Riva', 'Spider Guard', 'Other'
];

const commonSubmissions = withSides(baseSubmissions);
const commonSweeps = withSides(baseSweeps);
const commonPositions = withSides(basePositions);

export default function TrackingScreen() {
  const insets = useSafeAreaInsets();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Entry, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    matHours: '',
    submissionsGot: [],
    submissionsReceived: [],
    sweeps: [],
    dominantPositions: [],
    notes: ''
  });
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Modal visibility state
  const [modalType, setModalType] = useState<null | 'subGot' | 'subRec' | 'sweep' | 'pos'>(null);

  // Load tracking data from AsyncStorage
  const loadTrackingData = useCallback(async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('bjj-tracker-entries');
      const parsed: Entry[] = stored ? JSON.parse(stored) : [];
      setEntries(parsed);
    } catch (error) {
      console.error('Error loading tracking data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrackingData();
  }, [loadTrackingData]);

  const saveEntries = async (newEntries: Entry[]) => {
    try {
      await AsyncStorage.setItem('bjj-tracker-entries', JSON.stringify(newEntries));
      setEntries(newEntries);
    } catch (error) {
      console.error('Error saving entries:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      matHours: '',
      submissionsGot: [],
      submissionsReceived: [],
      sweeps: [],
      dominantPositions: [],
      notes: ''
    });
    setEditingId(null);
    setModalType(null); // Close any open modals
  };

  const handleSaveEntry = async () => {
    if (!formData.date || !formData.matHours) {
      Alert.alert('Error', 'Please fill in at least the date and mat hours.');
      return;
    }
    let newEntries = [...entries];
    if (editingId) {
      // Update existing entry
      newEntries = newEntries.map(e =>
        e.id === editingId ? { ...e, ...formData } : e
      );
    } else {
      // Add new entry
      newEntries = [
        {
          id: uuidv4(),
          ...formData
        },
        ...newEntries
      ];
    }
    await saveEntries(newEntries);
    resetForm();
    setShowForm(false);
    Alert.alert('Success', editingId ? 'Entry updated successfully!' : 'Entry saved successfully!');
  };

  const handleDeleteEntry = async (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const newEntries = entries.filter(e => e.id !== id);
            await saveEntries(newEntries);
          }
        }
      ]
    );
  };

  const handleEditEntry = (item: Entry) => {
    setFormData({
      date: item.date,
      matHours: item.matHours,
      submissionsGot: item.submissionsGot,
      submissionsReceived: item.submissionsReceived,
      sweeps: item.sweeps,
      dominantPositions: item.dominantPositions,
      notes: item.notes
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  // Helper to parse YYYY-MM-DD as a local date
  function parseLocalDate(dateString: string) {
    const [yyyy, mm, dd] = dateString.split('-').map(Number);
    return new Date(yyyy, mm - 1, dd);
  }

  const formatDate = (dateString: string) => {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render a single entry
  const renderEntry = ({ item }: { item: Entry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
        <View style={styles.entryActions}>
          <TouchableOpacity onPress={() => handleEditEntry(item)}>
            <Text style={styles.editButton}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteEntry(item.id)}>
            <Text style={styles.deleteButton}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.entryContent}>
        {item.matHours && (
          <View style={styles.entrySection}>
            <Text style={styles.entrySectionTitle}>⏱️ Mat Hours</Text>
            <Text style={styles.entrySectionText}>{item.matHours}h</Text>
          </View>
        )}

        {item.submissionsGot.length > 0 && (
          <View style={styles.entrySection}>
            <Text style={styles.entrySectionTitle}>✅ Submissions You Got</Text>
            <View style={styles.badgesContainer}>
              {item.submissionsGot.map((sub, index) => (
                <View key={index} style={[styles.badge, styles.badgeGot]}>
                  <Text style={styles.badgeText}>{sub}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {item.submissionsReceived.length > 0 && (
          <View style={styles.entrySection}>
            <Text style={styles.entrySectionTitle}>❌ Submissions Done On You</Text>
            <View style={styles.badgesContainer}>
              {item.submissionsReceived.map((sub, index) => (
                <View key={index} style={[styles.badge, styles.badgeReceived]}>
                  <Text style={styles.badgeText}>{sub}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {item.sweeps.length > 0 && (
          <View style={styles.entrySection}>
            <Text style={styles.entrySectionTitle}>🔄 Sweeps</Text>
            <View style={styles.badgesContainer}>
              {item.sweeps.map((sweep, index) => (
                <View key={index} style={[styles.badge, styles.badgeSweep]}>
                  <Text style={styles.badgeText}>{sweep}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {item.dominantPositions.length > 0 && (
          <View style={styles.entrySection}>
            <Text style={styles.entrySectionTitle}>👊 Dominant Positions</Text>
            <View style={styles.badgesContainer}>
              {item.dominantPositions.map((pos, index) => (
                <View key={index} style={[styles.badge, styles.badgePosition]}>
                  <Text style={styles.badgeText}>{pos}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {item.notes && (
          <View style={styles.entrySection}>
            <Text style={styles.entrySectionTitle}>📝 Notes</Text>
            <Text style={styles.entrySectionText}>{item.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );

  // Header and form for FlatList
  const listHeader = (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Training Log</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
          <Text style={styles.addButtonText}>+ Add Entry</Text>
        </TouchableOpacity>
      </View>
      {/* Form */}
      {showForm && (
        <View style={styles.form}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>
              {editingId ? 'Edit Training Entry' : 'Add New Training Entry'}
            </Text>
            {editingId && (
              <Text style={styles.editIndicator}>Editing existing entry</Text>
            )}
          </View>
          {/* Date and Hours */}
          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View pointerEvents="none">
                  <TextInput
                    style={styles.input}
                    value={formData.date}
                    editable={false}
                  />
                </View>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                date={formData.date ? new Date(formData.date) : new Date()}
                maximumDate={new Date()}
                onConfirm={selectedDate => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    // Force local date extraction
                    const localDate = new Date(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      selectedDate.getDate()
                    );
                    const yyyy = localDate.getFullYear();
                    const mm = String(localDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(localDate.getDate()).padStart(2, '0');
                    setFormData(f => ({ ...f, date: `${yyyy}-${mm}-${dd}` }));
                  }
                }}
                onCancel={() => setShowDatePicker(false)}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mat Hours</Text>
              <TextInput
                style={styles.input}
                value={formData.matHours}
                onChangeText={h => setFormData(f => ({ ...f, matHours: h }))}
                keyboardType="numeric"
                placeholder="e.g., 1.5"
                placeholderTextColor="#888"
              />
            </View>
          </View>

          {/* Submissions Got */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Submissions You Got</Text>
            <TouchableOpacity onPress={() => setModalType('subGot')}>
              <TextInput
                style={styles.input}
                value=""
                placeholder="Tap to add submissions"
                editable={false}
                pointerEvents="none"
                placeholderTextColor="#888"
              />
            </TouchableOpacity>
            <View style={styles.tagsContainer}>
              {formData.submissionsGot.map((s, i) => (
                <View key={s + '-' + i} style={styles.tag}>
                  <Text style={styles.tagText}>{s}</Text>
                  <TouchableOpacity
                    style={styles.removeTagButton}
                    onPress={() => setFormData(f => ({ ...f, submissionsGot: f.submissionsGot.filter(x => x !== s) }))}
                  >
                    <Text style={styles.removeTagText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Submissions Received */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Submissions Done On You</Text>
            <TouchableOpacity onPress={() => setModalType('subRec')}>
              <TextInput
                style={styles.input}
                value=""
                placeholder="Tap to add submissions"
                editable={false}
                pointerEvents="none"
                placeholderTextColor="#888"
              />
            </TouchableOpacity>
            <View style={styles.tagsContainer}>
              {formData.submissionsReceived.map((s, i) => (
                <View key={s + '-' + i} style={[styles.tag, styles.tagReceived]}>
                  <Text style={styles.tagText}>{s}</Text>
                  <TouchableOpacity
                    style={styles.removeTagButton}
                    onPress={() => setFormData(f => ({ ...f, submissionsReceived: f.submissionsReceived.filter(x => x !== s) }))}
                  >
                    <Text style={styles.removeTagText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Sweeps */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Sweeps</Text>
            <TouchableOpacity onPress={() => setModalType('sweep')}>
              <TextInput
                style={styles.input}
                value=""
                placeholder="Tap to add sweeps"
                editable={false}
                pointerEvents="none"
                placeholderTextColor="#888"
              />
            </TouchableOpacity>
            <View style={styles.tagsContainer}>
              {formData.sweeps.map((s, i) => (
                <View key={s + '-' + i} style={[styles.tag, styles.tagSweep]}>
                  <Text style={styles.tagText}>{s}</Text>
                  <TouchableOpacity
                    style={styles.removeTagButton}
                    onPress={() => setFormData(f => ({ ...f, sweeps: f.sweeps.filter(x => x !== s) }))}
                  >
                    <Text style={styles.removeTagText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Dominant Positions */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Dominant Positions</Text>
            <TouchableOpacity onPress={() => setModalType('pos')}>
              <TextInput
                style={styles.input}
                value=""
                placeholder="Tap to add positions"
                editable={false}
                pointerEvents="none"
                placeholderTextColor="#888"
              />
            </TouchableOpacity>
            <View style={styles.tagsContainer}>
              {formData.dominantPositions.map((s, i) => (
                <View key={s + '-' + i} style={[styles.tag, styles.tagPosition]}>
                  <Text style={styles.tagText}>{s}</Text>
                  <TouchableOpacity
                    style={styles.removeTagButton}
                    onPress={() => setFormData(f => ({ ...f, dominantPositions: f.dominantPositions.filter(x => x !== s) }))}
                  >
                    <Text style={styles.removeTagText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.textArea}
              value={formData.notes}
              onChangeText={n => setFormData(f => ({ ...f, notes: n }))}
              multiline
              placeholder="Training notes, techniques worked on, etc."
              placeholderTextColor="#888"
            />
          </View>

          {/* Form Actions */}
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSaveEntry}>
              <Text style={styles.submitButtonText}>
                {editingId ? 'Update Entry' : 'Save Entry'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* TagPickerModals */}
          <TagPickerModal
            visible={modalType === 'subGot'}
            onClose={() => setModalType(null)}
            options={commonSubmissions}
            selected={formData.submissionsGot}
            onSelect={tag => setFormData(f => ({ ...f, submissionsGot: [...f.submissionsGot, tag] }))}
            title="Select Submission You Got"
          />
          <TagPickerModal
            visible={modalType === 'subRec'}
            onClose={() => setModalType(null)}
            options={commonSubmissions}
            selected={formData.submissionsReceived}
            onSelect={tag => setFormData(f => ({ ...f, submissionsReceived: [...f.submissionsReceived, tag] }))}
            title="Select Submission Done On You"
          />
          <TagPickerModal
            visible={modalType === 'sweep'}
            onClose={() => setModalType(null)}
            options={commonSweeps}
            selected={formData.sweeps}
            onSelect={tag => setFormData(f => ({ ...f, sweeps: [...f.sweeps, tag] }))}
            title="Select Sweep"
          />
          <TagPickerModal
            visible={modalType === 'pos'}
            onClose={() => setModalType(null)}
            options={commonPositions}
            selected={formData.dominantPositions}
            onSelect={tag => setFormData(f => ({ ...f, dominantPositions: [...f.dominantPositions, tag] }))}
            title="Select Dominant Position"
          />
        </View>
      )}
      {/* Empty state if no entries */}
      {entries.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No training entries yet. Add your first entry to start tracking!
          </Text>
        </View>
      )}
    </>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={entries}
          keyExtractor={item => item.id}
          renderItem={renderEntry}
          ListHeaderComponent={
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {listHeader}
            </ScrollView>
          }
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f8f9fa', // handled by SafeAreaView
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333'
  },
  addButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  formHeader: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0'
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  editIndicator: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500'
  },
  formRow: {
    flexDirection: 'row',
    gap: 16
  },
  formGroup: {
    flex: 1,
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa'
  },
  textArea: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    minHeight: 80,
    textAlignVertical: 'top'
  },
  autocompleteContainer: {
    marginBottom: 8
  },
  autocompleteInput: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fafafa'
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white'
  },
  suggestionText: {
    fontSize: 16,
    color: '#333'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  tagReceived: {
    backgroundColor: '#f44336'
  },
  tagSweep: {
    backgroundColor: '#FF9800'
  },
  tagPosition: {
    backgroundColor: '#9C27B0'
  },
  tagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500'
  },
  removeTagButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6
  },
  removeTagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  formActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0'
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600'
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  entriesList: {
    gap: 20
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  entryDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  entryActions: {
    flexDirection: 'row',
    gap: 12
  },
  editButton: {
    fontSize: 20,
    padding: 8
  },
  deleteButton: {
    fontSize: 20,
    color: '#f44336',
    padding: 8
  },
  entryContent: {
    gap: 16
  },
  entrySection: {
    gap: 8
  },
  entrySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  entrySectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  badgeGot: {
    backgroundColor: '#4CAF50'
  },
  badgeReceived: {
    backgroundColor: '#f44336'
  },
  badgeSweep: {
    backgroundColor: '#FF9800'
  },
  badgePosition: {
    backgroundColor: '#9C27B0'
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500'
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666'
  }
}); 