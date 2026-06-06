import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Switch, TextInput
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminSettingsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
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

  useEffect(() => { 
    loadUser(); 
  }, []);

  const handleClearCache = async () => {
    Alert.alert('Clear Cache', 'Clear all cached data?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', onPress: async () => {
        try {
          await AsyncStorage.clear();
          Alert.alert('Success', 'Cache cleared successfully');
        } catch (err) {
          Alert.alert('Error', 'Failed to clear cache');
        }
      }}
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This action cannot be undone. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        Alert.alert('Not Implemented', 'Account deletion requires backend implementation');
      }}
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Name</Text>
            <Text style={styles.settingValue}>{user?.name || 'N/A'}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#bdc3c7" />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Email</Text>
            <Text style={styles.settingValue}>{user?.email || 'N/A'}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#bdc3c7" />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Role</Text>
            <Text style={styles.settingValue}>{user?.role || 'N/A'}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#bdc3c7" />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preferences</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="notifications" size={24} color="#3498db" />
            <Text style={styles.settingName}>Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#767577', true: '#3498db' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="dark-mode" size={24} color="#3498db" />
            <Text style={styles.settingName}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#767577', true: '#3498db' }}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.settingRow} onPress={handleClearCache}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="delete-sweep" size={24} color="#e74c3c" />
            <Text style={styles.settingName}>Clear Cache</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#bdc3c7" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={handleDeleteAccount}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="person-remove" size={24} color="#e74c3c" />
            <Text style={[styles.settingName, styles.dangerText]}>Delete Account</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#bdc3c7" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>App Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Build</Text>
            <Text style={styles.settingValue}>2024.06.03</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="#fff" />
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, margin: 10, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#34495e' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingName: { fontSize: 16, marginLeft: 12, color: '#2c3e50' },
  settingValue: { fontSize: 14, color: '#7f8c8d', marginLeft: 12 },
  dangerText: { color: '#e74c3c' },
  logoutBtn: { flexDirection: 'row', backgroundColor: '#e74c3c', padding: 15, margin: 10, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  logoutBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
});
