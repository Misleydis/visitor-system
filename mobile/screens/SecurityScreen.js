import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerVisitor, getTodayVisitors, recordTimeOut } from '../services/api';

export default function SecurityScreen({ navigation }) {
  const [form, setForm] = useState({
    firstName: '', surname: '', nationalId: '', phoneNumber: '',
    address: '', vehicleReg: '', department: '', personToVisit: '', purpose: ''
  });
  const [loading, setLoading] = useState(false);
  const [todayVisitors, setTodayVisitors] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
          <MaterialIcons name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  const loadTodayVisitors = async () => {
    try {
      const res = await getTodayVisitors();
      setTodayVisitors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTodayVisitors();
  }, []);

  const handleRegister = async () => {
    for (let key in form) {
      if (key !== 'vehicleReg' && !form[key]) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }
    }
    setLoading(true);
    try {
      await registerVisitor(form);
      Alert.alert('Success', 'Visitor registered & SMS sent');
      setForm({
        firstName: '', surname: '', nationalId: '', phoneNumber: '',
        address: '', vehicleReg: '', department: '', personToVisit: '', purpose: ''
      });
      loadTodayVisitors();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeOut = async (id, name) => {
    Alert.alert('Time Out', `Record time-out for ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await recordTimeOut(id);
            loadTodayVisitors();
            Alert.alert('Success', 'Time-out recorded');
          } catch (err) {
            Alert.alert('Error', 'Failed to record time-out');
          }
        }
      }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Register New Visitor</Text>
      <TextInput style={styles.input} placeholder="First Name" value={form.firstName} onChangeText={t => setForm({ ...form, firstName: t })} />
      <TextInput style={styles.input} placeholder="Surname" value={form.surname} onChangeText={t => setForm({ ...form, surname: t })} />
      <TextInput style={styles.input} placeholder="National ID" value={form.nationalId} onChangeText={t => setForm({ ...form, nationalId: t })} />
      <TextInput style={styles.input} placeholder="Phone Number" value={form.phoneNumber} onChangeText={t => setForm({ ...form, phoneNumber: t })} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Address" value={form.address} onChangeText={t => setForm({ ...form, address: t })} />
      <TextInput style={styles.input} placeholder="Vehicle Registration (optional)" value={form.vehicleReg} onChangeText={t => setForm({ ...form, vehicleReg: t })} />
      <TextInput style={styles.input} placeholder="Department" value={form.department} onChangeText={t => setForm({ ...form, department: t })} />
      <TextInput style={styles.input} placeholder="Person to Visit" value={form.personToVisit} onChangeText={t => setForm({ ...form, personToVisit: t })} />
      <TextInput style={styles.input} placeholder="Purpose" value={form.purpose} onChangeText={t => setForm({ ...form, purpose: t })} />
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register & Send SMS</Text>}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Today's Visitors</Text>
      {todayVisitors.map(v => (
        <View key={v._id} style={styles.card}>
          <Text style={styles.name}>{v.firstName} {v.surname} - {v.ticketNumber}</Text>
          <Text>To: {v.personToVisit} ({v.department})</Text>
          <Text>Time In: {new Date(v.timeIn).toLocaleTimeString()}</Text>
          {v.timeOut ? (
            <Text>Time Out: {new Date(v.timeOut).toLocaleTimeString()}</Text>
          ) : (
            <TouchableOpacity style={styles.timeoutBtn} onPress={() => handleTimeOut(v._id, v.firstName)}>
              <Text style={styles.timeoutText}>Record Time Out</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginVertical: 15, color: '#2c3e50' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  name: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  timeoutBtn: { backgroundColor: '#e67e22', padding: 8, borderRadius: 5, marginTop: 8, alignItems: 'center' },
  timeoutText: { color: '#fff', fontWeight: 'bold' },
});