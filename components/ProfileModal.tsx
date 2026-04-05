"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    age: "29",
    avatar: "",
    avatarPreview: "",
    profileComplete: false
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      const token = (session?.user as any)?.token || (session?.user as any)?.access_token || (session?.user as any)?.data?.token;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          }
        });

        if (res.ok) {
          const json = await res.json();
          const d = json.data;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError("");

    const token = (session?.user as any)?.token || (session?.user as any)?.access_token || (session?.user as any)?.data?.token;

    try {
      const payload = new FormData();
      payload.append("full_name", formData.fullName);
      payload.append("email", formData.email);
      if (formData.mobileNumber) {
        payload.append("mobile_number", formData.mobileNumber);
      }
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

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="text-[28px] font-bold text-center text-gray-900 dark:text-white mb-8">Profile</h2>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-16 h-16 shrink-0">
          <img
            src={formData.avatarPreview || formData.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"}
            alt="Profile Avatar"
            className="w-full h-full rounded-full object-cover border border-gray-100 dark:border-gray-700"
          />
          <div className={`absolute bottom-0 right-0 w-[14px] h-[14px] border-2 border-white dark:border-gray-900 rounded-full ${formData.profileComplete ? 'bg-[#1cd14f]' : 'bg-gray-400'}`}></div>
        </div>
        <div>
          {loading ? (
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          ) : (
            <>
              <h3 className="text-[19px] font-bold text-gray-900 dark:text-white leading-tight">{formData.username || "User"}</h3>
              <p className={`text-[13px] font-medium mt-0.5 ${formData.profileComplete ? 'text-[#1cd14f]' : 'text-gray-500'}`}>
                {formData.profileComplete ? "Profile is Complete" : "Profile Incomplete"}
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
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full pl-3 pr-10 py-2.5 text-gray-400 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4C40F7] focus:border-[#4C40F7] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <PencilIcon />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#3b4252] dark:text-gray-300">Email</label>
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full pl-3 pr-10 py-2.5 text-gray-400 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4C40F7] focus:border-[#4C40F7] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <CheckIcon />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="space-y-1.5 flex-2">
            <label className="block text-sm font-medium text-[#3b4252] dark:text-gray-300">Mobile Number</label>
            <div className="relative flex items-center bg-white border border-gray-300 rounded-md overflow-hidden dark:bg-gray-800 dark:border-gray-700 focus-within:ring-1 focus-within:ring-[#4C40F7] focus-within:border-[#4C40F7]">
              <div className="pl-3 pr-1 text-gray-400/70 font-medium">+995</div>
              <input
                type="text"
                value={formData.mobileNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                className="w-full py-2.5 text-gray-400 bg-transparent focus:outline-none dark:text-gray-300"
              />
              <div className="pr-3 text-gray-300 pointer-events-none">
                <CheckIcon />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            <label className="block text-sm font-medium text-[#3b4252] dark:text-gray-300">Age</label>
            <div className="relative">
              <select
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="w-full pl-3 pr-8 py-2.5 text-gray-400 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4C40F7] focus:border-[#4C40F7] appearance-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
              >
                <option value="28">28</option>
                <option value="29">29</option>
                <option value="30">30</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDownIcon />
              </div>
            </div>
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
          disabled={isUpdating}
          className="w-full bg-[#4C40F7] hover:bg-[#3b32d9] text-white py-3.5 rounded-md font-medium transition-colors mt-8 disabled:opacity-70"
        >
          {isUpdating ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </ModalOverlay>
  );
}
