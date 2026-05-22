import type { CVData, ExperienciaLaboral, Educacion, Idioma, Certificacion } from '../types/CVType';
import type { HabilidadData } from '../types/HabilidadType';

interface CVPrintProps {
    cvData: CVData;
    userName: string;
    userEmail?: string;
    habilidades: HabilidadData[];
    experiencias: ExperienciaLaboral[];
    educaciones: Educacion[];
    idiomas: Idioma[];
    certificaciones: Certificacion[];
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    if (!year) return dateStr;
    if (!month) return year;
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const label = months[parseInt(month, 10) - 1] ?? month;
    return `${label} ${year}`;
}

function toBullets(text?: string): string[] {
    if (!text?.trim()) return [];
    return text.split(/[\n•\-]+/).map(s => s.trim()).filter(Boolean);
}

function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
    return arr.reduce<Record<string, T[]>>((acc, item) => {
        const k = String(item[key]);
        (acc[k] ??= []).push(item);
        return acc;
    }, {});
}

function esc(str?: string | null): string {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function printCV(props: CVPrintProps) {
    const { cvData, userName, userEmail, habilidades, experiencias, educaciones, idiomas, certificaciones } = props;

    const skillGroups = groupBy(habilidades, 'categoria');

    const sortedExp = [...experiencias].sort((a, b) => {
        const aEnd = a.es_trabajo_actual ? '9999-99' : (a.fecha_fin ?? '0000-00');
        const bEnd = b.es_trabajo_actual ? '9999-99' : (b.fecha_fin ?? '0000-00');
        return bEnd.localeCompare(aEnd);
    });

    const sortedEdu = [...educaciones].sort((a, b) => {
        const aEnd = a.en_curso ? '9999-99' : (a.fecha_fin ?? '0000-00');
        const bEnd = b.en_curso ? '9999-99' : (b.fecha_fin ?? '0000-00');
        return bEnd.localeCompare(aEnd);
    });

    // ── Contact bar ──────────────────────────────────────────────────
    const contactParts: string[] = [];
    if (cvData.telefono)
        contactParts.push(`<span class="ci">&#9990;&nbsp;${esc(cvData.telefono)}</span>`);
    if (userEmail)
        contactParts.push(`<span class="ci">&#9993;&nbsp;${esc(userEmail)}</span>`);
    if (cvData.ciudad || cvData.pais)
        contactParts.push(`<span class="ci">&#9679;&nbsp;${esc([cvData.ciudad, cvData.pais].filter(Boolean).join(', '))}</span>`);
    if (cvData.linkedin_url) {
        const liUser = cvData.linkedin_url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '');
        contactParts.push(`<a href="${esc(cvData.linkedin_url)}" class="ci">in&nbsp;linkedin.com/in/${esc(liUser)}</a>`);
    }
    if (cvData.github_url) {
        const ghUser = cvData.github_url.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '');
        contactParts.push(`<a href="${esc(cvData.github_url)}" class="ci">&#9679;&nbsp;github.com/${esc(ghUser)}</a>`);
    }
    if (cvData.portfolio_url)
        contactParts.push(`<a href="${esc(cvData.portfolio_url)}" class="ci">&#9679;&nbsp;Portfolio</a>`);

    const contactBar = contactParts.join('<span class="sep">|</span>');

    // ── Summary ──────────────────────────────────────────────────────
    const summarySection = cvData.resumen_profesional ? `
        <div class="section">
            <div class="section-title">Perfil Profesional</div>
            <p class="summary-text">${esc(cvData.resumen_profesional)}</p>
        </div>` : '';

    // ── Experience ───────────────────────────────────────────────────
    const expSection = sortedExp.length === 0 ? '' : `
        <div class="section">
            <div class="section-title">Experiencia Profesional</div>
            ${sortedExp.map(exp => {
                const bullets = toBullets(exp.descripcion);
                const dateStr = `${formatDate(exp.fecha_inicio)} – ${exp.es_trabajo_actual ? 'Presente' : formatDate(exp.fecha_fin)}`;
                return `
                <div class="entry">
                    <div class="entry-header">
                        <span class="entry-company">${esc(exp.empresa)}</span>
                        <span class="entry-dates">${dateStr}</span>
                    </div>
                    <div class="entry-role">${esc(exp.cargo)}</div>
                    ${bullets.length > 0
                        ? `<ul class="bullet-list">${bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>`
                        : ''
                    }
                </div>`;
            }).join('')}
        </div>`;

    // ── Education ────────────────────────────────────────────────────
    const eduSection = sortedEdu.length === 0 ? '' : `
        <div class="section">
            <div class="section-title">Formación Académica</div>
            ${sortedEdu.map(edu => {
                const dateStr = `${formatDate(edu.fecha_inicio)} – ${edu.en_curso ? 'En curso' : formatDate(edu.fecha_fin)}`;
                return `
                <div class="entry">
                    <div class="entry-header">
                        <span class="entry-company">${esc(edu.institucion)}</span>
                        <span class="entry-dates">${dateStr}</span>
                    </div>
                    <div class="entry-role">${esc(edu.titulo)}${edu.nivel ? ` · ${esc(edu.nivel)}` : ''}</div>
                    ${edu.descripcion ? `<p class="entry-desc">${esc(edu.descripcion)}</p>` : ''}
                </div>`;
            }).join('')}
        </div>`;

    // ── Sidebar: Skills grouped by category ──────────────────────────
    const sideSkills = Object.entries(skillGroups).map(([cat, items]) => `
        <div class="sidebar-section">
            <div class="section-title">${esc(cat)}</div>
            ${items.map(s => `
                <div class="skill-item">
                    <span class="skill-bullet"></span>
                    <span>${esc(s.nombre)}</span>
                </div>`).join('')}
        </div>`
    ).join('');

    // ── Sidebar: Languages ───────────────────────────────────────────
    const sideLangs = idiomas.length === 0 ? '' : `
        <div class="sidebar-section">
            <div class="section-title">Idiomas</div>
            ${idiomas.map(i => `
                <div class="lang-row">
                    <span class="lang-name">${esc(i.nombre)}</span>
                    <span class="lang-level">${esc(i.nivel)}</span>
                </div>`).join('')}
        </div>`;

    // ── Sidebar: Certifications ──────────────────────────────────────
    const sideCerts = certificaciones.length === 0 ? '' : `
        <div class="sidebar-section">
            <div class="section-title">Certificaciones</div>
            ${certificaciones.map(c => `
                <div class="cert-item">
                    <span class="cert-name">${esc(c.nombre)}</span>
                    ${c.emisor ? `<span class="cert-meta">${esc(c.emisor)}</span>` : ''}
                    ${c.fecha ? `<span class="cert-meta">${formatDate(c.fecha)}</span>` : ''}
                </div>`).join('')}
        </div>`;

    // ── Sidebar: Availability ────────────────────────────────────────
    const sideExtra = (cvData.disponibilidad || cvData.modalidad_trabajo) ? `
        <div class="sidebar-section">
            <div class="section-title">Disponibilidad</div>
            ${cvData.disponibilidad ? `<div class="skill-item"><span class="skill-bullet"></span><span>${esc(cvData.disponibilidad)}</span></div>` : ''}
            ${cvData.modalidad_trabajo ? `<div class="skill-item"><span class="skill-bullet"></span><span>${esc(cvData.modalidad_trabajo)}</span></div>` : ''}
        </div>` : '';

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>CV – ${esc(userName)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: auto; }

    body {
      font-family: 'Calibri', 'Segoe UI', Arial, Helvetica, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1a1a1a;
      background: #fff;
    }

    /* ── Header ─────────────────────────────────────────────────── */
    .cv-header {
      background: #d8e8f5;
      padding: 22px 44px 18px;
      text-align: center;
    }
    .cv-header-title {
      font-size: 20pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #0f1c2e;
      line-height: 1.2;
    }
    .cv-header-name {
      font-size: 11pt;
      color: #2c3e50;
      margin-top: 4px;
      letter-spacing: 0.5px;
    }

    /* ── Contact bar ─────────────────────────────────────────────── */
    .contact-bar {
      background: #fff;
      border-top: 1px solid #c5d8ec;
      border-bottom: 1px solid #dde8f0;
      padding: 9px 44px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 0;
    }
    .ci {
      display: inline-flex;
      align-items: center;
      font-size: 8.5pt;
      color: #333;
      padding: 0 12px;
      text-decoration: none;
      white-space: nowrap;
    }
    a.ci:hover { color: #1a5fa8; }
    .sep {
      color: #aab8c4;
      font-size: 10pt;
      line-height: 1;
    }

    /* ── Body layout ─────────────────────────────────────────────── */
    .cv-body {
      display: flex;
      padding: 22px 44px 32px;
      gap: 28px;
    }
    .col-main { flex: 1.75; }
    .col-side {
      flex: 1;
      border-left: 1px solid #dde3ea;
      padding-left: 22px;
    }

    /* ── Section titles ─────────────────────────────────────────── */
    .section-title {
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #0f1c2e;
      border-bottom: 1.5px solid #0f1c2e;
      padding-bottom: 3px;
      margin-bottom: 10px;
    }

    /* ── Main sections ───────────────────────────────────────────── */
    .section { margin-bottom: 18px; }

    .summary-text {
      font-size: 9.5pt;
      line-height: 1.65;
      color: #2d3748;
      text-align: justify;
    }

    /* Experience / Education entries */
    .entry {
      margin-bottom: 12px;
      padding-bottom: 11px;
      border-bottom: 0.5px solid #eaecef;
    }
    .entry:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
    }
    .entry-company {
      font-weight: 700;
      font-size: 10pt;
      color: #0f1c2e;
    }
    .entry-dates {
      font-size: 8.5pt;
      color: #5a6a7a;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .entry-role {
      font-size: 9.5pt;
      font-style: italic;
      color: #3a4a5a;
      margin-top: 2px;
    }
    .entry-desc {
      font-size: 9pt;
      color: #4a5568;
      margin-top: 4px;
    }
    .bullet-list {
      margin: 5px 0 0 14px;
      padding: 0;
    }
    .bullet-list li {
      font-size: 9.5pt;
      color: #2d3748;
      margin-bottom: 2px;
      line-height: 1.55;
    }

    /* ── Sidebar ─────────────────────────────────────────────────── */
    .sidebar-section { margin-bottom: 14px; }

    .skill-item {
      display: flex;
      align-items: flex-start;
      gap: 7px;
      font-size: 9.5pt;
      color: #2d3748;
      line-height: 1.5;
      padding: 1px 0;
    }
    .skill-bullet {
      display: inline-block;
      width: 5px;
      height: 5px;
      background: #4a5568;
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;
    }

    .lang-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5pt;
      padding: 3px 0;
      border-bottom: 0.5px solid #eee;
    }
    .lang-row:last-child { border-bottom: none; }
    .lang-name { font-weight: 600; color: #1a1a1a; }
    .lang-level { color: #5a6a7a; font-size: 8.5pt; }

    .cert-item { margin-bottom: 8px; }
    .cert-name {
      display: block;
      font-size: 9pt;
      font-weight: 700;
      color: #1a1a1a;
    }
    .cert-meta {
      display: block;
      font-size: 8pt;
      color: #5a6a7a;
    }

    /* ── Print ───────────────────────────────────────────────────── */
    @page { margin: 0.5in; size: letter portrait; }
    @media print {
      html, body { height: auto; }
      body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      a { color: inherit; text-decoration: none; }
      .cv-header, .contact-bar { break-inside: avoid; break-after: avoid; }
      .entry { break-inside: avoid; }
      .sidebar-section { break-inside: avoid; }
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="cv-header">
    <div class="cv-header-title">${esc(cvData.titulo_profesional)}</div>
    <div class="cv-header-name">${esc(userName)}</div>
  </div>

  <!-- CONTACT BAR -->
  ${contactParts.length > 0 ? `<div class="contact-bar">${contactBar}</div>` : ''}

  <!-- BODY -->
  <div class="cv-body">

    <!-- LEFT COLUMN -->
    <div class="col-main">
      ${summarySection}
      ${expSection}
      ${eduSection}
    </div>

    <!-- RIGHT COLUMN -->
    <div class="col-side">
      ${sideSkills}
      ${sideLangs}
      ${sideCerts}
      ${sideExtra}
    </div>

  </div>

</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;width:0;height:0;border:none;top:-9999px;left:-9999px;';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) { document.body.removeChild(iframe); return; }
    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 500);
    };
}
