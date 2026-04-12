"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "./Button";
import Image from "next/image";
import Link from "next/link";
import { ProfileModal } from "./ProfileModal";

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    {visible ? (
      <>
        <path d="M1.05938 11.348C0.980208 11.1235 0.980208 10.8765 1.05938 10.652C1.83045 8.68365 3.13931 7.00069 4.82002 5.81644C6.50073 4.6322 8.47759 4 10.5 4C12.5224 4 14.4993 4.6322 16.18 5.81644C17.8607 7.00069 19.1695 8.68365 19.9406 10.652C20.0198 10.8765 20.0198 11.1235 19.9406 11.348C19.1695 13.3163 17.8607 14.9993 16.18 16.1836C14.4993 17.3678 12.5224 18 10.5 18C8.47759 18 6.50073 17.3678 4.82002 16.1836C3.13931 14.9993 1.83045 13.3163 1.05938 11.348Z" />
        <path d="M10.5001 14.0005C12.0741 14.0005 13.35 12.6573 13.35 11.0003C13.35 9.34326 12.0741 8 10.5001 8C8.92619 8 7.65027 9.34326 7.65027 11.0003C7.65027 12.6573 8.92619 14.0005 10.5001 14.0005Z" />
      </>
    ) : (
      <path d="M2 9C2.85907 9.9609 3.87049 10.7965 5 11.4785M5 11.4785C6.2165 12.2111 7.57462 12.7204 9 12.9785C10.3213 13.2128 11.6787 13.2128 13 12.9785C14.4254 12.7204 15.7835 12.2111 17 11.4785M5 11.4785L3.5 13.1538M20 9C19.1409 9.9609 18.1295 10.7965 17 11.4785M17 11.4785L18.5 13.1538M9 12.9775L8.5 15M13 12.9775L13.5 15" />
    )}
  </svg>
);

function ModalOverlay({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-[440px] p-8">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 z-10 cursor-pointer">
          <Image src="/icons/Close.svg" alt="Close" width={24} height={24} />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

function Divider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
      <span className="text-gray-400 dark:text-gray-500 text-sm tracking-widest uppercase">{text}</span>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
    </div>
  );
}

function LoginModal({ onClose, onSwitch }: { onClose: () => void, onSwitch: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!validateEmail(email)) {
        setError("Please enter a valid email address.");
        setLoading(false);
        return;
      }

      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid credentials. Please try again.");
      } else {
        router.refresh();
        onClose();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="text-center mb-8">
        <h2 className="text-[28px] font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
        <p className="text-[#5b616e] dark:text-gray-400">Log in to continue your learning</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</div>}

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#3b4252] dark:text-gray-300">Email</label>
          <input
            type="email"
            required
            minLength={3}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4C40F7] focus:border-[#4C40F7] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5 relative">
          <label className="block text-sm font-medium text-[#3b4252] dark:text-gray-300">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={3}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4C40F7] focus:border-[#4C40F7] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              <EyeIcon visible={showPassword} />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4C40F7] hover:bg-[#3b32d9] text-white py-3 rounded-md font-medium transition-colors disabled:opacity-70 mt-4"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <Divider text="or" />

      <p className="text-center text-sm text-[#5b616e]">
        Don't have an account?{" "}
        <button onClick={onSwitch} type="button" className="text-[#1e2330] dark:text-white font-semibold underline hover:text-[#4C40F7]">
          Sign Up
        </button>
      </p>
    </ModalOverlay>
  );
}

