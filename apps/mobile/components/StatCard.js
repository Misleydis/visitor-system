import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, typography } from '../theme/adminTheme';

export default function StatCard({ icon, label, value, color = colors.primary, tint }) {
  const bg = tint || `${color}14`;

  return (
    <View style={[styles.card, shadow.card]}>
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <MaterialIcons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: colors.text,
    marginBottom: 2,
  },
  label: {
    ...typography.overline,
    fontSize: 10,
  },
});
