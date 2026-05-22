import { useState } from 'react';
import { Github, Linkedin, Twitter, Globe, MapPin, Phone, Mail, ExternalLink, CheckCircle, Send } from 'lucide-react';
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

function ContactSection({ cv, persona, links_sociales, email_contacto, colores, divStyle, h2Style, line }: {
    cv: import('../types/PortfolioTypes').CVPublico;
    persona: import('../types/PortfolioTypes').PersonaPublica;
    links_sociales: import('../types/PortfolioTypes').LinksSociales;
    email_contacto?: string;
    colores: import('../types/PortfolioTypes').ColoresPortfolio;
    divStyle: React.CSSProperties;
    h2Style: React.CSSProperties;
    line: React.ReactNode;
}) {
    const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dest = email_contacto || '';
        const subject = encodeURIComponent(`Contacto desde portafolio — ${form.nombre}`);
        const body = encodeURIComponent(`Nombre: ${form.nombre}\nEmail: ${form.email}\n\n${form.mensaje}`);
        window.open(`mailto:${dest}?subject=${subject}&body=${body}`, '_blank');
        setSent(true);
        setTimeout(() => { setSent(false); setForm({ nombre: '', email: '', mensaje: '' }); }, 3000);
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.55rem 0.85rem', borderRadius: 8, fontSize: '0.88rem',
        border: `1px solid ${colores.primario}25`, background: colores.fondo, color: colores.texto,
        outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    };
    const linkItem = { display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.75rem 1.1rem', border: `1px solid ${colores.primario}20`, borderRadius: 10, textDecoration: 'none', color: colores.texto, fontSize: '0.88rem' } as React.CSSProperties;

    return (
        <section id="contacto" style={{ ...divStyle, borderBottom: 'none' }}>
            <h2 style={h2Style}>Contacto {line}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '3rem' }}>
                {/* Info */}
                <div>
                    <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1.25rem' }}>¿Tienes alguna propuesta o quieres conectar? Aquí mis canales:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {email_contacto && (
                            <a href={`mailto:${email_contacto}`} style={linkItem}>
                                <Mail size={16} color={colores.primario} />{email_contacto}
                            </a>
                        )}
                        {cv.telefono && (
                            <a href={`tel:${cv.telefono}`} style={linkItem}>
                                <Phone size={16} color={colores.primario} />{cv.telefono}
                            </a>
                        )}
                        {links_sociales?.linkedin && (
                            <a href={links_sociales.linkedin} target="_blank" rel="noopener noreferrer" style={linkItem}>
                                <Linkedin size={16} color={colores.primario} />LinkedIn
                            </a>
                        )}
                        {links_sociales?.github && (
                            <a href={links_sociales.github} target="_blank" rel="noopener noreferrer" style={linkItem}>
                                <Github size={16} color={colores.primario} />GitHub
                            </a>
                        )}
                        {links_sociales?.twitter && (
                            <a href={links_sociales.twitter} target="_blank" rel="noopener noreferrer" style={linkItem}>
                                <Twitter size={16} color={colores.primario} />Twitter
                            </a>
                        )}
                        {links_sociales?.website && (
                            <a href={links_sociales.website} target="_blank" rel="noopener noreferrer" style={linkItem}>
                                <Globe size={16} color={colores.primario} />Website
                            </a>
                        )}
                        {(cv.ciudad || persona.ciudad) && (
                            <div style={linkItem}>
                                <MapPin size={16} color={colores.primario} />
                                {[cv.ciudad || persona.ciudad, cv.pais || persona.pais].filter(Boolean).join(', ')}
                            </div>
                        )}
                    </div>
                </div>
                {/* Form */}
                <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', color: colores.primario }}>Envíame un mensaje</p>
                    {sent ? (
                        <div style={{ padding: '1.25rem', borderRadius: 10, background: `${colores.primario}10`, border: `1px solid ${colores.primario}25`, textAlign: 'center' }}>
                            <p style={{ fontSize: '0.92rem', fontWeight: 600, color: colores.primario }}>¡Mensaje preparado!</p>
                            <p style={{ fontSize: '0.8rem', opacity: 0.65, marginTop: '0.3rem' }}>Se abrió tu cliente de correo con el mensaje listo para enviar.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <input style={inputStyle} placeholder="Tu nombre" value={form.nombre} required
                                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                            <input style={inputStyle} type="email" placeholder="Tu email" value={form.email} required
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 110 }} placeholder="Tu mensaje..." value={form.mensaje} required
                                onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))} />
                            <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: 8, background: colores.primario, color: '#fff', border: 'none', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                <Send size={14} />Enviar mensaje
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}

