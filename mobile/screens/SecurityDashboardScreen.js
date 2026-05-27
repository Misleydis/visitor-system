import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayVisitors, getAllVisitors } from '../services/api';   // fixed path

export default function SecurityDashboardScreen({ navigation }) {
  const [todayVisitors, setTodayVisitors] = useState([]);
  const [allVisitors, setAllVisitors] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [securityName, setSecurityName] = useState('');

  useEffect(() => {
    loadUser();
    loadData();
  }, []);

  const loadUser = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setSecurityName(user.name);
    }
  };

  const getUser = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  };

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  };

  const loadData = async () => {
    try {
      const todayRes = await getTodayVisitors();
      const allRes = await getAllVisitors();
      setTodayVisitors(todayRes.data || []);
      setAllVisitors(allRes.data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const totalToday = todayVisitors.length;
  const siteCounts = {};
  todayVisitors.forEach(v => { siteCounts[v.site] = (siteCounts[v.site] || 0) + 1; });
  const mostVisitedSite = Object.keys(siteCounts).length ? Object.keys(siteCounts).reduce((a, b) => siteCounts[a] > siteCounts[b] ? a : b) : 'None';
  const nationalIdCounts = {};
  allVisitors.forEach(v => { nationalIdCounts[v.nationalId] = (nationalIdCounts[v.nationalId] || 0) + 1; });
  const returningCount = Object.values(nationalIdCounts).filter(c => c > 1).length;
  const recentVisitors = [...todayVisitors].sort((a, b) => new Date(b.timeIn) - new Date(a.timeIn)).slice(0, 5);

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

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome to Mzinyathi Gardens</Text>
        <Text style={styles.welcomeSubtitle}>The cradle of ubuntu lokubambana</Text>
        <Text style={styles.securityName}>Security: {securityName}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <MaterialIcons name="people" size={32} color="#3498db" />
          <Text style={styles.statValue}>{totalToday}</Text>
          <Text style={styles.statLabel}>Visitors Today</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="location-on" size={32} color="#f39c12" />
          <Text style={styles.statValue}>{mostVisitedSite}</Text>
          <Text style={styles.statLabel}>Most Visited Site</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="repeat" size={32} color="#2ecc71" />
          <Text style={styles.statValue}>{returningCount}</Text>
          <Text style={styles.statLabel}>Returning Visitors</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Visitors</Text>
      {recentVisitors.map(v => (
        <View key={v._id} style={styles.recentCard}>
          <Text style={styles.recentName}>{v.firstName} {v.surname}</Text>
          <Text>{v.ticketNumber} - {v.site}</Text>
          <Text>{new Date(v.timeIn).toLocaleTimeString()}</Text>
        </View>
      ))}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('RegisterVisitor')}>
          <MaterialIcons name="person-add" size={24} color="#fff" />
          <Text style={styles.navBtnText}>Register Visitor</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('AllVisitors')}>
          <MaterialIcons name="list" size={24} color="#fff" />
          <Text style={styles.navBtnText}>All Visitors</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('ReturningVisitors')}>
          <MaterialIcons name="history" size={24} color="#fff" />
          <Text style={styles.navBtnText}>Returning</Text>
        </TouchableOpacity>
      </View>

      {/* OB button for security and security admin */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.navBtn, styles.obBtn]} onPress={async () => {
          const user = await getUser();
          navigation.navigate('OccurrenceBook', { user });
        }}>
          <MaterialIcons name="book" size={24} color="#fff" />
          <Text style={styles.navBtnText}>OB</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  welcomeCard: { backgroundColor: '#2c3e50', padding: 20, marginBottom: 15, alignItems: 'center' },
  welcomeTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  welcomeSubtitle: { fontSize: 14, color: '#bdc3c7', marginTop: 5, textAlign: 'center' },
  securityName: { fontSize: 16, color: '#ecf0f1', marginTop: 10 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  statCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', flex: 0.31, elevation: 2 },
  statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 5, color: '#2c3e50' },
  statLabel: { fontSize: 12, color: '#7f8c8d', textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', margin: 15, color: '#34495e' },
  recentCard: { backgroundColor: '#fff', padding: 12, marginHorizontal: 15, marginBottom: 8, borderRadius: 8, elevation: 1 },
  recentName: { fontWeight: 'bold', fontSize: 16 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20, paddingHorizontal: 10 },
  navBtn: { backgroundColor: '#3498db', padding: 12, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 0.3 },
  navBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  obBtn: { backgroundColor: '#9b59b6', flex: 0.4 }
});