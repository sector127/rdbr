"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSession, signOut } from "next-auth/react";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import { fetchUserData } from "@/lib/api";


const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PencilIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const LogOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
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
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-[440px] p-6 lg:p-8">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 z-10 transition-colors">
          <CloseIcon />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    mobilePrefix: "+995",
    mobileNumber: "",
    age: "",
    avatar: "",
    avatarPreview: "",
    profileComplete: false
  });
  const [touched, setTouched] = useState<Partial<Record<keyof typeof formData, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const validate = (data = formData) => {
    const errs: Partial<Record<keyof typeof formData, string>> = {};

    const name = data.fullName || "";
    if (!name.trim()) errs.fullName = "Name is required";
    else if (name.trim().length < 3) errs.fullName = "Name must be at least 3 characters";
    else if (name.trim().length > 50) errs.fullName = "Name must not exceed 50 characters";

    const mobileStr = (data.mobileNumber || "").replace(/\s/g, "");
    if (!mobileStr) {
      errs.mobileNumber = "Mobile number is required";
    } else if (!/^\d+$/.test(mobileStr)) {
      errs.mobileNumber = "Please enter a valid Georgian mobile number (9 digits starting with 5)";
    } else if (!mobileStr.startsWith("5")) {
      errs.mobileNumber = "Georgian mobile numbers must start with 5";
    } else if (mobileStr.length !== 9) {
      errs.mobileNumber = "Mobile number must be exactly 9 digits";
    }

    const ageValue = data.age;
    if (!ageValue) {
      errs.age = "Age is required";
    } else {
      const parsedAge = Number(ageValue);
      if (isNaN(parsedAge)) errs.age = "Age must be a number";
      else if (parsedAge < 16) errs.age = "You must be at least 16 years old to enroll";
      else if (parsedAge > 120) errs.age = "Please enter a valid age";
    }
    return errs;
  };

  useEffect(() => {
    setErrors(validate(formData));
  }, [formData]);

