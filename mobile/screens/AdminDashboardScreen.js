import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, ActivityIndicator, RefreshControl, Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  getAllVisitors, getTodayVisitors, getUsers, createUser, deleteUser,
  getPendingUsers, approveUser
} from '../services/api';
import { LineChart, ProgressChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }) {
  const [visitors, setVisitors] = useState([]);
  const [todayVisitors, setTodayVisitors] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'security', initials: '' });
  const [showUserForm, setShowUserForm] = useState(false);
  const [user, setUser] = useState(null);
  const [showDailyDatePicker, setShowDailyDatePicker] = useState(false);
  const [showTrendDatePicker, setShowTrendDatePicker] = useState(false);
  const [selectedDailyDate, setSelectedDailyDate] = useState(new Date());
  const [selectedTrendDate, setSelectedTrendDate] = useState(new Date());

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
    } catch (err) {
      console.error('Error loading visitors:', err);
      Alert.alert('Error', 'Failed to load visitors: ' + (err.response?.data?.msg || err.message));
      setLoading(false);
      return;
    }

    try {
      const todayRes = await getTodayVisitors();
      setTodayVisitors(todayRes.data);
    } catch (err) {
      console.error('Error loading today visitors:', err);
      Alert.alert('Error', 'Failed to load today visitors: ' + (err.response?.data?.msg || err.message));
      setLoading(false);
      return;
    }

    try {
      const usersRes = await getUsers();
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error loading users:', err);
      Alert.alert('Error', 'Failed to load users: ' + (err.response?.data?.msg || err.message));
      setLoading(false);
      return;
    }
    
    try {
      const pendingRes = await getPendingUsers();
      setPendingUsers(pendingRes.data);
    } catch (pendingErr) {
      console.warn('Could not load pending users:', pendingErr);
      setPendingUsers([]);
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

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      Alert.alert('Error', 'Fill all fields');
      return;
    }
    try {
      await createUser(newUser);
      Alert.alert('Success', 'User created');
      setNewUser({ name: '', email: '', password: '', role: 'security' });
      setShowUserForm(false);
      loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Failed');
    }
  };

  const handleDeleteUser = async (id) => {
    Alert.alert('Delete', 'Delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: async () => { await deleteUser(id); loadData(); } }
    ]);
  };

  const handleApprove = async (userId, role) => {
    try {
      await approveUser(userId, role);
      Alert.alert('Success', `User approved as ${role}`);
      loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Approval failed');
    }
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

  const totalVisitors = visitors.length;
  const activeVisitors = todayVisitors.filter(v => v.status === 'active').length;
  const completedToday = todayVisitors.filter(v => v.status === 'completed').length;
  const totalUsers = users.length;

  const last7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(selectedTrendDate);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const getVisitorCounts = () => {
    const counts = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(selectedTrendDate);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      const count = visitors.filter(v => {
        const vDate = new Date(v.visitDate);
        return vDate >= date && vDate < next;
      }).length;
      counts.push(count);
    }
    return counts;
  };

  const chartData = {
    labels: last7Days().map(d => d.slice(5)),
    datasets: [{ data: getVisitorCounts() }]
  };

  const progressData = {
    labels: ['Check-ins', 'Completion'],
    data: [
      todayVisitors.length > 0 ? activeVisitors / todayVisitors.length : 0,
      todayVisitors.length > 0 ? completedToday / todayVisitors.length : 0
    ]
  };

  const recentVisitors = [...visitors]
    .sort((a, b) => new Date(b.timeIn) - new Date(a.timeIn))
    .slice(0, 10);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.card, styles.statCard]}>
          <MaterialIcons name="people" size={32} color="#3498db" />
          <Text style={styles.statValue}>{totalVisitors}</Text>
          <Text style={styles.statLabel}>Total Visitors</Text>
        </View>
        <View style={[styles.card, styles.statCard]}>
          <MaterialIcons name="access-time" size={32} color="#f39c12" />
          <Text style={styles.statValue}>{activeVisitors}</Text>
          <Text style={styles.statLabel}>Active Now</Text>
        </View>
        <View style={[styles.card, styles.statCard]}>
          <MaterialIcons name="check-circle" size={32} color="#2ecc71" />
          <Text style={styles.statValue}>{completedToday}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={[styles.card, styles.statCard]}>
          <MaterialIcons name="supervised-user-circle" size={32} color="#9b59b6" />
          <Text style={styles.statValue}>{totalUsers}</Text>
          <Text style={styles.statLabel}>System Users</Text>
        </View>
      </View>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pending Approvals</Text>
          {pendingUsers.map(user => (
            <View key={user._id} style={styles.pendingRow}>
              <View>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              <View style={styles.approveButtons}>
                <TouchableOpacity style={[styles.approveBtn, { backgroundColor: '#2ecc71' }]} onPress={() => handleApprove(user._id, 'security')}>
                  <Text style={styles.approveText}>Security</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.approveBtn, { backgroundColor: '#f39c12' }]} onPress={() => handleApprove(user._id, 'reception')}>
                  <Text style={styles.approveText}>Reception</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Daily Progress with Calendar */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <TouchableOpacity onPress={() => setShowDailyDatePicker(true)} style={styles.calendarBtn}>
            <MaterialIcons name="calendar-today" size={20} color="#3498db" />
          </TouchableOpacity>
          <Text style={styles.cardTitle}>Daily Progress</Text>
        </View>
        {todayVisitors.length > 0 ? (
          <ProgressChart data={progressData} width={width * 0.8} height={180} strokeWidth={10} radius={32} chartConfig={{ backgroundColor: '#fff', color: (opacity = 1) => `rgba(52,152,219,${opacity})`, labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})` }} hideLegend={false} />
        ) : (
          <Text style={{ textAlign: 'center', color: '#7f8c8d', padding: 20 }}>No visitors today</Text>
        )}
      </View>

      {/* Last 7 Days with Calendar */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <TouchableOpacity onPress={() => setShowTrendDatePicker(true)} style={styles.calendarBtn}>
            <MaterialIcons name="calendar-today" size={20} color="#3498db" />
          </TouchableOpacity>
          <Text style={styles.cardTitle}>Last 7 Days (Visitor Trend)</Text>
        </View>
        <LineChart data={chartData} width={width * 0.8} height={220} chartConfig={{ backgroundColor: '#fff', decimalPlaces: 0, color: (opacity = 1) => `rgba(46,204,113,${opacity})` }} bezier style={{ marginLeft: 0 }} />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowUserForm(!showUserForm)}>
          <MaterialIcons name="person-add" size={20} color="#fff" />
          <Text style={styles.actionText}>Add User</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={exportToPDF}>
          <MaterialIcons name="print" size={20} color="#fff" />
          <Text style={styles.actionText}>Export Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('OccurrenceBook', { user })}>
          <MaterialIcons name="book" size={20} color="#fff" />
          <Text style={styles.actionText}>Occurrence Book</Text>
        </TouchableOpacity>
      </View>

      {/* Add User Form */}
      {showUserForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Create New User</Text>
          <TextInput style={styles.input} placeholder="Full Name" value={newUser.name} onChangeText={t => setNewUser({...newUser, name: t})} />
          <TextInput style={styles.input} placeholder="Email" value={newUser.email} onChangeText={t => setNewUser({...newUser, email: t})} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry value={newUser.password} onChangeText={t => setNewUser({...newUser, password: t})} />
          <TextInput style={styles.input} placeholder="Initials" value={newUser.initials} onChangeText={t => setNewUser({...newUser, initials: t})} />
          <View style={styles.roleRow}>
            {['security','reception','admin','security_admin'].map(role => (
              <TouchableOpacity key={role} style={[styles.roleBtn, newUser.role === role && styles.roleActive]} onPress={() => setNewUser({...newUser, role})}>
                <Text>{role.replace('_', ' ').toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={handleAddUser}>
            <Text style={styles.saveBtnText}>Save User</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* System Users */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>System Users</Text>
        {users.map(u => (
          <View key={u._id} style={styles.userRow}>
            <View>
              <Text style={styles.userName}>{u.name}</Text>
              <Text style={styles.userEmail}>{u.email} ({u.role || 'pending'})</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteUser(u._id)}>
              <MaterialIcons name="delete" size={22} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Recent Visitors */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <TouchableOpacity onPress={() => navigation.navigate('Visitors')} style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
          <Text style={styles.cardTitle}>Recent Visitors</Text>
        </View>
        {recentVisitors.map(v => (
          <View key={v._id} style={styles.visitorRow}>
            <View style={styles.visitorDetails}>
              <Text style={styles.visitorName}>{v.firstName} {v.surname}</Text>
              <Text style={styles.visitorInfo}>Email: {v.email || 'N/A'}</Text>
              <Text style={styles.visitorInfo}>Purpose: {v.purpose}</Text>
              <Text style={styles.visitorInfo}>Date: {new Date(v.timeIn).toLocaleDateString()}</Text>
              <Text style={styles.visitorInfo}>Time: {new Date(v.timeIn).toLocaleTimeString()}</Text>
            </View>
            <Text style={v.timeOut ? styles.completedBadge : styles.activeBadge}>
              {v.timeOut ? 'Completed' : 'Active'}
            </Text>
          </View>
        ))}
      </View>

      {/* Date Pickers */}
      {showDailyDatePicker && (
        <DateTimePicker
          value={selectedDailyDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDailyDatePicker(false);
            if (date) setSelectedDailyDate(date);
          }}
        />
      )}

      {showTrendDatePicker && (
        <DateTimePicker
          value={selectedTrendDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowTrendDatePicker(false);
            if (date) setSelectedTrendDate(date);
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, justifyContent: 'space-between', marginTop: 10 },
  statCard: { width: '23%', alignItems: 'center', paddingVertical: 12 },
  statValue: { fontSize: 22, fontWeight: 'bold', marginTop: 8, color: '#2c3e50' },
  statLabel: { fontSize: 11, color: '#7f8c8d', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, margin: 10, elevation: 2 },
  chartCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, margin: 10, alignItems: 'center', elevation: 2 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 10 },
  calendarBtn: { marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#34495e' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginVertical: 5 },
  actionBtn: { flexDirection: 'row', backgroundColor: '#3498db', padding: 12, borderRadius: 30, flex: 0.32, justifyContent: 'center', alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 12 },
  formCard: { backgroundColor: '#fff', margin: 10, padding: 15, borderRadius: 12 },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 10 },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  roleBtn: { flex: 1, padding: 8, backgroundColor: '#ecf0f1', marginHorizontal: 4, borderRadius: 8, alignItems: 'center' },
  roleActive: { backgroundColor: '#3498db' },
  saveBtn: { backgroundColor: '#2ecc71', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  userRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ecf0f1', paddingVertical: 10 },
  userName: { fontWeight: 'bold' },
  userEmail: { fontSize: 12, color: '#7f8c8d' },
  pendingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ecf0f1', paddingVertical: 12 },
  approveButtons: { flexDirection: 'row' },
  approveBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginLeft: 8 },
  approveText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  viewAllBtn: { backgroundColor: '#3498db', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  viewAllText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  visitorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#ecf0f1', paddingVertical: 10 },
  visitorDetails: { flex: 1 },
  visitorName: { fontWeight: 'bold', fontSize: 16 },
  visitorInfo: { fontSize: 12, color: '#95a5a6', marginTop: 2 },
  activeBadge: { backgroundColor: '#2ecc71', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, color: '#fff', overflow: 'hidden', fontWeight: 'bold' },
  completedBadge: { backgroundColor: '#95a5a6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, color: '#fff', overflow: 'hidden', fontWeight: 'bold' },
});
