import { useState } from 'react';
import { Github, Linkedin, Twitter, Globe, ExternalLink, MapPin, Phone, CheckCircle, Mail, Send } from 'lucide-react';
import type { TemplateProps } from '../types/PortfolioTypes';
import type { CVPublico, PersonaPublica, LinksSociales, ColoresPortfolio } from '../types/PortfolioTypes';

interface CreativoContactProps {
    cv: CVPublico;
    persona: PersonaPublica;
    links_sociales: LinksSociales;
    email_contacto?: string;
    colores: ColoresPortfolio;
    heroBg: string;
    tipo_fondo_hero: string;
    imagen_fondo_hero_url?: string;
    hero_overlay_opacidad: number;
}

function CreativoContactSection({ cv, persona, links_sociales, email_contacto, colores, heroBg, tipo_fondo_hero, imagen_fondo_hero_url, hero_overlay_opacidad }: CreativoContactProps) {
    const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dest = email_contacto || cv.linkedin_url || '';
        if (dest) {
            const subject = encodeURIComponent(`Contacto desde portfolio — ${form.nombre}`);
            const body = encodeURIComponent(`Hola ${persona.nombre},\n\nMi nombre es ${form.nombre} (${form.email}).\n\n${form.mensaje}\n\nSaludos`);
            window.open(`mailto:${dest}?subject=${subject}&body=${body}`, '_blank');
        }
        setSent(true);
        setTimeout(() => { setSent(false); setForm({ nombre: '', email: '', mensaje: '' }); }, 3500);
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10,
        background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)',
        color: '#fff', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box',
    };

    return (
        <section id="contacto" style={{ background: heroBg, padding: '5rem 0', position: 'relative', overflow: 'hidden' }}>
            {tipo_fondo_hero === 'imagen' && imagen_fondo_hero_url && (
                <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${hero_overlay_opacidad})` }} />
            )}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>¿Hablamos?</p>
                <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#fff', marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>Contacto</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
                    {/* Info column */}
                    <div>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.75, marginBottom: '2rem' }}>
                            ¿Tienes un proyecto en mente? Cuéntame, estaré encantado de leerlo.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {(email_contacto || cv.linkedin_url) && (
                                <a href={`mailto:${email_contacto || cv.linkedin_url}`}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                                    <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Mail size={16} color="#fff" />
                                    </span>
                                    {email_contacto || 'Enviar email'}
                                </a>
                            )}
                            {cv.telefono && (
                                <a href={`tel:${cv.telefono}`}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                                    <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Phone size={16} color="#fff" />
                                    </span>
                                    {cv.telefono}
                                </a>
                            )}
                            {(cv.ciudad || persona.ciudad) && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                    <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <MapPin size={16} color="rgba(255,255,255,0.7)" />
                                    </span>
                                    {[cv.ciudad || persona.ciudad, cv.pais || persona.pais].filter(Boolean).join(', ')}
                                </div>
                            )}
                        </div>
                        {/* Social links */}
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '2rem' }}>
                            {links_sociales?.linkedin && (
                                <a href={links_sociales.linkedin} target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1rem', borderRadius: 50, background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, border: '1.5px solid rgba(255,255,255,0.25)' }}>
                                    <Linkedin size={13} /> LinkedIn
                                </a>
                            )}
                            {links_sociales?.github && (
                                <a href={links_sociales.github} target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1rem', borderRadius: 50, background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, border: '1.5px solid rgba(255,255,255,0.25)' }}>
                                    <Github size={13} /> GitHub
                                </a>
                            )}
                            {links_sociales?.twitter && (
                                <a href={links_sociales.twitter} target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1rem', borderRadius: 50, background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, border: '1.5px solid rgba(255,255,255,0.25)' }}>
                                    <Twitter size={13} /> Twitter
                                </a>
                            )}
                            {links_sociales?.website && (
                                <a href={links_sociales.website} target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1rem', borderRadius: 50, background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, border: '1.5px solid rgba(255,255,255,0.25)' }}>
                                    <Globe size={13} /> Website
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Form column */}
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '2rem', border: '1.5px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)' }}>
                        {sent ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✓</div>
                                <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>¡Mensaje enviado!</p>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '0.35rem' }}>Se abrió tu cliente de correo con el mensaje listo.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nombre</label>
                                    <input style={inputStyle} placeholder="Tu nombre" value={form.nombre}
                                        onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
                                    <input style={inputStyle} type="email" placeholder="tu@email.com" value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mensaje</label>
                                    <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 110 }} placeholder="Cuéntame sobre tu proyecto..." value={form.mensaje}
                                        onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))} required />
                                </div>
                                <button type="submit"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', borderRadius: 12, background: '#fff', color: colores.primario, border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.25rem' }}>
                                    <Send size={15} /> Enviar mensaje
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

function fmtDate(d?: string) {
    if (!d) return '';
    const [y, m] = d.split('-');
    if (!m) return y;
    const M = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${M[+m - 1]} ${y}`;
}

const SEC_LABEL: Record<string, string> = {
    resumen: 'Sobre mí', experiencia: 'Experiencia', educacion: 'Educación',
    habilidades: 'Habilidades', idiomas: 'Idiomas', certificaciones: 'Certificaciones',
    proyectos_custom: 'Proyectos', contacto: 'Contacto',
};

const NIVEL_PCT: Record<string, number> = { Básico: 25, Intermedio: 50, Avanzado: 75, Experto: 100 };

export const CreativoTemplate = ({ persona, cv, config, contenido, experiencias, educaciones, habilidades, idiomas, certificaciones }: TemplateProps) => {
    const { colores, fuente, secciones, orden_secciones, tipo_fondo_hero = 'gradiente', gradiente_hero, hero_overlay_opacidad = 0.5, mostrar_navegacion = true, altura_hero = 'pantalla' } = config;
    const { titulo_hero, bio_extendida, frase_motivacional, proyectos_custom, links_sociales, imagen_perfil_url, imagen_fondo_hero_url, nombre_nav } = contenido;

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
    } else if (tipo_fondo_hero === 'color') {
        heroBg = colores.primario;
    } else {
        heroBg = `linear-gradient(135deg, ${colores.primario} 0%, ${colores.secundario} 50%, ${colores.acento} 100%)`;
    }

    const heroMinH = altura_hero === 'pantalla' ? '100vh' : altura_hero === 'compacta' ? '320px' : '560px';

    const sortedExp = [...experiencias].sort((a, b) => {
        const ae = a.es_trabajo_actual ? '9999' : (a.fecha_fin ?? '');
        const be = b.es_trabajo_actual ? '9999' : (b.fecha_fin ?? '');
        return be.localeCompare(ae);
    });

    const skillGroups = habilidades.reduce<Record<string, typeof habilidades>>((acc, h) => {
        (acc[h.categoria] ??= []).push(h); return acc;
    }, {});

    const secBg = (i: number) => i % 2 === 0 ? colores.fondo : `${colores.primario}04`;

    return (
        <div style={{ fontFamily, color: colores.texto, background: colores.fondo, minHeight: '100%', scrollBehavior: 'smooth' }}>

            {/* NAV — transparent over hero */}
            {mostrar_navegacion !== false && (
                <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 2rem' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62 }}>
                        {navBrand && <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#fff', letterSpacing: '-0.02em' }}>{navBrand}</span>}
                        <div style={{ display: 'flex', gap: '1.75rem' }}>
                            {visibleSecs.map(s => (
                                <a key={s} href={`#${s}`} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.02em' }}>
                                    {SEC_LABEL[s]}
                                </a>
                            ))}
                        </div>
                    </div>
                </nav>
            )}

            {/* HERO — Full viewport, bold */}
            <section style={{ background: heroBg, minHeight: heroMinH, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {tipo_fondo_hero === 'imagen' && imagen_fondo_hero_url && (
                    <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${hero_overlay_opacidad})` }} />
                )}
                {/* Decorative elements */}
                <div style={{ position: 'absolute', top: '10%', left: '5%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '30%', right: '20%', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '6rem 2rem 4rem', maxWidth: 800, margin: '0 auto' }}>
                    {/* Profile photo */}
                    {imagen_perfil_url ? (
                        <img src={imagen_perfil_url} alt={`${persona.nombre} ${persona.apellido}`}
                            style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.5)', margin: '0 auto 1.5rem', display: 'block', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }} />
                    ) : (
                        <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2.5rem', fontWeight: 800, color: '#fff', border: '3px solid rgba(255,255,255,0.3)' }}>
                            {persona.nombre[0]}{persona.apellido[0]}
                        </div>
                    )}

                    {titulo_hero && (
                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                            {titulo_hero}
                        </p>
                    )}

                    <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                        {persona.nombre}
                    </h1>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 900, color: 'rgba(255,255,255,0.5)', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
                        {persona.apellido}
                    </h1>

                    <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, marginBottom: frase_motivacional ? '0.75rem' : '2rem' }}>
                        {cv.titulo_profesional}
                    </p>

                    {frase_motivacional && (
                        <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
                            "{frase_motivacional}"
                        </p>
                    )}

                    {/* Social links */}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {links_sociales?.linkedin && (
                            <a href={links_sociales.linkedin} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: 50, background: '#fff', color: colores.primario, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                                <Linkedin size={14} /> LinkedIn
                            </a>
                        )}
                        {links_sociales?.github && (
                            <a href={links_sociales.github} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: 50, background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, border: '1.5px solid rgba(255,255,255,0.35)' }}>
                                <Github size={14} /> GitHub
                            </a>
                        )}
                        {links_sociales?.twitter && (
                            <a href={links_sociales.twitter} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: 50, background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, border: '1.5px solid rgba(255,255,255,0.35)' }}>
                                <Twitter size={14} /> Twitter
                            </a>
                        )}
                        {links_sociales?.website && (
                            <a href={links_sociales.website} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: 50, background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, border: '1.5px solid rgba(255,255,255,0.35)' }}>
                                <Globe size={14} /> Website
                            </a>
                        )}
                    </div>

                    {/* Scroll hint */}
                    <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', opacity: 0.4 }}>
                        <div style={{ width: 1, height: 40, background: '#fff' }} />
                    </div>
                </div>
            </section>

            {/* SECTIONS */}
            {visibleSecs.map((key, idx) => {
                const bg = secBg(idx);

                if (key === 'proyectos_custom' && proyectos_custom.length > 0) {
                    return (
                        <section key={key} id={key} style={{ background: bg, padding: '5rem 0' }}>
                            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: colores.acento, marginBottom: '0.5rem' }}>Mi trabajo</p>
                                <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: colores.texto, marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>
                                    Proyectos
                                </h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                    {proyectos_custom.map((p, i) => (
                                        <div key={i} style={{ borderRadius: 18, overflow: 'hidden', background: colores.fondo, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', border: `1px solid ${colores.texto}08` }}>
                                            {p.imagen_url ? (
                                                <img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ height: 160, background: `linear-gradient(135deg, ${colores.primario}, ${colores.secundario})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'rgba(255,255,255,0.4)' }}>
                                                    {p.nombre[0]}
                                                </div>
                                            )}
                                            <div style={{ padding: '1.4rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                    <p style={{ fontWeight: 800, fontSize: '1.05rem' }}>{p.nombre}</p>
                                                    {p.url && (
                                                        <a href={p.url} target="_blank" rel="noopener noreferrer"
                                                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '4px 10px', background: colores.primario, color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: '0.72rem', fontWeight: 700 }}>
                                                            <ExternalLink size={11} /> Ver
                                                        </a>
                                                    )}
                                                </div>
                                                {p.descripcion && <p style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.65 }}>{p.descripcion}</p>}
                                                {p.tecnologias.length > 0 && (
                                                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
                                                        {p.tecnologias.map((t, ti) => (
                                                            <span key={ti} style={{ padding: '3px 10px', background: `${colores.acento}18`, color: colores.acento, borderRadius: 20, fontSize: '0.73rem', fontWeight: 700 }}>{t}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    );
                }

                if (key === 'resumen' && (bio_extendida || cv.resumen_profesional)) {
                    return (
                        <section key={key} id={key} style={{ background: bg, padding: '5rem 0' }}>
                            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem', display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: 280 }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: colores.acento, marginBottom: '0.5rem' }}>Quién soy</p>
                                    <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: colores.texto, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>Sobre mí</h2>
                                    <p style={{ lineHeight: 1.85, opacity: 0.8, fontSize: '1rem' }}>{bio_extendida || cv.resumen_profesional}</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', minWidth: 220 }}>
                                    {cv.anios_experiencia != null && (
                                        <div style={{ textAlign: 'center', padding: '1.25rem', background: `${colores.primario}12`, borderRadius: 16 }}>
                                            <p style={{ fontSize: '2rem', fontWeight: 900, color: colores.primario }}>{cv.anios_experiencia}+</p>
                                            <p style={{ fontSize: '0.72rem', opacity: 0.65, marginTop: '0.25rem' }}>años exp.</p>
                                        </div>
                                    )}
                                    {cv.sector_profesional && (
                                        <div style={{ textAlign: 'center', padding: '1.25rem', background: `${colores.acento}12`, borderRadius: 16 }}>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: colores.acento }}>{cv.sector_profesional}</p>
                                            <p style={{ fontSize: '0.72rem', opacity: 0.65, marginTop: '0.25rem' }}>sector</p>
                                        </div>
                                    )}
                                    {(cv.ciudad || persona.ciudad) && (
                                        <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '0.85rem', background: `${colores.secundario}10`, borderRadius: 12 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', fontSize: '0.82rem', opacity: 0.7 }}>
                                                <MapPin size={13} color={colores.secundario} />
                                                {[cv.ciudad || persona.ciudad, cv.pais || persona.pais].filter(Boolean).join(', ')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    );
                }

                if (key === 'experiencia' && sortedExp.length > 0) {
                    return (
                        <section key={key} id={key} style={{ background: bg, padding: '5rem 0' }}>
                            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: colores.acento, marginBottom: '0.5rem' }}>Trayectoria</p>
                                <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: colores.texto, marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>Experiencia</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                                    {sortedExp.map((exp, i) => (
                                        <div key={i} style={{ padding: '1.5rem', borderRadius: 16, background: colores.fondo, border: `1px solid ${colores.primario}15`, borderTop: `3px solid ${colores.primario}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                                <p style={{ fontWeight: 800, fontSize: '0.97rem' }}>{exp.empresa}</p>
                                                <span style={{ fontSize: '0.7rem', color: colores.acento, fontWeight: 700, background: `${colores.acento}15`, padding: '2px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                                                    {exp.es_trabajo_actual ? 'Actual' : fmtDate(exp.fecha_fin)}
                                                </span>
                                            </div>
                                            <p style={{ color: colores.primario, fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.65rem' }}>{exp.cargo}</p>
                                            <p style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: exp.descripcion ? '0.65rem' : 0 }}>
                                                {fmtDate(exp.fecha_inicio)} — {exp.es_trabajo_actual ? 'Presente' : fmtDate(exp.fecha_fin)}
                                            </p>
                                            {exp.descripcion && <p style={{ fontSize: '0.84rem', opacity: 0.72, lineHeight: 1.65 }}>{exp.descripcion}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    );
                }

                if (key === 'habilidades' && habilidades.length > 0) {
                    return (
                        <section key={key} id={key} style={{ background: bg, padding: '5rem 0' }}>
                            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: colores.acento, marginBottom: '0.5rem' }}>Stack</p>
                                <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: colores.texto, marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>Habilidades</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                                    {Object.entries(skillGroups).map(([cat, skills]) => (
                                        <div key={cat} style={{ padding: '1.4rem', background: colores.fondo, borderRadius: 16, border: `1px solid ${colores.texto}08` }}>
                                            <p style={{ fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: colores.acento, marginBottom: '1rem' }}>{cat}</p>
                                            {skills.map((s, i) => (
                                                <div key={i} style={{ marginBottom: '0.65rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.25rem' }}>
                                                        <span style={{ fontWeight: 600 }}>{s.nombre}</span>
                                                        <span style={{ opacity: 0.5, fontSize: '0.73rem' }}>{NIVEL_PCT[s.nivel] ?? 50}%</span>
                                                    </div>
                                                    <div style={{ height: 4, background: `${colores.primario}15`, borderRadius: 2 }}>
                                                        <div style={{ height: '100%', width: `${NIVEL_PCT[s.nivel] ?? 50}%`, background: `linear-gradient(to right, ${colores.primario}, ${colores.acento})`, borderRadius: 2 }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {/* Language pills */}
                                {secciones.idiomas && idiomas.length > 0 && (
                                    <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        {idiomas.map((id, i) => (
                                            <span key={i} style={{ padding: '6px 16px', background: `${colores.secundario}18`, color: colores.secundario, borderRadius: 50, fontSize: '0.82rem', fontWeight: 700, border: `1px solid ${colores.secundario}30` }}>
                                                {id.nombre} · {id.nivel}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    );
                }

                if (key === 'educacion' && educaciones.length > 0) {
                    return (
                        <section key={key} id={key} style={{ background: bg, padding: '5rem 0' }}>
                            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: colores.acento, marginBottom: '0.5rem' }}>Formación</p>
                                <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: colores.texto, marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>Educación</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {educaciones.map((edu, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '1.5rem', padding: '1.25rem 1.5rem', background: colores.fondo, borderRadius: 14, border: `1px solid ${colores.texto}08`, alignItems: 'center' }}>
                                            <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${colores.primario}25, ${colores.acento}25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem', fontWeight: 900, color: colores.primario }}>
                                                {edu.institucion[0]}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>{edu.titulo}</p>
                                                <p style={{ color: colores.primario, fontSize: '0.85rem', fontWeight: 600 }}>{edu.institucion}</p>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <span style={{ fontSize: '0.72rem', color: colores.acento, fontWeight: 700, background: `${colores.acento}15`, padding: '2px 8px', borderRadius: 6 }}>
                                                    {edu.nivel}
                                                </span>
                                                <p style={{ fontSize: '0.73rem', opacity: 0.5, marginTop: '0.3rem' }}>
                                                    {fmtDate(edu.fecha_inicio)} — {edu.en_curso ? 'En curso' : fmtDate(edu.fecha_fin)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    );
                }

                if (key === 'certificaciones' && certificaciones.length > 0) {
                    return (
                        <section key={key} id={key} style={{ background: bg, padding: '5rem 0' }}>
                            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: colores.acento, marginBottom: '0.5rem' }}>Logros</p>
                                <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: colores.texto, marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>Certificaciones</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
                                    {certificaciones.map((c, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.1rem', background: colores.fondo, borderRadius: 12, border: `1px solid ${colores.primario}15` }}>
                                            <CheckCircle size={16} color={colores.primario} style={{ flexShrink: 0, marginTop: 2 }} />
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: '0.88rem' }}>{c.nombre}</p>
                                                {c.emisor && <p style={{ fontSize: '0.77rem', opacity: 0.6 }}>{c.emisor}</p>}
                                                {c.fecha && <p style={{ fontSize: '0.72rem', opacity: 0.5 }}>{fmtDate(c.fecha)}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    );
                }

                if (key === 'contacto') {
                    return (
                        <CreativoContactSection key={key}
                            cv={cv} persona={persona} links_sociales={links_sociales}
                            email_contacto={contenido.email_contacto}
                            colores={colores} heroBg={heroBg}
                            tipo_fondo_hero={tipo_fondo_hero}
                            imagen_fondo_hero_url={imagen_fondo_hero_url}
                            hero_overlay_opacidad={hero_overlay_opacidad}
                        />
                    );
                }

                return null;
            })}

            <footer style={{ background: '#0f0f14', padding: '1.5rem 2rem', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
                    {persona.nombre} {persona.apellido} · {cv.titulo_profesional}
                </p>
            </footer>
        </div>
    );
};
