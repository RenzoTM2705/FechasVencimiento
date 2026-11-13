import { useId, useState, type FormEvent } from 'react';
import { CircleAlert, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/logo';
import { Input } from '@/components/ui/input';
import { toFriendlyMessage } from '@/lib/errors';
import { validateLogin, type LoginErrors } from '@/lib/validation';
import { signIn } from './auth-store';

export function LoginPage() {
    const formId = useId();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<LoginErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const found = validateLogin({ email, password });
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSubmitting(true);
        setFormError(null);
        try {
            await signIn(email.trim(), password);
        } catch (cause) {
            setFormError(toFriendlyMessage(cause));
            setSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-dvh flex-col bg-canvas">
            <main className="flex flex-1 items-center justify-center px-4 py-10">
                <div className="w-full max-w-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <Logo className="h-11 w-11" />
                        <div>
                            <p className="text-[15px] leading-tight font-semibold text-ink">
                                Control de Vencimientos
                            </p>
                            <p className="text-[13px] text-ink-muted">Tienda principal</p>
                        </div>
                    </div>

                    <div className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
                        <h1 className="text-[20px] leading-snug font-semibold text-ink">
                            Inicia sesión
                        </h1>
                        <p className="mt-1 text-sm text-ink-soft">
                            Acceso reservado al personal de la tienda.
                        </p>

                        <form onSubmit={handleSubmit} noValidate className="mt-5">
                            {formError ? (
                                <p
                                    role="alert"
                                    className="mb-4 flex items-center gap-2 rounded-control border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger"
                                >
                                    <CircleAlert size={16} aria-hidden="true" />
                                    {formError}
                                </p>
                            ) : null}

                            <div className="space-y-4">
                                <Input
                                    id={`${formId}-email`}
                                    label="Correo"
                                    type="email"
                                    inputMode="email"
                                    autoComplete="username"
                                    placeholder="tu-correo@ejemplo.com"
                                    value={email}
                                    error={errors.email}
                                    onChange={(event) => setEmail(event.target.value)}
                                />
                                <Input
                                    id={`${formId}-password`}
                                    label="Contraseña"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    error={errors.password}
                                    onChange={(event) => setPassword(event.target.value)}
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                disabled={submitting}
                                className="mt-5 w-full"
                            >
                                <LogIn size={16} aria-hidden="true" />
                                {submitting ? 'Entrando…' : 'Entrar'}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>

            <footer className="border-t border-line py-4 text-center text-[13px] text-ink-muted">
                © {new Date().getFullYear()} Control de Vencimientos
            </footer>
        </div>
    );
}