function RegisterModal({ onClose, onSwitch }: { onClose: () => void, onSwitch: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Avatar must be less than 2MB");
        setAvatar(null);
        setAvatarPreview(null);
        return;
      }
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Invalid image format! Only webp, png, jpeg, jpg allowed.");
        setAvatar(null);
        setAvatarPreview(null);
        return;
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError("");
    } else {
      setAvatar(null);
      setAvatarPreview(null);
    }
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.email) {
        setError("Email is required");
        return;
      }
      if (!validateEmail(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }
    }
    setError("");
    if (step === 2) {
      if (!formData.username || formData.username.length < 3 || 
          !formData.password || formData.password.length < 3 || 
          formData.password !== formData.password_confirmation) {
            
        if (formData.password !== formData.password_confirmation) {
          setError("Passwords do not match");
        }
        return;
      }
    }
    setError("");
    setStep(s => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("username", formData.username);
      payload.append("email", formData.email);
      payload.append("password", formData.password);
      payload.append("password_confirmation", formData.password_confirmation);
      if (avatar) {
        payload.append("avatar", avatar);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: "POST",
        body: payload,
        headers: { "Accept": "application/json" }
      });

      const responseData = await res.json();

      if (!res.ok) {
        setError(responseData.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (!signInRes?.error) {
        router.refresh();
        onClose();
      } else {
        setError("Account created, but automatic login failed.");
      }
    } catch (err: any) {
      setError(err?.message || "Registration error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="text-center mb-6">
        <h2 className="text-[28px] font-bold text-gray-900 dark:text-white mb-2">Create Account</h2>
        <p className="text-[#5b616e] dark:text-gray-400">Join and start learning today</p>
      </div>

      <div className="flex gap-2 mb-6">
        <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-[#AEA6FE]' : 'bg-[#EAE8FE] dark:bg-gray-800'}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-[#AEA6FE]' : 'bg-[#EAE8FE] dark:bg-gray-800'}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-[#AEA6FE]' : 'bg-[#EAE8FE] dark:bg-gray-800'}`} />
      </div>

      <form onSubmit={step === 3 ? handleSubmit : nextStep} className="space-y-4">
        {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md animate-in fade-in">{error}</div>}

        {step === 1 && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-right-4 duration-300">
            <label className="block text-sm font-medium text-[#3b4252] dark:text-gray-300">Email*</label>
            <input
              id="email"
              type="email"
              required
              minLength={3}
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4C40F7] focus:border-[#4C40F7] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="you@example.com"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#3b4252] dark:text-gray-300">Username*</label>
              <input
                id="username"
                type="text"
                required
                minLength={3}
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 text-gray-900 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="johndoe"
              />
            </div>
            <div className="space-y-1.5 relative">
              <label className="block text-sm font-medium text-[#3b4252] dark:text-gray-300">Password*</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={3}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-3 pr-10 py-2.5 text-gray-900 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="••••••••"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#3b4252] dark:text-gray-300">Confirm Password*</label>
              <div className="relative">
                <input
                  id="password_confirmation"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={3}
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  className="w-full pl-3 pr-10 py-2.5 text-gray-900 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="••••••••"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <label className="block text-sm font-medium text-[#3b4252] dark:text-gray-300">Avatar (Optional)</label>
            <div className="flex items-center gap-4">
              <input
                id="avatar"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="w-full px-3 py-2.5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#EAE8FE] file:text-[#4C40F7] border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              />
              {avatarPreview && (
                <div className="relative h-12 w-12 shrink-0 rounded-full border border-gray-200 overflow-hidden">
                  <Image src={avatarPreview} alt="Avatar Preview" fill className="object-cover" />
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4C40F7] hover:bg-[#3b32d9] text-white py-3 rounded-md font-medium transition-colors mt-6"
        >
          {loading ? "Processing..." : step === 3 ? "Create Account" : "Next"}
        </button>
        
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            disabled={loading}
            className="w-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 py-2 mt-2 text-sm"
          >
            Back
          </button>
        )}
      </form>

      <Divider text="or" />

      <p className="text-center text-sm text-[#5b616e]">
        Already have an account?{" "}
        <button onClick={onSwitch} type="button" className="text-[#1e2330] dark:text-white font-semibold underline hover:text-[#4C40F7]">
          Log In
        </button>
      </p>
    </ModalOverlay>
  );
}

export function GlobalAuthModals() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const authModalType = searchParams.get('auth'); // 'login' | 'register'

  const closeModal = () => {
    // Remove auth param from URL
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('auth');
    const query = newParams.toString() ? `?${newParams.toString()}` : '';
    router.replace(`${pathname}${query}`);
  };

  const switchModal = (type: 'login' | 'register') => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('auth', type);
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  if (authModalType === 'login') {
    return <LoginModal onClose={closeModal} onSwitch={() => switchModal('register')} />;
  }
  
  if (authModalType === 'register') {
    return <RegisterModal onClose={closeModal} onSwitch={() => switchModal('login')} />;
  }

  if (authModalType === 'profile') {
    return <ProfileModal onClose={closeModal} />;
  }

  return null;
}

export function AuthButtons() {
  return (
    <>
      <Link href="?auth=login" className="w-[114px] h-[60px] inline-flex">
        <Button variant="outline" className="w-full h-full text-xl border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 border">
          Log In
        </Button>
      </Link>
      <Link href="?auth=register" className="w-[125px] h-[60px] inline-flex">
        <Button variant="solid" className="w-full h-full text-xl">
          Sign Up
        </Button>
      </Link>
    </>
  );
}
