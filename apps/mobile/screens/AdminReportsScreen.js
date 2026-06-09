import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, RefreshControl, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getAllVisitors, getTodayVisitors } from '../services/api';

export default function AdminReportsScreen({ navigation, hideHeader }) {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
    if (hideHeader) return;
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
          <MaterialIcons name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, hideHeader]);

  const loadData = async () => {
    setLoading(true);
    try {
      const visitorsRes = await getAllVisitors();
      setVisitors(visitorsRes.data);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const exportToPDF = async () => {
    if (visitors.length === 0) {
      Alert.alert('No Data', 'No visitors to export.');
      return;
    }

    const tableRows = visitors.map(v => `
      <tr>
        <td>${v.ticketNumber}</td>
        <td>${v.firstName} ${v.surname}</td>
        <td>${v.nationalId}</td>
        <td>${v.phoneNumber}</td>
        <td>${v.address || ''}</td>
        <td>${v.vehicleReg || ''}</td>
        <td>${v.site}</td>
        <td>${v.personToVisit}</td>
        <td>${new Date(v.timeIn).toLocaleString()}</td>
        <td>${v.timeOut ? new Date(v.timeOut).toLocaleString() : 'Still active'}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Visitor Report</title>
      <style>
        @page { size: landscape; margin: 10mm; }
        body { font-family: Arial, sans-serif; padding: 10px; font-size: 10px; }
        h1 { text-align: center; color: #2c3e50; font-size: 16px; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9px; }
        th, td { border: 1px solid #ddd; padding: 4px; text-align: left; word-wrap: break-word; }
        th { background-color: #3498db; color: white; font-size: 9px; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .footer { text-align: center; margin-top: 20px; font-size: 8px; color: #7f8c8d; }
      </style>
      </head>
      <body>
        <h1>Visitor Management System – Full Report</h1>
        <p style="font-size: 9px;">Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead><tr><th>Ticket</th><th>Name</th><th>National ID</th><th>Phone</th><th>Address</th><th>Vehicle Reg</th><th>Site</th><th>Host</th><th>Time In</th><th>Time Out</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
        <div class="footer">Smart Visitor Management System – Confidential</div>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save Visitor Report',
        UTI: 'com.adobe.pdf'
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Export Failed', 'Could not generate or share PDF.');
    }
  };

  const exportTodayToPDF = async () => {
    const today = new Date().toISOString().split('T')[0];
    const todayVisitors = visitors.filter(v => v.timeIn.startsWith(today));

    if (todayVisitors.length === 0) {
      Alert.alert('No Data', 'No visitors today to export.');
      return;
    }

    const tableRows = todayVisitors.map(v => `
      <tr>
        <td>${v.ticketNumber}</td>
        <td>${v.firstName} ${v.surname}</td>
        <td>${v.nationalId}</td>
        <td>${v.phoneNumber}</td>
        <td>${v.site}</td>
        <td>${v.personToVisit}</td>
        <td>${new Date(v.timeIn).toLocaleString()}</td>
        <td>${v.timeOut ? new Date(v.timeOut).toLocaleString() : 'Still active'}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Today's Visitor Report</title>
      <style>
        @page { size: landscape; margin: 10mm; }
        body { font-family: Arial, sans-serif; padding: 10px; font-size: 10px; }
        h1 { text-align: center; color: #2c3e50; font-size: 16px; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9px; }
        th, td { border: 1px solid #ddd; padding: 4px; text-align: left; word-wrap: break-word; }
        th { background-color: #3498db; color: white; font-size: 9px; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .footer { text-align: center; margin-top: 20px; font-size: 8px; color: #7f8c8d; }
      </style>
      </head>
      <body>
        <h1>Visitor Management System – Today's Report</h1>
        <p style="font-size: 9px;">Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead><tr><th>Ticket</th><th>Name</th><th>National ID</th><th>Phone</th><th>Site</th><th>Host</th><th>Time In</th><th>Time Out</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
        <div class="footer">Smart Visitor Management System – Confidential</div>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save Today\'s Report',
        UTI: 'com.adobe.pdf'
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Export Failed', 'Could not generate or share PDF.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <TouchableOpacity style={styles.reportBtn} onPress={exportToPDF}>
        <MaterialIcons name="picture-as-pdf" size={24} color="#fff" />
        <Text style={styles.reportBtnText}>Export Full Report</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.reportBtn, styles.reportBtnSecondary]} onPress={exportTodayToPDF}>
        <MaterialIcons name="today" size={24} color="#fff" />
        <Text style={styles.reportBtnText}>Export Today's Report</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Report Statistics</Text>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{visitors.length}</Text>
            <Text style={styles.statLabel}>Total Visitors</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{visitors.filter(v => !v.timeOut).length}</Text>
            <Text style={styles.statLabel}>Active Visitors</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{visitors.filter(v => v.timeOut).length}</Text>
            <Text style={styles.statLabel}>Completed Visits</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        {visitors.slice(0, 5).map(v => (
          <View key={v._id} style={styles.activityRow}>
            <View style={styles.activityIcon}>
              <MaterialIcons name={v.timeOut ? "check-circle" : "person"} size={20} color={v.timeOut ? "#2ecc71" : "#3498db"} />
            </View>
            <View style={styles.activityDetails}>
              <Text style={styles.activityName}>{v.firstName} {v.surname}</Text>
              <Text style={styles.activityTime}>{new Date(v.timeIn).toLocaleString()}</Text>
            </View>
            <Text style={v.timeOut ? styles.completedBadge : styles.activeBadge}>
              {v.timeOut ? 'Completed' : 'Active'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  reportBtn: { flexDirection: 'row', backgroundColor: '#2563eb', padding: 16, marginBottom: 12, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  reportBtnSecondary: { backgroundColor: '#10b981' },
  reportBtnText: { color: '#fff', fontWeight: '700', marginLeft: 10, fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#34495e' },
  statRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  statLabel: { fontSize: 12, color: '#7f8c8d', marginTop: 4 },
  activityRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ecf0f1', paddingVertical: 10 },
  activityIcon: { marginRight: 12 },
  activityDetails: { flex: 1 },
  activityName: { fontSize: 14, fontWeight: 'bold' },
  activityTime: { fontSize: 12, color: '#7f8c8d' },
  activeBadge: { backgroundColor: '#2ecc71', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, color: '#fff', fontWeight: 'bold', fontSize: 11 },
  completedBadge: { backgroundColor: '#95a5a6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, color: '#fff', fontWeight: 'bold', fontSize: 11 },
});
