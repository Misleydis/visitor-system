import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { getActivityLogs } from '../services/api';

export default function ActivityLogScreen() {
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    try {
      const res = await getActivityLogs();
      setLogs(res.data);
    } catch (err) { console.error(err); }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.action}>{item.action}</Text>
      <Text>User: {item.userName} ({item.userRole})</Text>
      <Text>Details: {item.details}</Text>
      <Text style={styles.time}>{new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  );

  return (
    <FlatList
      data={logs}
      keyExtractor={item => item._id}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, elevation: 1 },
  action: { fontWeight: 'bold', fontSize: 16, color: '#2c3e50' },
  time: { fontSize: 11, color: '#7f8c8d', marginTop: 5 },
});