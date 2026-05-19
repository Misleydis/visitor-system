import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { getVisitorByTicket } from '../services/api';

export default function ReceptionScreen() {
  const [ticketNumber, setTicketNumber] = useState('');
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!ticketNumber) { Alert.alert('Error', 'Enter ticket number'); return; }
    setLoading(true);
    try {
      const res = await getVisitorByTicket(ticketNumber);
      setVisitor(res.data);
    } catch (err) {
      Alert.alert('Not Found', 'Visitor not found');
      setVisitor(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Visitor</Text>
      <TextInput style={styles.input} placeholder="Enter Ticket Number (e.g., V001)" value={ticketNumber} onChangeText={setTicketNumber} autoCapitalize="characters" />
      <TouchableOpacity style={styles.button} onPress={handleSearch} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Search</Text>}
      </TouchableOpacity>

      {visitor && (
        <View style={styles.card}>
          <Text style={styles.name}>{visitor.firstName} {visitor.surname}</Text>
          <Text>Ticket: {visitor.ticketNumber}</Text>
          <Text>National ID: {visitor.nationalId}</Text>
          <Text>Phone: {visitor.phoneNumber}</Text>
          <Text>Visiting: {visitor.personToVisit} ({visitor.department})</Text>
          <Text>Purpose: {visitor.purpose}</Text>
          <Text>Time In: {new Date(visitor.timeIn).toLocaleString()}</Text>
          <Text style={visitor.timeOut ? styles.completed : styles.active}>
            Status: {visitor.timeOut ? 'Completed' : 'Active'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2c3e50' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#3498db', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginTop: 20, elevation: 3 },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#2c3e50' },
  active: { color: '#27ae60', fontWeight: 'bold', marginTop: 10 },
  completed: { color: '#c0392b', fontWeight: 'bold', marginTop: 10 }
});