import React from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle, 
  GestureResponderEvent 
} from 'react-native';
import { theme } from '../theme';

export interface ButtonProps {
  label?: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  labelStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';
  const isIcon = variant === 'icon';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole={isIcon ? 'imagebutton' : 'button'}
      accessibilityState={{ disabled, busy: loading }}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        isGhost && styles.ghost,
        isIcon && styles.iconButton,
        disabled && styles.disabled,
        pressed && !disabled && (isPrimary ? styles.primaryPressed : styles.pressedOpacity),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator 
          color={isPrimary ? theme.colors.background : theme.colors.primary} 
          size="small" 
        />
      ) : (
        <>
          {icon && icon}
          {label && !isIcon && (
            <Text
              style={[
                styles.labelText,
                isPrimary && styles.primaryLabel,
                isSecondary && styles.secondaryLabel,
                isGhost && styles.ghostLabel,
                disabled && styles.disabledLabel,
                labelStyle,
              ]}
            >
              {label}
            </Text>
          )}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: theme.radius.interactive,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    minWidth: 44, // Touch target guideline
  },
  primary: {
    backgroundColor: theme.colors.primary,
    width: '100%',
  },
  primaryPressed: {
    backgroundColor: theme.colors.primaryActive,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.textPrimary,
    width: '100%',
  },
  secondaryLabel: {
    color: theme.colors.textPrimary,
  },
  ghost: {
    backgroundColor: 'transparent',
    height: 'auto',
    paddingHorizontal: 0,
    width: 'auto',
  },
  ghostLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    paddingHorizontal: 0,
  },
  labelText: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    letterSpacing: -0.16,
  },
  primaryLabel: {
    color: theme.colors.background,
  },
  pressedOpacity: {
    opacity: 0.7,
  },
  disabled: {
    backgroundColor: theme.colors.control,
    borderColor: 'transparent',
    opacity: 0.5,
  },
  disabledLabel: {
    color: theme.colors.textTertiary,
  },
});
