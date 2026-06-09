import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IslandTabBar from '../components/IslandTabBar';
import DashboardScreen from './AdminDashboardScreen';
import UsersScreen from './AdminUsersScreen';
import VisitorsScreen from './AdminVisitorsScreen';
import ReportsScreen from './AdminReportsScreen';
import SettingsScreen from './AdminSettingsScreen';
import { colors, spacing, typography } from '../theme/adminTheme';

const SCREENS = {
  Dashboard: DashboardScreen,
  Users: UsersScreen,
  Visitors: VisitorsScreen,
  Reports: ReportsScreen,
  Settings: SettingsScreen,
};

const TABS = [
  { key: 'Dashboard', icon: 'dashboard', label: 'Home' },
  { key: 'Users', icon: 'people', label: 'Users' },
  { key: 'Visitors', icon: 'badge', label: 'Visitors' },
  { key: 'Reports', icon: 'insights', label: 'Reports' },
  { key: 'Settings', icon: 'settings', label: 'Settings' },
];

export default function AdminLayout({ navigation }) {
  const [activeScreen, setActiveScreen] = useState('Dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('user').then((data) => {
      if (data) setUser(JSON.parse(data));
    });
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    navigation.replace('Login');
  };

  const ActiveScreen = SCREENS[activeScreen];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.userName}>{user?.name || 'Admin'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <MaterialIcons name="logout" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <ActiveScreen navigation={navigation} user={user} hideHeader={true} />
      </View>

      <IslandTabBar tabs={TABS} activeKey={activeScreen} onTabPress={setActiveScreen} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  greeting: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 2,
  },
  userName: {
    ...typography.title,
    fontSize: 20,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    flex: 1,
    paddingBottom: 100,
  },
});
