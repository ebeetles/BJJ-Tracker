import React, { useMemo } from 'react';
import './AnalyticsSection.css';

const HollowPieChart = ({ data, size = 120, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let currentAngle = -90; // Start from top
  
  const segments = data.map((item, index) => {
    const percentage = item.value / data.reduce((sum, d) => sum + d.value, 0);
    const angle = percentage * 360;
    const strokeDasharray = (percentage * circumference);
    
    const x1 = size / 2 + radius * Math.cos(currentAngle * Math.PI / 180);
    const y1 = size / 2 + radius * Math.sin(currentAngle * Math.PI / 180);
    const x2 = size / 2 + radius * Math.cos((currentAngle + angle) * Math.PI / 180);
    const y2 = size / 2 + radius * Math.sin((currentAngle + angle) * Math.PI / 180);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`
    ].join(' ');
    
    currentAngle += angle;
    
    return {
      pathData,
      strokeDasharray,
      color: item.color,
      label: item.label,
      value: item.value,
      percentage: (percentage * 100).toFixed(1)
    };
  });

  return (
    <div className="pie-chart-container">
      <svg width={size} height={size} className="pie-chart">
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.pathData}
            stroke={segment.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            className="pie-segment"
          />
        ))}
      </svg>
      <div className="pie-center">
        <div className="pie-total">{data.reduce((sum, d) => sum + d.value, 0)}</div>
        <div className="pie-label">Total</div>
      </div>
    </div>
  );
};

const AnalyticsSection = ({ trackingData }) => {
  const analytics = useMemo(() => {
    if (trackingData.length === 0) {
      return {
        totalMatHours: 0,
        totalSessions: 0,
        averageSessionLength: 0,
        totalSubmissionsGot: 0,
        totalSubmissionsReceived: 0,
        submissionRatio: 0,
        mostCommonSubmissionGot: null,
        mostCommonSubmissionReceived: null,
        weeklyHours: [],
        monthlyHours: [],
        submissionStats: {},
        recentTrends: [],
        pieChartData: []
      };
    }

    // Calculate basic stats
    const totalMatHours = trackingData.reduce((sum, entry) => sum + (parseFloat(entry.matHours) || 0), 0);
    const totalSessions = trackingData.length;
    const averageSessionLength = totalMatHours / totalSessions;

    // Calculate submission stats
    const allSubmissionsGot = trackingData.flatMap(entry => entry.submissionsGot || []);
    const allSubmissionsReceived = trackingData.flatMap(entry => entry.submissionsReceived || []);
    
    const totalSubmissionsGot = allSubmissionsGot.length;
    const totalSubmissionsReceived = allSubmissionsReceived.length;
    const submissionRatio = totalSubmissionsReceived > 0 ? totalSubmissionsGot / totalSubmissionsReceived : totalSubmissionsGot;

    // Most common submissions
    const submissionGotCounts = {};
    const submissionReceivedCounts = {};
    
    allSubmissionsGot.forEach(sub => {
      submissionGotCounts[sub] = (submissionGotCounts[sub] || 0) + 1;
    });
    
    allSubmissionsReceived.forEach(sub => {
      submissionReceivedCounts[sub] = (submissionReceivedCounts[sub] || 0) + 1;
    });

    const mostCommonSubmissionGot = Object.entries(submissionGotCounts)
      .sort(([,a], [,b]) => b - a)[0] || null;
    
    const mostCommonSubmissionReceived = Object.entries(submissionReceivedCounts)
      .sort(([,a], [,b]) => b - a)[0] || null;

    // Weekly and monthly breakdowns
    const weeklyHours = {};
    const monthlyHours = {};
    
    trackingData.forEach(entry => {
      const date = new Date(entry.date);
      const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)}`;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      weeklyHours[weekKey] = (weeklyHours[weekKey] || 0) + (parseFloat(entry.matHours) || 0);
      monthlyHours[monthKey] = (monthlyHours[monthKey] || 0) + (parseFloat(entry.matHours) || 0);
    });

    // Recent trends (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const recentData = trackingData.filter(entry => 
      new Date(entry.date) >= fourWeeksAgo
    );

    const recentTrends = recentData.map(entry => ({
      date: entry.date,
      hours: parseFloat(entry.matHours) || 0,
      submissionsGot: (entry.submissionsGot || []).length,
      submissionsReceived: (entry.submissionsReceived || []).length
    }));

    // Pie chart data
    const pieChartData = [
      {
        label: 'Submissions Got',
        value: totalSubmissionsGot,
        color: '#4CAF50'
      },
      {
        label: 'Submissions Received',
        value: totalSubmissionsReceived,
        color: '#f44336'
      }
    ];

    return {
      totalMatHours,
      totalSessions,
      averageSessionLength,
      totalSubmissionsGot,
      totalSubmissionsReceived,
      submissionRatio,
      mostCommonSubmissionGot,
      mostCommonSubmissionReceived,
      weeklyHours: Object.entries(weeklyHours).sort(([a], [b]) => a.localeCompare(b)),
      monthlyHours: Object.entries(monthlyHours).sort(([a], [b]) => a.localeCompare(b)),
      submissionStats: { ...submissionGotCounts, ...submissionReceivedCounts },
      recentTrends,
      pieChartData
    };
  }, [trackingData]);

  const formatHours = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getProgressBarWidth = (value, max) => {
    return Math.min((value / max) * 100, 100);
  };

  if (trackingData.length === 0) {
    return (
      <div className="analytics-section">
        <div className="analytics-header">
          <h2>Training Analytics</h2>
        </div>
        <div className="empty-analytics">
          <p>No training data available yet.</p>
          <p>Start tracking your training sessions to see detailed analytics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-section">
      <div className="analytics-header">
        <h2>Training Analytics</h2>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>Total Mat Hours</h3>
            <p className="stat-value">{formatHours(analytics.totalMatHours)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Training Sessions</h3>
            <p className="stat-value">{analytics.totalSessions}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Avg Session Length</h3>
            <p className="stat-value">{formatHours(analytics.averageSessionLength)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Submission Ratio</h3>
            <p className="stat-value">{analytics.submissionRatio.toFixed(1)}:1</p>
          </div>
        </div>
      </div>

      {/* Submission Stats with Pie Chart */}
      <div className="analytics-section-group">
        <h3>Submission Statistics</h3>
        <div className="submission-stats-with-chart">
          <div className="pie-chart-section">
            <HollowPieChart data={analytics.pieChartData} />
            <div className="pie-legend">
              {analytics.pieChartData.map((item, index) => (
                <div key={index} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="legend-label">{item.label}</span>
                  <span className="legend-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="submission-details">
            <div className="submission-stat">
              <h4>✅ Submissions You Got</h4>
              <p className="stat-number">{analytics.totalSubmissionsGot}</p>
              {analytics.mostCommonSubmissionGot && (
                <p className="stat-detail">
                  Most common: <strong>{analytics.mostCommonSubmissionGot[0]}</strong> ({analytics.mostCommonSubmissionGot[1]}x)
                </p>
              )}
            </div>
            
            <div className="submission-stat">
              <h4>❌ Submissions Received</h4>
              <p className="stat-number">{analytics.totalSubmissionsReceived}</p>
              {analytics.mostCommonSubmissionReceived && (
                <p className="stat-detail">
                  Most common: <strong>{analytics.mostCommonSubmissionReceived[0]}</strong> ({analytics.mostCommonSubmissionReceived[1]}x)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trends */}
      {analytics.recentTrends.length > 0 && (
        <div className="analytics-section-group">
          <h3>Recent Trends (Last 4 Weeks)</h3>
          <div className="trends-container">
            {analytics.recentTrends.slice(-7).map((trend, index) => (
              <div key={index} className="trend-item">
                <div className="trend-date">{formatDate(trend.date)}</div>
                <div className="trend-stats">
                  <span className="trend-hours">⏱️ {formatHours(trend.hours)}</span>
                  <span className="trend-submissions">
                    ✅ {trend.submissionsGot} | ❌ {trend.submissionsReceived}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Hours Chart */}
      {analytics.weeklyHours.length > 0 && (
        <div className="analytics-section-group">
          <h3>Weekly Training Hours</h3>
          <div className="chart-container">
            {analytics.weeklyHours.slice(-8).map(([week, hours], index) => (
              <div key={week} className="chart-bar">
                <div className="bar-label">{week}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${getProgressBarWidth(hours, Math.max(...analytics.weeklyHours.map(([,h]) => h)))}%` }}
                  ></div>
                </div>
                <div className="bar-value">{formatHours(hours)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Submissions */}
      <div className="analytics-section-group">
        <h3>Top Submissions</h3>
        <div className="top-submissions">
          <div className="submission-category">
            <h4>✅ Your Most Successful</h4>
            {Object.entries(analytics.submissionStats)
              .filter(([sub]) => analytics.allSubmissionsGot?.includes(sub))
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([submission, count], index) => (
                <div key={submission} className="submission-rank">
                  <span className="rank-number">{index + 1}</span>
                  <span className="submission-name">{submission}</span>
                  <span className="submission-count">{count}</span>
                </div>
              ))}
          </div>
          
          <div className="submission-category">
            <h4>❌ Most Common Against You</h4>
            {Object.entries(analytics.submissionStats)
              .filter(([sub]) => analytics.allSubmissionsReceived?.includes(sub))
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([submission, count], index) => (
                <div key={submission} className="submission-rank">
                  <span className="rank-number">{index + 1}</span>
                  <span className="submission-name">{submission}</span>
                  <span className="submission-count">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection; 