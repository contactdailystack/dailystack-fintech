import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';

export interface StatBadgeProps {
  value: string | number;
  label: string;
  unit?: string;
  highlighted?: boolean;
  style?: ViewStyle;
}

export const StatBadge: React.FC<StatBadgeProps> = ({
  value,
  label,
  unit,
  highlighted = false,
  style,
}) => {
  return (
    <View style={[styles.container, highlighted && styles.highlightedBorder, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, highlighted && styles.highlightedText]}>
          {value}
        </Text>
        {unit && (
          <Text style={[styles.unit, highlighted && styles.highlightedUnit]}>
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSubtle,
    borderWidth: 1,
    borderRadius: theme.radius.large,
    padding: theme.spacing.lg,
    flex: 1,
    minWidth: 100,
    justifyContent: 'center',
  },
  highlightedBorder: {
    borderColor: theme.colors.primary,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontFamily: theme.typography.hero.fontFamily,
    fontSize: theme.typography.section.fontSize,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  highlightedText: {
    color: theme.colors.primary,
  },
  unit: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginLeft: 2,
  },
  highlightedUnit: {
    color: theme.colors.primary,
    opacity: 0.8,
  },
});
