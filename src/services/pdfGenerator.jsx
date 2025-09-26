import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  pdf
} from '@react-pdf/renderer';

// Register fonts for better text rendering
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfB.ttf', fontWeight: 'bold' }
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  
  // Header styles
  header: {
    backgroundColor: '#2563eb',
    padding: 20,
    marginBottom: 20,
    borderRadius: 8
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5
  },
  headerSubtitle: {
    color: '#e0e7ff',
    fontSize: 14,
    textAlign: 'center'
  },
  
  // User info card
  userCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  userLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 'normal'
  },
  userValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: 'bold'
  },
  
  // Overall score section
  overallScore: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center'
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
    textAlign: 'center'
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  scoreLabel: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold'
  },
  scoreStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280'
  },
  
  // Section titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
    marginTop: 20
  },
  
  // Charts section
  chartsSection: {
    marginBottom: 20
  },
  chartContainer: {
    marginBottom: 15,
    padding: 15,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    backgroundColor: '#ffffff'
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center'
  },
  
  // Bar chart representation
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  bar: {
    flex: 1,
    marginHorizontal: 2,
    backgroundColor: '#3b82f6',
    borderRadius: 2
  },
  barLabel: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 5
  },
  
  // Gauge chart representation
  gaugeContainer: {
    alignItems: 'center',
    padding: 20
  },
  gaugeCircle: {
    width: 120,
    height: 60,
    border: '8px solid #e5e7eb',
    borderTop: '8px solid #3b82f6',
    borderRadius: 60,
    marginBottom: 10
  },
  gaugeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center'
  },
  
  // Pie chart representation
  pieChart: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    padding: 20
  },
  pieSlice: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 5
  },
  pieLegend: {
    marginLeft: 20
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  legendColor: {
    width: 12,
    height: 12,
    marginRight: 8
  },
  legendText: {
    fontSize: 10,
    color: '#6b7280'
  },
  
  // Spider chart representation (simplified as bar chart)
  spiderChart: {
    alignItems: 'center',
    padding: 20
  },
  
  // Packet analysis cards
  packetCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center'
  },
  packetInfo: {
    flex: 1
  },
  packetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10
  },
  packetDetails: {
    flexDirection: 'row',
    gap: 20
  },
  packetDetail: {
    fontSize: 12,
    color: '#6b7280'
  },
  packetDetailValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: 'bold'
  },
  packetPerformance: {
    alignItems: 'center',
    marginRight: 20
  },
  performanceImage: {
    width: 40,
    height: 40,
    marginBottom: 5
  },
  performanceText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center'
  },
  largeTextContainer: {
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    padding: 15,
    marginTop: 10
  },
  largeText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.4
  },
  
  // Performance insights
  insightsCard: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #0ea5e9',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0c4a6e',
    marginBottom: 10
  },
  insightsText: {
    fontSize: 12,
    color: '#0c4a6e',
    lineHeight: 1.5
  },
  
  // Recommendations
  recommendationsCard: {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 10
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  recommendationNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2
  },
  recommendationNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  recommendationText: {
    fontSize: 12,
    color: '#92400e',
    flex: 1,
    lineHeight: 1.4
  },
  
  // Footer
  footer: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: 20,
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  footerText: {
    fontSize: 10,
    color: '#6b7280'
  }
});

// Helper function to safely parse CSS values
const safeParseCSSValue = (value, fallback = 0) => {
  if (!value) return fallback;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return !isNaN(parsed) ? parsed : fallback;
  }
  return fallback;
};

// Helper function to safely parse margin values
const safeParseMargin = (margin, fallback = 0) => {
  if (!margin) return fallback;
  if (typeof margin === 'number') return margin;
  if (typeof margin === 'string') {
    if (margin.includes(' ')) {
      const parts = margin.split(' ');
      const parsed = parseFloat(parts[0]);
      return !isNaN(parsed) ? parsed : fallback;
    } else {
      const parsed = parseFloat(margin);
      return !isNaN(parsed) ? parsed : fallback;
    }
  }
  return fallback;
};

