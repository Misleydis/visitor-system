import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DashboardScreen from './AdminDashboardScreen';
import UsersScreen from './AdminUsersScreen';
import VisitorsScreen from './AdminVisitorsScreen';
import ReportsScreen from './AdminReportsScreen';
import OccurrenceBookScreen from './OccurrenceBookScreen';
import SettingsScreen from './AdminSettingsScreen';

const SCREENS = {
  Dashboard: DashboardScreen,
  Users: UsersScreen,
  Visitors: VisitorsScreen,
  Reports: ReportsScreen,
  'Occurrence Book': OccurrenceBookScreen,
  Settings: SettingsScreen,
};

const MENU_ITEMS = [
  { key: 'Dashboard', icon: 'dashboard', label: 'Dashboard' },
  { key: 'Users', icon: 'people', label: 'Users' },
  { key: 'Visitors', icon: 'person', label: 'Visitors' },
  { key: 'Reports', icon: 'assessment', label: 'Reports' },
  { key: 'Occurrence Book', icon: 'book', label: 'Occurrence Book' },
  { key: 'Settings', icon: 'settings', label: 'Settings' },
];

export default function AdminLayout({ navigation }) {
  const [activeScreen, setActiveScreen] = useState('Dashboard');
  const [user, setUser] = useState(null);

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

  React.useEffect(() => {
    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  const ActiveScreen = SCREENS[activeScreen];

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Admin Panel</Text>
          <Text style={styles.sidebarSubtitle}>{user?.name || 'Admin'}</Text>
        </View>
        
        <ScrollView style={styles.menuContainer}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuItem,
                activeScreen === item.key && styles.menuItemActive,
              ]}
              onPress={() => setActiveScreen(item.key)}
            >
              <MaterialIcons
                name={item.icon}
                size={24}
                color={activeScreen === item.key ? '#3498db' : '#bdc3c7'}
              />
              <Text
                style={[
                  styles.menuItemText,
                  activeScreen === item.key && styles.menuItemTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#e74c3c" />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <ActiveScreen navigation={navigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#f4f6f9' },
  sidebar: {
    width: 250,
    backgroundColor: '#0a1929',
    paddingTop: 20,
    paddingBottom: 20,
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a5f',
    marginBottom: 10,
  },
  sidebarTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  sidebarSubtitle: { fontSize: 14, color: '#7f8c8d', marginTop: 4 },
  menuContainer: { flex: 1 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  menuItemActive: { backgroundColor: '#1e3a5f' },
  menuItemText: { fontSize: 16, color: '#bdc3c7', marginLeft: 15 },
  menuItemTextActive: { color: '#3498db', fontWeight: 'bold' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#1e3a5f',
  },
  logoutBtnText: { fontSize: 16, color: '#e74c3c', marginLeft: 15, fontWeight: 'bold' },
  mainContent: { flex: 1 },
});
