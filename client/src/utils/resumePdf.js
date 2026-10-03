import { jsPDF } from 'jspdf';

// All three templates are text-based (no images/tables-as-images) so the
// output stays ATS-parseable. Only layout, spacing and headline styling differ.

function addWrapped(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function sectionHeading(doc, title, x, y, accentColor) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...accentColor);
  doc.text(title.toUpperCase(), x, y);
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.4);
  doc.line(x, y + 2, 195, y + 2);
  doc.setTextColor(20, 20, 20);
  return y + 8;
}

function buildCommon(doc, resume, accentColor, nameSize) {
  const margin = 15;
  let y = 18;
  const { personalInfo = {}, summary, education = [], skills = [], projects = [], certifications = [], experience = [], achievements = [] } = resume;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(nameSize);
  doc.setTextColor(...accentColor);
  doc.text(personalInfo.fullName || 'Your Name', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(60, 60, 60);
  const contactLine = [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.linkedin, personalInfo.github, personalInfo.portfolio]
    .filter(Boolean).join('  |  ');
  y = addWrapped(doc, contactLine, margin, y, 180, 5) + 3;

  if (summary) {
    y = sectionHeading(doc, 'Summary', margin, y, accentColor);
    doc.setFontSize(10);
    y = addWrapped(doc, summary, margin, y, 180, 5) + 4;
  }

  if (education.length) {
    y = sectionHeading(doc, 'Education', margin, y, accentColor);
    doc.setFontSize(10);
    education.forEach(ed => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${ed.degree || ''}${ed.branch ? ' - ' + ed.branch : ''}`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${ed.startYear || ''}${ed.endYear ? ' - ' + ed.endYear : ''}`, 195, y, { align: 'right' });
      y += 5;
      doc.text(`${ed.college || ''}${ed.cgpa ? '  |  CGPA: ' + ed.cgpa : ''}`, margin, y);
      y += 6;
    });
    y += 1;
  }

  if (skills.length) {
    y = sectionHeading(doc, 'Skills', margin, y, accentColor);
    doc.setFontSize(10);
    const skillLine = skills.map(s => (typeof s === 'string' ? s : `${s.name}${s.level ? ` (${s.level})` : ''}`)).join('   •   ');
    y = addWrapped(doc, skillLine, margin, y, 180, 5) + 4;
  }

  if (projects.length) {
    y = sectionHeading(doc, 'Projects', margin, y, accentColor);
    doc.setFontSize(10);
    projects.forEach(p => {
      doc.setFont('helvetica', 'bold');
      doc.text(p.title || '', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      if (p.description) y = addWrapped(doc, p.description, margin, y, 180, 5) + 1;
      const techLine = [
        Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies,
        p.link
      ].filter(Boolean).join('  |  ');
      if (techLine) { doc.setFontSize(9); doc.setTextColor(90, 90, 90); y = addWrapped(doc, techLine, margin, y, 180, 4.5) + 1; doc.setFontSize(10); doc.setTextColor(20, 20, 20); }
      y += 2;
    });
  }

  if (experience.length) {
    y = sectionHeading(doc, 'Experience', margin, y, accentColor);
    doc.setFontSize(10);
    experience.forEach(ex => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${ex.role || ''} - ${ex.organization || ''}`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(ex.duration || '', 195, y, { align: 'right' });
      y += 5;
      if (ex.description) y = addWrapped(doc, ex.description, margin, y, 180, 5) + 2;
    });
  }

  if (certifications.length) {
    y = sectionHeading(doc, 'Certifications', margin, y, accentColor);
    doc.setFontSize(10);
    certifications.forEach(c => {
      const line = `${c.name}${c.organization ? ' - ' + c.organization : ''}`;
      y = addWrapped(doc, line, margin, y, 180, 5) + 1;
    });
    y += 2;
  }

  if (achievements.length) {
    y = sectionHeading(doc, 'Achievements', margin, y, accentColor);
    doc.setFontSize(10);
    achievements.forEach(a => { y = addWrapped(doc, `•  ${a}`, margin, y, 180, 5) + 1; });
  }

  return doc;
}

const templates = {
  'simple-ats': (resume) => {
    const doc = new jsPDF();
    return buildCommon(doc, resume, [30, 30, 30], 18);
  },
  'modern-professional': (resume) => {
    const doc = new jsPDF();
    doc.setFillColor(47, 111, 237);
    doc.rect(0, 0, 210, 10, 'F');
    return buildCommon(doc, resume, [47, 111, 237], 20);
  },
  'minimal-student': (resume) => {
    const doc = new jsPDF();
    return buildCommon(doc, resume, [22, 163, 150], 16);
  }
};

export function generateResumePdf(resume, template = 'simple-ats') {
  const build = templates[template] || templates['simple-ats'];
  const doc = build(resume);
  const fileName = `${(resume.personalInfo?.fullName || 'resume').replace(/\s+/g, '_')}_SkillHub.pdf`;
  doc.save(fileName);
}
