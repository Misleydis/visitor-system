import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE } from '../services/api';

export default function MyOccurrenceEntries({ route, navigation }) {
  const { user } = route.params;
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE}/occurrence-book/my-entries`, {
        headers: { 'x-auth-token': token }
      });
      setEntries(response.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load entries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadEntries();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>My OB Entries</Text>
        <Text style={styles.subtitle}>{user.name}</Text>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="book" size={64} color="#bdc3c7" />
          <Text style={styles.emptyText}>No entries yet</Text>
        </View>
      ) : (
        entries.map((entry) => (
          <View key={entry._id} style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <View>
                <Text style={styles.entryNumber}>Entry #{entry.entryNumber}</Text>
                <Text style={styles.entryDate}>
                  {new Date(entry.date).toLocaleDateString()} at {entry.time}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: entry.adminSignatures?.length > 0 ? '#2ecc71' : '#f39c12' }]}>
                <Text style={styles.statusText}>
                  {entry.adminSignatures?.length > 0 ? 'Signed' : 'Pending'}
                </Text>
              </View>
            </View>
            <Text style={styles.occurrence}>{entry.occurrence}</Text>
            <Text style={styles.site}>Site: {entry.site}</Text>
            <Text style={styles.initials}>Initials: {entry.securityInitials}</Text>
            
            {entry.adminSignatures && entry.adminSignatures.length > 0 && (
              <View style={styles.signaturesSection}>
                <Text style={styles.signaturesTitle}>Admin Signatures:</Text>
                {entry.adminSignatures.map((sig, index) => (
                  <View key={index} style={styles.signatureItem}>
                    <Text style={styles.signatureText}>
                      {sig.adminInitials} - {new Date(sig.signedAt).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0a1929',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#bdc3c7',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 20,
  },
  entryCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  entryDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  occurrence: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 8,
  },
  site: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  initials: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  signaturesSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  signaturesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  signatureItem: {
    marginBottom: 3,
  },
  signatureText: {
    fontSize: 12,
    color: '#27ae60',
  },
});