export function MinimalistaTemplate({ persona, cv, config, contenido, experiencias, educaciones, habilidades, idiomas, certificaciones }: TemplateProps) {
    const { colores, fuente, secciones, orden_secciones, tipo_fondo_hero = 'color', gradiente_hero, hero_overlay_opacidad = 0.45, mostrar_navegacion = true, altura_hero = 'media' } = config;
    const { titulo_hero, bio_extendida, frase_motivacional, proyectos_custom, links_sociales, disponible_para_trabajo, imagen_perfil_url, imagen_fondo_hero_url, nombre_nav } = contenido;

    const fontFamily = fuente === 'playfair' ? "'Playfair Display', Georgia, 'Times New Roman', serif"
        : fuente === 'poppins' ? "'Poppins', 'Segoe UI', system-ui, sans-serif"
        : fuente === 'roboto' ? "'Roboto', system-ui, Arial, sans-serif"
        : "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

    const navBrand = nombre_nav?.trim() || '';
    const visibleSecs = orden_secciones.filter(s => secciones[s as keyof typeof secciones]);

    let heroBg: string;
    if (tipo_fondo_hero === 'imagen' && imagen_fondo_hero_url) {
        heroBg = `url(${imagen_fondo_hero_url}) center/cover no-repeat`;
    } else if (tipo_fondo_hero === 'gradiente' && gradiente_hero) {
        heroBg = gradiente_hero;
    } else {
        heroBg = `linear-gradient(135deg, ${colores.primario}18 0%, ${colores.fondo} 60%)`;
    }

    const heroMinH = altura_hero === 'pantalla' ? '100vh' : altura_hero === 'compacta' ? '280px' : '480px';
    const heroTextColor = (tipo_fondo_hero === 'imagen' || tipo_fondo_hero === 'gradiente') ? '#fff' : colores.texto;
    const heroSubColor = (tipo_fondo_hero === 'imagen' || tipo_fondo_hero === 'gradiente') ? 'rgba(255,255,255,0.78)' : colores.acento;

    const skillGroups = habilidades.reduce<Record<string, typeof habilidades>>((acc, h) => {
        (acc[h.categoria] ??= []).push(h); return acc;
    }, {});

    const sortedExp = [...experiencias].sort((a, b) => {
        const ae = a.es_trabajo_actual ? '9999' : (a.fecha_fin ?? '');
        const be = b.es_trabajo_actual ? '9999' : (b.fecha_fin ?? '');
        return be.localeCompare(ae);
    });

    const divStyle: React.CSSProperties = { padding: '3.5rem 0', borderBottom: `1px solid ${colores.texto}10` };
    const h2Style: React.CSSProperties = { fontSize: '1.35rem', fontWeight: 700, color: colores.primario, marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' };
    const line = <span style={{ display: 'block', flex: 1, height: 2, background: `${colores.primario}20`, borderRadius: 2 }} />;

    return (
        <div style={{ fontFamily, color: colores.texto, background: colores.fondo, minHeight: '100%', scrollBehavior: 'smooth' }}>

            {/* NAV */}
            {mostrar_navegacion !== false && (
                <nav style={{ background: colores.fondo, borderBottom: `1px solid ${colores.texto}10`, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>
                        {navBrand && <span style={{ fontWeight: 800, fontSize: '1rem', color: colores.primario, letterSpacing: '-0.01em' }}>{navBrand}</span>}
                        <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
                            {visibleSecs.map(s => (
                                <a key={s} href={`#${s}`} style={{ fontSize: '0.8rem', color: colores.texto, textDecoration: 'none', opacity: 0.65, fontWeight: 500 }}>
                                    {SEC_LABEL[s]}
                                </a>
                            ))}
                        </div>
                    </div>
                </nav>
            )}

            {/* HERO */}
            <section style={{ background: heroBg, minHeight: heroMinH, position: 'relative', display: 'flex', alignItems: 'center' }}>
                {(tipo_fondo_hero === 'imagen' || tipo_fondo_hero === 'gradiente') && (
                    <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${tipo_fondo_hero === 'imagen' ? hero_overlay_opacidad : 0.08})` }} />
                )}
                <div style={{ maxWidth: 960, margin: '0 auto', padding: '4rem 2rem', display: 'flex', alignItems: 'center', gap: '3.5rem', position: 'relative', zIndex: 1, width: '100%' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {titulo_hero && (
                            <p style={{ color: tipo_fondo_hero !== 'color' ? colores.acento : colores.primario, fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.9rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                {titulo_hero}
                            </p>
                        )}
                        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '0.6rem', color: heroTextColor, letterSpacing: '-0.02em' }}>
                            {persona.nombre}{' '}
                            <span style={{ color: tipo_fondo_hero !== 'color' ? colores.acento : colores.primario }}>{persona.apellido}</span>
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: heroSubColor, marginBottom: '0.75rem', fontWeight: 500 }}>
                            {cv.titulo_profesional}
                        </p>
                        {frase_motivacional && (
                            <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: heroSubColor, opacity: 0.85, marginBottom: '1.75rem', maxWidth: 480 }}>
                                "{frase_motivacional}"
                            </p>
                        )}
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {links_sociales?.linkedin && (
                                <a href={links_sociales.linkedin} target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', borderRadius: 8, background: colores.primario, color: '#fff', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700 }}>
                                    <Linkedin size={14} /> LinkedIn
                                </a>
                            )}
                            {links_sociales?.github && (
                                <a href={links_sociales.github} target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', borderRadius: 8, border: `1.5px solid ${tipo_fondo_hero !== 'color' ? 'rgba(255,255,255,0.5)' : colores.primario}`, color: tipo_fondo_hero !== 'color' ? '#fff' : colores.primario, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, background: 'transparent' }}>
                                    <Github size={14} /> GitHub
                                </a>
                            )}
                            {links_sociales?.twitter && (
                                <a href={links_sociales.twitter} target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', borderRadius: 8, border: `1.5px solid ${tipo_fondo_hero !== 'color' ? 'rgba(255,255,255,0.5)' : colores.primario}`, color: tipo_fondo_hero !== 'color' ? '#fff' : colores.primario, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, background: 'transparent' }}>
                                    <Twitter size={14} /> Twitter
                                </a>
                            )}
                            {links_sociales?.website && (
                                <a href={links_sociales.website} target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', borderRadius: 8, border: `1.5px solid ${tipo_fondo_hero !== 'color' ? 'rgba(255,255,255,0.5)' : colores.primario}`, color: tipo_fondo_hero !== 'color' ? '#fff' : colores.primario, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, background: 'transparent' }}>
                                    <Globe size={14} /> Website
                                </a>
                            )}
                        </div>
                    </div>
                    {imagen_perfil_url ? (
                        <img src={imagen_perfil_url} alt={`${persona.nombre} ${persona.apellido}`}
                            style={{ width: 170, height: 170, borderRadius: '50%', objectFit: 'cover', border: `4px solid ${colores.primario}`, flexShrink: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }} />
                    ) : (
                        <div style={{ width: 170, height: 170, borderRadius: '50%', background: `linear-gradient(135deg, ${colores.primario}, ${colores.secundario})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '3rem', fontWeight: 800, color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                            {persona.nombre[0]}{persona.apellido[0]}
                        </div>
                    )}
                </div>
            </section>

            {/* SECTIONS */}
            <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 2rem' }}>
                {visibleSecs.map(key => {
                    if (key === 'resumen' && (bio_extendida || cv.resumen_profesional)) {
                        return (
                            <section key={key} id={key} style={divStyle}>
                                <h2 style={h2Style}>Sobre mí {line}</h2>
                                <p style={{ lineHeight: 1.85, opacity: 0.82, fontSize: '1rem', maxWidth: 720 }}>
                                    {bio_extendida || cv.resumen_profesional}
                                </p>
                                <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                                    {(cv.ciudad || persona.ciudad) && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', opacity: 0.65 }}>
                                            <MapPin size={14} color={colores.primario} />
                                            {[cv.ciudad || persona.ciudad, cv.pais || persona.pais].filter(Boolean).join(', ')}
                                        </span>
                                    )}
                                    {cv.anios_experiencia != null && (
                                        <span style={{ fontSize: '0.85rem', opacity: 0.65 }}>{cv.anios_experiencia}+ años de experiencia</span>
                                    )}
                                    {cv.sector_profesional && (
                                        <span style={{ fontSize: '0.85rem', opacity: 0.65 }}>{cv.sector_profesional}</span>
                                    )}
                                </div>
                            </section>
                        );
                    }

                    if (key === 'experiencia' && sortedExp.length > 0) {
                        return (
                            <section key={key} id={key} style={divStyle}>
                                <h2 style={h2Style}>Experiencia {line}</h2>
                                <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                                    <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: `${colores.primario}25`, borderRadius: 2 }} />
                                    {sortedExp.map((exp, i) => (
                                        <div key={i} style={{ position: 'relative', marginBottom: '2.25rem' }}>
                                            <div style={{ position: 'absolute', left: '-1.65rem', top: 7, width: 13, height: 13, borderRadius: '50%', background: colores.primario, border: `2.5px solid ${colores.fondo}`, boxShadow: `0 0 0 2px ${colores.primario}30` }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                                                <div>
                                                    <p style={{ fontWeight: 700, fontSize: '1rem' }}>{exp.empresa}</p>
                                                    <p style={{ color: colores.primario, fontSize: '0.9rem', fontWeight: 600, marginTop: '0.15rem' }}>{exp.cargo}</p>
                                                </div>
                                                <span style={{ fontSize: '0.78rem', opacity: 0.55, whiteSpace: 'nowrap', fontWeight: 500 }}>
                                                    {fmtDate(exp.fecha_inicio)} — {exp.es_trabajo_actual ? 'Presente' : fmtDate(exp.fecha_fin)}
                                                </span>
                                            </div>
                                            {exp.descripcion && (
                                                <p style={{ fontSize: '0.88rem', lineHeight: 1.7, opacity: 0.72, marginTop: '0.4rem' }}>{exp.descripcion}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    }

                    if (key === 'educacion' && educaciones.length > 0) {
                        return (
                            <section key={key} id={key} style={divStyle}>
                                <h2 style={h2Style}>Educación {line}</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                    {educaciones.map((edu, i) => (
                                        <div key={i} style={{ border: `1px solid ${colores.primario}20`, borderRadius: 12, padding: '1.25rem 1.4rem', background: `${colores.primario}05`, borderLeft: `3px solid ${colores.primario}` }}>
                                            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{edu.titulo}</p>
                                            <p style={{ color: colores.primario, fontSize: '0.85rem', fontWeight: 600, marginTop: '0.2rem' }}>{edu.institucion}</p>
                                            <p style={{ fontSize: '0.78rem', opacity: 0.6, marginTop: '0.25rem' }}>
                                                {edu.nivel} · {fmtDate(edu.fecha_inicio)} — {edu.en_curso ? 'En curso' : fmtDate(edu.fecha_fin)}
                                            </p>
                                            {edu.descripcion && <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem', lineHeight: 1.6 }}>{edu.descripcion}</p>}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    }

                    if (key === 'habilidades' && habilidades.length > 0) {
                        return (
                            <section key={key} id={key} style={divStyle}>
                                <h2 style={h2Style}>Habilidades {line}</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
                                    {Object.entries(skillGroups).map(([cat, skills]) => (
                                        <div key={cat}>
                                            <p style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: colores.primario, marginBottom: '0.85rem' }}>{cat}</p>
                                            {skills.map((s, i) => (
                                                <div key={i} style={{ marginBottom: '0.65rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                                        <span style={{ fontWeight: 500 }}>{s.nombre}</span>
                                                        <span style={{ opacity: 0.55, fontSize: '0.75rem' }}>{s.nivel}</span>
                                                    </div>
                                                    <div style={{ height: 5, background: `${colores.primario}18`, borderRadius: 3 }}>
                                                        <div style={{ height: '100%', width: `${NIVEL_PCT[s.nivel] ?? 50}%`, background: `linear-gradient(to right, ${colores.primario}, ${colores.acento})`, borderRadius: 3 }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    }

                    if (key === 'idiomas' && idiomas.length > 0) {
                        return (
                            <section key={key} id={key} style={divStyle}>
                                <h2 style={h2Style}>Idiomas {line}</h2>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {idiomas.map((id, i) => (
                                        <div key={i} style={{ border: `1px solid ${colores.primario}30`, borderRadius: 10, padding: '0.85rem 1.4rem', textAlign: 'center' }}>
                                            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{id.nombre}</p>
                                            <p style={{ fontSize: '0.78rem', color: colores.primario, fontWeight: 600, marginTop: '0.2rem' }}>{id.nivel}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    }

                    if (key === 'certificaciones' && certificaciones.length > 0) {
                        return (
                            <section key={key} id={key} style={divStyle}>
                                <h2 style={h2Style}>Certificaciones {line}</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                                    {certificaciones.map((c, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.9rem 1rem', border: `1px solid ${colores.primario}15`, borderRadius: 10 }}>
                                            <CheckCircle size={16} color={colores.primario} style={{ flexShrink: 0, marginTop: 2 }} />
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.nombre}</p>
                                                {c.emisor && <p style={{ fontSize: '0.78rem', opacity: 0.65, marginTop: '0.15rem' }}>{c.emisor}</p>}
                                                {c.fecha && <p style={{ fontSize: '0.73rem', opacity: 0.55, marginTop: '0.1rem' }}>{fmtDate(c.fecha)}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    }

                    if (key === 'proyectos_custom' && proyectos_custom.length > 0) {
                        return (
                            <section key={key} id={key} style={divStyle}>
                                <h2 style={h2Style}>Proyectos {line}</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
                                    {proyectos_custom.map((p, i) => (
                                        <div key={i} style={{ border: `1px solid ${colores.primario}18`, borderRadius: 14, overflow: 'hidden', background: colores.fondo, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                            {p.imagen_url ? (
                                                <img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ height: 110, background: `linear-gradient(135deg, ${colores.primario}20, ${colores.secundario}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Globe size={30} color={`${colores.primario}60`} />
                                                </div>
                                            )}
                                            <div style={{ padding: '1.1rem 1.25rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                                    <p style={{ fontWeight: 700, fontSize: '1rem' }}>{p.nombre}</p>
                                                    {p.url && (
                                                        <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: colores.primario, display: 'flex' }}>
                                                            <ExternalLink size={14} />
                                                        </a>
                                                    )}
                                                </div>
                                                {p.descripcion && <p style={{ fontSize: '0.84rem', opacity: 0.72, lineHeight: 1.65 }}>{p.descripcion}</p>}
                                                {p.tecnologias.length > 0 && (
                                                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                                                        {p.tecnologias.map((t, ti) => (
                                                            <span key={ti} style={{ padding: '2px 9px', background: `${colores.primario}14`, color: colores.primario, borderRadius: 20, fontSize: '0.73rem', fontWeight: 600 }}>
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    }

                    if (key === 'contacto') {
                        return (
                            <ContactSection key={key} cv={cv} persona={persona} links_sociales={links_sociales} email_contacto={contenido.email_contacto} colores={colores} divStyle={divStyle} h2Style={h2Style} line={line} />
                        );
                    }

                    return null;
                })}
            </div>

            <footer style={{ textAlign: 'center', padding: '2rem', fontSize: '0.78rem', opacity: 0.4, borderTop: `1px solid ${colores.texto}10`, marginTop: '1rem' }}>
                {persona.nombre} {persona.apellido} · Portafolio profesional
            </footer>
        </div>
    );
}
