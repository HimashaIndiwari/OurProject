import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generate a professional certificate PDF
 * @param {Object} certificate - Certificate data
 * @returns {Buffer} PDF buffer
 */
export const generateCertificatePDF = async (certificate) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document with proper margins for A4 Portrait
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'portrait',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Set up fonts and colors
      const primaryColor = '#1a365d';
      const secondaryColor = '#2d3748';
      const accentColor = '#3182ce';
      const lightBlue = '#e6f3ff';

      // Page dimensions - A4 Portrait (in points: 72 points = 1 inch)
      const pageWidth = 595.28;  // A4 portrait width in points
      const pageHeight = 841.89; // A4 portrait height in points
      const margin = 50;
      const usableWidth = pageWidth - (margin * 2);
      const usableHeight = pageHeight - (margin * 2);

      // White background
      doc.rect(0, 0, pageWidth, pageHeight)
         .fill('#ffffff');

      // Main border - double line border
      // Outer border
      doc.rect(margin, margin, usableWidth, usableHeight)
         .stroke(primaryColor, 2);
      
      // Inner border (8 points inset)
      doc.rect(margin + 8, margin + 8, usableWidth - 16, usableHeight - 16)
         .stroke(primaryColor, 1);

      // Calculate vertical positions with proper spacing
      let currentY = margin + 30;

      // Header - Organization Name (top right)
      doc.fontSize(12)
         .fillColor(primaryColor)
         .text('CricketXpert Coaching', margin + 20, currentY, {
           align: 'right',
           width: usableWidth - 40
         });

      currentY += 50;

      // Certificate Title with background highlight
      const titleWidth = 380;
      const titleX = (pageWidth - titleWidth) / 2;
      const titleHeight = 35;
      
      // Background highlight for title
      doc.rect(titleX, currentY, titleWidth, titleHeight)
         .fill(lightBlue)
         .stroke(accentColor, 1);
      
      doc.fontSize(18)
         .fillColor(primaryColor)
         .text('CERTIFICATE OF COMPLETION', titleX + 10, currentY + 9, {
           align: 'center',
           width: titleWidth - 20
         });

      currentY += titleHeight + 20;

      // Decorative line under title
      const lineLength = 250;
      doc.moveTo((pageWidth - lineLength) / 2, currentY)
         .lineTo((pageWidth + lineLength) / 2, currentY)
         .stroke(accentColor, 2);

      currentY += 35;

      // "This is to certify" text
      doc.fontSize(14)
         .fillColor(secondaryColor)
         .text('This is to certify that', margin + 20, currentY, {
           align: 'center',
           width: usableWidth - 40
         });

      currentY += 35;

      // Student name with background highlight
      const studentName = `${certificate.user.firstName} ${certificate.user.lastName}`;
      const nameWidth = Math.min(Math.max(studentName.length * 10, 200), 400);
      const nameX = (pageWidth - nameWidth) / 2;
      const nameHeight = 32;
      
      doc.rect(nameX, currentY, nameWidth, nameHeight)
         .fill(lightBlue)
         .stroke(accentColor, 1);
      
      doc.fontSize(20)
         .fillColor(primaryColor)
         .text(studentName, nameX + 10, currentY + 7, {
           align: 'center',
           width: nameWidth - 20
         });

      currentY += nameHeight + 30;

      // "has successfully completed" text
      doc.fontSize(14)
         .fillColor(secondaryColor)
         .text('has successfully completed the program', margin + 20, currentY, {
           align: 'center',
           width: usableWidth - 40
         });

      currentY += 30;

      // Program name with background highlight
      const programName = `"${certificate.program.title}"`;
      const programWidth = Math.min(Math.max(programName.length * 8, 250), 420);
      const programX = (pageWidth - programWidth) / 2;
      const programHeight = 32;
      
      doc.rect(programX, currentY, programWidth, programHeight)
         .fill(lightBlue)
         .stroke(accentColor, 1);
      
      doc.fontSize(16)
         .fillColor(accentColor)
         .text(programName, programX + 10, currentY + 8, {
           align: 'center',
           width: programWidth - 20
         });

      currentY += programHeight + 35;

      // Completion date
      const completionDate = certificate.issueDate.toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric'
      });

      doc.fontSize(12)
         .fillColor(secondaryColor)
         .text(`Completed on: ${completionDate}`, margin + 20, currentY, {
           align: 'center',
           width: usableWidth - 40
         });

      currentY += 30;

      // Performance details with background
      const attendance = certificate.completionDetails.attendancePercentage;
      const grade = certificate.completionDetails.finalGrade;
      const performanceWidth = 350;
      const performanceX = (pageWidth - performanceWidth) / 2;
      const performanceHeight = 25;
      
      doc.rect(performanceX, currentY, performanceWidth, performanceHeight)
         .fill('#f0f8ff')
         .stroke(accentColor, 1);
      
      doc.fontSize(12)
         .fillColor(primaryColor)
         .text(`Attendance: ${attendance}% | Final Grade: ${grade}`, performanceX + 10, currentY + 6, {
           align: 'center',
           width: performanceWidth - 20
         });

      currentY += performanceHeight + 50;

      // Bottom section with signatures
      // Coach signature section (left side)
      let coachName = 'Head Coach';
      if (certificate.coach && certificate.coach.userId) {
        coachName = `${certificate.coach.userId.firstName} ${certificate.coach.userId.lastName}`;
      }
      
      const leftSignatureX = margin + 70;
      
      doc.fontSize(11)
         .fillColor(secondaryColor)
         .text('Coach Signature:', leftSignatureX, currentY, {
           align: 'left',
           width: 150
         });

      // Signature line
      doc.moveTo(leftSignatureX, currentY + 18)
         .lineTo(leftSignatureX + 130, currentY + 18)
         .stroke(accentColor, 1);

      doc.fontSize(12)
         .fillColor(primaryColor)
         .text(coachName, leftSignatureX, currentY + 23, {
           align: 'left',
           width: 130
         });

      // Official seal (right side)
      const sealX = pageWidth - margin - 120;
      const sealCenterX = sealX + 50;
      
      doc.circle(sealCenterX, currentY + 20, 22)
         .stroke(primaryColor, 2);
      
      doc.circle(sealCenterX, currentY + 20, 22)
         .fillOpacity(0.1)
         .fill(lightBlue)
         .fillOpacity(1);
      
      doc.fontSize(8)
         .fillColor(primaryColor)
         .text('OFFICIAL', sealCenterX - 25, currentY + 14, {
           align: 'center',
           width: 50
         });
      
      doc.fontSize(7)
         .fillColor(secondaryColor)
         .text('SEAL', sealCenterX - 25, currentY + 24, {
           align: 'center',
           width: 50
         });

      currentY += 70;

      // Certificate number at bottom
      const certWidth = 280;
      const certX = (pageWidth - certWidth) / 2;
      const certHeight = 22;
      
      doc.rect(certX, currentY, certWidth, certHeight)
         .fill('#f8f9fa')
         .stroke(accentColor, 1);
      
      doc.fontSize(10)
         .fillColor(primaryColor)
         .text(`Certificate No: ${certificate.certificateNumber}`, certX + 10, currentY + 6, {
           align: 'center',
           width: certWidth - 20
         });

      // Finalize the PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate a simple text-based certificate (fallback)
 * @param {Object} certificate - Certificate data
 * @returns {Buffer} PDF buffer
 */
export const generateSimpleCertificatePDF = async (certificate) => {
  const content = `
CERTIFICATE OF COMPLETION

This is to certify that
${certificate.user.firstName} ${certificate.user.lastName}

has successfully completed the program
"${certificate.program.title}"

Certificate Number: ${certificate.certificateNumber}
Issue Date: ${certificate.issueDate.toLocaleDateString()}
Attendance: ${certificate.completionDetails.attendancePercentage}%
Final Grade: ${certificate.completionDetails.finalGrade}

Coach: ${certificate.coach.userId.firstName} ${certificate.coach.userId.lastName}

This certificate is digitally verified and can be verified at:
${certificate.verificationUrl}

---
CricketXpert Coaching Academy
  `;

  return Buffer.from(content, 'utf8');
};