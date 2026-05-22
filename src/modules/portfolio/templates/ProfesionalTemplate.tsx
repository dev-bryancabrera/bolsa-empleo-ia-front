import { useState } from 'react';
import { Phone, Mail, MapPin, Globe, Github, Linkedin, Twitter, ExternalLink, CheckCircle, Send } from 'lucide-react';
import type { TemplateProps } from '../types/PortfolioTypes';

function fmtDate(d?: string) {
    if (!d) return '';
    const [y, m] = d.split('-');
    if (!m) return y;
    const M = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${M[+m - 1]} ${y}`;
}

const NIVEL_PCT: Record<string, number> = { Básico: 25, Intermedio: 50, Avanzado: 75, Experto: 100 };

const SEC_LABEL: Record<string, string> = {
    resumen: 'Sobre mí', experiencia: 'Experiencia', educacion: 'Educación',
    habilidades: 'Habilidades', idiomas: 'Idiomas', certificaciones: 'Certificaciones',
    proyectos_custom: 'Proyectos', contacto: 'Contacto',
};

function ProfContactSection({ cv, persona, links_sociales, email_contacto, colores, sectionH2 }: {
    cv: import('../types/PortfolioTypes').CVPublico;
    persona: import('../types/PortfolioTypes').PersonaPublica;
    links_sociales: import('../types/PortfolioTypes').LinksSociales;
    email_contacto?: string;
    colores: import('../types/PortfolioTypes').ColoresPortfolio;
    sectionH2: React.CSSProperties;
}) {
    const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const subject = encodeURIComponent(`Contacto desde portafolio — ${form.nombre}`);
        const body = encodeURIComponent(`Nombre: ${form.nombre}\nEmail: ${form.email}\n\n${form.mensaje}`);
        window.open(`mailto:${email_contacto || ''}?subject=${subject}&body=${body}`, '_blank');
        setSent(true);
        setTimeout(() => { setSent(false); setForm({ nombre: '', email: '', mensaje: '' }); }, 3000);
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.55rem 0.85rem', borderRadius: 8, fontSize: '0.85rem',
        border: `1px solid ${colores.primario}25`, background: colores.fondo, color: colores.texto,
        outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    };
    const linkRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: colores.texto, textDecoration: 'none', padding: '0.5rem 0', borderBottom: `1px solid ${colores.texto}08` };

    return (
        <section id="contacto" style={{ background: `${colores.primario}05`, padding: '3rem 0', borderTop: `1px solid ${colores.texto}08` }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
                <h2 style={{ ...sectionH2, width: 'fit-content', marginBottom: '2rem' }}>Contacto</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '3rem' }}>
                    {/* Info */}
                    <div>
                        <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1.25rem' }}>¿Tienes un proyecto o propuesta? Contáctame por cualquiera de estos medios:</p>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {email_contacto && (
                                <a href={`mailto:${email_contacto}`} style={linkRow}>
                                    <Mail size={14} color={colores.primario} />{email_contacto}
                                </a>
                            )}
                            {cv.telefono && (
                                <a href={`tel:${cv.telefono}`} style={linkRow}>
                                    <Phone size={14} color={colores.primario} />{cv.telefono}
                                </a>
                            )}
                            {links_sociales?.linkedin && (
                                <a href={links_sociales.linkedin} target="_blank" rel="noopener noreferrer" style={linkRow}>
                                    <Linkedin size={14} color={colores.primario} />LinkedIn
                                </a>
                            )}
                            {links_sociales?.github && (
                                <a href={links_sociales.github} target="_blank" rel="noopener noreferrer" style={linkRow}>
                                    <Github size={14} color={colores.primario} />GitHub
                                </a>
                            )}
                            {links_sociales?.twitter && (
                                <a href={links_sociales.twitter} target="_blank" rel="noopener noreferrer" style={linkRow}>
                                    <Twitter size={14} color={colores.primario} />Twitter
                                </a>
                            )}
                            {links_sociales?.website && (
                                <a href={links_sociales.website} target="_blank" rel="noopener noreferrer" style={linkRow}>
                                    <Globe size={14} color={colores.primario} />Website
                                </a>
                            )}
                            {(cv.ciudad || persona.ciudad) && (
                                <span style={linkRow}>
                                    <MapPin size={14} color={colores.primario} />
                                    {[cv.ciudad || persona.ciudad, cv.pais || persona.pais].filter(Boolean).join(', ')}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Form */}
                    <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: colores.primario, marginBottom: '1rem' }}>Envíame un mensaje</p>
                        {sent ? (
                            <div style={{ padding: '1.25rem', borderRadius: 10, background: `${colores.primario}10`, border: `1px solid ${colores.primario}25`, textAlign: 'center' }}>
                                <p style={{ fontWeight: 700, color: colores.primario, fontSize: '0.92rem' }}>¡Mensaje preparado!</p>
                                <p style={{ fontSize: '0.8rem', opacity: 0.65, marginTop: '0.3rem' }}>Tu cliente de correo se abrió con el mensaje listo.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <input style={inputStyle} placeholder="Tu nombre" value={form.nombre} required
                                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                                <input style={inputStyle} type="email" placeholder="Tu email" value={form.email} required
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 110 }} placeholder="Tu mensaje..." value={form.mensaje} required
                                    onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))} />
                                <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: 8, background: colores.primario, color: '#fff', border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: 'fit-content' }}>
                                    <Send size={14} />Enviar mensaje
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export const ProfesionalTemplate = ({ persona, cv, config, contenido, experiencias, educaciones, habilidades, idiomas, certificaciones }: TemplateProps) => {
    const { colores, fuente, secciones, orden_secciones, tipo_fondo_hero = 'color', gradiente_hero, hero_overlay_opacidad = 0.55, mostrar_navegacion = true, altura_hero = 'media' } = config;
    const { titulo_hero, bio_extendida, frase_motivacional, proyectos_custom, links_sociales, disponible_para_trabajo, imagen_perfil_url, imagen_fondo_hero_url, nombre_nav } = contenido;

    const fontFamily = fuente === 'playfair' ? "'Playfair Display', Georgia, 'Times New Roman', serif"
        : fuente === 'poppins' ? "'Poppins', 'Segoe UI', system-ui, sans-serif"
        : fuente === 'roboto' ? "'Roboto', system-ui, Arial, sans-serif"
        : "'Inter', system-ui, -apple-system, sans-serif";

    const navBrand = nombre_nav?.trim() || '';
    const visibleSecs = orden_secciones.filter(s => secciones[s as keyof typeof secciones]);

    let heroBg: string;
    if (tipo_fondo_hero === 'imagen' && imagen_fondo_hero_url) {
        heroBg = `url(${imagen_fondo_hero_url}) center/cover no-repeat`;
    } else if (tipo_fondo_hero === 'gradiente' && gradiente_hero) {
        heroBg = gradiente_hero;
    } else {
        heroBg = `linear-gradient(135deg, ${colores.primario} 0%, ${colores.secundario} 100%)`;
    }

    const heroMinH = altura_hero === 'pantalla' ? '100vh' : altura_hero === 'compacta' ? '260px' : '420px';

    const sortedExp = [...experiencias].sort((a, b) => {
        const ae = a.es_trabajo_actual ? '9999' : (a.fecha_fin ?? '');
        const be = b.es_trabajo_actual ? '9999' : (b.fecha_fin ?? '');
        return be.localeCompare(ae);
    });

    const skillGroups = habilidades.reduce<Record<string, typeof habilidades>>((acc, h) => {
        (acc[h.categoria] ??= []).push(h); return acc;
    }, {});

    // Sidebar sections
    const sidebarSecs = ['habilidades', 'idiomas', 'certificaciones'];
    // Main content sections
    const mainSecs = ['resumen', 'experiencia', 'educacion'];

    const sectionH2: React.CSSProperties = {
        fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
        color: colores.primario, borderBottom: `2px solid ${colores.primario}`, paddingBottom: '0.4rem',
        marginBottom: '1.25rem',
    };

    return (
        <div style={{ fontFamily, color: colores.texto, background: colores.fondo, minHeight: '100%', scrollBehavior: 'smooth' }}>

            {/* NAV */}
            {mostrar_navegacion !== false && (
                <nav style={{ background: colores.primario, position: 'sticky', top: 0, zIndex: 100 }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54 }}>
                        {navBrand && <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', letterSpacing: '-0.01em' }}>{navBrand}</span>}
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            {visibleSecs.map(s => (
                                <a key={s} href={`#${s}`} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontWeight: 500 }}>
                                    {SEC_LABEL[s]}
                                </a>
                            ))}
                        </div>
                    </div>
                </nav>
            )}

            {/* HERO — Split layout */}
            <section style={{ background: heroBg, minHeight: heroMinH, position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                {tipo_fondo_hero === 'imagen' && imagen_fondo_hero_url && (
                    <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${hero_overlay_opacidad})` }} />
                )}
                {/* Decorative circle */}
                <div style={{ position: 'absolute', right: -80, top: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: 60, bottom: -100, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3.5rem 2rem', display: 'flex', alignItems: 'center', gap: '3rem', position: 'relative', zIndex: 1, width: '100%' }}>
                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {disponible_para_trabajo && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.25)' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                                Disponible para oportunidades
                            </span>
                        )}
                        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                            {persona.nombre} {persona.apellido}
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginBottom: '0.75rem' }}>
                            {titulo_hero || cv.titulo_profesional}
                        </p>
                        {frase_motivacional && (
                            <p style={{ fontSize: '0.92rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.65)', marginBottom: '1.5rem', maxWidth: 500 }}>
                                "{frase_motivacional}"
                            </p>
                        )}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {links_sociales?.linkedin && (
                                <a href={links_sociales.linkedin} target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 8, background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.25)' }}>
                                    <Linkedin size={14} /> LinkedIn
                                </a>
                            )}
                            {links_sociales?.github && (
                                <a href={links_sociales.github} target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 8, background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.25)' }}>
                                    <Github size={14} /> GitHub
                                </a>
                            )}
                            {links_sociales?.twitter && (
                                <a href={links_sociales.twitter} target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 8, background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.25)' }}>
                                    <Twitter size={14} /> Twitter
                                </a>
                            )}
                            {links_sociales?.website && (
                                <a href={links_sociales.website} target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 8, background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.25)' }}>
                                    <Globe size={14} /> Website
                                </a>
                            )}
                        </div>
                        {/* Quick stats */}
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                            {(cv.ciudad || persona.ciudad) && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>
                                    <MapPin size={13} /> {[cv.ciudad || persona.ciudad, cv.pais || persona.pais].filter(Boolean).join(', ')}
                                </span>
                            )}
                            {cv.anios_experiencia != null && (
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>
                                    {cv.anios_experiencia}+ años exp.
                                </span>
                            )}
                            {cv.modalidad_trabajo && (
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>{cv.modalidad_trabajo}</span>
                            )}
                        </div>
                    </div>

                    {/* Profile photo */}
                    {imagen_perfil_url ? (
                        <img src={imagen_perfil_url} alt={`${persona.nombre} ${persona.apellido}`}
                            style={{ width: 180, height: 180, borderRadius: 16, objectFit: 'cover', border: '4px solid rgba(255,255,255,0.3)', flexShrink: 0, boxShadow: '0 16px 48px rgba(0,0,0,0.3)' }} />
                    ) : (
                        <div style={{ width: 180, height: 180, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '3.5rem', fontWeight: 800, color: '#fff', border: '4px solid rgba(255,255,255,0.2)', boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>
                            {persona.nombre[0]}{persona.apellido[0]}
                        </div>
                    )}
                </div>
            </section>

            {/* BODY: Two column */}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem', display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>

                {/* Main column */}
                <div style={{ flex: '1 1 0', minWidth: 0 }}>
                    {visibleSecs.filter(k => mainSecs.includes(k) || (!sidebarSecs.includes(k) && k !== 'proyectos_custom' && k !== 'contacto')).map(key => {
                        if (key === 'resumen' && (bio_extendida || cv.resumen_profesional)) {
                            return (
                                <section key={key} id={key} style={{ marginBottom: '2.5rem' }}>
                                    <h2 style={sectionH2}>Sobre mí</h2>
                                    <p style={{ lineHeight: 1.8, opacity: 0.82, fontSize: '0.95rem' }}>{bio_extendida || cv.resumen_profesional}</p>
                                </section>
                            );
                        }

                        if (key === 'experiencia' && sortedExp.length > 0) {
                            return (
                                <section key={key} id={key} style={{ marginBottom: '2.5rem' }}>
                                    <h2 style={sectionH2}>Experiencia Profesional</h2>
                                    {sortedExp.map((exp, i) => (
                                        <div key={i} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: i < sortedExp.length - 1 ? `1px solid ${colores.texto}10` : 'none' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                                                <div>
                                                    <p style={{ fontWeight: 700, fontSize: '0.98rem' }}>{exp.empresa}</p>
                                                    <p style={{ color: colores.primario, fontSize: '0.87rem', fontWeight: 600 }}>{exp.cargo}</p>
                                                </div>
                                                <span style={{ fontSize: '0.75rem', opacity: 0.55, background: `${colores.primario}12`, color: colores.primario, padding: '2px 10px', borderRadius: 6, fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                    {fmtDate(exp.fecha_inicio)} — {exp.es_trabajo_actual ? 'Presente' : fmtDate(exp.fecha_fin)}
                                                </span>
                                            </div>
                                            {exp.descripcion && (
                                                <p style={{ fontSize: '0.86rem', lineHeight: 1.7, opacity: 0.72, marginTop: '0.5rem' }}>{exp.descripcion}</p>
                                            )}
                                        </div>
                                    ))}
                                </section>
                            );
                        }

                        if (key === 'educacion' && educaciones.length > 0) {
                            return (
                                <section key={key} id={key} style={{ marginBottom: '2.5rem' }}>
                                    <h2 style={sectionH2}>Formación Académica</h2>
                                    {educaciones.map((edu, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '0.85rem 1rem', background: `${colores.primario}06`, borderRadius: 10, borderLeft: `3px solid ${colores.primario}` }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: 700, fontSize: '0.92rem' }}>{edu.titulo}</p>
                                                <p style={{ color: colores.primario, fontSize: '0.82rem', fontWeight: 600 }}>{edu.institucion}</p>
                                                <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.15rem' }}>
                                                    {edu.nivel} · {fmtDate(edu.fecha_inicio)} — {edu.en_curso ? 'En curso' : fmtDate(edu.fecha_fin)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </section>
                            );
                        }

                        return null;
                    })}
                </div>

                {/* Sidebar */}
                <div style={{ width: 260, flexShrink: 0 }}>
                    {visibleSecs.filter(k => sidebarSecs.includes(k)).map(key => {
                        if (key === 'habilidades' && habilidades.length > 0) {
                            return (
                                <div key={key} id={key} style={{ marginBottom: '2rem' }}>
                                    <h2 style={sectionH2}>Habilidades</h2>
                                    {Object.entries(skillGroups).map(([cat, skills]) => (
                                        <div key={cat} style={{ marginBottom: '1.25rem' }}>
                                            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: colores.acento, marginBottom: '0.6rem' }}>{cat}</p>
                                            {skills.map((s, i) => (
                                                <div key={i} style={{ marginBottom: '0.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                                                        <span style={{ fontWeight: 500 }}>{s.nombre}</span>
                                                        <span style={{ opacity: 0.5, fontSize: '0.72rem' }}>{s.nivel}</span>
                                                    </div>
                                                    <div style={{ height: 4, background: `${colores.primario}18`, borderRadius: 2 }}>
                                                        <div style={{ height: '100%', width: `${NIVEL_PCT[s.nivel] ?? 50}%`, background: colores.primario, borderRadius: 2 }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            );
                        }

                        if (key === 'idiomas' && idiomas.length > 0) {
                            return (
                                <div key={key} id={key} style={{ marginBottom: '2rem' }}>
                                    <h2 style={sectionH2}>Idiomas</h2>
                                    {idiomas.map((id, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${colores.texto}10` }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{id.nombre}</span>
                                            <span style={{ fontSize: '0.78rem', color: colores.primario, fontWeight: 600 }}>{id.nivel}</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        }

                        if (key === 'certificaciones' && certificaciones.length > 0) {
                            return (
                                <div key={key} id={key} style={{ marginBottom: '2rem' }}>
                                    <h2 style={sectionH2}>Certificaciones</h2>
                                    {certificaciones.map((c, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                            <CheckCircle size={14} color={colores.primario} style={{ flexShrink: 0, marginTop: 2 }} />
                                            <div>
                                                <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>{c.nombre}</p>
                                                {c.emisor && <p style={{ fontSize: '0.73rem', opacity: 0.6 }}>{c.emisor}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        }

                        return null;
                    })}

                </div>
            </div>

            {/* PROJECTS — full width */}
            {secciones.proyectos_custom && proyectos_custom.length > 0 && (
                <section id="proyectos_custom" style={{ background: `${colores.primario}05`, padding: '3rem 0', borderTop: `1px solid ${colores.texto}08` }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
                        <h2 style={{ ...sectionH2, width: 'fit-content' }}>Proyectos Destacados</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
                            {proyectos_custom.map((p, i) => (
                                <div key={i} style={{ background: colores.fondo, borderRadius: 14, overflow: 'hidden', border: `1px solid ${colores.texto}10`, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                                    {p.imagen_url ? (
                                        <img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ height: 100, background: `linear-gradient(135deg, ${colores.primario}25, ${colores.secundario}35)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Globe size={28} color={`${colores.primario}70`} />
                                        </div>
                                    )}
                                    <div style={{ padding: '1.1rem 1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.nombre}</p>
                                            {p.url && (
                                                <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: colores.primario }}>
                                                    <ExternalLink size={13} />
                                                </a>
                                            )}
                                        </div>
                                        {p.descripcion && <p style={{ fontSize: '0.82rem', opacity: 0.7, lineHeight: 1.6 }}>{p.descripcion}</p>}
                                        {p.tecnologias.length > 0 && (
                                            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.65rem' }}>
                                                {p.tecnologias.map((t, ti) => (
                                                    <span key={ti} style={{ padding: '2px 8px', background: `${colores.primario}15`, color: colores.primario, borderRadius: 20, fontSize: '0.7rem', fontWeight: 700 }}>{t}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CONTACT — full width section */}
            {secciones.contacto && (
                <ProfContactSection
                    cv={cv} persona={persona}
                    links_sociales={links_sociales}
                    email_contacto={contenido.email_contacto}
                    colores={colores} sectionH2={sectionH2}
                />
            )}

            <footer style={{ background: colores.primario, padding: '1.5rem 2rem', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>
                    {persona.nombre} {persona.apellido} · {cv.titulo_profesional}
                </p>
            </footer>
        </div>
    );
};
