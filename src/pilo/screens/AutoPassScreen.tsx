import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  StatusBar 
} from 'react-native';
import { theme } from '../theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

interface FeatureComparison {
  id: string;
  benefit: string;
  withPass: string;
  withoutPass: string;
  accented?: boolean;
}

const BENEFIT_MATRIX: FeatureComparison[] = [
  { id: '1', benefit: 'Base KM Charge', withPass: '$0.85/km', withoutPass: '$1.40/km', accented: true },
  { id: '2', benefit: 'Surge Pricing', withPass: 'Always Zero', withoutPass: 'Up to 2.5x multipliers' },
  { id: '3', benefit: 'Cabin Reservation Priority', withPass: 'Instant Dispatch', withoutPass: 'Standard wait queue' },
  { id: '4', benefit: 'Cabin Climate Setup', withPass: 'Included', withoutPass: 'Not customizable' },
];

export const AutoPassScreen: React.FC = () => {
  const handleUpgrade = () => {
    alert('Thank you for subscribing to Pilo AutoPass! Account activated.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ─── Promotion Header ─── */}
        <View style={styles.header}>
          <Text style={theme.typography.label}>PILO EXCLUSIVE PASS</Text>
          <Text style={styles.heroText}>Ride smart.{"\n"}Save monthly.</Text>
          <Text style={styles.subtext}>
            Unlock flat-rate autonomous travel and bypass congestion surcharges entirely.
          </Text>
        </View>

        {/* ─── Transparent Price Block ─── */}
        <Card style={styles.priceCard}>
          <View style={styles.priceRow}>
            <View>
              <Text style={theme.typography.label}>AUTOPASS FLAT PLAN</Text>
              <Text style={styles.pricePeriod}>Billed Monthly</Text>
            </View>
            <View style={styles.priceValueContainer}>
              <Text style={styles.priceSymbol}>$</Text>
              <Text style={styles.priceValue}>29</Text>
              <Text style={styles.priceUnit}>/mo</Text>
            </View>
          </View>
        </Card>

        {/* ─── Comparison Feature Matrix ─── */}
        <Text style={[theme.typography.label, styles.sectionTitle]}>HOW IT COMPARES</Text>
        <Card style={styles.matrixCard} padding={0}>
          {BENEFIT_MATRIX.map((item, index) => (
            <View 
              key={item.id} 
              style={[
                styles.matrixRow, 
                index < BENEFIT_MATRIX.length - 1 && styles.borderBottom
              ]}
            >
              <View style={styles.benefitTextWrapper}>
                <Text style={styles.benefitLabel}>{item.benefit}</Text>
              </View>
              <View style={styles.comparisonColumns}>
                <View style={styles.columnHalf}>
                  <Text style={[styles.columnText, item.accented && styles.primaryAccent]}>
                    {item.withPass}
                  </Text>
                </View>
                <View style={styles.columnHalf}>
                  <Text style={[styles.columnText, styles.mutedText]}>
                    {item.withoutPass}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Card>

        {/* Safe Lock Trust Badge */}
        <View style={styles.trustBadge}>
          <Text style={styles.trustBadgeText}>
            🔒 Cancel anytime with 1-tap. No commitment, zero fine print.
          </Text>
        </View>

        {/* ─── High Conversion Conversion CTA ─── */}
        <Button 
          label="Activate AutoPass Premium"
          variant="primary"
          onPress={handleUpgrade}
          style={styles.ctaButton}
        />
        
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
    lineHeight: 38,
  },
  subtext: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: theme.typography.body.fontSize - 1,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    lineHeight: 22,
  },
  priceCard: {
    marginBottom: theme.spacing.xxl,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pricePeriod: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  priceValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceSymbol: {
    fontFamily: theme.typography.section.fontFamily,
    fontSize: theme.typography.subheadline.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  priceValue: {
    fontFamily: theme.typography.hero.fontFamily,
    fontSize: theme.typography.hero.fontSize,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  priceUnit: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  matrixCard: {
    marginBottom: theme.spacing.xl,
  },
  matrixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  benefitTextWrapper: {
    width: '45%',
    paddingRight: theme.spacing.sm,
  },
  benefitLabel: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: theme.typography.body.fontSize - 2,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  comparisonColumns: {
    width: '55%',
    flexDirection: 'row',
  },
  columnHalf: {
    flex: 1,
    alignItems: 'flex-start',
  },
  columnText: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: theme.typography.supporting.fontSize,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  primaryAccent: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  mutedText: {
    color: theme.colors.textSecondary,
  },
  trustBadge: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  trustBadgeText: {
    fontFamily: theme.typography.supporting.fontFamily,
    fontSize: theme.typography.supporting.fontSize - 1,
    color: theme.colors.textSecondary,
  },
  ctaButton: {
    width: '100%',
  },
});
export default AutoPassScreen;
