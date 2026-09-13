import PDFDocument from 'pdfkit';

export interface AdmitCardPdfData {
  studentName: string;
  studentEmail: string;
  studentContact: string;
  parentEmail: string;
  facultyName: string;
  semester: number;
  moduleName: string;
  moduleCode: string | null;
  examDate: string;
  startTime: string;
  endTime: string;
  duration: string;
  seatNumber: string;
  roomName: string;
  admitCardId: string;
}

function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function generateAdmitCardPdf(data: AdmitCardPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header background
    doc.rect(0, 0, 595.28, 120).fill('#1a365d');

    // College name
    doc.fontSize(22).fillColor('#ffffff').font('Helvetica-Bold');
    doc.text('ISLINGTON COLLEGE', 40, 30, { align: 'center', width: 515.28 });

    doc.fontSize(11).fillColor('#cbd5e0').font('Helvetica');
    doc.text('Affiliated to Staffordshire University, UK', 40, 58, {
      align: 'center',
      width: 515.28,
    });

    // Admit Card title
    doc.fontSize(16).fillColor('#ffffff').font('Helvetica-Bold');
    doc.text('ADMIT CARD', 40, 82, { align: 'center', width: 515.28 });

    // Divider line
    doc
      .moveTo(40, 125)
      .lineTo(555.28, 125)
      .lineWidth(2)
      .strokeColor('#e2e8f0')
      .stroke();

    let y = 145;

    // Student info section
    doc.fontSize(12).fillColor('#2d3748').font('Helvetica-Bold');
    doc.text('STUDENT INFORMATION', 40, y);
    y += 22;

    doc.fontSize(10).fillColor('#4a5568').font('Helvetica');

    const leftCol = 50;
    const rightCol = 320;
    const lineHeight = 20;

    // Row 1
    doc.font('Helvetica-Bold').text('Name:', leftCol, y);
    doc.font('Helvetica').text(data.studentName, leftCol + 60, y);
    doc.font('Helvetica-Bold').text('Email:', rightCol, y);
    doc.font('Helvetica').text(data.studentEmail, rightCol + 45, y);
    y += lineHeight;

    // Row 2
    doc.font('Helvetica-Bold').text('Contact:', leftCol, y);
    doc.font('Helvetica').text(data.studentContact, leftCol + 60, y);
    doc.font('Helvetica-Bold').text('Parent Email:', rightCol, y);
    doc.font('Helvetica').text(data.parentEmail, rightCol + 80, y);
    y += lineHeight;

    // Row 3
    doc.font('Helvetica-Bold').text('Faculty:', leftCol, y);
    doc.font('Helvetica').text(data.facultyName, leftCol + 60, y);
    doc.font('Helvetica-Bold').text('Semester:', rightCol, y);
    doc.font('Helvetica').text(String(data.semester), rightCol + 65, y);
    y += lineHeight + 10;

    // Divider
    doc
      .moveTo(40, y)
      .lineTo(555.28, y)
      .lineWidth(1)
      .strokeColor('#e2e8f0')
      .stroke();
    y += 15;

    // Exam details section
    doc.fontSize(12).fillColor('#2d3748').font('Helvetica-Bold');
    doc.text('EXAMINATION DETAILS', 40, y);
    y += 22;

    doc.fontSize(10).fillColor('#4a5568').font('Helvetica');

    // Row 1
    doc.font('Helvetica-Bold').text('Module:', leftCol, y);
    doc
      .font('Helvetica')
      .text(
        data.moduleName + (data.moduleCode ? ` (${data.moduleCode})` : ''),
        leftCol + 60,
        y,
      );
    y += lineHeight;

    // Row 2
    doc.font('Helvetica-Bold').text('Date:', leftCol, y);
    doc.font('Helvetica').text(formatDate(data.examDate), leftCol + 60, y);
    y += lineHeight;

    // Row 3
    doc.font('Helvetica-Bold').text('Time:', leftCol, y);
    doc
      .font('Helvetica')
      .text(
        `${formatTime(data.startTime)} - ${formatTime(data.endTime)} (${data.duration})`,
        leftCol + 60,
        y,
      );
    y += lineHeight + 10;

    // Divider
    doc
      .moveTo(40, y)
      .lineTo(555.28, y)
      .lineWidth(1)
      .strokeColor('#e2e8f0')
      .stroke();
    y += 15;

    // Seat info
    doc.fontSize(12).fillColor('#2d3748').font('Helvetica-Bold');
    doc.text('SEATING INFORMATION', 40, y);
    y += 22;

    doc.fontSize(10).fillColor('#4a5568').font('Helvetica');
    doc.font('Helvetica-Bold').text('Room:', leftCol, y);
    doc.font('Helvetica').text(data.roomName, leftCol + 60, y);
    doc.font('Helvetica-Bold').text('Seat Number:', rightCol, y);
    doc.font('Helvetica').text(data.seatNumber, rightCol + 85, y);
    y += lineHeight + 20;

    // Footer
    doc
      .moveTo(40, y)
      .lineTo(555.28, y)
      .lineWidth(1)
      .strokeColor('#e2e8f0')
      .stroke();
    y += 15;

    doc.fontSize(8).fillColor('#a0aec0').font('Helvetica');
    doc.text(`Admit Card ID: ${data.admitCardId}`, 40, y, { align: 'left' });
    doc.text(
      `Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      40,
      y,
      { align: 'right', width: 515.28 },
    );
    y += 20;

    doc.fontSize(9).fillColor('#718096').font('Helvetica-Oblique');
    doc.text(
      'This is a system-generated admit card. Please carry a valid photo ID along with this document.',
      40,
      y,
      { align: 'center', width: 515.28 },
    );

    // Border around entire card
    doc
      .rect(30, 130, 535.28, y - 120)
      .lineWidth(1)
      .strokeColor('#cbd5e0')
      .stroke();

    doc.end();
  });
}
