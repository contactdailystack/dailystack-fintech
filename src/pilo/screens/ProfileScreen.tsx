import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Pressable, 
  StatusBar 
} from 'react-native';
import { theme } from '../theme';
import { Card } from '../components/Card';
import { StatBadge } from '../components/StatBadge';

interface SettingOption {
  id: string;
  label: string;
  value?: string;
  chevron?: boolean;
}

const PROFILE_SETTINGS: SettingOption[] = [
  { id: '1', label: 'Ride Preferences', value: 'Cabin Temp: 71°F, Quiet Mode', chevron: true },
  { id: '2', label: 'Payment Options', value: 'Apple Pay (•••• 9021)', chevron: true },
  { id: '3', label: 'Safety & Security', value: 'Emergency Contacts Set', chevron: true },
  { id: '4', label: 'Notification Settings', chevron: true },
];

export const ProfileScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ─── Premium Header (Single Hero Element) ─── */}
        <View style={styles.header}>
          <Text style={theme.typography.label}>YOUR PILO HUB</Text>
          <Text style={styles.heroText}>Leo Vance</Text>
          <Text style={styles.subtext}>Member since November 2025</Text>
        </View>

        {/* ─── Ambient AutoPass Active Container ─── */}
        <Card style={styles.subscriptionCard}>
          <View style={styles.subHeader}>
            <View>
              <Text style={theme.typography.label}>ACTIVE SUBSCRIPTION</Text>
              <Text style={styles.subTitle}>AutoPass Premium</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>ACTIVE</Text>
            </View>
          </View>
          <Text style={styles.subDesc}>
            Your pass automatically renews on June 18, 2026. Saving you 15% on surge rates and charging flat per-km pricing.
          </Text>
        </Card>

        {/* ─── High-Typography Metric Grid (Stat Badges) ─── */}
        <Text style={[theme.typography.label, styles.sectionTitle]}>JOURNEY METRICS</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatBadge 
              label="TOTAL RIDES" 
              value={12} 
              style={styles.statCard} 
            />
            <StatBadge 
              label="DISTANCE" 
              value={48} 
              unit="km" 
              style={styles.statCard} 
            />
          </View>
          <View style={styles.statsRow}>
            <StatBadge 
              label="TOTAL SAVED" 
              value="$124" 
              highlighted={true}
              style={styles.statCard} 
            />
          </View>
        </View>

        {/* ─── Collapsed settings panel ─── */}
        <Text style={[theme.typography.label, styles.sectionTitle]}>PREFERENCES & ACCOUNT</Text>
        <Card style={styles.settingsCard} padding={0}>
          {PROFILE_SETTINGS.map((item, index) => (
            <Pressable 
              key={item.id} 
              style={[
                styles.settingRow, 
                index < PROFILE_SETTINGS.length - 1 && styles.borderBottom
              ]}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
              </View>
              {item.chevron && <Text style={styles.chevron}>→</Text>}
            </Pressable>
          ))}
        </Card>

        {/* App Version Info */}
        <Text style={styles.versionText}>PILO iOS v3.48.2 (2026) · DEEP DARK SYSTEM</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  header: {
    marginBottom: theme.spacing.xxl,
  },
  heroText: {
    fontFamily: theme.typography.hero.fontFamily,
    fontSize: theme.typography.section.fontSize + 4,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xs,
    letterSpacing: -0.5,
  },
  subtext: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: theme.typography.supporting.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  subscriptionCard: {
    marginBottom: theme.spacing.xxl,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  subTitle: {
    fontFamily: theme.typography.subheadline.fontFamily,
    fontSize: theme.typography.subheadline.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.badge,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusBadgeText: {
    ...theme.typography.label,
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.background,
  },
  subDesc: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: theme.typography.supporting.fontSize + 1,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  statsGrid: {
    marginBottom: theme.spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flex: 1,
  },
  settingsCard: {
    marginBottom: theme.spacing.xxl,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  settingLabel: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  settingValue: {
    fontFamily: theme.typography.supporting.fontFamily,
    fontSize: theme.typography.supporting.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  chevron: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xl,
  },
});
