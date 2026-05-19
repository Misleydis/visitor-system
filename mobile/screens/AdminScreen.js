import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getAllVisitors, getTodayVisitors, getUsers, createUser, deleteUser, getPendingUsers, approveUser } from '../services/api';
import { LineChart, ProgressChart } from 'react-native-chart-kit';

export default function AdminDashboard({ navigation }) {
  const [visitors, setVisitors] = useState([]);
  const [todayVisitors, setTodayVisitors] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'security' });
  const [showUserForm, setShowUserForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [visitorsRes, todayRes, usersRes, pendingRes] = await Promise.all([
        getAllVisitors(),
        getTodayVisitors(),
        getUsers(),
        getPendingUsers()
      ]);
      setVisitors(visitorsRes.data);
      setTodayVisitors(todayRes.data);
      setUsers(usersRes.data);
      setPendingUsers(pendingRes.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      { text: 'Delete', onPress: async () => {
          try {
            await deleteUser(id);
            loadData();
          } catch (err) {
            Alert.alert('Error', 'Delete failed');
          }
        }
      }
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

  const totalVisitors = visitors.length;
  const activeVisitors = todayVisitors.filter(v => v.status === 'active').length;
  const completedToday = todayVisitors.filter(v => v.status === 'completed').length;
  const totalUsers = users.length;

  const last7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const getVisitorCounts = () => {
    const counts = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Visitor insights & management</Text>
      </View>

      {/* Stats Cards Row */}
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

      {/* Pending Approvals Section */}
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
                <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(user._id, 'security')}>
                  <Text style={styles.approveText}>Security</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(user._id, 'reception')}>
                  <Text style={styles.approveText}>Reception</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Progress & Line Chart */}
      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardTitle}>Daily Progress</Text>
          <ProgressChart
            data={progressData}
            width={180}
            height={120}
            strokeWidth={8}
            radius={28}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            }}
            hideLegend={false}
          />
        </View>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardTitle}>Last 7 Days</Text>
          <LineChart
            data={chartData}
            width={180}
            height={120}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            }}
            bezier
            style={{ marginLeft: -20 }}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowUserForm(!showUserForm)}>
          <MaterialIcons name="person-add" size={20} color="#fff" />
          <Text style={styles.actionText}>Add User</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Export', 'Export feature coming soon')}>
          <MaterialIcons name="print" size={20} color="#fff" />
          <Text style={styles.actionText}>Export Report</Text>
        </TouchableOpacity>
      </View>

      {/* Add User Form */}
      {showUserForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Create New User</Text>
          <TextInput style={styles.input} placeholder="Full Name" value={newUser.name} onChangeText={t => setNewUser({...newUser, name: t})} />
          <TextInput style={styles.input} placeholder="Email" value={newUser.email} onChangeText={t => setNewUser({...newUser, email: t})} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry value={newUser.password} onChangeText={t => setNewUser({...newUser, password: t})} />
          <View style={styles.roleRow}>
            {['security', 'reception', 'admin'].map(role => (
              <TouchableOpacity key={role} style={[styles.roleBtn, newUser.role === role && styles.roleActive]} onPress={() => setNewUser({...newUser, role})}>
                <Text>{role.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={handleAddUser}>
            <Text style={styles.saveBtnText}>Save User</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* System Users List */}
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
        <Text style={styles.cardTitle}>Recent Visitors</Text>
        {visitors.slice(0, 8).map(v => (
          <View key={v._id} style={styles.visitorRow}>
            <View style={styles.visitorInfo}>
              <Text style={styles.visitorName}>{v.firstName} {v.surname}</Text>
              <Text style={styles.visitorTicket}>{v.ticketNumber} → {v.personToVisit}</Text>
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
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: { padding: 20, backgroundColor: '#2c3e50', marginBottom: 15 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#bdc3c7', marginTop: 5 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, justifyContent: 'space-between' },
  statCard: { width: '23%', alignItems: 'center', paddingVertical: 12 },
  statValue: { fontSize: 22, fontWeight: 'bold', marginTop: 8, color: '#2c3e50' },
  statLabel: { fontSize: 11, color: '#7f8c8d', textAlign: 'center' },
  row: { flexDirection: 'row', paddingHorizontal: 10, justifyContent: 'space-between' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, margin: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  halfCard: { width: '44%' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#34495e' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginVertical: 5 },
  actionBtn: { flexDirection: 'row', backgroundColor: '#3498db', padding: 12, borderRadius: 30, flex: 0.48, justifyContent: 'center', alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
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
  approveBtn: { backgroundColor: '#2ecc71', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginLeft: 8 },
  approveText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  visitorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ecf0f1', paddingVertical: 8 },
  visitorInfo: { flex: 1 },
  visitorName: { fontWeight: 'bold' },
  visitorTicket: { fontSize: 12, color: '#7f8c8d' },
  activeBadge: { backgroundColor: '#2ecc71', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, color: '#fff', overflow: 'hidden', fontWeight: 'bold' },
  completedBadge: { backgroundColor: '#95a5a6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, color: '#fff', overflow: 'hidden', fontWeight: 'bold' }
});