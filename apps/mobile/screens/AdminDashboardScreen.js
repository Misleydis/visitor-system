import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, RefreshControl, Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAllVisitors, getTodayVisitors, getUsers, getPendingUsers, approveUser } from '../services/api';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import StatCard from '../components/StatCard';
import { colors, spacing, radius, shadow, typography } from '../theme/adminTheme';

const { width } = Dimensions.get('window');
const chartWidth = width - spacing.lg * 2 - spacing.md * 2;

const chartConfig = {
  backgroundColor: colors.surface,
  backgroundGradientFrom: colors.surface,
  backgroundGradientTo: colors.surface,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: () => colors.textMuted,
  propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
  propsForBackgroundLines: { stroke: colors.border, strokeDasharray: '4' },
};

export default function AdminDashboardScreen({ navigation, user }) {
  const [visitors, setVisitors] = useState([]);
  const [todayVisitors, setTodayVisitors] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showTrendDatePicker, setShowTrendDatePicker] = useState(false);
  const [selectedTrendDate, setSelectedTrendDate] = useState(new Date());

  const loadData = async () => {
    try {
      const [visitorsRes, todayRes, usersRes] = await Promise.all([
        getAllVisitors(),
        getTodayVisitors(),
        getUsers(),
      ]);
      setVisitors(visitorsRes.data);
      setTodayVisitors(todayRes.data);
      setUsers(usersRes.data);
      try {
        const pendingRes = await getPendingUsers();
        setPendingUsers(pendingRes.data);
      } catch {
        setPendingUsers([]);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Failed to load dashboard');
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleApprove = async (userId, role) => {
    try {
      await approveUser(userId, role);
      loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Approval failed');
    }
  };

  const activeVisitors = todayVisitors.filter((v) => v.status === 'active').length;
  const completedToday = todayVisitors.filter((v) => v.status === 'completed').length;

  const getVisitorCounts = () => {
    const counts = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(selectedTrendDate);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      counts.push(
        visitors.filter((v) => {
          const vDate = new Date(v.visitDate);
          return vDate >= date && vDate < next;
        }).length
      );
    }
    return counts;
  };

  const last7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(selectedTrendDate);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0].slice(5));
    }
    return days;
  };

  const recentVisitors = [...visitors]
    .sort((a, b) => new Date(b.timeIn) - new Date(a.timeIn))
    .slice(0, 5);

  const progressData = {
    labels: ['Active', 'Done'],
    data: [
      todayVisitors.length > 0 ? activeVisitors / todayVisitors.length : 0,
      todayVisitors.length > 0 ? completedToday / todayVisitors.length : 0,
    ],
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.pageTitle}>Overview</Text>
      <Text style={styles.pageSubtitle}>Today's visitor activity at a glance</Text>

      <View style={styles.statsGrid}>
        <StatCard icon="groups" label="Total Visitors" value={visitors.length} color="#2563eb" />
        <StatCard icon="schedule" label="Active Now" value={activeVisitors} color="#f59e0b" />
        <StatCard icon="task-alt" label="Completed" value={completedToday} color="#10b981" />
        <StatCard icon="manage-accounts" label="Staff Users" value={users.length} color="#7c3aed" />
      </View>

      {pendingUsers.length > 0 && (
        <View style={[styles.sectionCard, styles.pendingCard]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Approvals</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingUsers.length}</Text>
            </View>
          </View>
          {pendingUsers.map((u) => (
            <View key={u._id} style={styles.pendingRow}>
              <View style={styles.pendingInfo}>
                <Text style={styles.pendingName}>{u.name}</Text>
                <Text style={styles.pendingEmail}>{u.email}</Text>
              </View>
              <View style={styles.approveRow}>
                {['security', 'reception', 'admin'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={styles.approveChip}
                    onPress={() => handleApprove(u._id, role)}
                  >
                    <Text style={styles.approveChipText}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActions}>
        <TouchableOpacity style={styles.actionPill} onPress={() => navigation.navigate('OccurrenceBook', { user })}>
          <MaterialIcons name="menu-book" size={18} color={colors.primary} />
          <Text style={styles.actionPillText}>Occurrence Book</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionPill} onPress={() => setShowTrendDatePicker(true)}>
          <MaterialIcons name="calendar-today" size={18} color={colors.primary} />
          <Text style={styles.actionPillText}>Trend Date</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.sectionCard, shadow.card]}>
        <Text style={styles.sectionTitle}>Daily Progress</Text>
        <Text style={styles.sectionHint}>{todayVisitors.length} visitors checked in today</Text>
        {todayVisitors.length > 0 ? (
          <ProgressChart
            data={progressData}
            width={chartWidth}
            height={160}
            strokeWidth={12}
            radius={28}
            chartConfig={chartConfig}
            hideLegend={false}
            style={styles.chart}
          />
        ) : (
          <Text style={styles.emptyText}>No visitors today yet</Text>
        )}
      </View>

      <View style={[styles.sectionCard, shadow.card]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>7-Day Trend</Text>
          <TouchableOpacity onPress={() => setShowTrendDatePicker(true)} style={styles.iconBtn}>
            <MaterialIcons name="calendar-today" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <LineChart
          data={{ labels: last7Days(), datasets: [{ data: getVisitorCounts() }] }}
          width={chartWidth}
          height={200}
          chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})` }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={[styles.sectionCard, shadow.card]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Visitors</Text>
        </View>
        {recentVisitors.length === 0 ? (
          <Text style={styles.emptyText}>No visitors recorded yet</Text>
        ) : (
          recentVisitors.map((v) => (
            <View key={v._id} style={styles.visitorRow}>
              <View style={styles.visitorAvatar}>
                <Text style={styles.visitorInitial}>{v.firstName?.[0]}{v.surname?.[0]}</Text>
              </View>
              <View style={styles.visitorInfo}>
                <Text style={styles.visitorName}>{v.firstName} {v.surname}</Text>
                <Text style={styles.visitorMeta}>{v.purpose} · {v.site}</Text>
              </View>
              <View style={[styles.statusPill, v.timeOut ? styles.statusDone : styles.statusActive]}>
                <Text style={styles.statusText}>{v.timeOut ? 'Done' : 'Active'}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {showTrendDatePicker && (
        <DateTimePicker
          value={selectedTrendDate}
          mode="date"
          onChange={(_, date) => {
            setShowTrendDatePicker(false);
            if (date) setSelectedTrendDate(date);
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  pageTitle: { ...typography.title, marginTop: spacing.xs },
  pageSubtitle: { ...typography.body, color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pendingCard: {
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.section },
  sectionHint: { ...typography.caption, marginBottom: spacing.sm },
  badge: {
    backgroundColor: colors.warning,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pendingRow: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  pendingInfo: { marginBottom: spacing.sm },
  pendingName: { fontWeight: '600', color: colors.text, fontSize: 15 },
  pendingEmail: { ...typography.caption, marginTop: 2 },
  approveRow: { flexDirection: 'row', gap: 8 },
  approveChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  approveChipText: { color: '#fff', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  quickActions: { marginBottom: spacing.md },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.pill,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  actionPillText: { fontWeight: '600', color: colors.text, fontSize: 13 },
  chart: { marginLeft: -8, borderRadius: radius.md },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { textAlign: 'center', color: colors.textMuted, paddingVertical: spacing.lg },
  visitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  visitorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  visitorInitial: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  visitorInfo: { flex: 1 },
  visitorName: { fontWeight: '600', fontSize: 15, color: colors.text },
  visitorMeta: { ...typography.caption, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  statusActive: { backgroundColor: '#d1fae5' },
  statusDone: { backgroundColor: '#f1f5f9' },
  statusText: { fontSize: 11, fontWeight: '700', color: colors.text },
});
