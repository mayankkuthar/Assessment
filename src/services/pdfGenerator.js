import jsPDF from 'jspdf';

class ProfessionalPDFGenerator {
  constructor() {
    this.currentY = 0;
    this.pageWidth = 0;
    this.pageHeight = 0;
    this.margin = 20;
    this.lineHeight = 6;
    this.sectionSpacing = 15;
    
    // Modern color palette
    this.colors = {
      primary: '#2563eb',      // Modern blue
      secondary: '#7c3aed',    // Purple
      success: '#059669',      // Green
      warning: '#d97706',      // Amber
      error: '#dc2626',        // Red
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        500: '#6b7280',
        700: '#374151',
        900: '#111827'
      },
      accent: '#06b6d4'        // Cyan
    };
  }

  // Utility methods
  initDocument() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.currentY = this.margin;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  setFillColorHex(hex) {
    const rgb = this.hexToRgb(hex);
    if (rgb) {
      this.doc.setFillColor(rgb.r, rgb.g, rgb.b);
    }
  }

  setTextColorHex(hex) {
    const rgb = this.hexToRgb(hex);
    if (rgb) {
      this.doc.setTextColor(rgb.r, rgb.g, rgb.b);
    }
  }

  setDrawColorHex(hex) {
    const rgb = this.hexToRgb(hex);
    if (rgb) {
      this.doc.setDrawColor(rgb.r, rgb.g, rgb.b);
    }
  }

  safeRoundedRect(x, y, w, h, r = 2, style = 'S') {
    try {
      this.doc.roundedRect(x, y, w, h, r, r, style);
    } catch (error) {
      this.doc.rect(x, y, w, h, style);
    }
  }

  splitText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = this.doc.getTextWidth(testLine);
      
      if (testWidth <= maxWidth && currentLine !== '') {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  checkPageBreak(requiredHeight) {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
      return true;
    }
    return false;
  }

  addPageNumbers() {
    const pageCount = this.doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.setTextColorHex(this.colors.gray[500]);
      
      const pageText = `Page ${i} of ${pageCount}`;
      const textWidth = this.doc.getTextWidth(pageText);
      this.doc.text(pageText, this.pageWidth - this.margin - textWidth, this.pageHeight - 10);
    }
  }

  // Header section
  addModernHeader(quizName, userName, userEmail, submissionDate) {
    // Gradient-style header background
    this.setFillColorHex(this.colors.primary);
    this.doc.rect(0, 0, this.pageWidth, 50, 'F');
    
    // Add subtle pattern overlay
    this.setFillColorHex('#ffffff');
    this.doc.setGState(this.doc.GState({ opacity: 0.1 }));
    
    // Reset opacity
    this.doc.setGState(this.doc.GState({ opacity: 1 }));
    
    // Quiz title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(22);
    this.doc.setFont('helvetica', 'bold');
    
    const titleLines = this.splitText(quizName, this.pageWidth - 2 * this.margin);
    titleLines.forEach((line, index) => {
      const textWidth = this.doc.getTextWidth(line);
      this.doc.text(line, (this.pageWidth - textWidth) / 2, 20 + (index * 8));
    });
    
    // Subtitle
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.setTextColorHex('#e0e7ff');
    const subtitleText = 'Assessment Performance Report';
    const subtitleWidth = this.doc.getTextWidth(subtitleText);
    this.doc.text(subtitleText, (this.pageWidth - subtitleWidth) / 2, 35);
    
    // User information card
    this.currentY = 65;
    this.checkPageBreak(35);
    
    this.setFillColorHex('#ffffff');
    this.setDrawColorHex(this.colors.gray[200]);
    this.doc.setLineWidth(0.5);
    this.safeRoundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 30, 4, 'FD');
    
    // User details
    this.setTextColorHex(this.colors.gray[700]);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    this.doc.text('Participant:', this.margin + 10, this.currentY + 10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(userName || 'Unknown User', this.margin + 35, this.currentY + 10);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Email:', this.margin + 10, this.currentY + 18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(userEmail || 'No email provided', this.margin + 25, this.currentY + 18);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Completed:', this.margin + 10, this.currentY + 26);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(new Date(submissionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }), this.margin + 40, this.currentY + 26);
    
    this.currentY += 45;
  }

  // Overall score section - Updated for marks-based system
  addModernOverallScore(totalMarks, totalQuestions, packetMarks) {
    this.checkPageBreak(120);
    
    // Section title
    this.setTextColorHex(this.colors.gray[900]);
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Overall Performance', this.margin, this.currentY);
    this.currentY += 15;
    
    // Main score card
    this.setFillColorHex('#ffffff');
    this.setDrawColorHex(this.colors.gray[200]);
    this.doc.setLineWidth(1);
    this.safeRoundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 80, 6, 'FD');
    
    // Calculate performance level based on total marks
    const performanceLevel = this.getPerformanceLevelFromMarks(totalMarks, totalQuestions);
    
    // Score circle
    const centerX = this.pageWidth / 2;
    const centerY = this.currentY + 40;
    const radius = 25;
    
    // Circle background
    this.setFillColorHex(performanceLevel.color);
    this.doc.setGState(this.doc.GState({ opacity: 0.1 }));
    this.doc.circle(centerX, centerY, radius, 'F');
    this.doc.setGState(this.doc.GState({ opacity: 1 }));
    
    // Circle border
    this.setDrawColorHex(performanceLevel.color);
    this.doc.setLineWidth(3);
    this.doc.circle(centerX, centerY, radius, 'S');
    
    // Score text
    this.setTextColorHex(performanceLevel.color);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    const scoreText = `${totalMarks}`;
    const scoreWidth = this.doc.getTextWidth(scoreText);
    this.doc.text(scoreText, centerX - scoreWidth/2, centerY + 2);
    
    // Performance level
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    const levelWidth = this.doc.getTextWidth(performanceLevel.label);
    this.doc.text(performanceLevel.label, centerX - levelWidth/2, centerY + 15);
    
    // Stats on the left
    this.setTextColorHex(this.colors.gray[700]);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    
    this.doc.text('Questions Answered:', this.margin + 15, this.currentY + 20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${totalQuestions}`, this.margin + 15, this.currentY + 30);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Total Marks:', this.margin + 15, this.currentY + 45);
    this.doc.setFont('helvetica', 'bold');
    this.setTextColorHex(this.colors.success);
    this.doc.text(`${totalMarks}`, this.margin + 15, this.currentY + 55);
    
    // Stats on the right
    this.setTextColorHex(this.colors.gray[700]);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Performance:', this.pageWidth - this.margin - 50, this.currentY + 20);
    this.doc.setFont('helvetica', 'bold');
    this.setTextColorHex(performanceLevel.color);
    this.doc.text(performanceLevel.label, this.pageWidth - this.margin - 50, this.currentY + 30);
    
    this.setTextColorHex(this.colors.gray[700]);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Level:', this.pageWidth - this.margin - 50, this.currentY + 45);
    this.doc.setFont('helvetica', 'bold');
    this.setTextColorHex(performanceLevel.color);
    this.doc.text(performanceLevel.emoji, this.pageWidth - this.margin - 50, this.currentY + 55);
    
    this.currentY += 95;
  }

  getScoreColor(score) {
    if (score >= 90) return this.colors.success;
    if (score >= 80) return this.colors.primary;
    if (score >= 70) return this.colors.warning;
    if (score >= 60) return this.colors.secondary;
    return this.colors.error;
  }

  getPerformanceLevel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
  }

  // Get performance level based on marks using custom scaling system
  getPerformanceLevelFromMarks(marks, totalQuestions) {
    // Default scale for overall performance (can be customized later)
    const defaultScale = [
      { min: 0, max: 10, label: "Needs Improvement", color: this.colors.error, emoji: "📚" },
      { min: 11, max: 20, label: "Average", color: this.colors.warning, emoji: "📊" },
      { min: 21, max: 30, label: "Good", color: this.colors.success, emoji: "🎯" },
      { min: 31, max: 50, label: "Excellent", color: this.colors.primary, emoji: "🏆" }
    ];
    
    const level = defaultScale.find(range => marks >= range.min && marks <= range.max);
    return level || defaultScale[0];
  }

  // Get performance level for individual packets
  getPacketPerformanceLevel(marks, packetName) {
    // Default scale for packets (can be customized per packet later)
    const defaultScale = [
      { min: 0, max: 2, label: "Needs Improvement", color: this.colors.error, emoji: "📚" },
      { min: 3, max: 5, label: "Average", color: this.colors.warning, emoji: "📊" },
      { min: 6, max: 8, label: "Good", color: this.colors.success, emoji: "🎯" },
      { min: 9, max: 12, label: "Excellent", color: this.colors.primary, emoji: "🏆" }
    ];
    
    const level = defaultScale.find(range => marks >= range.min && marks <= range.max);
    return level || defaultScale[0];
  }

  // Packet analysis section
  addPacketAnalysis(packets, packetScores, questions) {
    this.checkPageBreak(60);
    
    // Section title
    this.setTextColorHex(this.colors.gray[900]);
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Section Analysis', this.margin, this.currentY);
    this.currentY += 20;
    
    packetScores.forEach((packetScore, index) => {
      this.addPacketCard(packetScore, index);
    });
  }

  addPacketCard(packetScore, index) {
    this.checkPageBreak(80);
    
    // Get performance level based on marks
    const performanceLevel = this.getPacketPerformanceLevel(packetScore.marks, packetScore.packetName);
    const cardHeight = 70;
    
    // Card background
    this.setFillColorHex('#ffffff');
    this.setDrawColorHex(this.colors.gray[200]);
    this.doc.setLineWidth(0.5);
    this.safeRoundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, cardHeight, 4, 'FD');
    
    // Accent bar
    this.setFillColorHex(performanceLevel.color);
    this.safeRoundedRect(this.margin, this.currentY, 4, cardHeight, 2, 'F');
    
    // Packet name
    this.setTextColorHex(this.colors.gray[900]);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(packetScore.packetName, this.margin + 15, this.currentY + 15);
    
    // Performance level
    this.setTextColorHex(performanceLevel.color);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(performanceLevel.emoji, this.pageWidth - this.margin - 40, this.currentY + 20);
    
    // Details
    this.setTextColorHex(this.colors.gray[700]);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    this.doc.text(`Marks: ${packetScore.marks}`, this.margin + 15, this.currentY + 30);
    this.doc.text(`Questions: ${packetScore.questions}`, this.margin + 15, this.currentY + 42);
    this.doc.text(`Level: ${performanceLevel.label}`, this.margin + 15, this.currentY + 54);
    
    // Performance indicator
    const indicatorX = this.pageWidth - this.margin - 100;
    const indicatorY = this.currentY + 35;
    
    // Performance circle
    this.setFillColorHex(performanceLevel.color);
    this.doc.circle(indicatorX + 15, indicatorY + 15, 12, 'F');
    
    // Performance text
    this.setTextColorHex('#ffffff');
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    const levelText = performanceLevel.label.substring(0, 3);
    const levelWidth = this.doc.getTextWidth(levelText);
    this.doc.text(levelText, indicatorX + 15 - levelWidth/2, indicatorY + 18);
    
    this.currentY += cardHeight + 10;
  }

  // Performance insights
  addPerformanceInsights(totalMarks, packetScores) {
    this.checkPageBreak(100);
    
    // Section title
    this.setTextColorHex(this.colors.gray[900]);
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Performance Insights', this.margin, this.currentY);
    this.currentY += 20;
    
    // Insights card
    this.setFillColorHex(this.colors.gray[50]);
    this.setDrawColorHex(this.colors.gray[200]);
    this.doc.setLineWidth(0.5);
    this.safeRoundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 80, 6, 'FD');
    
    // Icon (using text)
    this.setFillColorHex(this.colors.primary);
    this.doc.circle(this.margin + 20, this.currentY + 20, 8, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('!', this.margin + 17, this.currentY + 23);
    
    // Insights text
    this.setTextColorHex(this.colors.gray[700]);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    
    const insights = this.generateInsights(totalMarks, packetScores);
    const lines = this.splitText(insights, this.pageWidth - 2 * this.margin - 50);
    
    lines.forEach((line, index) => {
      this.doc.text(line, this.margin + 35, this.currentY + 15 + (index * 6));
    });
    
    this.currentY += 100;
  }

  generateInsights(totalMarks, packetScores) {
    let insights = '';
    
    if (totalMarks >= 31) {
      insights = 'Exceptional performance across all sections! You demonstrate mastery of the subject matter. Consider exploring advanced topics or helping peers in areas of strength.';
    } else if (totalMarks >= 21) {
      insights = 'Strong overall performance with room for refinement in specific areas. Focus on the sections with lower scores to achieve even better results.';
    } else if (totalMarks >= 11) {
      insights = 'Good foundation with clear opportunities for improvement. Review the concepts in lower-scoring sections and practice similar problems to strengthen understanding.';
    } else {
      insights = 'This assessment highlights areas that need focused attention. Consider additional study time, seek help from instructors, and practice regularly to improve performance.';
    }
    
    // Add section-specific insights
    const lowestSection = packetScores.reduce((min, current) => 
      current.marks < min.marks ? current : min
    );
    
    insights += ` Pay special attention to ${lowestSection.packetName} where additional practice would be most beneficial.`;
    
    return insights;
  }

  // Recommendations section
  addRecommendations(totalMarks, packetScores) {
    this.checkPageBreak(120);
    
    // Section title
    this.setTextColorHex(this.colors.gray[900]);
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Recommendations', this.margin, this.currentY);
    this.currentY += 20;
    
    const recommendations = this.generateRecommendations(totalMarks, packetScores);
    
    recommendations.forEach((rec, index) => {
      this.checkPageBreak(40);
      
      // Recommendation card
      this.setFillColorHex('#ffffff');
      this.setDrawColorHex(this.colors.gray[200]);
      this.doc.setLineWidth(0.5);
      this.safeRoundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 35, 4, 'FD');
      
      // Number circle - properly centered
      this.setFillColorHex(rec.color);
      this.doc.circle(this.margin + 15, this.currentY + 17, 8, 'F');
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      const numberText = `${index + 1}`;
      const numberWidth = this.doc.getTextWidth(numberText);
      this.doc.text(numberText, this.margin + 15 - (numberWidth / 2), this.currentY + 20);
      
      // Recommendation text
      this.setTextColorHex(this.colors.gray[700]);
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      
      const lines = this.splitText(rec.text, this.pageWidth - 2 * this.margin - 40);
      lines.forEach((line, lineIndex) => {
        this.doc.text(line, this.margin + 30, this.currentY + 12 + (lineIndex * 6));
      });
      
      this.currentY += 45;
    });
  }

  // Summary page with charts
  addSummaryPage(totalMarks, packetScores, totalQuestions, correctAnswers) {
    this.doc.addPage();
    this.currentY = this.margin;
    
    // Header
    this.setFillColorHex(this.colors.success);
    this.doc.rect(0, 0, this.pageWidth, 40, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    const titleText = 'Assessment Summary & Analytics';
    const titleWidth = this.doc.getTextWidth(titleText);
    this.doc.text(titleText, (this.pageWidth - titleWidth) / 2, 25);
    
    this.currentY = 60;
    
    // Performance overview cards
          this.addPerformanceCards(totalMarks, totalQuestions, correctAnswers);
    
    // Bar chart
    this.addBarChart(packetScores);
    
    // Gauge chart
          this.addGaugeChart(totalMarks);
    
    // Scatter plot
    this.addScatterPlot(packetScores);
    
    // Summary table
    this.addSummaryTable(packetScores);
  }

  addPerformanceCards(totalMarks, totalQuestions, correctAnswers) {
    const cardWidth = (this.pageWidth - 3 * this.margin) / 3;
    const cardHeight = 50;
    
    // Card 1: Total Marks
    this.setFillColorHex(this.colors.primary);
    this.safeRoundedRect(this.margin, this.currentY, cardWidth, cardHeight, 6, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    const scoreText = `${totalMarks}`;
    const scoreWidth = this.doc.getTextWidth(scoreText);
    this.doc.text(scoreText, this.margin + (cardWidth - scoreWidth) / 2, this.currentY + 20);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const label1 = 'Total Marks';
    const label1Width = this.doc.getTextWidth(label1);
    this.doc.text(label1, this.margin + (cardWidth - label1Width) / 2, this.currentY + 35);
    
    // Card 2: Performance Level
    const performanceLevel = this.getPerformanceLevelFromMarks(totalMarks, totalQuestions);
    this.setFillColorHex(performanceLevel.color);
    this.safeRoundedRect(this.margin + cardWidth + 10, this.currentY, cardWidth, cardHeight, 6, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    const levelText = performanceLevel.emoji;
    const levelWidth = this.doc.getTextWidth(levelText);
    this.doc.text(levelText, this.margin + cardWidth + 10 + (cardWidth - levelWidth) / 2, this.currentY + 20);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const label2 = 'Performance';
    const label2Width = this.doc.getTextWidth(label2);
    this.doc.text(label2, this.margin + cardWidth + 10 + (cardWidth - label2Width) / 2, this.currentY + 35);
    
    // Card 3: Total Questions
    this.setFillColorHex(this.colors.secondary);
    this.safeRoundedRect(this.margin + 2 * (cardWidth + 10), this.currentY, cardWidth, cardHeight, 6, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    const totalText = `${totalQuestions}`;
    const totalWidth = this.doc.getTextWidth(totalText);
    this.doc.text(totalText, this.margin + 2 * (cardWidth + 10) + (cardWidth - totalWidth) / 2, this.currentY + 20);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const label3 = 'Total Questions';
    const label3Width = this.doc.getTextWidth(label3);
    this.doc.text(label3, this.margin + 2 * (cardWidth + 10) + (cardWidth - label3Width) / 2, this.currentY + 35);
    
    this.currentY += 70;
  }

  addBarChart(packetScores) {
    this.checkPageBreak(120);
    
    // Chart background
    this.setFillColorHex('#ffffff');
    this.setDrawColorHex(this.colors.gray[200]);
    this.doc.setLineWidth(1);
    this.safeRoundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 100, 6, 'FD');
    
    // Title
    this.setTextColorHex(this.colors.gray[900]);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Section Performance Comparison', this.margin + 10, this.currentY + 15);
    
    // Chart area
    const chartX = this.margin + 20;
    const chartY = this.currentY + 25;
    const chartWidth = this.pageWidth - 2 * this.margin - 40;
    const chartHeight = 50;
    
    // Draw bars
    const barWidth = (chartWidth / packetScores.length) - 10;
    const maxMarks = Math.max(...packetScores.map(p => p.marks || 0));
    
    packetScores.forEach((packet, index) => {
      const marks = packet.marks || 0;
      const performanceLevel = this.getPacketPerformanceLevel(marks, packet.packetName);
      const barHeight = maxMarks > 0 ? (chartHeight * marks) / maxMarks : 0;
      const barX = chartX + (index * (barWidth + 10));
      const barY = chartY + chartHeight - barHeight;
      
      // Bar
      this.setFillColorHex(performanceLevel.color);
      this.safeRoundedRect(barX, barY, barWidth, barHeight, 2, 'F');
      
      // Marks label on top
      this.setTextColorHex(this.colors.gray[700]);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      const marksText = `${marks}`;
      const marksWidth = this.doc.getTextWidth(marksText);
      this.doc.text(marksText, barX + (barWidth - marksWidth) / 2, barY - 3);
      
      // Packet name at bottom
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      const packetName = packet.packetName.length > 12 ? 
        packet.packetName.substring(0, 12) + '...' : packet.packetName;
      const nameWidth = this.doc.getTextWidth(packetName);
      this.doc.text(packetName, barX + (barWidth - nameWidth) / 2, chartY + chartHeight + 10);
    });
    
    // Y-axis labels
    this.setTextColorHex(this.colors.gray[500]);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('100%', chartX - 15, chartY);
    this.doc.text('50%', chartX - 15, chartY + chartHeight / 2);
    this.doc.text('0%', chartX - 15, chartY + chartHeight);
    
    this.currentY += 120;
  }

  addGaugeChart(totalMarks) {
    this.checkPageBreak(120);
    
    // Chart background
    this.setFillColorHex('#ffffff');
    this.setDrawColorHex(this.colors.gray[200]);
    this.doc.setLineWidth(1);
    this.safeRoundedRect(this.margin, this.currentY, (this.pageWidth - 3 * this.margin) / 2, 100, 6, 'FD');
    
    // Title
    this.setTextColorHex(this.colors.gray[900]);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Performance Gauge', this.margin + 10, this.currentY + 15);
    
    // Gauge center
    const gaugeCenterX = this.margin + ((this.pageWidth - 3 * this.margin) / 2) / 2;
    const gaugeCenterY = this.currentY + 60;
    const gaugeRadius = 30;
    
    // Get performance level for color
    const performanceLevel = this.getPerformanceLevelFromMarks(totalMarks, 0);
    
    // Background circle
    this.setDrawColorHex(this.colors.gray[300]);
    this.doc.setLineWidth(8);
    this.doc.circle(gaugeCenterX, gaugeCenterY, gaugeRadius, 'S');
    
    // Progress arc (simulate with multiple small arcs)
    this.setDrawColorHex(performanceLevel.color);
    this.doc.setLineWidth(8);
    // Use a scale of 0-50 for the gauge (assuming max possible marks is around 50)
    const progressAngle = Math.min((totalMarks / 50) * 2 * Math.PI, 2 * Math.PI);
    
    // Draw progress arc using multiple small lines
    for (let i = 0; i < progressAngle; i += 0.1) {
      const x1 = gaugeCenterX + (gaugeRadius - 4) * Math.cos(i - Math.PI/2);
      const y1 = gaugeCenterY + (gaugeRadius - 4) * Math.sin(i - Math.PI/2);
      const x2 = gaugeCenterX + (gaugeRadius + 4) * Math.cos(i - Math.PI/2);
      const y2 = gaugeCenterY + (gaugeRadius + 4) * Math.sin(i - Math.PI/2);
      this.doc.line(x1, y1, x2, y2);
    }
    
    // Center score
    this.setTextColorHex(this.colors.gray[900]);
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    const scoreText = `${totalMarks}`;
    const scoreWidth = this.doc.getTextWidth(scoreText);
    this.doc.text(scoreText, gaugeCenterX - scoreWidth/2, gaugeCenterY + 2);
    
    // Performance level
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const levelText = performanceLevel.label;
    const levelWidth = this.doc.getTextWidth(levelText);
    this.doc.text(levelText, gaugeCenterX - levelWidth/2, gaugeCenterY + 15);
  }

  addScatterPlot(packetScores) {
    // Position scatter plot next to gauge
    const scatterX = this.margin + (this.pageWidth - 3 * this.margin) / 2 + 10;
    const scatterWidth = (this.pageWidth - 3 * this.margin) / 2;
    
    // Chart background
    this.setFillColorHex('#ffffff');
    this.setDrawColorHex(this.colors.gray[200]);
    this.doc.setLineWidth(1);
    this.safeRoundedRect(scatterX, this.currentY, scatterWidth, 100, 6, 'FD');
    
    // Title
    this.setTextColorHex(this.colors.gray[900]);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Score Distribution', scatterX + 10, this.currentY + 15);
    
    // Plot area
    const plotX = scatterX + 20;
    const plotY = this.currentY + 25;
    const plotWidth = scatterWidth - 40;
    const plotHeight = 60;
    
    // Plot border
    this.setDrawColorHex(this.colors.gray[300]);
    this.doc.setLineWidth(0.5);
    this.doc.rect(plotX, plotY, plotWidth, plotHeight, 'S');
    
    // Grid lines
    this.setDrawColorHex(this.colors.gray[200]);
    this.doc.setLineWidth(0.3);
    
    // Horizontal grid lines
    for (let i = 1; i < 5; i++) {
      const y = plotY + (plotHeight / 5) * i;
      this.doc.line(plotX, y, plotX + plotWidth, y);
    }
    
    // Vertical grid lines
    for (let i = 1; i < packetScores.length; i++) {
      const x = plotX + (plotWidth / packetScores.length) * i;
      this.doc.line(x, plotY, x, plotY + plotHeight);
    }
    
    // Data points
    packetScores.forEach((packet, index) => {
      const marks = packet.marks || 0;
      const performanceLevel = this.getPacketPerformanceLevel(marks, packet.packetName);
      const pointX = plotX + (plotWidth / (packetScores.length - 1)) * index;
      const pointY = plotY + plotHeight - (plotHeight * (marks / 12)); // Assuming max marks per packet is 12
      
      // Point
      this.setFillColorHex(performanceLevel.color);
      this.doc.circle(pointX, pointY, 3, 'F');
      
      // Value label
      this.setTextColorHex(this.colors.gray[600]);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      const valueText = `${marks}`;
      const valueWidth = this.doc.getTextWidth(valueText);
      this.doc.text(valueText, pointX - valueWidth/2, pointY - 5);
    });
    
    this.currentY += 120;
  }

     addSummaryTable(packetScores) {
     this.checkPageBreak(20 + (packetScores.length * 18));
     
     // Table header
     this.setFillColorHex(this.colors.primary);
     this.setDrawColorHex(this.colors.primary);
     this.doc.setLineWidth(0.5);
     this.safeRoundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 18, 3, 'FD');
     
     this.doc.setTextColor(255, 255, 255);
     this.doc.setFontSize(11);
     this.doc.setFont('helvetica', 'bold');
     
     // Headers
     this.doc.text('Section', this.margin + 10, this.currentY + 12);
     this.doc.text('Marks', this.margin + 80, this.currentY + 12);
     this.doc.text('Level', this.margin + 120, this.currentY + 12);
     this.doc.text('Questions', this.margin + 160, this.currentY + 12);
     this.doc.text('Performance', this.pageWidth - this.margin - 40, this.currentY + 12);
     
     this.currentY += 20;
     
     // Table rows
     packetScores.forEach((packet, index) => {
       const marks = packet.marks || 0;
       const performanceLevel = this.getPacketPerformanceLevel(marks, packet.packetName);
       const isEven = index % 2 === 0;
       
       // Row background
       this.setFillColorHex(isEven ? '#ffffff' : this.colors.gray[50]);
       this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 16, 'F');
       
       // Row border
       this.setDrawColorHex(this.colors.gray[200]);
       this.doc.setLineWidth(0.3);
       this.doc.line(this.margin, this.currentY + 16, this.pageWidth - this.margin, this.currentY + 16);
       
       // Row data
       this.setTextColorHex(this.colors.gray[700]);
       this.doc.setFontSize(10);
       this.doc.setFont('helvetica', 'normal');
       
       const packetName = packet.packetName.length > 20 ? 
         packet.packetName.substring(0, 20) + '...' : packet.packetName;
       this.doc.text(packetName, this.margin + 10, this.currentY + 10);
       this.doc.text(`${marks}`, this.margin + 80, this.currentY + 10);
       
       this.setTextColorHex(performanceLevel.color);
       this.doc.setFont('helvetica', 'bold');
       this.doc.text(`${performanceLevel.emoji}`, this.margin + 120, this.currentY + 10);
       
       this.setTextColorHex(this.colors.gray[700]);
       this.doc.setFont('helvetica', 'normal');
       this.doc.text(`${packet.questions}`, this.margin + 160, this.currentY + 10);
       
       this.setTextColorHex(performanceLevel.color);
       this.doc.setFont('helvetica', 'bold');
       this.doc.text(performanceLevel.label, this.pageWidth - this.margin - 40, this.currentY + 10);
       
       this.currentY += 16;
     });
     
     this.currentY += 10;
   }

   generateRecommendations(totalMarks, packetScores) {
     const recommendations = [];
     
     if (totalMarks >= 21) {
       recommendations.push({
         text: 'Maintain your excellent study habits and continue practicing regularly to stay sharp.',
         color: this.colors.success
       });
     } else {
       recommendations.push({
         text: 'Develop a structured study schedule focusing on areas where you scored below average.',
         color: this.colors.warning
       });
     }
     
     // Find weakest areas
     const sortedPackets = packetScores
       .map(p => ({ ...p, marks: p.marks || 0 }))
       .sort((a, b) => a.marks - b.marks);
     
     if (sortedPackets.length > 0) {
       recommendations.push({
         text: `Focus additional study time on ${sortedPackets[0].packetName} as this shows the greatest potential for improvement.`,
         color: this.colors.primary
       });
     }
     
     recommendations.push({
       text: 'Review your responses and understand the reasoning behind different scoring levels.',
       color: this.colors.secondary
     });
     
     if (totalMarks < 11) {
       recommendations.push({
         text: 'Consider seeking additional help from instructors or study groups for challenging topics.',
         color: this.colors.error
       });
     }
     
     return recommendations;
   }

  // Footer
  addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.setDrawColorHex(this.colors.gray[200]);
      this.doc.setLineWidth(0.5);
      this.doc.line(this.margin, this.pageHeight - 20, this.pageWidth - this.margin, this.pageHeight - 20);
      
      // Footer text
      this.setTextColorHex(this.colors.gray[500]);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('Generated by Assessment System', this.margin, this.pageHeight - 12);
      
      // Date
      const currentDate = new Date().toLocaleDateString();
      this.doc.text(`Report Date: ${currentDate}`, this.margin, this.pageHeight - 6);
    }
  }

  // Calculate packet scores - Updated for marks-based system
  calculatePacketScores(packets, questions, answers, attemptData) {
    // If we have packet_marks from the attempt data, use those
    if (attemptData.packet_marks && Object.keys(attemptData.packet_marks).length > 0) {
      return packets.map(packet => {
        const packetData = attemptData.packet_marks[packet.name];
        if (packetData) {
          return {
            packetName: packet.name,
            marks: packetData.marks || 0,
            questions: packetData.questions || 0
          };
        } else {
          return {
            packetName: packet.name,
            marks: 0,
            questions: 0
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
        packetName: packet.name,
        marks,
        questions: packetQuestions.length
      };
    });
  }

  // Main generation method - Updated for marks-based system
  generateReport(quizData, userData, attemptData, questions, answers, packets) {
    try {
      this.initDocument();
      
      // Use total_marks instead of calculating percentage
      const totalMarks = attemptData.total_marks || 0;
      const totalQuestions = attemptData.total_questions || 0;
      
      const packetScores = this.calculatePacketScores(packets, questions, answers, attemptData);
      
      // Generate report sections
      this.addModernHeader(
        quizData.name,
        userData.user_name || 'Unknown User',
        userData.email || 'No email provided',
        attemptData.completed_at
      );
      
      this.addModernOverallScore(totalMarks, totalQuestions, attemptData.packet_marks);
      
      this.addPacketAnalysis(packets, packetScores, questions);
      
      this.addPerformanceInsights(totalMarks, packetScores);
      
      this.addRecommendations(totalMarks, packetScores);
      
      // Add summary page with charts
      this.addSummaryPage(totalMarks, packetScores, totalQuestions, totalMarks);
      
      // Add footer and page numbers
      this.addFooter();
      this.addPageNumbers();
      
      return this.doc;
    } catch (error) {
      console.error('Error generating professional PDF report:', error);
      throw error;
    }
  }

  downloadPDF(filename = 'assessment_report.pdf') {
    try {
      this.doc.save(filename);
      return true;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      return false;
    }
  }
}

export default ProfessionalPDFGenerator;