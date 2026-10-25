import { useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';

export default function AuthPage({ initialMode = 'login', onAuthenticated }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isSignup = mode === 'signup';

  const submit = async event => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const response = await api.post(isSignup ? '/auth/register' : '/auth/login', isSignup ? { name, email, password } : { email, password });
      localStorage.setItem('pocket_token', response.data.token);
      localStorage.setItem('pocket_user', JSON.stringify(response.data.user));
      onAuthenticated(response.data);
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to connect. Check that the API and MongoDB are running.');
    } finally { setBusy(false); }
  };

  const changeMode = next => { setMode(next); setError(''); navigate(next === 'signup' ? '/sign-up' : '/sign-in'); };

  return <main className="auth-shell">
    <section className="auth-story">
      <div className="auth-brand"><span className="brand-mark"><Wallet size={19}/></span><span>pocket<span className="brand-dot">.</span></span></div>
      <div className="auth-story-copy"><span className="auth-kicker"><Sparkles size={14}/> A calmer way to manage money</span><h1>Make room for<br/><em>what matters.</em></h1><p>A clear picture of your money can make the next decision feel a little easier.</p>
        <div className="auth-points"><span><Check size={15}/> Your data stays yours</span><span><Check size={15}/> Simple, thoughtful spending tools</span></div>
      </div>
      <div className="auth-story-note"><ShieldCheck size={16}/><span>Your account and financial records are protected.</span></div>
      <div className="auth-orbit orbit-one"/><div className="auth-orbit orbit-two"/><div className="auth-orbit orbit-three"/>
    </section>
    <section className="auth-content"><div className="auth-card">
      <div className="auth-mobile-brand"><span className="brand-mark"><Wallet size={18}/></span><b>pocket<span className="brand-dot">.</span></b></div>
      <span className="auth-eyebrow">{isSignup ? 'START YOUR POCKET' : 'WELCOME BACK'}</span>
      <h2>{isSignup ? 'Create your account' : 'Sign in to Pocket'}</h2>
      <p className="auth-subtitle">{isSignup ? 'A little more clarity starts here.' : 'Your money overview is right where you left it.'}</p>
      <form className="auth-form" onSubmit={submit}>
        {isSignup&&<label>Your name<div className="auth-input"><input autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="How should we address you?" minLength={2} maxLength={80} required/></div></label>}
        <label>Email address<div className="auth-input"><Mail size={16}/><input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></div></label>
        <label>Password<div className="auth-input"><LockKeyhole size={16}/><input type={showPassword?'text':'password'} autoComplete={isSignup?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder={isSignup?'At least 8 characters':'Enter your password'} minLength={isSignup?8:1} required/><button className="show-password" type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label>
        {error&&<div className="auth-error" role="alert">{error}</div>}
        <button className="primary-button auth-submit" type="submit" disabled={busy}>{busy?(isSignup?'Creating account…':'Signing in…'):(isSignup?'Create account':'Sign in')} {!busy&&<ArrowRight size={16}/>}</button>
      </form>
      <p className="auth-switch">{isSignup?'Already have an account?':'New to Pocket?'} <button onClick={()=>changeMode(isSignup?'login':'signup')}>{isSignup?'Sign in':'Create an account'}</button></p>
      <div className="auth-footnote"><LockKeyhole size={13}/> Your password is securely hashed and never stored as plain text.</div>
    </div><div className="auth-footer">Personal Budget Tracker <span>·</span> India</div></section>
  </main>;
}
