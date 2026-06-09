import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, typography } from '../theme/adminTheme';

export default function IslandTabBar({ tabs, activeKey, onTabPress }) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 12);

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomInset }]} pointerEvents="box-none">
      <View style={styles.island}>
        {tabs.map((tab) => {
          const active = activeKey === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => onTabPress(tab.key)}
              activeOpacity={0.85}
            >
              <MaterialIcons
                name={tab.icon}
                size={22}
                color={active ? colors.primary : colors.textSubtle}
              />
              <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
  },
  island: {
    flexDirection: 'row',
    backgroundColor: colors.island,
    borderRadius: radius.island,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    ...shadow.island,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: radius.xl,
    gap: 4,
  },
  tabActive: {
    backgroundColor: colors.primarySoft,
  },
  label: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSubtle,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
