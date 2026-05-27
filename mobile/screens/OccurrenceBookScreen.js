import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getNextEntryNumber, createOBEntry, getMyOBEntries, getAllOBEntries, signOffOBEntries, getSecurityGuards } from '../services/api';

const SITES = ['head office', 'phase I', 'phase II', 'phase III', 'phase IV', 'phase V', 'phase VI', 'phase VII', 'phase VIII', 'phase IX', 'phase X', 'phase XI', 'phase XII', 'the gate', '2 acres'];

export default function OccurrenceBookScreen({ route }) {
  const { user } = route.params;
  const isSecurityAdmin = user.role === 'security_admin' || user.role === 'it_admin' || user.role === 'admin';
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    entryNumber: '',
    occurrence: '',
    site: ''
  });
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  const [showEntries, setShowEntries] = useState(false);
  const [selectedDate, setSelectedDate] = useState(isSecurityAdmin ? '' : new Date().toISOString().split('T')[0]);
  const [guards, setGuards] = useState([]);
  const [selectedGuard, setSelectedGuard] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [showSignModal, setShowSignModal] = useState(false);
  const [signData, setSignData] = useState({ securityId: '', date: '', initials: user.initials || '' });

  useEffect(() => {
    loadEntries();
    if (isSecurityAdmin) {
      loadGuards();
    }
  }, [selectedDate, selectedGuard, selectedSite]);

  const loadGuards = async () => {
    try {
      const response = await getSecurityGuards();
      setGuards(response.data);
    } catch (err) {
      console.error('Error loading guards:', err);
      Alert.alert('Error', err.response?.data?.msg || 'Failed to load guards');
    }
  };

  const loadEntries = async () => {
    try {
      let response;
      if (isSecurityAdmin) {
        // Only pass date filter if a date is selected, otherwise show all
        const dateFilter = selectedDate ? selectedDate : '';
        response = await getAllOBEntries(dateFilter, dateFilter, selectedGuard, selectedSite);
      } else {
        response = await getMyOBEntries(selectedDate, selectedDate);
      }
      setEntries(response.data);
    } catch (err) {
      console.error('Error loading entries:', err);
      Alert.alert('Error', err.response?.data?.msg || 'Failed to load entries');
    }
  };

  const fetchNextEntryNumber = async (site) => {
    if (!site) return;
    try {
      const response = await getNextEntryNumber(site);
      setForm({ ...form, site, entryNumber: response.data.nextEntryNumber.toString() });
    } catch (err) {
      Alert.alert('Error', 'Failed to get entry number');
    }
  };

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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const formatTime = (timeStr) => {
    return timeStr;
  };

  const handleSignOff = async () => {
    if (!signData.securityId || !signData.date) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    const initials = signData.initials || generateInitials(user.name);
    if (!initials) {
      Alert.alert('Error', 'Could not generate initials from your name');
      return;
    }
    setLoading(true);
    try {
      await signOffOBEntries({ ...signData, initials });
      Alert.alert('Success', 'Signed off successfully');
      setShowSignModal(false);
      setSignData({ securityId: '', date: '', initials: user.initials || generateInitials(user.name) });
      loadEntries();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const openSignModal = (securityId, date) => {
    setSignData({ securityId, date, initials: user.initials || generateInitials(user.name) });
    setShowSignModal(true);
  };

  const groupEntriesByGuardAndDate = () => {
    const grouped = {};
    entries.forEach(entry => {
      const key = `${entry.securityId._id}-${entry.date}`;
      if (!grouped[key]) {
        grouped[key] = {
          securityId: entry.securityId,
          date: entry.date,
          entries: []
        };
      }
      grouped[key].entries.push(entry);
    });
    return Object.values(grouped);
  };

  const groupedEntries = isSecurityAdmin ? groupEntriesByGuardAndDate() : null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.viewEntriesButton} onPress={() => setShowEntries(true)}>
          <Text style={styles.viewEntriesButtonText}>{isSecurityAdmin ? 'View All Entries' : 'View My Entries'}</Text>
        </TouchableOpacity>

        {!isSecurityAdmin && (
          <>
            <Text style={styles.sectionTitle}>Create New Entry</Text>

            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              value={form.date}
              onChangeText={(t) => setForm({ ...form, date: t })}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Time *</Text>
            <TextInput
              style={styles.input}
              value={form.time}
              onChangeText={(t) => setForm({ ...form, time: t })}
              placeholder="HH:MM"
            />

            <Text style={styles.label}>Site *</Text>
            <Picker
              selectedValue={form.site}
              onValueChange={(v) => fetchNextEntryNumber(v)}
            >
              <Picker.Item label="Select site" value="" color="grey" />
              {SITES.map(s => <Picker.Item key={s} label={s} value={s} />)}
            </Picker>

            <Text style={styles.label}>Entry Number *</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={form.entryNumber}
              editable={false}
              placeholder="Auto-generated"
            />

            <Text style={styles.label}>Occurrence *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.occurrence}
              onChangeText={(t) => setForm({ ...form, occurrence: t })}
              placeholder="Describe the occurrence..."
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Entry'}</Text>
            </TouchableOpacity>
          </>
        )}

        {isSecurityAdmin && (
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Filters</Text>
            <Text style={styles.label}>Security Guard</Text>
            <Picker
              selectedValue={selectedGuard}
              onValueChange={setSelectedGuard}
            >
              <Picker.Item label="All Guards" value="" />
              {guards.map(g => <Picker.Item key={g._id} label={g.name} value={g._id} />)}
            </Picker>

            <Text style={styles.label}>Site</Text>
            <Picker
              selectedValue={selectedSite}
              onValueChange={setSelectedSite}
            >
              <Picker.Item label="All Sites" value="" />
              {SITES.map(s => <Picker.Item key={s} label={s} value={s} />)}
            </Picker>
          </View>
        )}
      </ScrollView>

      <Modal visible={showEntries} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>My OB Entries</Text>
            <TouchableOpacity onPress={() => setShowEntries(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateFilter}>
            <Text style={styles.label}>Filter by Date:</Text>
            <TextInput
              style={styles.input}
              value={selectedDate}
              onChangeText={setSelectedDate}
              placeholder="YYYY-MM-DD"
            />
            <TouchableOpacity style={styles.filterButton} onPress={loadEntries}>
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.entriesList}>
            {entries.length === 0 ? (
              <Text style={styles.noEntries}>No entries for this date</Text>
            ) : isSecurityAdmin ? (
              groupedEntries.map((group, idx) => (
                <View key={idx} style={styles.groupCard}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupGuard}>{group.securityId.name}</Text>
                    <Text style={styles.groupDate}>{formatDate(group.date)}</Text>
                  </View>
                  
                  {group.entries.map((entry) => (
                    <View key={entry._id} style={styles.entryCard}>
                      <Text style={styles.entryTime}>{formatTime(entry.time)} - Entry #{entry.entryNumber}</Text>
                      <Text style={styles.entrySite}>{entry.site}</Text>
                      <Text style={styles.entryOccurrence}>{entry.occurrence}</Text>
                      <Text style={styles.entryInitials}>Security: {entry.securityInitials}</Text>
                      
                      {entry.adminSignatures && entry.adminSignatures.length > 0 && (
                        <View style={styles.signaturesSection}>
                          <Text style={styles.signaturesTitle}>Signed by:</Text>
                          {entry.adminSignatures.map((sig, sigIdx) => (
                            <Text key={sigIdx} style={styles.signature}>
                              {sig.adminInitials} ({sig.adminId?.name || 'Unknown'})
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}

                  <TouchableOpacity
                    style={styles.signButton}
                    onPress={() => openSignModal(group.securityId._id, group.date)}
                  >
                    <Text style={styles.signButtonText}>Sign Off</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              entries.map((entry) => (
                <View key={entry._id} style={styles.entryCard}>
                  <Text style={styles.entryDate}>{formatDate(entry.date)} at {formatTime(entry.time)}</Text>
                  <Text style={styles.entryNumber}>Entry #{entry.entryNumber}</Text>
                  <Text style={styles.entrySite}>Site: {entry.site}</Text>
                  <Text style={styles.entryOccurrence}>{entry.occurrence}</Text>
                  <Text style={styles.entryInitials}>Signed: {entry.securityInitials}</Text>
                  
                  {entry.adminSignatures && entry.adminSignatures.length > 0 && (
                    <View style={styles.signaturesSection}>
                      <Text style={styles.signaturesTitle}>Admin Signatures:</Text>
                      {entry.adminSignatures.map((sig, idx) => (
                        <Text key={idx} style={styles.signature}>
                          {sig.adminInitials} - {new Date(sig.signedAt).toLocaleString()}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {showSignModal && (
        <Modal visible={showSignModal} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sign Off Entries</Text>
              <TouchableOpacity onPress={() => setShowSignModal(false)}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.label}>Your Initials</Text>
              <TextInput
                style={styles.input}
                value={signData.initials}
                onChangeText={(t) => setSignData({ ...signData, initials: t })}
                placeholder="Enter your initials"
              />

              <Text style={styles.infoText}>
                You are signing off all entries for this guard on {formatDate(signData.date)}
              </Text>

              <TouchableOpacity style={styles.button} onPress={handleSignOff} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Signing...' : 'Sign Off'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  viewEntriesButton: { backgroundColor: '#3498db', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  viewEntriesButtonText: { color: '#fff', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15 },
  disabledInput: { backgroundColor: '#f0f0f0' },
  textArea: { height: 100, textAlignVertical: 'top' },
  label: { fontWeight: 'bold', marginBottom: 5 },
  button: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  closeButton: { color: '#3498db', fontSize: 16 },
  dateFilter: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 10 },
  filterButton: { backgroundColor: '#3498db', padding: 10, borderRadius: 8 },
  filterButtonText: { color: '#fff', fontWeight: 'bold' },
  entriesList: { flex: 1, padding: 20 },
  noEntries: { textAlign: 'center', color: '#999', marginTop: 50 },
  entryCard: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  entryDate: { fontWeight: 'bold', color: '#2c3e50' },
  entryNumber: { color: '#3498db', fontWeight: 'bold', marginTop: 5 },
  entrySite: { color: '#666', marginTop: 5 },
  entryOccurrence: { marginTop: 10, lineHeight: 20 },
  entryInitials: { marginTop: 10, fontStyle: 'italic', color: '#666' },
  signaturesSection: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#ddd' },
  signaturesTitle: { fontWeight: 'bold', color: '#2c3e50' },
  signature: { color: '#27ae60', marginTop: 5 },
  filterSection: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 20 },
  groupCard: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  groupGuard: { fontWeight: 'bold', fontSize: 16, color: '#2c3e50' },
  groupDate: { color: '#666' },
  entryTime: { fontWeight: 'bold', color: '#2c3e50' },
  signButton: { backgroundColor: '#27ae60', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  signButtonText: { color: '#fff', fontWeight: 'bold' },
  modalContent: { padding: 20 },
  infoText: { color: '#666', marginVertical: 20, textAlign: 'center' }
});
