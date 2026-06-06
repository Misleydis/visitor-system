import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, RefreshControl, TextInput
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllVisitors, getTodayVisitors } from '../services/api';

export default function AdminVisitorsScreen({ navigation }) {
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (err) {
      console.error('Error loading user:', err);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
          <MaterialIcons name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const loadData = async () => {
    setLoading(true);
    try {
      const visitorsRes = await getAllVisitors();
      setVisitors(visitorsRes.data);
      setFilteredVisitors(visitorsRes.data);
    } catch (err) {
      console.error('Error loading visitors:', err);
      Alert.alert('Error', 'Failed to load visitors: ' + (err.response?.data?.msg || err.message));
    }
    setLoading(false);
  };

  useEffect(() => { 
    loadUser(); 
    loadData(); 
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = visitors.filter(v => 
        v.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVisitors(filtered);
    } else {
      setFilteredVisitors(visitors);
    }
  }, [searchQuery, visitors]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search visitors..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredVisitors.map(v => (
          <View key={v._id} style={styles.visitorCard}>
            <View style={styles.visitorHeader}>
              <View>
                <Text style={styles.visitorName}>{v.firstName} {v.surname}</Text>
                <Text style={styles.visitorTicket}>Ticket: {v.ticketNumber}</Text>
              </View>
              <Text style={v.timeOut ? styles.completedBadge : styles.activeBadge}>
                {v.timeOut ? 'Completed' : 'Active'}
              </Text>
            </View>
            <View style={styles.visitorDetails}>
              <Text style={styles.visitorInfo}>Email: {v.email || 'N/A'}</Text>
              <Text style={styles.visitorInfo}>ID: {v.nationalId}</Text>
              <Text style={styles.visitorInfo}>Phone: {v.phoneNumber}</Text>
              <Text style={styles.visitorInfo}>Site: {v.site}</Text>
              <Text style={styles.visitorInfo}>To Meet: {v.personToVisit}</Text>
              <Text style={styles.visitorInfo}>Purpose: {v.purpose}</Text>
              <Text style={styles.visitorInfo}>Time In: {new Date(v.timeIn).toLocaleString()}</Text>
              <Text style={styles.visitorInfo}>Time Out: {v.timeOut ? new Date(v.timeOut).toLocaleString() : '—'}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 15, fontSize: 16 },
  scrollView: { flex: 1 },
  visitorCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, margin: 10, elevation: 2 },
  visitorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  visitorName: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  visitorTicket: { fontSize: 14, color: '#7f8c8d', marginTop: 2 },
  visitorDetails: { marginTop: 10 },
  visitorInfo: { fontSize: 14, color: '#7f8c8d', marginTop: 4 },
  activeBadge: { backgroundColor: '#2ecc71', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, color: '#fff', fontWeight: 'bold', fontSize: 12 },
  completedBadge: { backgroundColor: '#95a5a6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, color: '#fff', fontWeight: 'bold', fontSize: 12 },
});