// Helper function to get performance level
const getPerformanceLevel = (marks, packet = null) => {
  console.log('🔍 getPerformanceLevel called with:', { marks, packetName: packet?.name });
  
  // First try to use the packet's own scoring scale
  if (packet && packet.scoringScale && packet.scoringScale.length > 0) {
    console.log('🔍 Using packet scoring scale with ranges:', packet.scoringScale.map(r => ({ min: r.min, max: r.max, hasImage: !!r.image })));
    
    const level = packet.scoringScale.find(range => marks >= range.min && marks <= range.max);
    console.log('🔍 Found matching level in packet:', level);
    
    if (level) {
      const result = {
        ...level,
        // Keep the original image field for base64 data
        image: level.image,
        // Use emoji as fallback if no custom image
        emoji: level.image && level.image.startsWith('data:image') ? null : (level.image || "📚")
      };
      console.log('🔍 Returning packet result:', { ...result, image: result.image ? 'BASE64_IMAGE' : 'NO_IMAGE' });
      return result;
    }
  }
  
  console.log('🔍 Using default scale for marks:', marks);
  // Default scale
  const defaultScale = [
    { min: 0, max: 2, label: "Needs Improvement", color: "#dc2626", emoji: "📚", largeText: "Keep practicing! You're making progress." },
    { min: 3, max: 5, label: "Average", color: "#d97706", emoji: "📊", largeText: "Good effort! You're on the right track." },
    { min: 6, max: 8, label: "Good", color: "#059669", emoji: "🎯", largeText: "Well done! You're showing strong understanding." },
    { min: 9, max: 15, label: "Excellent", color: "#2563eb", emoji: "🏆", largeText: "Outstanding! You've mastered this material!" }
  ];
  
  const level = defaultScale.find(range => marks >= range.min && marks <= range.max);
  return level || defaultScale[0];
};

// Chart Components
const BarChart = ({ data, labels, title }) => (
  <View style={styles.chartContainer}>
    <Text style={styles.chartTitle}>{title}</Text>
    <View style={styles.barChart}>
      {data.map((value, index) => (
        <View key={index} style={styles.barContainer}>
          <View 
            style={[
              styles.bar, 
              { 
                height: Math.max(20, (value / Math.max(...data)) * 80),
                backgroundColor: index % 2 === 0 ? '#3b82f6' : '#10b981'
              }
            ]} 
          />
          <Text style={styles.barLabel}>{labels[index]}</Text>
        </View>
      ))}
    </View>
  </View>
);

const GaugeChart = ({ value, maxValue, title }) => {
  const percentage = Math.min(100, (value / maxValue) * 100);
  const rotation = (percentage / 100) * 180;
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.gaugeContainer}>
        <View style={styles.gaugeCircle} />
        <Text style={styles.gaugeText}>{Math.round(percentage)}%</Text>
        <Text style={[styles.gaugeText, { fontSize: 12 }]}>{value}/{maxValue}</Text>
      </View>
    </View>
  );
};

