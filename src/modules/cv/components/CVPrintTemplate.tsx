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

    // ── Sidebar content ──────────────────────────────────────────────
    const contactItems: { icon: string; text: string; href?: string }[] = [];
    if (userEmail)            contactItems.push({ icon: '✉', text: userEmail, href: `mailto:${userEmail}` });
    if (cvData.telefono)      contactItems.push({ icon: '✆', text: cvData.telefono });
    if (cvData.ciudad || cvData.pais)
        contactItems.push({ icon: '⌖', text: [cvData.ciudad, cvData.pais].filter(Boolean).join(', ') });
    if (cvData.linkedin_url)  contactItems.push({ icon: 'in', text: cvData.linkedin_url.replace('https://',''), href: cvData.linkedin_url });
    if (cvData.github_url)    contactItems.push({ icon: '⌁', text: cvData.github_url.replace('https://',''), href: cvData.github_url });
    if (cvData.portfolio_url) contactItems.push({ icon: '⊹', text: cvData.portfolio_url.replace('https://',''), href: cvData.portfolio_url });

    const sidebarContact = contactItems.map(c =>
        `<div class="contact-row">
            <span class="contact-icon">${c.icon}</span>
            ${c.href
                ? `<a href="${c.href}" class="contact-text">${c.text}</a>`
                : `<span class="contact-text">${c.text}</span>`
            }
         </div>`
    ).join('');

    const sidebarSkills = Object.entries(skillGroups).map(([cat, items]) => `
        <div class="sidebar-section">
            <h3 class="sidebar-section-title">${cat}</h3>
            <div class="skill-pills">
                ${items.map(s => `<span class="skill-pill">${s.nombre}${s.nivel && s.nivel !== 'Sin especificar' ? ` <span class="skill-level">${s.nivel}</span>` : ''}</span>`).join('')}
            </div>
        </div>`
    ).join('');

    const sidebarLangs = idiomas.length === 0 ? '' : `
        <div class="sidebar-section">
            <h3 class="sidebar-section-title">Idiomas</h3>
            ${idiomas.map(i => `
                <div class="lang-row">
                    <span class="lang-name">${i.nombre}</span>
                    <span class="lang-level">${i.nivel}</span>
                </div>`
            ).join('')}
        </div>`;

    const sidebarCerts = certificaciones.length === 0 ? '' : `
        <div class="sidebar-section">
            <h3 class="sidebar-section-title">Certificaciones</h3>
            ${certificaciones.map(cert => `
                <div class="cert-item">
                    <span class="cert-name">${cert.nombre}</span>
                    ${cert.emisor ? `<span class="cert-issuer">${cert.emisor}</span>` : ''}
                    ${cert.fecha ? `<span class="cert-date">${formatDate(cert.fecha)}</span>` : ''}
                </div>`
            ).join('')}
        </div>`;

    const sidebarExtra = (cvData.disponibilidad || cvData.modalidad_trabajo) ? `
        <div class="sidebar-section">
            <h3 class="sidebar-section-title">Disponibilidad</h3>
            ${cvData.disponibilidad ? `<p class="sidebar-text">${cvData.disponibilidad}</p>` : ''}
            ${cvData.modalidad_trabajo ? `<p class="sidebar-text">${cvData.modalidad_trabajo}</p>` : ''}
        </div>` : '';

    // ── Main content ─────────────────────────────────────────────────
    const expSection = sortedExp.length === 0 ? '' : `
        <section>
            <h2 class="main-section-title">
                <span class="title-line"></span>Experiencia Laboral
            </h2>
            ${sortedExp.map(exp => {
                const bullets = toBullets(exp.descripcion);
                const dateRange = `${formatDate(exp.fecha_inicio)} – ${exp.es_trabajo_actual ? 'Presente' : formatDate(exp.fecha_fin)}`;
                return `
                <div class="entry">
                    <div class="entry-header">
                        <div>
                            <span class="entry-company">${exp.empresa}</span>
                            <span class="entry-role">${exp.cargo}</span>
                        </div>
                        <span class="entry-date">${dateRange}</span>
                    </div>
                    ${bullets.length > 0 ? `<ul class="bullet-list">${bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
                </div>`;
            }).join('')}
        </section>`;

    const eduSection = sortedEdu.length === 0 ? '' : `
        <section>
            <h2 class="main-section-title">
                <span class="title-line"></span>Educación
            </h2>
            ${sortedEdu.map(edu => {
                const dateRange = `${formatDate(edu.fecha_inicio)} – ${edu.en_curso ? 'En curso' : formatDate(edu.fecha_fin)}`;
                return `
                <div class="entry">
                    <div class="entry-header">
                        <div>
                            <span class="entry-company">${edu.institucion}</span>
                            <span class="entry-role">${edu.titulo}${edu.nivel ? ` · ${edu.nivel}` : ''}</span>
                        </div>
                        <span class="entry-date">${dateRange}</span>
                    </div>
                    ${edu.descripcion ? `<p class="entry-desc">${edu.descripcion}</p>` : ''}
                </div>`;
            }).join('')}
        </section>`;

    // ── Full document ─────────────────────────────────────────────────
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>CV – ${userName}</title>
  <style>
    /* ── Reset ───────────────────────────────────────────────────── */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1a1a2e;
      background: #ffffff;
      display: flex;
      min-height: 100vh;
    }

    /* ── Sidebar ─────────────────────────────────────────────────── */
    .sidebar {
      width: 230px;
      min-width: 230px;
      background: #1e3a5f;
      color: #e8edf5;
      padding: 36px 22px 36px 22px;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .sidebar-name {
      font-size: 18pt;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.15;
      letter-spacing: -0.3px;
      margin-bottom: 4px;
    }

    .sidebar-title {
      font-size: 9pt;
      font-weight: 600;
      color: #7ec8e3;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.15);
    }

    .sidebar-section {
      margin-bottom: 20px;
    }

    .sidebar-section-title {
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #7ec8e3;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid rgba(126,200,227,0.3);
    }

    /* Contact */
    .contact-row {
      display: flex;
      align-items: flex-start;
      gap: 7px;
      margin-bottom: 6px;
    }
    .contact-icon {
      font-size: 9pt;
      color: #7ec8e3;
      min-width: 14px;
      line-height: 1.5;
      font-style: normal;
    }
    .contact-text, a.contact-text {
      font-size: 8pt;
      color: #c8d8ea;
      word-break: break-all;
      line-height: 1.4;
      text-decoration: none;
    }

    /* Skills */
    .skill-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .skill-pill {
      font-size: 7.5pt;
      background: rgba(126,200,227,0.15);
      color: #d0e8f5;
      border: 1px solid rgba(126,200,227,0.25);
      border-radius: 4px;
      padding: 2px 7px;
      line-height: 1.5;
    }
    .skill-level {
      font-size: 6.5pt;
      opacity: 0.75;
    }

    /* Languages */
    .lang-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }
    .lang-name {
      font-size: 8.5pt;
      color: #d0e8f5;
      font-weight: 600;
    }
    .lang-level {
      font-size: 7.5pt;
      color: #7ec8e3;
    }

    /* Certifications */
    .cert-item {
      margin-bottom: 8px;
    }
    .cert-name {
      display: block;
      font-size: 8pt;
      font-weight: 600;
      color: #d0e8f5;
    }
    .cert-issuer {
      display: block;
      font-size: 7.5pt;
      color: #a0c4de;
    }
    .cert-date {
      font-size: 7pt;
      color: #7ec8e3;
    }

    .sidebar-text {
      font-size: 8.5pt;
      color: #c8d8ea;
      margin-bottom: 3px;
    }

    /* ── Main area ───────────────────────────────────────────────── */
    .main {
      flex: 1;
      padding: 36px 32px 36px 36px;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    /* Summary */
    .summary-box {
      background: #f0f5fb;
      border-left: 4px solid #1e3a5f;
      border-radius: 0 8px 8px 0;
      padding: 12px 16px;
      margin-bottom: 22px;
      font-size: 9.5pt;
      color: #2d3748;
      line-height: 1.6;
    }

    /* Section titles */
    .main-section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11pt;
      font-weight: 700;
      color: #1e3a5f;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 12px;
      padding-bottom: 4px;
      border-bottom: 2px solid #1e3a5f;
    }

    section {
      margin-bottom: 20px;
    }

    /* Entries */
    .entry {
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eef2f7;
    }
    .entry:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 3px;
    }
    .entry-company {
      display: block;
      font-weight: 700;
      font-size: 10.5pt;
      color: #1a1a2e;
    }
    .entry-role {
      display: block;
      font-size: 9.5pt;
      color: #1e3a5f;
      font-weight: 600;
      margin-top: 1px;
    }
    .entry-date {
      font-size: 8.5pt;
      color: #6b7280;
      white-space: nowrap;
      flex-shrink: 0;
      margin-top: 2px;
      background: #f0f5fb;
      padding: 1px 7px;
      border-radius: 20px;
    }
    .entry-desc {
      font-size: 9pt;
      color: #4b5563;
      margin-top: 4px;
    }

    .bullet-list {
      margin: 5px 0 0 16px;
      padding: 0;
    }
    .bullet-list li {
      font-size: 9.5pt;
      margin-bottom: 2px;
      color: #374151;
    }

    /* ── Print ───────────────────────────────────────────────────── */
    @page {
      size: Letter;
      margin: 0;
    }
    @media print {
      body { min-height: 0; }
      .sidebar { min-height: 100vh; }
      a { color: inherit; text-decoration: none; }
    }
  </style>
</head>
<body>

  <!-- SIDEBAR -->
  <div class="sidebar">
    <div class="sidebar-name">${userName}</div>
    <div class="sidebar-title">${cvData.titulo_profesional || ''}</div>

    ${sidebarContact ? `
    <div class="sidebar-section">
      <h3 class="sidebar-section-title">Contacto</h3>
      ${sidebarContact}
    </div>` : ''}

    ${sidebarSkills}
    ${sidebarLangs}
    ${sidebarCerts}
    ${sidebarExtra}
  </div>

  <!-- MAIN -->
  <div class="main">

    ${cvData.resumen_profesional ? `<div class="summary-box">${cvData.resumen_profesional}</div>` : ''}

    ${expSection}
    ${eduSection}

  </div>

</body>
</html>`;

    const win = window.open('', '_blank', 'width=960,height=720');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 450);
}
