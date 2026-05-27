import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, StyleSheet, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllVisitors, recordTimeOut, cancelVisitor, editVisitor, deleteVisitor } from '../services/api';

const SITES = ['head office', 'phase I', 'phase II', 'phase III', 'phase IV', 'phase V', 'phase VI', 'phase VII', 'phase VIII', 'phase IX', 'phase X', 'phase XI', 'phase XII', 'the gate', '2 acres'];
const HEAD_OFFICE_OPTIONS = ['IT Department', 'Mr Khumalo', 'Manager', 'Other'];

export default function AllVisitorsScreen() {
  const [visitors, setVisitors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    loadVisitors();
    loadUserRole();
  }, []);

  const loadVisitors = async () => {
    try {
      const res = await getAllVisitors();
      setVisitors(res.data);
      setFiltered(res.data);
    } catch (err) { Alert.alert('Error', 'Failed to load'); }
  };

  const loadUserRole = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (!text) setFiltered(visitors);
    else setFiltered(visitors.filter(v => v.firstName.includes(text) || v.surname.includes(text) || v.ticketNumber.includes(text)));
  };

  const handleTimeout = async (id) => {
    Alert.alert('Confirm', 'Record time-out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: async () => { await recordTimeOut(id); loadVisitors(); } }
    ]);
  };

  const handleCancel = async (id) => {
    Alert.alert('Confirm', 'Cancel this visitor?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: async () => { await cancelVisitor(id); loadVisitors(); } }
    ]);
  };

  const handleEdit = (visitor) => {
    setSelectedVisitor(visitor);
    setEditMode(true);
    setEditForm({ ...visitor });
    setModalVisible(true);
  };

  const handleDelete = async (id, name) => {
    Alert.alert('Delete', `Delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: async () => { await deleteVisitor(id); loadVisitors(); } }
    ]);
  };

  const saveEdit = async () => {
    try {
      await editVisitor(selectedVisitor._id, editForm);
      Alert.alert('Success', 'Visitor updated');
      setModalVisible(false);
      loadVisitors();
    } catch (err) { Alert.alert('Error', err.response?.data?.msg || 'Update failed'); }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.firstName} {item.surname}</Text>
        <View style={styles.actionIcons}>
          <TouchableOpacity onPress={() => handleEdit(item)}><MaterialIcons name="edit" size={22} color="#3498db" /></TouchableOpacity>
          {userRole === 'admin' && (
            <TouchableOpacity onPress={() => handleDelete(item._id, item.firstName)}><MaterialIcons name="delete" size={22} color="#e74c3c" /></TouchableOpacity>
          )}
        </View>
      </View>
      <Text>Ticket: {item.ticketNumber} | Site: {item.site}</Text>
      <Text>Time In: {new Date(item.timeIn).toLocaleString()}</Text>
      <Text>Time Out: {item.timeOut ? new Date(item.timeOut).toLocaleString() : '—'}</Text>
      <Text>Status: {item.status}</Text>
      <View style={styles.rowActions}>
        {item.status === 'active' && (
          <>
            <TouchableOpacity onPress={() => handleTimeout(item._id)}><MaterialIcons name="exit-to-app" size={22} color="#e67e22" /></TouchableOpacity>
            <TouchableOpacity onPress={() => handleCancel(item._id)}><MaterialIcons name="cancel" size={22} color="#e74c3c" /></TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput style={styles.search} placeholder="Search by name or ticket" value={search} onChangeText={handleSearch} />
      <FlatList data={filtered} keyExtractor={item => item._id} renderItem={renderItem} />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>{editMode ? 'Edit Visitor' : 'Visitor Details'}</Text>
            {selectedVisitor && (
              <>
                {editMode ? (
                  <>
                    <TextInput style={styles.input} placeholder="First Name" value={editForm.firstName} onChangeText={t => setEditForm({...editForm, firstName: t})} />
                    <TextInput style={styles.input} placeholder="Surname" value={editForm.surname} onChangeText={t => setEditForm({...editForm, surname: t})} />
                    <TextInput style={styles.input} placeholder="National ID" value={editForm.nationalId} onChangeText={t => setEditForm({...editForm, nationalId: t})} />
                    <TextInput style={styles.input} placeholder="Phone" value={editForm.phoneNumber} onChangeText={t => setEditForm({...editForm, phoneNumber: t})} />
                    <TextInput style={styles.input} placeholder="Address" value={editForm.address} onChangeText={t => setEditForm({...editForm, address: t})} />
                    <TextInput style={styles.input} placeholder="Vehicle Reg" value={editForm.vehicleReg} onChangeText={t => setEditForm({...editForm, vehicleReg: t})} />
                    <Text style={styles.label}>Site</Text>
                    <Picker selectedValue={editForm.site} onValueChange={v => setEditForm({...editForm, site: v})}>
                      <Picker.Item label="Select site" value="" color="grey" />
                      {SITES.map(s => <Picker.Item key={s} label={s} value={s} />)}
                    </Picker>
                    {editForm.site === 'head office' && (
                      <>
                        <Text style={styles.label}>Person to Visit</Text>
                        <Picker selectedValue={editForm.personToVisit} onValueChange={v => setEditForm({...editForm, personToVisit: v})}>
                          <Picker.Item label="Select" value="" color="grey" />
                          {HEAD_OFFICE_OPTIONS.map(opt => <Picker.Item key={opt} label={opt} value={opt} />)}
                        </Picker>
                        {editForm.personToVisit === 'Other' && (
                          <TextInput style={styles.input} placeholder="Specify other" value={editForm.personToVisitOther} onChangeText={t => setEditForm({...editForm, personToVisitOther: t})} />
                        )}
                      </>
                    )}
                    <TextInput style={styles.input} placeholder="Purpose" value={editForm.purpose} onChangeText={t => setEditForm({...editForm, purpose: t})} multiline />
                    <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}><Text style={styles.saveBtnText}>Save Changes</Text></TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text>Name: {selectedVisitor.firstName} {selectedVisitor.surname}</Text>
                    <Text>National ID: {selectedVisitor.nationalId}</Text>
                    <Text>Phone: {selectedVisitor.phoneNumber}</Text>
                    <Text>Address: {selectedVisitor.address}</Text>
                    <Text>Vehicle: {selectedVisitor.vehicleReg}</Text>
                    <Text>Site: {selectedVisitor.site}</Text>
                    <Text>Person to Visit: {selectedVisitor.personToVisit} {selectedVisitor.personToVisitOther}</Text>
                    <Text>Purpose: {selectedVisitor.purpose}</Text>
                    <Text>Time In: {new Date(selectedVisitor.timeIn).toLocaleString()}</Text>
                    <Text>Time Out: {selectedVisitor.timeOut ? new Date(selectedVisitor.timeOut).toLocaleString() : '—'}</Text>
                    <Text>Status: {selectedVisitor.status}</Text>
                  </>
                )}
                <TouchableOpacity style={styles.closeBtn} onPress={() => { setModalVisible(false); setEditMode(false); }}><Text>Close</Text></TouchableOpacity>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  search: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: 'bold', fontSize: 16 },
  actionIcons: { flexDirection: 'row', gap: 15 },
  rowActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginVertical: 5 },
  label: { fontWeight: 'bold', marginTop: 5 },
  saveBtn: { backgroundColor: '#2ecc71', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  closeBtn: { marginTop: 20, backgroundColor: '#3498db', padding: 10, borderRadius: 8, alignItems: 'center' },
});