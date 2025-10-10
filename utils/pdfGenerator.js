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
      // Create a new PDF document with proper margins
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20
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

      // Page dimensions - A4 Landscape
      const pageWidth = 842;  // A4 landscape width
      const pageHeight = 595; // A4 landscape height
      const margin = 20;

      // Beautiful background
      doc.rect(0, 0, pageWidth, pageHeight)
         .fill('#f8f9fa');

      // Main border - centered
      const borderWidth = pageWidth - (margin * 2);
      const borderHeight = pageHeight - (margin * 2);
      doc.rect(margin, margin, borderWidth, borderHeight)
         .stroke(primaryColor, 3);

      // Inner border - centered
      doc.rect(margin + 5, margin + 5, borderWidth - 30, borderHeight - 30)
         .stroke(accentColor, 1);

      // Header - Organization Name (centered)
      const headerY = margin + 30;
      doc.fontSize(16)
         .fillColor(primaryColor)
         .text('CricketXpert Coaching Academy', pageWidth / 2, headerY, {
           align: 'center',
           width: borderWidth - 40
         });

      // Certificate Title with decorative background (centered)
      const titleY = headerY + 40;
      const titleWidth = 500;
      const titleX = (pageWidth - titleWidth) / 2;
      
      doc.rect(titleX, titleY, titleWidth, 45)
         .fill(lightBlue)
         .stroke(accentColor, 1);
      
      doc.fontSize(18)
         .fillColor(primaryColor)
         .text('CERTIFICATE OF COMPLETION', pageWidth / 2, titleY + 12, {
           align: 'center',
           width: titleWidth - 20
         });

      // Decorative line (centered)
      const lineY = titleY + 60;
      const lineLength = 200;
      doc.moveTo((pageWidth - lineLength) / 2, lineY)
         .lineTo((pageWidth + lineLength) / 2, lineY)
         .stroke(accentColor, 2);

      // Main content area (centered)
      const contentY = lineY + 30;
      const contentWidth = borderWidth - 40;
      const contentX = (pageWidth - contentWidth) / 2;

      // This is to certify text (centered)
      doc.fontSize(16)
         .fillColor(secondaryColor)
         .text('This is to certify that', pageWidth / 2, contentY, {
           align: 'center',
           width: contentWidth
         });

      // Student name with decorative underline (centered)
      const studentName = `${certificate.user.firstName} ${certificate.user.lastName}`;
      const nameY = contentY + 35;
      
      doc.fontSize(22)
         .fillColor(primaryColor)
         .text(studentName, pageWidth / 2, nameY, {
           align: 'center',
           width: contentWidth
         });
      
      // Decorative underline for student name (centered)
      const underlineY = nameY + 30;
      const underlineLength = 250;
      doc.moveTo((pageWidth - underlineLength) / 2, underlineY)
         .lineTo((pageWidth + underlineLength) / 2, underlineY)
         .stroke(accentColor, 2);

      // Program completion text (centered)
      const completionY = underlineY + 25;
      doc.fontSize(16)
         .fillColor(secondaryColor)
         .text(`has successfully completed the program`, pageWidth / 2, completionY, {
           align: 'center',
           width: contentWidth
         });

      // Program name with decorative background (centered)
      const programY = completionY + 30;
      const programWidth = 500;
      const programX = (pageWidth - programWidth) / 2;
      
      doc.rect(programX, programY, programWidth, 35)
         .fill(lightBlue)
         .stroke(accentColor, 1);
      
      doc.fontSize(16)
         .fillColor(accentColor)
         .text(`"${certificate.program.title}"`, pageWidth / 2, programY + 8, {
           align: 'center',
           width: programWidth - 20
         });

      // Completion details (centered)
      const completionDate = certificate.issueDate.toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric'
      });

      const detailsY = programY + 50;
      doc.fontSize(14)
         .fillColor(secondaryColor)
         .text(`Completed on: ${completionDate}`, pageWidth / 2, detailsY, {
           align: 'center',
           width: contentWidth
         });

      // Performance details with decorative background (centered)
      const attendance = certificate.completionDetails.attendancePercentage;
      const grade = certificate.completionDetails.finalGrade;
      const performanceY = detailsY + 30;
      const performanceWidth = 550;
      const performanceX = (pageWidth - performanceWidth) / 2;
      
      doc.rect(performanceX, performanceY, performanceWidth, 30)
         .fill('#f0f8ff')
         .stroke(accentColor, 1);
      
      doc.fontSize(14)
         .fillColor(primaryColor)
         .text(`Attendance: ${attendance}% | Final Grade: ${grade}`, pageWidth / 2, performanceY + 8, {
           align: 'center',
           width: performanceWidth - 20
         });

      // Bottom section - ALL CENTERED
      const bottomY = performanceY + 60;

      // Coach signature (CENTERED)
      let coachName = 'Head Coach';
      if (certificate.coach && certificate.coach.userId) {
        coachName = `${certificate.coach.userId.firstName} ${certificate.coach.userId.lastName}`;
      }
      
      const signatureY = bottomY + 20;
      
      doc.fontSize(12)
         .fillColor(secondaryColor)
         .text('Coach Signature:', pageWidth / 2, signatureY, {
           align: 'center',
           width: contentWidth
         });

      doc.moveTo(pageWidth / 2 - 50, signatureY + 20)
         .lineTo(pageWidth / 2 + 50, signatureY + 20)
         .stroke(accentColor, 1);

      doc.fontSize(14)
         .fillColor(primaryColor)
         .text(coachName, pageWidth / 2, signatureY + 25, {
           align: 'center',
           width: contentWidth
         });

      // Official seal (CENTERED)
      const sealY = signatureY + 60;
      
      doc.circle(pageWidth / 2, sealY + 25, 25)
         .stroke(primaryColor, 2)
         .fill('#f0f8ff');
      
      doc.fontSize(8)
         .fillColor(primaryColor)
         .text('OFFICIAL', pageWidth / 2, sealY + 20, {
           align: 'center',
           width: 50
         });
      
      doc.fontSize(6)
         .fillColor(secondaryColor)
         .text('SEAL', pageWidth / 2, sealY + 30, {
           align: 'center',
           width: 50
         });

      // Certificate number (CENTERED)
      const certY = sealY + 60;
      const certWidth = 400;
      const certX = (pageWidth - certWidth) / 2;
      doc.rect(certX, certY, certWidth, 25)
         .fill('#f8f9fa')
         .stroke(accentColor, 1);
      
      doc.fontSize(11)
         .fillColor(primaryColor)
         .text(`Certificate No: ${certificate.certificateNumber}`, pageWidth / 2, certY + 7, {
           align: 'center',
           width: certWidth - 10
         });

      // Verification info (CENTERED)
      const verifyY = certY + 35;
      const verifyWidth = 500;
      const verifyX = (pageWidth - verifyWidth) / 2;
      doc.rect(verifyX, verifyY, verifyWidth, 25)
         .fill('#f0f8ff')
         .stroke(accentColor, 1);
      
      doc.fontSize(10)
         .fillColor(secondaryColor)
         .text(`Verify at: ${certificate.verificationUrl || 'www.cricketxpert.com/verify'}`, pageWidth / 2, verifyY + 7, {
           align: 'center',
           width: verifyWidth - 10
         });

      // Footer (CENTERED)
      const footerY = pageHeight - margin - 15;
      doc.fontSize(10)
         .fillColor(secondaryColor)
         .text('© 2024 CricketXpert Coaching Academy. All rights reserved.', pageWidth / 2, footerY, {
           align: 'center',
           width: contentWidth
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
