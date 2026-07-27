import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { escolaApi, EscolaAnamnese as Anamnese } from '../../lib/api-escola';
import { canEditAnamnese, canViewAnamnese, getEscolaRole } from '../../lib/escola-auth';

type FieldType = 'text' | 'date' | 'long';

const SECTIONS: { title: string; icon: string; fields: { key: keyof Anamnese; label: string; type: FieldType }[] }[] = [
    {
        title: 'Identificação',
        icon: 'badge',
        fields: [
            { key: 'child_name', label: 'Nome da criança', type: 'text' },
            { key: 'birth_date', label: 'Data de nascimento', type: 'date' },
            { key: 'birthplace', label: 'Naturalidade', type: 'text' },
            { key: 'guardians', label: 'Nome dos responsáveis', type: 'text' },
            { key: 'guardians_phones', label: 'Telefones dos responsáveis', type: 'text' },
            { key: 'address', label: 'Endereço', type: 'text' },
            { key: 'grade', label: 'Série', type: 'text' },
            { key: 'school', label: 'Escola onde estuda', type: 'text' },
        ],
    },
    {
        title: 'Saúde e cuidados',
        icon: 'health_and_safety',
        fields: [
            { key: 'sports', label: 'Pratica atividades esportivas? Quais', type: 'long' },
            { key: 'allergies', label: 'Possui alguma alergia? Especificar', type: 'long' },
            { key: 'specialists', label: 'Faz acompanhamento com algum especialista? Quais', type: 'long' },
            { key: 'medications', label: 'Faz uso de algum medicamento? Quais', type: 'long' },
            { key: 'food_restrictions', label: 'Possui restrições alimentares? Quais', type: 'long' },
        ],
    },
    {
        title: 'Sobre a criança',
        icon: 'favorite',
        fields: [
            { key: 'routine', label: 'A rotina da criança', type: 'long' },
            { key: 'school_history', label: 'Trajetória escolar até o momento', type: 'long' },
            { key: 'favorite_activities', label: 'O que mais gosta de fazer', type: 'long' },
            { key: 'socioemotional', label: 'Aspectos socioemocionais — humor, o que deixa triste, feliz, irritada', type: 'long' },
        ],
    },
    {
        title: 'Expectativas e atendimentos',
        icon: 'target',
        fields: [
            { key: 'expectations', label: 'O que você espera dos atendimentos? Pontos de investimento e disciplinas com maior foco', type: 'long' },
            { key: 'class_days', label: 'Dia(s) em que os atendimentos/aulas serão ministradas', type: 'long' },
            { key: 'other_notes', label: 'Outros aspectos importantes não abordados na ficha', type: 'long' },
            { key: 'signed_by', label: 'Responsável pelo preenchimento', type: 'text' },
        ],
    },
];

export default function EscolaAnamnesePage() {
    const role = getEscolaRole();
    const editable = canEditAnamnese(role);

    const [data, setData] = useState<Anamnese | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        escolaApi.getAnamnese().then(d => { setData(d); setLoading(false); });
    }, []);

    if (!canViewAnamnese(role)) return <Navigate to="/escola" replace />;

    const setField = (key: keyof Anamnese, value: string) => {
        setData(prev => prev ? { ...prev, [key]: value } : prev);
        setSaved(false);
    };

    const handleSave = async () => {
        if (!data) return;
        setSaving(true);
        const { id, updated_at, ...patch } = data;
        const ok = await escolaApi.saveAnamnese(id, patch);
        setSaving(false);
        if (ok) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        }
    };

    if (loading) {
        return <div className="py-24 text-center" style={{ color: 'var(--fg-soft)' }}>
            <span className="material-symbols-outlined text-[32px] animate-spin">progress_activity</span>
        </div>;
    }

    if (!data) {
        return <div className="escola-card-soft p-6 text-center">
            <p className="font-bold">Ficha não encontrada.</p>
        </div>;
    }

    return (
        <div className="escola-enter space-y-5">
            <div>
                <h1 className="text-[26px] font-semibold leading-tight">Ficha de <span className="escola-mark">acompanhamento</span></h1>
                <p className="text-[13px] mt-1" style={{ color: 'var(--fg-soft)' }}>
                    {editable
                        ? 'Preencha com calma — é o que orienta o trabalho da professora.'
                        : 'Preenchida pela família. Somente leitura.'}
                </p>
            </div>

            {/* Recado de abertura da ficha original */}
            <div className="escola-card p-5" style={{ borderLeft: '3px solid var(--accent)' }}>
                <p className="escola-serif italic text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,.75)' }}>
                    “Querida família, estamos prestes a iniciar nossa parceria em prol do bem-estar e melhor
                    desenvolvimento acadêmico do seu bem mais precioso. É importante que eu conheça um pouco
                    mais sobre ele para trabalhar de forma mais assertiva. Desde já, agradeço imensamente a
                    confiança e parceria. Conte sempre comigo.”
                </p>
                <p className="text-right text-[13px] font-semibold mt-2">— Profª Andréa</p>
            </div>

            {SECTIONS.map(section => (
                <section key={section.title} className="escola-card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(198,242,78,.12)', color: 'var(--accent)' }}>
                            <span className="material-symbols-outlined text-[18px]">{section.icon}</span>
                        </span>
                        <h2 className="text-[16px] font-semibold">{section.title}</h2>
                    </div>

                    <div className="space-y-4">
                        {section.fields.map(field => {
                            const value = (data[field.key] as string) || '';
                            return (
                                <div key={field.key}>
                                    <label className="escola-label block mb-1.5">{field.label}</label>
                                    {!editable ? (
                                        <p className="text-[14px] leading-snug p-3 rounded-xl"
                                            style={{ background: 'var(--surface-2)', color: value ? 'var(--fg)' : 'var(--fg-soft)' }}>
                                            {value || 'Não informado'}
                                        </p>
                                    ) : field.type === 'long' ? (
                                        <textarea className="escola-input" rows={3} value={value}
                                            onChange={e => setField(field.key, e.target.value)} />
                                    ) : (
                                        <input type={field.type === 'date' ? 'date' : 'text'} className="escola-input" value={value}
                                            onChange={e => setField(field.key, e.target.value)} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}

            {editable && (
                <div className="sticky bottom-24 z-30">
                    <button onClick={handleSave} disabled={saving} className="escola-btn w-full py-3.5 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">
                            {saved ? 'check_circle' : 'save'}
                        </span>
                        {saving ? 'Salvando...' : saved ? 'Ficha salva!' : 'Salvar ficha'}
                    </button>
                </div>
            )}

            <p className="text-[12px] text-center" style={{ color: 'var(--fg-soft)' }}>
                Última atualização: {new Date(data.updated_at).toLocaleString('pt-BR')}
            </p>
        </div>
    );
}
