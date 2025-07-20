import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

type Entry = {
  id: string;
  date: string;
  matHours: string;
  submissionsGot: string[];
  submissionsReceived: string[];
  sweeps: string[];
  dominantPositions: string[];
  notes: string;
};

type AnalyticsData = {
  totalHours: number;
  totalSessions: number;
  submissionsGot: { [key: string]: number };
  submissionsReceived: { [key: string]: number };
  sweeps: { [key: string]: number };
  positions: { [key: string]: number };
  weeklyHours: { week: string; hours: number }[];
  monthlyHours: { month: string; hours: number }[];
};

// Helper to group by base technique and side
function groupByBaseAndSide(data: { [key: string]: number }) {
  const result: { [key: string]: { L: number; R: number } } = {};
  Object.entries(data).forEach(([key, count]) => {
    const match = key.match(/^(.*) \((L|R)\)$/);
    if (match) {
      const base = match[1].trim();
      const side = match[2];
      if (!result[base]) result[base] = { L: 0, R: 0 };
      result[base][side] += count;
    } else {
      if (!result[key]) result[key] = { L: 0, R: 0 };
      result[key].L += count; // fallback
    }
  });
  return result;
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalHours: 0,
    totalSessions: 0,
    submissionsGot: {},
    submissionsReceived: {},
    sweeps: {},
    positions: {},
    weeklyHours: [],
    monthlyHours: []
  });
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [parseError, setParseError] = useState(false);

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true);
    setParseError(false);
    try {
      const stored = await AsyncStorage.getItem('bjj-tracker-entries');
      let entries: Entry[] = [];
      if (stored) {
        try {
          entries = JSON.parse(stored);
        } catch (e) {
          setParseError(true);
          entries = [];
        }
      }
      setHasData(entries.length > 0);
      // Calculate analytics
      const analytics: AnalyticsData = {
        totalHours: 0,
        totalSessions: entries.length,
        submissionsGot: {},
        submissionsReceived: {},
        sweeps: {},
        positions: {},
        weeklyHours: [],
        monthlyHours: []
      };
      const weekMap: { [key: string]: number } = {};
      const monthMap: { [key: string]: number } = {};
      entries.forEach(entry => {
        const hours = parseFloat(entry.matHours) || 0;
        analytics.totalHours += hours;
        // Submissions Got
        entry.submissionsGot.forEach(sub => {
          analytics.submissionsGot[sub] = (analytics.submissionsGot[sub] || 0) + 1;
        });
        // Submissions Received
        entry.submissionsReceived.forEach(sub => {
          analytics.submissionsReceived[sub] = (analytics.submissionsReceived[sub] || 0) + 1;
        });
        // Sweeps
        entry.sweeps.forEach(sweep => {
          analytics.sweeps[sweep] = (analytics.sweeps[sweep] || 0) + 1;
        });
        // Positions
        entry.dominantPositions.forEach(pos => {
          analytics.positions[pos] = (analytics.positions[pos] || 0) + 1;
        });
        // Weekly
        const date = new Date(entry.date);
        const year = date.getFullYear();
        const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
        const weekKey = `${year}-W${week.toString().padStart(2, '0')}`;
        weekMap[weekKey] = (weekMap[weekKey] || 0) + hours;
        // Monthly
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        monthMap[monthKey] = (monthMap[monthKey] || 0) + hours;
      });
      analytics.weeklyHours = Object.entries(weekMap).map(([week, hours]) => ({ week, hours }));
      analytics.monthlyHours = Object.entries(monthMap).map(([month, hours]) => ({ month, hours }));
      setAnalyticsData(analytics);
    } catch (error) {
      setParseError(true);
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadAnalyticsData();
    }, [loadAnalyticsData])
  );

  const getWeekKey = (date: Date): string => {
    const year = date.getFullYear();
    const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week.toString().padStart(2, '0')}`;
  };

  const getMonthKey = (date: Date): string => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const getTopTechniques = (data: { [key: string]: number }, count: number = 5) => {
    return Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([name, count]) => ({ name, count }));
  };

  const createPieChartData = (data: { [key: string]: number }) => {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    return Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      }));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (parseError) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>There was a problem loading your analytics data. Try adding a new entry or resetting your data.</Text>
      </View>
    );
  }

  if (!hasData) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Data Yet</Text>
          <Text style={styles.emptyStateText}>
            Start tracking your training sessions to see detailed analytics and insights about your BJJ progress.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⏱️</Text>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>TOTAL HOURS</Text>
            <Text style={styles.statValue}>{analyticsData.totalHours.toFixed(1)}</Text>
          </View>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📊</Text>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>SESSIONS</Text>
            <Text style={styles.statValue}>{analyticsData.totalSessions}</Text>
          </View>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📈</Text>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>AVG HOURS/SESSION</Text>
            <Text style={styles.statValue}>
              {analyticsData.totalSessions > 0 ? (analyticsData.totalHours / analyticsData.totalSessions).toFixed(1) : '0'}
            </Text>
          </View>
        </View>
      </View>

      {/* Weekly Hours Chart */}
      {analyticsData.weeklyHours.length > 0 && (
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Weekly Training Hours</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: analyticsData.weeklyHours.map(w => w.week.split('-W')[1]),
                datasets: [{
                  data: analyticsData.weeklyHours.map(w => w.hours)
                }]
              }}
              width={Dimensions.get('window').width - 64}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForLabels: {
                  fontSize: 12,
                  fontWeight: '600'
                }
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>
      )}

      {/* Submissions Got Chart */}
      {Object.keys(analyticsData.submissionsGot).length > 0 && (
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Submissions You Got</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={createPieChartData(analyticsData.submissionsGot)}
              width={Dimensions.get('window').width - 64}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
          {/* L/R breakdown */}
          <View style={{ marginTop: 12 }}>
            {Object.entries(groupByBaseAndSide(analyticsData.submissionsGot)).map(([base, sides]) => (
              <View key={base} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text>{base}</Text>
                <Text>L: {sides.L}   R: {sides.R}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Submissions Received Chart */}
      {Object.keys(analyticsData.submissionsReceived).length > 0 && (
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Submissions Done On You</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={createPieChartData(analyticsData.submissionsReceived)}
              width={Dimensions.get('window').width - 64}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
          {/* L/R breakdown */}
          <View style={{ marginTop: 12 }}>
            {Object.entries(groupByBaseAndSide(analyticsData.submissionsReceived)).map(([base, sides]) => (
              <View key={base} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text>{base}</Text>
                <Text>L: {sides.L}   R: {sides.R}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Sweeps Chart */}
      {Object.keys(analyticsData.sweeps).length > 0 && (
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Sweeps</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={createPieChartData(analyticsData.sweeps)}
              width={Dimensions.get('window').width - 64}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
          {/* L/R breakdown */}
          <View style={{ marginTop: 12 }}>
            {Object.entries(groupByBaseAndSide(analyticsData.sweeps)).map(([base, sides]) => (
              <View key={base} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text>{base}</Text>
                <Text>L: {sides.L}   R: {sides.R}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Top Techniques Lists */}
      <View style={styles.topTechniquesContainer}>
        <View style={styles.topTechniquesSection}>
          <Text style={styles.sectionTitle}>Top Submissions Got</Text>
          {getTopTechniques(analyticsData.submissionsGot).map((item, index) => (
            <View key={index} style={styles.techniqueRank}>
              <View style={styles.rankNumber}>
                <Text style={styles.rankNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.techniqueName}>{item.name}</Text>
              <View style={styles.techniqueCount}>
                <Text style={styles.techniqueCountText}>{item.count}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.topTechniquesSection}>
          <Text style={styles.sectionTitle}>Top Sweeps</Text>
          {getTopTechniques(analyticsData.sweeps).map((item, index) => (
            <View key={index} style={styles.techniqueRank}>
              <View style={styles.rankNumber}>
                <Text style={styles.rankNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.techniqueName}>{item.name}</Text>
              <View style={styles.techniqueCount}>
                <Text style={styles.techniqueCountText}>{item.count}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center'
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666'
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  statIcon: {
    fontSize: 32,
    color: '#667eea'
  },
  statContent: {
    flex: 1
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  statValue: {
    color: '#333',
    fontSize: 24,
    fontWeight: '700',
    margin: 0
  },
  analyticsSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0'
  },
  chartContainer: {
    alignItems: 'center'
  },
  chart: {
    borderRadius: 8
  },
  topTechniquesContainer: {
    flexDirection: 'row',
    gap: 16
  },
  topTechniquesSection: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  techniqueRank: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    gap: 12
  },
  rankNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rankNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700'
  },
  techniqueName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  techniqueCount: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  techniqueCountText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600'
  },
  addButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600'
  }
}); 