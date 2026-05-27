import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, RefreshControl, Alert, FlatList
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayVisitors } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

export default function ReceptionScreen({ navigation }) {
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Stats
  const totalToday = visitors.length;
  const checkedIn = visitors.filter(v => v.status === 'active').length;
  const checkedOut = visitors.filter(v => v.status === 'completed').length;
  const yetToCheckOut = checkedIn; // same as active

  useEffect(() => {
    loadVisitors();
    const socket = connectSocket();
    socket.on('visitor_registered', loadVisitors);
    socket.on('visitor_checked_out', loadVisitors);
    return () => {
      socket.off('visitor_registered');
      socket.off('visitor_checked_out');
      disconnectSocket();
    };
  }, []);

  const loadVisitors = async () => {
    try {
      const res = await getTodayVisitors();
      setVisitors(res.data);
      setFilteredVisitors(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load visitors');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVisitors();
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (!text.trim()) {
      setFilteredVisitors(visitors);
    } else {
      const lower = text.toLowerCase();
      const filtered = visitors.filter(v =>
        v.firstName.toLowerCase().includes(lower) ||
        v.surname.toLowerCase().includes(lower) ||
        v.ticketNumber.toLowerCase().includes(lower)
      );
      setFilteredVisitors(filtered);
    }
  };

  // Logout button
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
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  // Render each visitor row as a card (since FlatList on mobile is easier to read)
  const renderVisitorItem = ({ item }) => (
    <View style={styles.rowCard}>
      <View style={styles.row}>
        <Text style={styles.cellName}>{item.firstName} {item.surname}</Text>
        <Text style={[styles.cellStatus, item.status === 'active' ? styles.statusIn : styles.statusOut]}>
          {item.status === 'active' ? 'In' : 'Out'}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.cellLabel}>Purpose:</Text>
        <Text style={styles.cellValue}>{item.purpose}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.cellLabel}>Entry:</Text>
        <Text style={styles.cellValue}>{new Date(item.timeIn).toLocaleTimeString()}</Text>
        <Text style={styles.cellLabel}>Exit:</Text>
        <Text style={styles.cellValue}>{item.timeOut ? new Date(item.timeOut).toLocaleTimeString() : '—'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.cellLabel}>To Meet:</Text>
        <Text style={styles.cellValue}>{item.personToVisit} {item.personToVisitOther ? `(${item.personToVisitOther})` : ''}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalToday}</Text>
            <Text style={styles.statLabel}>Today's visitors</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{checkedIn}</Text>
            <Text style={styles.statLabel}>Checked In</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{checkedOut}</Text>
            <Text style={styles.statLabel}>Checked out</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{yetToCheckOut}</Text>
            <Text style={styles.statLabel}>Yet To Check out</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ticket number"
            placeholderTextColor="#95a5a6"
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>

        {/* Visitor List as FlatList inside ScrollView (nested, but fine for small lists) */}
        <FlatList
          data={filteredVisitors}
          keyExtractor={item => item._id}
          renderItem={renderVisitorItem}
          scrollEnabled={false} // let outer ScrollView handle scrolling
          ListEmptyComponent={<Text style={styles.emptyText}>No visitors today</Text>}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 25,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#34495e',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 15,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 8,
  },
  headerCell: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  rowCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 6,
    padding: 12,
    borderRadius: 10,
    elevation: 1,
    borderWidth: 0.5,
    borderColor: '#ecf0f1',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  cellName: {
    flex: 2,
    fontWeight: 'bold',
    fontSize: 15,
    color: '#2c3e50',
  },
  cellStatus: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusIn: {
    backgroundColor: '#d5f5e3',
    color: '#27ae60',
  },
  statusOut: {
    backgroundColor: '#fadbd8',
    color: '#e74c3c',
  },
  cellLabel: {
    width: 70,
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  cellValue: {
    flex: 1,
    fontSize: 13,
    color: '#2c3e50',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#95a5a6',
    fontSize: 16,
  },
});