// Age dropdown tracking removed

  useEffect(() => {
    async function fetchProfile() {
      const token = (session?.user as any)?.token || (session?.user as any)?.access_token || (session?.user as any)?.data?.token;

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const d = await fetchUserData(token);

        if (d) {
          setFormData(prev => ({
            ...prev,
            username: d.username || "",
            fullName: d.full_name || d.fullName || d.username || "",
            email: d.email || "",
            mobileNumber: (d.mobile_number || d.mobileNumber || "")?.replace("+995", ""),
            age: d.age?.toString() || "29",
            avatar: d.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
            profileComplete: d.profileComplete || false
          }));
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchProfile();
    } else if (session === null) {
      setLoading(false);
    }
  }, [session]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setFormData(prev => ({ ...prev, avatarPreview: URL.createObjectURL(file) }));
    }
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleCloseAttempt = () => {
    const errs = validate(formData);
    if (Object.keys(errs).length > 0 && !formData.profileComplete) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currErrs = validate(formData);
    if (Object.keys(currErrs).length > 0) {
      setTouched({ fullName: true, mobileNumber: true, age: true });
      return;
    }
    
    setIsUpdating(true);
    setUpdateError("");

    const token = (session?.user as any)?.token || (session?.user as any)?.access_token || (session?.user as any)?.data?.token;

    try {
      const payload = new FormData();
      payload.append("full_name", formData.fullName.trim());
      // we don't append email because it's read-only
      
      const mobileStripped = formData.mobileNumber.replace(/\s/g, "");
      payload.append("mobile_number", mobileStripped);
      payload.append("age", formData.age);
      if (avatarFile) {
        payload.append("avatar", avatarFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: payload
      });

      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setUpdateError(errorData.message || "Failed to update profile.");
      }
    } catch (err: any) {
      setUpdateError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <>
      <ModalOverlay onClose={handleCloseAttempt}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[28px] font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Profile 
            {(formData.profileComplete && !hasErrors) && (
              <span className="text-[13px] inline-flex items-center gap-1 font-bold text-[#1cd14f] bg-[#1cd14f]/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                Complete <CheckIcon />
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2 pr-8">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              title="Sign Out"
            >
              <LogOutIcon />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <img
              src={formData.avatarPreview || formData.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"}
              alt="Profile Avatar"
              className="w-full h-full rounded-full object-cover border border-gray-100 dark:border-gray-700"
            />
            <div className={`absolute bottom-0 right-0 w-[14px] h-[14px] border-2 border-white dark:border-gray-900 rounded-full ${(!hasErrors && formData.profileComplete) ? 'bg-[#1cd14f]' : 'bg-[#F4A316]'}`}></div>
          </div>
          <div>
            {loading ? (
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
            ) : (
              <>
                <h3 className="text-[19px] font-bold text-gray-900 dark:text-white leading-tight">{formData.fullName || "User"}</h3>
                <p className={`text-[13px] font-medium mt-0.5 ${(!hasErrors && formData.profileComplete) ? 'text-[#1cd14f]' : 'text-[#F4A316]'}`}>
                  {(!hasErrors && formData.profileComplete) ? "Profile is Complete" : "Profile Incomplete"}
                </p>
              </>
            )}
          </div>
        </div>


      <form onSubmit={handleSubmit} className="space-y-4">
        {updateError && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md animate-in fade-in">
            {updateError}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#3b4252] dark:text-gray-300">Full Name</label>
          <div className="relative">
            <input
              type="text"
              value={formData.fullName}
              onBlur={() => handleBlur("fullName")}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className={`w-full pl-3 pr-10 py-2.5 text-gray-900 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 dark:bg-gray-800 dark:text-gray-300 ${
                touched.fullName && errors.fullName
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                  : touched.fullName && !errors.fullName
                  ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                  : "border-gray-300 dark:border-gray-700 focus:ring-[#4C40F7] focus:border-[#4C40F7]"
              }`}
            />
            {touched.fullName && !errors.fullName && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-green-500">
                <CheckIcon />
              </div>
            )}
          </div>
          {touched.fullName && errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#3b4252] dark:text-gray-300">Email</label>
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full pl-3 pr-10 py-2.5 text-gray-400 bg-gray-100 border border-gray-300 rounded-md focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500 cursor-not-allowed opacity-80"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="space-y-1.5 flex-[2]">
            <label className="block text-sm font-medium text-[#3b4252] dark:text-gray-300">Mobile Number</label>
            <div className={`relative flex items-center bg-white border rounded-md overflow-hidden dark:bg-gray-800 focus-within:ring-1 ${
              touched.mobileNumber && errors.mobileNumber
                ? "border-red-500 focus-within:ring-red-500 focus-within:border-red-500"
                : touched.mobileNumber && !errors.mobileNumber
                ? "border-green-500 focus-within:ring-green-500 focus-within:border-green-500"
                : "border-gray-300 dark:border-gray-700 focus-within:ring-[#4C40F7] focus-within:border-[#4C40F7]"
            }`}>
              <div className="pl-3 pr-1 text-gray-400/70 font-medium">+995</div>
              <input
                type="text"
                value={formData.mobileNumber}
                onBlur={() => handleBlur("mobileNumber")}
                onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                className="w-full py-2.5 text-gray-900 bg-transparent focus:outline-none dark:text-gray-300"
              />
              {touched.mobileNumber && !errors.mobileNumber && (
                <div className="pr-3 pointer-events-none text-green-500">
                  <CheckIcon />
                </div>
              )}
            </div>
            {touched.mobileNumber && errors.mobileNumber && <p className="text-xs text-red-500 mt-1">{errors.mobileNumber}</p>}
          </div>

          <div className="space-y-1.5 flex-1">
            <label className="block text-sm font-medium text-[#3b4252] dark:text-gray-300">Age</label>
            <div className="relative">
              <input
                type="number"
                value={formData.age}
                onBlur={() => handleBlur("age")}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className={`w-full pl-3 pr-8 py-2.5 text-gray-900 bg-white border rounded-md focus:outline-none focus:ring-1 dark:bg-gray-800 dark:text-gray-300 ${
                  touched.age && errors.age
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                    : touched.age && !errors.age
                    ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                    : "border-gray-300 dark:border-gray-700 focus:ring-[#4C40F7] focus:border-[#4C40F7]"
                }`}
              />
              {touched.age && !errors.age && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-green-500">
                  <CheckIcon />
                </div>
              )}
            </div>
            {touched.age && errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="block text-sm font-medium text-[#3b4252] dark:text-gray-300">Upload Avatar</label>
          <div className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 py-7 px-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#4C40F7] transition-colors relative group">
            <input type="file" onChange={handleAvatarChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" id="avatar-upload" accept=".jpg,.jpeg,.png,.webp" />
            <div className="mb-3 text-gray-400"><UploadIcon /></div>
            <p className="text-[14px] text-[#3b4252] font-medium dark:text-gray-300 mb-1">
              Drag and drop or <span className="text-[#4C40F7] group-hover:underline">Upload file</span>
            </p>
            <p className="text-[13px] text-gray-400">JPG, PNG or WebP</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isUpdating || hasErrors}
          className="w-full bg-[#4C40F7] hover:bg-[#3b32d9] text-white py-3.5 rounded-md font-medium transition-colors mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? "Saving..." : "Save Profile"}
        </button>

      </form>
      </ModalOverlay>

      {/* Confirmation Modal for closing when incomplete */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-10000 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-500 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Profile Incomplete</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Your profile is incomplete. You won't be able to enroll in courses until you complete it. Close anyway?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                No, go back
              </button>
              <button
                onClick={() => {
                  setShowCloseConfirm(false);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
              >
                Yes, close
              </button>
            </div>
          </div>
        </div>
      )}

    </>

  );
}
