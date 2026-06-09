import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { getReturningVisitors } from '../services/api';   // fixed path

export default function ReturningVisitorsScreen() {
  const [returning, setReturning] = useState([]);

  useEffect(() => {
    loadReturning();
  }, []);

  const loadReturning = async () => {
    try {
      const res = await getReturningVisitors();
      setReturning(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.id}>National ID: {item._id}</Text>
      <Text>Visits: {item.count}</Text>
      <Text>Last visit: {new Date(item.visits[0].timeIn).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList data={returning} keyExtractor={item => item._id} renderItem={renderItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 },
  id: { fontWeight: 'bold' }
});