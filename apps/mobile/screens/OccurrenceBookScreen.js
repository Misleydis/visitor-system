import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, RefreshControl, FlatList, Modal
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  getAllOBEntries, 
  getMyOBEntries, 
  createOBEntry, 
  signOffOBEntries, 
  getSecurityGuards 
} from '../services/api';

const SITES = [
  'Select site',
  'Head Office',
  'Phase I', 'Phase II', 'Phase III', 'Phase IV', 'Phase V',
  'Phase VI', 'Phase VII', 'Phase VIII', 'Phase IX', 'Phase X',
  'Phase XI', 'Phase XII', 'The Gate', '2 Acres'
];

export default function OccurrenceBookScreen({ route, navigation }) {
  const { user } = route.params;
  const isSecurityAdmin = user.role === 'security_admin' || user.role === 'it_admin' || user.role === 'admin';
  
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    entryNumber: '',
    occurrence: '',
    site: ''
  });
  const [entries, setEntries] = useState([]);
  const [guards, setGuards] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGuard, setSelectedGuard] = useState('');
  const [selectedGuardName, setSelectedGuardName] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [showFilterDatePicker, setShowFilterDatePicker] = useState(false);
  const [showSitePicker, setShowSitePicker] = useState(false);
  const [showGuardPicker, setShowGuardPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signData, setSignData] = useState({ entryId: '', initials: user.initials || '' });
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [sitePickerVisible, setSitePickerVisible] = useState(false);

  const loadGuards = async () => {
    try {
      const response = await getSecurityGuards();
      setGuards(response.data);
    } catch (err) {
      console.error('Error loading guards:', err);
    }
  };

  const loadEntries = async () => {
    try {
      let response;
      if (isSecurityAdmin) {
        const dateFilter = showAllEntries ? '' : selectedDate;
        const siteFilter = selectedSite ? selectedSite.toLowerCase() : '';
        response = await getAllOBEntries(dateFilter, dateFilter, selectedGuard, siteFilter);
      } else {
        response = await getMyOBEntries(selectedDate, selectedDate);
      }
      setEntries(response.data);
    } catch (err) {
      console.error('Error loading entries:', err);
      Alert.alert('Error', 'Failed to load entries');
    }
  };

  useEffect(() => {
    if (isSecurityAdmin) {
      loadGuards();
    }
    loadEntries();
  }, [selectedDate, selectedGuard, selectedSite, showAllEntries]);

  const generateInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  };

  const handleSubmit = async () => {
    if (!form.date || !form.time || !form.entryNumber || !form.occurrence || !form.site) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    const initials = user.initials || generateInitials(user.name);
    if (!initials) {
      Alert.alert('Error', 'Could not generate initials from your name');
      return;
    }
    setLoading(true);
    try {
      await createOBEntry({ ...form, initials });
      Alert.alert('Success', 'OB entry created');
      setForm({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        entryNumber: '',
        occurrence: '',
        site: ''
      });
      loadEntries();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOff = async () => {
    if (!signData.entryId) {
      Alert.alert('Error', 'Please select an entry to sign off');
      return;
    }
    const initials = signData.initials || generateInitials(user.name);
    if (!initials) {
      Alert.alert('Error', 'Could not generate initials from your name');
      return;
    }
    setLoading(true);
    try {
      await signOffOBEntries({ entryId: signData.entryId, initials });
      Alert.alert('Success', 'Entry signed off successfully');
      setShowSignModal(false);
      setSignData({ entryId: '', initials: user.initials || generateInitials(user.name) });
      loadEntries();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const openSignModal = (entryId) => {
    setSignData({ 
      entryId,
      initials: user.initials || generateInitials(user.name) 
    });
    setShowSignModal(true);
  };

  const groupEntriesByGuardAndDate = (entries) => {
    const grouped = {};
    entries.forEach(entry => {
      const guardId = entry.securityId._id || entry.securityId;
      const guardName = entry.securityId.name || 'Unknown';
      const date = new Date(entry.date).toISOString().split('T')[0];
      
      if (!grouped[guardId]) {
        grouped[guardId] = { guardName, dates: {} };
      }
      if (!grouped[guardId].dates[date]) {
        grouped[guardId].dates[date] = [];
      }
      grouped[guardId].dates[date].push(entry);
    });
    return grouped;
  };

  const fetchNextEntryNumber = async (site) => {
    if (!site) return;
    try {
      const response = await getAllOBEntries('', '', '', site.toLowerCase());
      const maxEntry = response.data.reduce((max, entry) => Math.max(max, entry.entryNumber), 0);
      setForm({ ...form, site, entryNumber: (maxEntry + 1).toString() });
    } catch (err) {
      setForm({ ...form, site, entryNumber: '1' });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.replace('Login')} style={{ marginRight: 15 }}>
          <MaterialIcons name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerStyle: { backgroundColor: '#0a1929' },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  const formatDate = (d) => d.toISOString().split('T')[0];
  const formatTime = (t) => t.toTimeString().split(' ')[0].slice(0, 5);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0a1929' }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header with gradient and abstract shapes */}
        <LinearGradient
          colors={['#0a1929', '#0d2b3e', '#143e5a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.mainTitle}>Occurrence Book</Text>
            <Text style={styles.subTitle}>
              {isSecurityAdmin ? 'View and sign off entries' : 'Record your daily occurrences'}
            </Text>
          </View>
        </LinearGradient>

        {/* Floating white content container */}
        <View style={styles.floatingContainer}>
          {/* Admin Filters */}
          {isSecurityAdmin && (
            <View style={styles.filterCard}>
              <Text style={styles.filterTitle}>Filters</Text>
              
              {/* Today / All Toggle */}
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, !showAllEntries && styles.toggleBtnActive]}
                  onPress={() => setShowAllEntries(false)}
                >
                  <Text style={[styles.toggleBtnText, !showAllEntries && styles.toggleBtnTextActive]}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, showAllEntries && styles.toggleBtnActive]}
                  onPress={() => setShowAllEntries(true)}
                >
                  <Text style={[styles.toggleBtnText, showAllEntries && styles.toggleBtnTextActive]}>All Entries</Text>
                </TouchableOpacity>
              </View>

              {/* Date Picker */}
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={styles.filterInput}
                  onPress={() => setShowFilterDatePicker(true)}
                >
                  <Text style={selectedDate ? styles.filterInputText : styles.filterInputPlaceholder}>
                    {selectedDate || 'Select Date'}
                  </Text>
                  <MaterialIcons name="calendar-today" size={20} color="#7f8c8d" />
                </TouchableOpacity>
              </View>
              
              {/* Site Picker */}
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={styles.filterInput}
                  onPress={() => setShowSitePicker(true)}
                >
                  <Text style={selectedSite ? styles.filterInputText : styles.filterInputPlaceholder}>
                    {selectedSite || 'Filter by Site'}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={20} color="#7f8c8d" />
                </TouchableOpacity>
              </View>
              
              {/* Guard Picker */}
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={styles.filterInput}
                  onPress={() => setShowGuardPicker(true)}
                >
                  <Text style={selectedGuardName ? styles.filterInputText : styles.filterInputPlaceholder}>
                    {selectedGuardName || 'Filter by Guard'}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={20} color="#7f8c8d" />
                </TouchableOpacity>
              </View>

              {(selectedGuard || selectedSite) && (
                <TouchableOpacity
                  style={styles.clearAllBtn}
                  onPress={() => {
                    setSelectedGuard('');
                    setSelectedGuardName('');
                    setSelectedSite('');
                  }}
                >
                  <Text style={styles.clearAllBtnText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Create Entry Form (for security) */}
          {!isSecurityAdmin && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Create New Entry</Text>
              <Text style={styles.formSub}>Fill in the details below to log a new occurrence</Text>

              {/* Date Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.inputText}>{formatDate(new Date(form.date))}</Text>
                  <MaterialIcons name="calendar-today" size={20} color="#7f8c8d" />
                </TouchableOpacity>
              </View>

              {/* Time Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time</Text>
                <TouchableOpacity style={styles.inputContainer} onPress={() => setShowTimePicker(true)}>
                  <Text style={styles.inputText}>{form.time}</Text>
                  <MaterialIcons name="access-time" size={20} color="#7f8c8d" />
                </TouchableOpacity>
              </View>

              {/* Entry Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Entry Number</Text>
                <TextInput
                  style={styles.inputContainer}
                  placeholder="Auto-generated"
                  value={form.entryNumber}
                  onChangeText={(text) => setForm({ ...form, entryNumber: text })}
                  keyboardType="numeric"
                />
              </View>

              {/* Site Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Site</Text>
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setSitePickerVisible(true)}
                >
                  <Text style={styles.inputText}>{form.site || 'Select site'}</Text>
                  <MaterialIcons name="arrow-drop-down" size={20} color="#7f8c8d" />
                </TouchableOpacity>
              </View>

              {/* Occurrence */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Occurrence</Text>
                <TextInput
                  style={[styles.inputContainer, styles.textArea]}
                  placeholder="Describe the occurrence"
                  value={form.occurrence}
                  onChangeText={(text) => setForm({ ...form, occurrence: text })}
                  multiline
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Create Entry</Text>
                )}
              </TouchableOpacity>

              {/* View My Entries Button */}
              <TouchableOpacity
                style={styles.viewEntriesBtn}
                onPress={() => navigation.navigate('MyOccurrenceEntries', { user })}
              >
                <Text style={styles.viewEntriesBtnText}>View My Entries</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Entries List */}
          <View style={styles.entriesCard}>
            <Text style={styles.entriesTitle}>
              {isSecurityAdmin ? 'All Entries' : 'My Entries'}
            </Text>
            {entries.length === 0 ? (
              <Text style={styles.emptyText}>No entries found</Text>
            ) : (
              <>
                {isSecurityAdmin ? (
                  Object.entries(groupEntriesByGuardAndDate(entries)).map(([guardId, { guardName, dates }]) => (
                    <View key={guardId} style={styles.guardSection}>
                      <Text style={styles.guardName}>{guardName}</Text>
                      {Object.entries(dates).map(([date, dateEntries]) => (
                        <View key={date} style={styles.dateSection}>
                          <Text style={styles.dateText}>{date}</Text>
                          {dateEntries.map((entry) => (
                            <View key={entry._id} style={styles.entryItem}>
                              <View style={styles.entryHeader}>
                                <Text style={styles.entryNumber}>#{entry.entryNumber}</Text>
                                {!entry.adminSignatures || entry.adminSignatures.length === 0 ? (
                                  <TouchableOpacity
                                    style={styles.signBtn}
                                    onPress={() => openSignModal(entry._id)}
                                  >
                                    <Text style={styles.signBtnText}>Sign Off</Text>
                                  </TouchableOpacity>
                                ) : (
                                  <Text style={styles.signedText}>
                                    Signed by: {entry.adminSignatures.map(s => s.adminInitials).join(', ')}
                                  </Text>
                                )}
                              </View>
                              <Text style={styles.entryTime}>{entry.time}</Text>
                              <Text style={styles.entryOccurrence}>{entry.occurrence}</Text>
                              <Text style={styles.entrySite}>{entry.site}</Text>
                            </View>
                          ))}
                        </View>
                      ))}
                    </View>
                  ))
                ) : (
                  entries.map((entry) => (
                    <View key={entry._id} style={styles.entryItem}>
                      <Text style={styles.entryNumber}>#{entry.entryNumber}</Text>
                      <Text style={styles.entryDate}>{new Date(entry.date).toLocaleDateString()}</Text>
                      <Text style={styles.entryTime}>{entry.time}</Text>
                      <Text style={styles.entryOccurrence}>{entry.occurrence}</Text>
                      <Text style={styles.entrySite}>{entry.site}</Text>
                      {entry.adminSignatures && entry.adminSignatures.length > 0 && (
                        <Text style={styles.signedText}>
                          Signed by: {entry.adminSignatures.map(s => s.adminInitials).join(', ')}
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(form.date)}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setForm({ ...form, date: formatDate(selectedDate) });
            }
          }}
        />
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={new Date(`2000-01-01T${form.time}`)}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              setForm({ ...form, time: formatTime(selectedTime) });
            }
          }}
        />
      )}

      {/* Site Picker Modal */}
      <Modal
        visible={sitePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSitePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Site</Text>
            <ScrollView>
              {SITES.map((site) => (
                <TouchableOpacity
                  key={site}
                  style={styles.modalItem}
                  onPress={() => {
                    setForm({ ...form, site });
                    setSitePickerVisible(false);
                    fetchNextEntryNumber(site);
                  }}
                >
                  <Text style={styles.modalItemText}>{site}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSitePickerVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sign Off Modal */}
      <Modal
        visible={showSignModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSignModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign Off Entry</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Your Initials"
              value={signData.initials}
              onChangeText={(text) => setSignData({ ...signData, initials: text })}
            />
            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={handleSignOff}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalSubmitBtnText}>Sign Off</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowSignModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filter Date Picker */}
      {showFilterDatePicker && (
        <DateTimePicker
          value={new Date(selectedDate || new Date())}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowFilterDatePicker(false);
            if (selectedDate) {
              setSelectedDate(selectedDate.toISOString().split('T')[0]);
            }
          }}
        />
      )}

      {/* Site Picker Modal */}
      <Modal
        visible={showSitePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSitePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Site</Text>
            <ScrollView>
              {SITES.map((site) => (
                <TouchableOpacity
                  key={site}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedSite(site === 'Select site' ? '' : site);
                    setShowSitePicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{site}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowSitePicker(false)}
            >
              <Text style={styles.modalCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Guard Picker Modal */}
      <Modal
        visible={showGuardPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGuardPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Guard</Text>
            <ScrollView>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedGuard('');
                  setSelectedGuardName('');
                  setShowGuardPicker(false);
                }}
              >
                <Text style={styles.modalItemText}>All Guards</Text>
              </TouchableOpacity>
              {guards.map((guard) => (
                <TouchableOpacity
                  key={guard._id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedGuard(guard._id);
                    setSelectedGuardName(guard.name);
                    setShowGuardPicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{guard.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowGuardPicker(false)}
            >
              <Text style={styles.modalCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerGradient: {
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 16,
    color: '#bdc3c7',
    textAlign: 'center',
  },
  floatingContainer: {
    padding: 15,
    marginTop: -20,
  },
  filterCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  filterInputText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  filterInputPlaceholder: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#3498db',
  },
  toggleBtnText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: '#fff',
  },
  clearAllBtn: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  clearAllBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  formSub: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewEntriesBtn: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  viewEntriesBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  entriesCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    padding: 20,
  },
  guardSection: {
    marginBottom: 20,
  },
  guardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  dateSection: {
    marginBottom: 15,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 10,
  },
  signBtn: {
    backgroundColor: '#2ecc71',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  signBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  entryItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  entryNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  entryDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  entryTime: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  entryOccurrence: {
    fontSize: 14,
    color: '#34495e',
    marginTop: 4,
  },
  entrySite: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  signedText: {
    fontSize: 12,
    color: '#27ae60',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 14,
  },
  modalSubmitBtn: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalSubmitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseBtn: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
});