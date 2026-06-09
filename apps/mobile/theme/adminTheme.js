export const colors = {
  bg: '#f0f4f8',
  surface: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
  textSubtle: '#94a3b8',
  border: '#e2e8f0',
  primary: '#2563eb',
  primarySoft: '#eff6ff',
  accent: '#7c3aed',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  island: '#ffffff',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
  island: 32,
};

export const typography = {
  hero: { fontSize: 32, fontWeight: '700', letterSpacing: -0.8, color: colors.text },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4, color: colors.text },
  section: { fontSize: 17, fontWeight: '600', letterSpacing: -0.2, color: colors.text },
  body: { fontSize: 15, fontWeight: '400', color: colors.text },
  caption: { fontSize: 12, fontWeight: '500', color: colors.textMuted, letterSpacing: 0.3 },
  overline: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSubtle,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
};

export const shadow = {
  card: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  island: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 14,
  },
};