const PieChart = ({ data, labels, title }) => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.pieChart}>
        <View style={styles.pieLegend}>
          {labels.map((label, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors[index % colors.length] }]} />
              <Text style={styles.legendText}>{label}: {data[index]}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const SpiderChart = ({ data, labels, title }) => (
  <View style={styles.chartContainer}>
    <Text style={styles.chartTitle}>{title}</Text>
    <View style={styles.spiderChart}>
      {/* Simplified radar chart - show performance levels as bars */}
      <View style={styles.barChart}>
        {data.map((value, index) => (
          <View key={index} style={styles.barContainer}>
            <View 
              style={[
                styles.bar, 
                { 
                  height: Math.max(20, (value / 100) * 60),
                  backgroundColor: index % 2 === 0 ? '#ef4444' : '#8b5cf6'
                }
              ]} 
            />
            <Text style={styles.barLabel}>{labels[index]}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.gaugeText}>Performance Radar (Bar View)</Text>
    </View>
  </View>
);

// Main PDF Document Component
const AssessmentReportPDF = ({ quizData, userData, attemptData, packetScores, customScoringScale, template }) => {
  const totalMarks = attemptData.total_marks || 0;
  const totalQuestions = attemptData.total_questions || 0;
  // For overall performance, use the first packet with a scoring scale, or default
  const firstPacketWithScale = packetScores.find(p => p.packet && p.packet.scoringScale);
  const overallPerformance = getPerformanceLevel(totalMarks, firstPacketWithScale?.packet);

  // Filter and sort packets based on template configuration
  const getConfiguredPackets = () => {
    if (!template?.packetConfigs) {
      return packetScores;
    }
    
    return packetScores
      .filter(packetScore => {
        const config = template.packetConfigs[packetScore.packet?.id];
        return config?.enabled !== false;
      })
      .sort((a, b) => {
        const configA = template.packetConfigs[a.packet?.id];
        const configB = template.packetConfigs[b.packet?.id];
        return (configA?.order || 0) - (configB?.order || 0);
      });
  };

  const configuredPackets = getConfiguredPackets();
  
  // Prepare chart data
  const packetNames = packetScores.map(p => p.packetName);
  const packetMarks = packetScores.map(p => p.marks);
  const packetPercentages = packetScores.map(p => Math.round((p.marks / p.totalMarks) * 100));
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{quizData.name}</Text>
          <Text style={styles.headerSubtitle}>Assessment Performance Report</Text>
        </View>
        
        {/* User Information */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <Text style={styles.userLabel}>Participant:</Text>
            <Text style={styles.userValue}>{userData.user_name || 'Unknown User'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userLabel}>Email:</Text>
            <Text style={styles.userValue}>{userData.email || 'No email provided'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userLabel}>Completed:</Text>
            <Text style={styles.userValue}>
              {new Date(attemptData.completed_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
        
        {/* Overall Score */}
        <View style={styles.overallScore}>
          <Text style={styles.scoreTitle}>Overall Performance</Text>
          <View style={[styles.scoreCircle, { backgroundColor: overallPerformance.color }]}>
            <Text style={styles.scoreText}>{totalMarks}</Text>
            <Text style={styles.scoreLabel}>{overallPerformance.label}</Text>
          </View>
          <View style={styles.scoreStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalQuestions}</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalMarks}</Text>
              <Text style={styles.statLabel}>Total Marks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{overallPerformance.label}</Text>
              <Text style={styles.statLabel}>Performance</Text>
            </View>
          </View>
        </View>
        
        {/* Charts Section */}
        <Text style={styles.sectionTitle}>Performance Analytics</Text>
        
        {/* Bar Chart - Packet Performance */}
        <BarChart 
          data={packetMarks}
          labels={packetNames}
          title="Packet Performance Comparison"
        />
        
        {/* Gauge Chart - Overall Score */}
        <GaugeChart 
          value={totalMarks}
          maxValue={packetScores.reduce((sum, p) => sum + p.totalMarks, 0)}
          title="Overall Score Gauge"
        />
        
        {/* Pie Chart - Score Distribution */}
        <PieChart 
          data={packetMarks}
          labels={packetNames}
          title="Score Distribution by Packet"
        />
        
        {/* Spider Chart - Performance Radar */}
        <SpiderChart 
          data={packetPercentages}
          labels={packetNames}
          title="Performance Radar Chart"
        />
        
        {/* Section Analysis */}
        <Text style={styles.sectionTitle}>Section Analysis</Text>
        {configuredPackets.map((packet, index) => {
          const performance = getPerformanceLevel(packet.marks, packet.packet);
          const config = template?.packetConfigs?.[packet.packet?.id] || {};
          
          // Apply packet-specific styling with safe parsing
          const packetCardStyle = {
            ...styles.packetCard,
            backgroundColor: config.backgroundColor || styles.packetCard.backgroundColor,
            padding: safeParseCSSValue(config.padding, styles.packetCard.padding),
            marginBottom: safeParseMargin(config.margin, styles.packetCard.marginBottom),
            borderRadius: safeParseCSSValue(config.borderRadius, styles.packetCard.borderRadius),
            borderWidth: safeParseCSSValue(config.borderWidth, styles.packetCard.borderWidth),
            borderColor: config.borderColor || styles.packetCard.borderColor,
          };

          const packetNameStyle = {
            ...styles.packetName,
            fontSize: safeParseCSSValue(config.fontSize, styles.packetName.fontSize),
            fontWeight: config.fontWeight || styles.packetName.fontWeight,
            color: config.headerTextColor || styles.packetName.color,
          };

          return (
            <View key={index} style={packetCardStyle}>
              <View style={styles.packetInfo}>
                {/* Custom packet header */}
                {config.showHeader !== false && (
                  <View style={[styles.packetHeader, { 
                    backgroundColor: config.headerBackgroundColor || '#f8fafc',
                    padding: 8,
                    marginBottom: 8,
                    borderRadius: 4
                  }]}>
                    <Text style={packetNameStyle}>
                      {config.title || packet.packetName}
                    </Text>
                    {config.customLabel && (
                      <Text style={[styles.packetDetail, { 
                        color: config.headerTextColor || '#6b7280',
                        fontSize: 10
                      }]}>
                        {config.customLabel}
                      </Text>
                    )}
                  </View>
                )}

                {/* Score breakdown */}
                {config.showScoreBreakdown !== false && (
                  <View style={styles.packetDetails}>
                    <View>
                      <Text style={styles.packetDetail}>Marks: </Text>
                      <Text style={[styles.packetDetailValue, { color: config.scoreColor || styles.packetDetailValue.color }]}>
                        {packet.marks}
                      </Text>
                      {config.showScalingRange && packet.totalMarks && (
                        <Text style={[styles.packetDetail, { fontSize: 8, color: '#6b7280' }]}>
                          / {packet.totalMarks}
                        </Text>
                      )}
                    </View>
                    <View>
                      <Text style={styles.packetDetail}>Questions: </Text>
                      <Text style={styles.packetDetailValue}>{packet.questions}</Text>
                    </View>
                    {config.showScalingLevel !== false && (
                      <View>
                        <Text style={styles.packetDetail}>Level: </Text>
                        <Text style={[
                          styles.packetDetailValue, 
                          { 
                            color: config.showScalingColors ? (config.scoreColor || performance.color) : styles.packetDetailValue.color,
                            backgroundColor: config.levelIndicatorStyle === 'highlight' ? (performance.color + '20') : 'transparent',
                            padding: config.levelIndicatorStyle === 'badge' ? 4 : 0,
                            borderRadius: config.levelIndicatorStyle === 'badge' ? 4 : 0,
                          }
                        ]}>
                          {config.showScalingLabel !== false ? performance.label : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                
                {/* Custom Scoring Scale Text - Above position */}
                {config.showScalingText && config.textDisplayPosition === 'above' && performance.largeText && (
                  <View style={[styles.largeTextContainer, { borderColor: config.scoreColor || performance.color, marginBottom: 8 }]}>
                    <Text style={[styles.largeText, { color: config.scoreColor || performance.color }]}>
                      {performance.largeText}
                    </Text>
                  </View>
                )}

                {/* Performance recommendations */}
                {config.showRecommendations !== false && performance.largeText && (
                  <View style={[styles.largeTextContainer, { borderColor: config.scoreColor || performance.color }]}>
                    <Text style={[styles.largeText, { color: config.scoreColor || performance.color }]}>
                      {performance.largeText}
                    </Text>
                    {config.showImprovementSuggestions && (
                      <Text style={[styles.packetDetail, { marginTop: 4, fontStyle: 'italic' }]}>
                        💡 Keep practicing to reach the next level!
                      </Text>
                    )}
                  </View>
                )}

                {/* Custom Scoring Scale Text - Below/Inline/Separate positions */}
                {config.showScalingText && config.textDisplayPosition !== 'above' && performance.largeText && (
                  <View style={[
                    styles.largeTextContainer, 
                    { 
                      borderColor: config.scoreColor || performance.color,
                      marginTop: config.textDisplayPosition === 'separate' ? 12 : 8,
                      backgroundColor: config.textDisplayPosition === 'separate' ? '#f8fafc' : 'transparent'
                    }
                  ]}>
                    <Text style={[styles.largeText, { color: config.scoreColor || performance.color }]}>
                      {performance.largeText}
                    </Text>
                  </View>
                )}

                {/* Show All Scale Levels */}
                {config.showAllScaleLevels && packet.packet?.scoringScale && (
                  <View style={[styles.largeTextContainer, { backgroundColor: '#f8fafc', padding: 8, marginTop: 8 }]}>
                    <Text style={[styles.packetDetail, { fontWeight: 'bold', marginBottom: 4 }]}>
                      📊 All Performance Levels:
                    </Text>
                    {packet.packet.scoringScale.map((scale, idx) => (
                      <Text 
                        key={idx}
                        style={[
                          styles.packetDetail, 
                          { 
                            fontSize: 8,
                            color: config.highlightCurrentLevel && scale.label === performance.label ? 
                                   (config.scoreColor || performance.color) : '#6b7280',
                            fontWeight: config.highlightCurrentLevel && scale.label === performance.label ? 'bold' : 'normal',
                            marginBottom: 2
                          }
                        ]}
                      >
                        • {scale.label} ({scale.min}-{scale.max} points)
                      </Text>
                    ))}
                  </View>
                )}

                {/* Scale Comparison */}
                {config.showScaleComparison && packet.packet?.scoringScale && (
                  <View style={[styles.largeTextContainer, { backgroundColor: '#fdf2f8', padding: 8, marginTop: 8 }]}>
                    <Text style={[styles.packetDetail, { fontWeight: 'bold', marginBottom: 4 }]}>
                      📈 Level Comparison:
                    </Text>
                    <Text style={[styles.packetDetail, { fontSize: 8, color: '#6b7280' }]}>
                      Current: {performance.label} | Next: {
                        packet.packet.scoringScale.find(s => s.min > performance.max)?.label || 'Maximum level reached'
                      }
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.packetPerformance}>
                {/* Display custom image if available with size options */}
                {config.showScalingImage !== false && performance.image && performance.image.startsWith('data:image') ? (
                  <Image 
                    src={performance.image} 
                    style={[
                      styles.performanceImage,
                      {
                        width: config.imageDisplayStyle === 'large' ? 100 : 
                               config.imageDisplayStyle === 'medium' ? 64 : 32,
                        height: config.imageDisplayStyle === 'large' ? 100 : 
                                config.imageDisplayStyle === 'medium' ? 64 : 32,
                        objectFit: config.imageDisplayStyle === 'banner' ? 'cover' : 'contain'
                      }
                    ]} 
                  />
                ) : config.showScalingImage !== false ? (
                  <Text style={[
                    styles.performanceText, 
                    { 
                      fontSize: config.imageDisplayStyle === 'large' ? 36 : 
                               config.imageDisplayStyle === 'medium' ? 28 : 20
                    }
                  ]}>
                    {performance.emoji}
                  </Text>
                ) : null}
                <Text style={styles.performanceText}>{performance.label}</Text>
              </View>
            </View>
          );
        })}
        
        {/* Performance Insights */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Performance Insights</Text>
          <Text style={styles.insightsText}>
            {totalMarks >= 9 
              ? "Exceptional performance across all sections! You demonstrate mastery of the subject matter."
              : totalMarks >= 6
              ? "Strong overall performance with room for refinement in specific areas."
              : totalMarks >= 3
              ? "Good foundation with clear opportunities for improvement."
              : "This assessment highlights areas that need focused attention. Consider additional study time and practice."
            }
          </Text>
        </View>
        
        {/* Recommendations */}
        <View style={styles.recommendationsCard}>
          <Text style={styles.recommendationsTitle}>Recommendations</Text>
          <View style={styles.recommendationItem}>
            <View style={styles.recommendationNumber}>
              <Text style={styles.recommendationNumberText}>1</Text>
            </View>
            <Text style={styles.recommendationText}>
              {totalMarks >= 6 
                ? "Maintain your excellent study habits and continue practicing regularly."
                : "Develop a structured study schedule focusing on areas where you scored below average."
              }
            </Text>
          </View>
          <View style={styles.recommendationItem}>
            <View style={styles.recommendationNumber}>
              <Text style={styles.recommendationNumberText}>2</Text>
            </View>
            <Text style={styles.recommendationText}>
              Review your responses and understand the reasoning behind different scoring levels.
            </Text>
          </View>
          <View style={styles.recommendationItem}>
            <View style={styles.recommendationNumber}>
              <Text style={styles.recommendationNumberText}>3</Text>
            </View>
            <Text style={styles.recommendationText}>
              {totalMarks < 3 
                ? "Consider seeking additional help from instructors or study groups for challenging topics."
                : "Focus on the sections with lower scores to achieve even better results."
              }
            </Text>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated by Assessment System</Text>
          <Text style={styles.footerText}>
            Report Date: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Main PDF Generator Class
class ProfessionalPDFGenerator {
  constructor() {
    this.customScoringScale = null;
  }

  // Set custom scoring scale
  setCustomScoringScale(scoringScale) {
    this.customScoringScale = scoringScale;
  }

  // Generate PDF report
  async generateReport(quizData, userData, attemptData, questions, answers, packets, customScoringScale = null, template = null) {
    try {
      console.log('📊 PDF Generator - Starting report generation with @react-pdf/renderer');
      console.log('📊 Custom scoring scale received:', customScoringScale);
      console.log('📊 Template configuration received:', template ? 'Yes' : 'No');
      
      // Calculate packet scores
      const packetScores = this.calculatePacketScores(packets, questions, answers, attemptData);
      
      // Create PDF document
      const pdfDoc = (
        <AssessmentReportPDF
          quizData={quizData}
          userData={userData}
          attemptData={attemptData}
          packetScores={packetScores}
          customScoringScale={customScoringScale}
          template={template}
        />
      );
      
      // Generate PDF blob
      const pdfBlob = await pdf(pdfDoc).toBlob();
      
      console.log('📊 PDF report generation completed successfully');
      return pdfBlob;
    } catch (error) {
      console.error('❌ Error generating PDF report:', error);
      throw error;
    }
  }

  // Calculate packet scores
  calculatePacketScores(packets, questions, answers, attemptData) {
    // If we have packet_marks from the attempt data, use those
    if (attemptData.packet_marks && Object.keys(attemptData.packet_marks).length > 0) {
      return packets.map(packet => {
        const packetData = attemptData.packet_marks[packet.name];
        if (packetData) {
          return {
            packet, // Include the full packet data
            packetName: packet.name,
            marks: packetData.marks || 0,
            questions: packetData.questions || 0,
            totalMarks: packetData.totalMarks || packetData.questions || 0
          };
        } else {
          return {
            packet, // Include the full packet data
            packetName: packet.name,
            marks: 0,
            questions: 0,
            totalMarks: 0
          };
        }
      });
    }
    
    // Fallback calculation (for backward compatibility)
    return packets.map(packet => {
      const packetQuestions = questions.filter(q => q.packet_id === packet.id);
      let marks = 0;
      
      packetQuestions.forEach(question => {
        // Mock calculation - in real app, check against actual answers
        if (Math.random() > 0.3) {
          marks += question.marks || 1;
        }
      });
      
      return {
        packet, // Include the full packet data
        packetName: packet.name,
        marks,
        questions: packetQuestions.length,
        totalMarks: packetQuestions.reduce((sum, q) => sum + (q.marks || 1), 0)
      };
    });
  }

  // Download PDF
  downloadPDF(filename = 'assessment_report.pdf') {
    try {
      // This will be handled by the component that calls generateReport
      console.log('📊 PDF ready for download:', filename);
      return true;
    } catch (error) {
      console.error('❌ Error downloading PDF:', error);
      return false;
    }
  }
}

export default ProfessionalPDFGenerator;