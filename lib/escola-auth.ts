export type EscolaRole = 'familia' | 'professora' | 'aluno';

/**
 * Credenciais do módulo Escola. Mesmo padrão dos módulos /nutri e /app/psico:
 * senha fixa no código, apenas para separar quem entra — não é autenticação real.
 * Para trocar uma senha, edite aqui e faça o deploy.
 */
export const ESCOLA_CREDENTIALS: Record<string, { password: string; role: EscolaRole; name: string }> = {
    familia: { password: 'Familia2026', role: 'familia', name: 'Família' },
    andrea: { password: 'Andrea2026', role: 'professora', name: 'Profª Andréa' },
    henrique: { password: 'Judo2026', role: 'aluno', name: 'Henrique' },
};

export const ROLE_LABEL: Record<EscolaRole, string> = {
    familia: 'Família',
    professora: 'Professora',
    aluno: 'Aluno',
};

export const getEscolaRole = (): EscolaRole | null => {
    const role = localStorage.getItem('escola_role');
    return role === 'familia' || role === 'professora' || role === 'aluno' ? role : null;
};

export const getEscolaName = (): string => localStorage.getItem('escola_name') || '';

export const isEscolaAuth = (): boolean =>
    localStorage.getItem('escola_auth') === 'true' && getEscolaRole() !== null;

export const escolaLogin = (login: string, password: string): boolean => {
    const entry = ESCOLA_CREDENTIALS[login.trim().toLowerCase()];
    if (!entry || entry.password !== password) return false;
    localStorage.setItem('escola_auth', 'true');
    localStorage.setItem('escola_role', entry.role);
    localStorage.setItem('escola_name', entry.name);
    return true;
};

export const escolaLogout = (): void => {
    localStorage.removeItem('escola_auth');
    localStorage.removeItem('escola_role');
    localStorage.removeItem('escola_name');
};

/** Quem pode registrar aula, nota, prova e tarefa. */
export const canWrite = (role: EscolaRole | null): boolean => role === 'familia' || role === 'professora';

/** A anamnese é preenchida pela família; a professora lê. O aluno não acessa. */
export const canEditAnamnese = (role: EscolaRole | null): boolean => role === 'familia';
export const canViewAnamnese = (role: EscolaRole | null): boolean => role === 'familia' || role === 'professora';

/** O diário de aula guarda observações da professora — fica fora da visão do aluno. */
export const canViewLessons = (role: EscolaRole | null): boolean => role === 'familia' || role === 'professora';
