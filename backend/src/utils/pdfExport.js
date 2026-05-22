const PDFDocument = require('pdfkit');

/**
 * Generates a styled developer productivity PDF report using pdfkit.
 * @param {Object} res Express response object to stream binary output
 * @param {Object} report The analysis report details (includes data, owner, repo)
 */
const generatePDFReport = (res, report) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Stream PDF directly to HTTP response
  doc.pipe(res);

  const reportData = report.data;

  // --- BRANDING & HEADER ---
  // Background decorative elements
  doc.rect(0, 0, 595.28, 15).fill('#3b82f6'); // Top accent bar
  
  doc.fillColor('#0f172a');
  doc.fontSize(24).font('Helvetica-Bold').text('DevTrackr AI Productivity Report', 50, 40);
  
  doc.fontSize(10).font('Helvetica').fillColor('#64748b');
  doc.text(`Generated on: ${new Date(report.createdAt).toLocaleDateString()}`, 50, 70);
  doc.text(`Target Repository: ${report.owner}/${report.repo}`, 50, 85);
  
  doc.moveDown(1.5);
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 105).lineTo(545, 105).stroke();

  // --- SECTION: TEAM HEALTH GAUGE ---
  doc.moveDown(2);
  const healthScore = reportData.gaugeScore || 0;
  let healthLabel = 'Stable Velocity';
  let healthColor = '#d97706'; // Amber

  if (healthScore >= 80) {
    healthLabel = 'Excellent Velocity';
    healthColor = '#059669'; // Green
  } else if (healthScore < 60) {
    healthLabel = 'Attention Required';
    healthColor = '#dc2626'; // Red
  }

  // Draw Health Card Box
  doc.roundedRect(50, 120, 495, 65, 8).fillColor('#f8fafc').fill();
  doc.roundedRect(50, 120, 495, 65, 8).strokeColor('#e2e8f0').lineWidth(1).stroke();
  
  // Draw score text inside box
  doc.fillColor('#475569').fontSize(11).font('Helvetica-Bold').text('TEAM HEALTH INDEX', 65, 132);
  doc.fillColor(healthColor).fontSize(26).font('Helvetica-Bold').text(`${healthScore}`, 65, 148);
  doc.fillColor('#64748b').fontSize(11).font('Helvetica-Bold').text('/ 100', 105, 160);
  
  doc.fillColor('#334155').fontSize(12).font('Helvetica-Bold').text(healthLabel, 180, 145);
  doc.fillColor('#64748b').fontSize(9).font('Helvetica').text('Index computed by analyzing commits frequency, pull request reviews latency, and issue resolution velocity.', 180, 160);

  // --- SECTION: SPRINT PERFORMANCE SUMMARY ---
  doc.fillColor('#0f172a');
  doc.fontSize(14).font('Helvetica-Bold').text('Sprint Summary', 50, 210);
  doc.strokeColor('#3b82f6').lineWidth(2).moveTo(50, 226).lineTo(150, 226).stroke();
  
  doc.fontSize(10).font('Helvetica').fillColor('#334155').text(reportData.sprintSummary || 'No summary available.', 50, 240, {
    width: 495,
    align: 'justify',
    lineGap: 4
  });

  // --- SECTION: DETECTED BOTTLENECKS ---
  doc.moveDown(2);
  const currentY = doc.y;
  doc.fillColor('#0f172a');
  doc.fontSize(14).font('Helvetica-Bold').text('Detected Process Bottlenecks', 50, currentY);
  doc.strokeColor('#ef4444').lineWidth(2).moveTo(50, currentY + 16).lineTo(230, currentY + 16).stroke();

  let bottleneckY = currentY + 30;
  if (reportData.bottlenecks && reportData.bottlenecks.length > 0) {
    reportData.bottlenecks.forEach((item) => {
      // Draw bottleneck card
      doc.roundedRect(50, bottleneckY, 495, 42, 6).fillColor('#fff5f5').fill();
      doc.roundedRect(50, bottleneckY, 495, 42, 6).strokeColor('#fee2e2').lineWidth(1).stroke();
      
      doc.fillColor('#b91c1c').fontSize(9).font('Helvetica-Bold').text(item.badge.toUpperCase(), 65, bottleneckY + 10);
      doc.fillColor('#451a03').fontSize(9).font('Helvetica').text(item.description, 65, bottleneckY + 23, { width: 465 });
      
      bottleneckY += 52;
    });
  } else {
    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('No significant bottleneck detected.', 50, bottleneckY);
    bottleneckY += 20;
  }

  // --- SECTION: ACTION ITEMS ---
  doc.y = bottleneckY + 10;
  
  // Check if we need to add a new page
  if (doc.y > 600) {
    doc.addPage();
    doc.y = 50;
  }
  
  const actionY = doc.y;
  doc.fillColor('#0f172a');
  doc.fontSize(14).font('Helvetica-Bold').text('Recommended Priority Actions', 50, actionY);
  doc.strokeColor('#8b5cf6').lineWidth(2).moveTo(50, actionY + 16).lineTo(230, actionY + 16).stroke();

  let tableY = actionY + 30;
  
  // Draw table header
  doc.rect(50, tableY, 495, 20).fillColor('#f1f5f9').fill();
  doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text('ACTION ITEM / TASK', 60, tableY + 6);
  doc.text('URGENCY', 460, tableY + 6);
  
  tableY += 20;

  if (reportData.priorityBoard && reportData.priorityBoard.length > 0) {
    reportData.priorityBoard.forEach((item) => {
      // Check for page overflow
      if (tableY > 750) {
        doc.addPage();
        tableY = 50;
        // Redraw headers on new page
        doc.rect(50, tableY, 495, 20).fillColor('#f1f5f9').fill();
        doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text('ACTION ITEM / TASK', 60, tableY + 6);
        doc.text('URGENCY', 460, tableY + 6);
        tableY += 20;
      }

      doc.fillColor('#334155').fontSize(9).font('Helvetica').text(item.task, 60, tableY + 8, { width: 380 });
      
      const isHigh = item.priority?.toLowerCase() === 'high';
      const color = isHigh ? '#b91c1c' : '#d97706';
      
      doc.fillColor(color).fontSize(9).font('Helvetica-Bold').text(item.priority.toUpperCase(), 460, tableY + 8);
      
      doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, tableY + 24).lineTo(545, tableY + 24).stroke();
      tableY += 24;
    });
  } else {
    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('No action items generated.', 50, tableY + 8);
    tableY += 25;
  }

  // --- SECTION: STRATEGIC RECOMMENDATIONS ---
  doc.y = tableY + 15;
  
  if (doc.y > 650) {
    doc.addPage();
    doc.y = 50;
  }
  
  const recY = doc.y;
  doc.fillColor('#0f172a');
  doc.fontSize(14).font('Helvetica-Bold').text('Strategic Insights', 50, recY);
  doc.strokeColor('#10b981').lineWidth(2).moveTo(50, recY + 16).lineTo(150, recY + 16).stroke();

  let recommendationY = recY + 30;
  if (reportData.recommendations && reportData.recommendations.length > 0) {
    reportData.recommendations.forEach((rec, idx) => {
      if (recommendationY > 750) {
        doc.addPage();
        recommendationY = 50;
      }
      
      // Draw number bullet
      doc.rect(50, recommendationY, 16, 16).fillColor('#f0fdf4').fill();
      doc.rect(50, recommendationY, 16, 16).strokeColor('#dcfce7').lineWidth(1).stroke();
      doc.fillColor('#15803d').fontSize(9).font('Helvetica-Bold').text(`${idx + 1}`, 55, recommendationY + 4);
      
      // Draw recommendation text
      doc.fillColor('#334155').fontSize(9).font('Helvetica').text(rec, 75, recommendationY + 3, { width: 470 });
      
      recommendationY += 28;
    });
  }

  // End Document
  doc.end();
};

module.exports = generatePDFReport;
