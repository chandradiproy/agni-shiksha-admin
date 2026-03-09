import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Flame, Loader2, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import { authService } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

// --- Validation Schemas ---
const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const loginSchema = z.object({
  otp: z.string().min(4, { message: "Please enter the valid OTP sent to your email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type EmailFormInputs = z.infer<typeof emailSchema>;
type LoginFormInputs = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const login = useAuthStore((state) => state.login);
  const addToast = useUIStore((state) => state.addToast);
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [isResending, setIsResending] = useState(false);

  // Handle Resend OTP Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors, isSubmitting: isEmailSubmitting },
  } = useForm<EmailFormInputs>({ resolver: zodResolver(emailSchema) });

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    reset: resetLoginForm,
  } = useForm<LoginFormInputs>({ resolver: zodResolver(loginSchema) });

  const onEmailSubmit = async (data: EmailFormInputs) => {
    try {
      await authService.requestOtp(data.email);
      setVerifiedEmail(data.email);
      setStep(2);
      setResendTimer(30); // Start 30s cooldown
      addToast(`OTP sent successfully to ${data.email}`, "success");
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || "Failed to send OTP. Please try again.";
      addToast(message, "error");
    }
  };

  const onLoginSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await authService.login(verifiedEmail, data.otp, data.password);
      
      // FIX: response is already the data payload from the service layer
      const { admin, token } = response;
      
      login({ id: admin.id, name: admin.name, email: admin.email, role: admin.role }, token);
      addToast(`Welcome back, ${admin.name || admin.email}!`, "success");
      
      // Use React Router for SPA navigation instead of window.location.href
      navigate('/');
      
    } catch (error: any) {
      // Catch network errors AND JS TypeError if payload is malformed
      const message = error.response?.data?.error || error.response?.data?.message || "Invalid OTP or Password.";
      addToast(message, "error");
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsResending(true);
    try {
      await authService.requestOtp(verifiedEmail);
      addToast("OTP resent successfully!", "success");
      setResendTimer(30);
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || "Failed to resend OTP.";
      addToast(message, "error");
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setVerifiedEmail('');
    resetLoginForm();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
            <Flame className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Agni Shiksha Admin</h2>
          <p className="text-sm text-gray-500 mt-2 text-center">
            {step === 1 ? "Enter your email to request a secure OTP." : "Verify your identity to continue."}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-6 animate-in fade-in slide-in-from-left-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
              <input
                {...registerEmail('email')}
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="admin@agnishiksha.com"
              />
              {emailErrors.email && <p className="text-red-500 text-xs mt-1">{emailErrors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isEmailSubmitting}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isEmailSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Sending OTP...</>
              ) : (
                <>Send OTP <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600 truncate mr-4 font-medium">{verifiedEmail}</span>
              <button type="button" onClick={handleBack} className="text-xs text-primary hover:text-primary-hover font-semibold flex items-center">
                <ArrowLeft className="w-3 h-3 mr-1" /> Change
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">One-Time Password (OTP)</label>
              <input
                {...registerLogin('otp')}
                type="text"
                autoComplete="one-time-code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-center tracking-[0.25em] font-mono text-lg"
                placeholder="000000"
              />
              {loginErrors.otp && <p className="text-red-500 text-xs mt-1 text-left">{loginErrors.otp.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                {...registerLogin('password')}
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="••••••••"
              />
              {loginErrors.password && <p className="text-red-500 text-xs mt-1">{loginErrors.password.message}</p>}
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || isResending}
                className="text-sm text-gray-600 hover:text-primary font-medium flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 mr-1.5 ${isResending ? 'animate-spin' : ''}`} />
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoginSubmitting}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoginSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Authenticating...</>
              ) : (
                'Secure Sign In'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};