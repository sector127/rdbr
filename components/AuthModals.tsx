"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "./Button";
import Image from "next/image";
import Link from "next/link";
import { ProfileModal } from "./ProfileModal";
import { ModalOverlay } from "./ModalOverlay";
import { API_URL } from "@/lib/api";

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

import { EyeIcon } from "./icons";



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
    <ModalOverlay onClose={onClose} className="max-w-[440px] p-8 relative rounded-xl">
      <button onClick={onClose} className="absolute top-4 right-4 p-1 z-10 cursor-pointer">
        <Image src="/icons/Close.svg" alt="Close" width={24} height={24} />
      </button>
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
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
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
      if (!formData.username || formData.username.length < 3) {
        setError("Username must be at least 3 characters");
        return;
      }
      if (!formData.password || formData.password.length < 3) {
        setError("Password must be at least 3 characters");
        return;
      }
      if (formData.password !== formData.password_confirmation) {
        setError("Passwords do not match");
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

      const res = await fetch(`${API_URL}/register`, {
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose} className="max-w-[440px] p-8 relative rounded-xl">
      <button onClick={onClose} className="absolute top-4 right-4 p-1 z-10 cursor-pointer">
        <Image src="/icons/Close.svg" alt="Close" width={24} height={24} />
      </button>
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
                  <Image src={avatarPreview} alt="Avatar Preview" fill sizes="48px" className="object-cover" />
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
