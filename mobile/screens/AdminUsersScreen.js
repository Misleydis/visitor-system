import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUsers, createUser, deleteUser, getPendingUsers, approveUser } from '../services/api';

export default function AdminUsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'security', initials: '' });
  const [showUserForm, setShowUserForm] = useState(false);
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
      const usersRes = await getUsers();
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error loading users:', err);
      Alert.alert('Error', 'Failed to load users: ' + (err.response?.data?.msg || err.message));
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
      setNewUser({ name: '', email: '', password: '', role: 'security', initials: '' });
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <TouchableOpacity style={styles.addBtn} onPress={() => setShowUserForm(!showUserForm)}>
        <MaterialIcons name="person-add" size={20} color="#fff" />
        <Text style={styles.addBtnText}>Add New User</Text>
      </TouchableOpacity>

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
                <Text style={styles.roleBtnText}>{role.replace('_', ' ').toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={handleAddUser}>
            <Text style={styles.saveBtnText}>Save User</Text>
          </TouchableOpacity>
        </View>
      )}

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  addBtn: { flexDirection: 'row', backgroundColor: '#3498db', padding: 15, margin: 10, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },
  formCard: { backgroundColor: '#fff', margin: 10, padding: 15, borderRadius: 12 },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 10 },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  roleBtn: { flex: 1, padding: 8, backgroundColor: '#ecf0f1', marginHorizontal: 4, borderRadius: 8, alignItems: 'center' },
  roleActive: { backgroundColor: '#3498db' },
  roleBtnText: { fontSize: 11, fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#2ecc71', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, margin: 10, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#34495e' },
  userRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ecf0f1', paddingVertical: 10 },
  userName: { fontWeight: 'bold' },
  userEmail: { fontSize: 12, color: '#7f8c8d' },
  pendingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ecf0f1', paddingVertical: 12 },
  approveButtons: { flexDirection: 'row' },
  approveBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginLeft: 8 },
  approveText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});
