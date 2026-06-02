import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  Pressable, 
  SafeAreaView, 
  StatusBar,
  Dimensions
} from 'react-native';
import { theme } from '../theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LocationNode {
  id: string;
  name: string;
  address: string;
  etaMinutes: number;
  cost: number;
}

const RECENT_LOCATIONS: LocationNode[] = [
  { id: '1', name: 'Work HQ', address: '84 Pine Street, Financial District', etaMinutes: 12, cost: 18.50 },
  { id: '2', name: 'Equinox Gym', address: '445 Hudson St, West Village', etaMinutes: 8, cost: 12.00 },
  { id: '3', name: 'Design Studio', address: '18 Mercer St, SoHo', etaMinutes: 15, cost: 22.40 },
];

export const HomeScreen: React.FC = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<LocationNode | null>(null);
  const [isBookingState, setIsBookingState] = useState(false);

  const handleSelectLocation = (loc: LocationNode) => {
    setSelectedDestination(loc);
    setSearchQuery(loc.name);
    setSearchFocused(false);
    setIsBookingState(true);
  };

  const handleResetSearch = () => {
    setSelectedDestination(null);
    setSearchQuery('');
    setIsBookingState(false);
  };

  const handleBookRide = () => {
    // Simulated ride confirm event
    alert(`Autonomous ride confirmed to ${selectedDestination?.name}! En route.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* ─── Map Viewport (60% Height Mock) ─── */}
      <View style={styles.mapContainer}>
        {/* Sleek simulated dark grid map */}
        <View style={styles.gridMap}>
          {/* Autonomous route nodes */}
          <View style={[styles.mapNode, { top: '30%', left: '40%' }]} />
          <View style={[styles.mapNodeActive, { top: '50%', left: '60%' }]} />
          
          {isBookingState && (
            <View style={styles.simulatedPath}>
              <View style={styles.simulatedCar} />
            </View>
          )}

          <Text style={styles.telemetryTag}>
            SYSTEM STATUS: ONLINE · LIDAR CALIBRATED
          </Text>
        </View>

        {/* Ambient AutoPass Tag (Not intrusive) */}
        <View style={styles.ambientBadgeContainer}>
          <View style={styles.badgePill}>
            <View style={styles.greenPulse} />
            <Text style={styles.badgeText}>AUTOPASS ACTIVE</Text>
          </View>
        </View>
      </View>

      {/* ─── Unified Bottom Sheet (Thumb Zone Priority) ─── */}
      <View style={styles.bottomSheet}>
        {!isBookingState ? (
          <>
            {/* Greeting Header */}
            <View style={styles.header}>
              <Text style={theme.typography.label}>PILO MOBILITY</Text>
              <Text style={styles.title}>Where to next?</Text>
            </View>

            {/* Destination Search Box */}
            <View style={[styles.searchContainer, searchFocused && styles.searchFocused]}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search destination..."
                placeholderTextColor={theme.colors.textTertiary}
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onChangeText={setSearchQuery}
                accessibilityLabel="Destination Input"
                accessibilityHint="Enter the address you wish to travel to"
              />
            </View>

            {/* Recents Directory */}
            <Text style={[theme.typography.label, styles.recentLabel]}>RECENT LOCATIONS</Text>
            <FlatList
              data={RECENT_LOCATIONS.filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Pressable 
                  style={styles.recentItem}
                  onPress={() => handleSelectLocation(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${item.name}`}
                >
                  <View style={styles.recentTextWrapper}>
                    <Text style={styles.recentName}>{item.name}</Text>
                    <Text style={styles.recentAddress}>{item.address}</Text>
                  </View>
                  <Text style={styles.recentEta}>{item.etaMinutes} min</Text>
                </Pressable>
              )}
            />
          </>
        ) : (
          /* ─── Active Route Summary Sheet (Pre-booking layout) ─── */
          <View style={styles.confirmWrapper}>
            <View style={styles.confirmHeader}>
              <Pressable onPress={handleResetSearch} hitSlop={12} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Edit</Text>
              </Pressable>
              <Text style={theme.typography.label}>CONFIRM PATHWAY</Text>
            </View>

            <Text style={styles.destinationTitle}>{selectedDestination?.name}</Text>
            <Text style={styles.destinationAddress}>{selectedDestination?.address}</Text>

            <Card style={styles.metricCard}>
              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <Text style={theme.typography.label}>ESTIMATED ARRIVAL</Text>
                  <Text style={styles.metricValue}>{selectedDestination?.etaMinutes} min</Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.metricItem}>
                  <Text style={theme.typography.label}>AUTOPASS COST</Text>
                  <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
                    ${selectedDestination?.cost.toFixed(2)}
                  </Text>
                </View>
              </View>
            </Card>

            <Button 
              label="Book Autonomous Ride"
              variant="primary"
              onPress={handleBookRide}
              style={styles.bookButton}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mapContainer: {
    height: SCREEN_HEIGHT * 0.45,
    position: 'relative',
    backgroundColor: '#0A0A0A',
  },
  gridMap: {
    flex: 1,
    position: 'relative',
    borderColor: theme.colors.borderSubtle,
    borderBottomWidth: 1,
  },
  mapNode: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.textTertiary,
  },
  mapNodeActive: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.primary,
  },
  simulatedPath: {
    position: 'absolute',
    top: '40%',
    left: '42%',
    width: '18%',
    height: 2,
    backgroundColor: theme.colors.primary,
    opacity: 0.8,
  },
  simulatedCar: {
    position: 'absolute',
    top: -4,
    left: '50%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.textPrimary,
  },
  telemetryTag: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.xl,
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.textTertiary,
    letterSpacing: 0.5,
  },
  ambientBadgeContainer: {
    position: 'absolute',
    top: theme.spacing.xl,
    right: theme.spacing.xl,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSubtle,
    borderWidth: 1,
    borderRadius: theme.radius.badge,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  badgeText: {
    ...theme.typography.label,
    fontSize: 9,
    color: theme.colors.textPrimary,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.typography.section.fontFamily,
    fontSize: theme.typography.section.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xs,
  },
  searchContainer: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSubtle,
    borderWidth: 1,
    borderRadius: theme.radius.input,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  searchFocused: {
    borderColor: theme.colors.primary,
  },
  searchInput: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textPrimary,
  },
  recentLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  recentTextWrapper: {
    flex: 1,
  },
  recentName: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  recentAddress: {
    fontFamily: theme.typography.supporting.fontFamily,
    fontSize: theme.typography.supporting.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  recentEta: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  confirmWrapper: {
    flex: 1,
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    marginRight: theme.spacing.lg,
  },
  backButtonText: {
    fontFamily: theme.typography.body.fontFamily,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  destinationTitle: {
    fontFamily: theme.typography.section.fontFamily,
    fontSize: theme.typography.section.fontSize - 2,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  destinationAddress: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: theme.typography.body.fontSize - 2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  metricCard: {
    marginBottom: theme.spacing.xxl,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
  },
  metricValue: {
    fontFamily: theme.typography.section.fontFamily,
    fontSize: theme.typography.subheadline.fontSize + 2,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xs,
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.borderSubtle,
    marginHorizontal: theme.spacing.lg,
  },
  bookButton: {
    marginTop: 'auto',
  },
});
