'use client';

import { useState, FormEvent } from 'react';
import { Mail, Check, Loader2, AlertCircle } from 'lucide-react';

interface WaitlistSignupProps {
  /** Compact mode (smaller, inline) */
  compact?: boolean;
  /** Custom placeholder text */
  placeholder?: string;
  /** Custom button text */
  buttonText?: string;
  /** Show success message inline vs. replacing form */
  inlineSuccess?: boolean;
  /** Custom className */
  className?: string;
}

export function WaitlistSignup({
  compact = false,
  placeholder = 'Enter your email',
  buttonText = 'Join Waitlist',
  inlineSuccess = false,
  className = '',
}: WaitlistSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your email');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to join waitlist. Please try again.');
    }
  };

  // Success state - full replacement
  if (status === 'success' && !inlineSuccess) {
    return (
      <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
        <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center backdrop-blur-sm">
          <Check className="w-8 h-8 text-green-400" />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">You're in! 🎉</h3>
          <p className="text-mono-silver font-inter">
            We'll notify you when MonoFrame launches.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <form 
        onSubmit={handleSubmit}
        className={`flex ${compact ? 'flex-row gap-2' : 'flex-col sm:flex-row gap-4'} w-full`}
      >
        {/* Email Input */}
        <div className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mono-silver pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            placeholder={placeholder}
            disabled={status === 'loading'}
            className={`
              w-full pl-12 pr-6 font-inter
              ${compact ? 'py-3 text-base' : 'py-4 text-lg'}
              bg-mono-white/5 backdrop-blur-lg
              border border-mono-white/20
              rounded-lg
              text-white placeholder:text-mono-silver/60
              focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300
              hover:bg-mono-white/10
            `}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className={`
            ${compact ? 'px-6 py-3 text-base' : 'px-8 py-4 text-lg'}
            bg-white text-black rounded-lg font-semibold
            shadow-[0_0_35px_rgba(255,255,255,0.25)]
            hover:shadow-[0_0_55px_rgba(255,255,255,0.4)]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
            transition-all duration-300
            flex items-center justify-center gap-2
            whitespace-nowrap
            hover:scale-105 active:scale-95
          `}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Joining...</span>
            </>
          ) : (
            buttonText
          )}
        </button>
      </form>

      {/* Error Message */}
      {status === 'error' && errorMessage && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm font-inter">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Inline Success Message */}
      {status === 'success' && inlineSuccess && (
        <div className="mt-3 flex items-center gap-2 text-green-400 text-sm font-inter">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>You're in! We'll notify you when MonoFrame launches.</span>
        </div>
      )}
    </div>
  );
}

/**
 * Preset: Compact (smaller, inline form)
 */
WaitlistSignup.Compact = function CompactWaitlist(
  props: Omit<WaitlistSignupProps, 'compact'>
) {
  return <WaitlistSignup compact={true} {...props} />;
};

/**
 * Preset: Inline Success (shows success message below form)
 */
WaitlistSignup.InlineSuccess = function InlineSuccessWaitlist(
  props: Omit<WaitlistSignupProps, 'inlineSuccess'>
) {
  return <WaitlistSignup inlineSuccess={true} {...props} />;
};

