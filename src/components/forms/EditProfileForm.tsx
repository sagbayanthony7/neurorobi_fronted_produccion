import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { imageUrl } from '../../utils/imageUrl';
import {
  Save, Undo, ShieldAlert, X, Camera, User, Lock, Check,
  Eye, EyeOff
} from 'lucide-react';
import axios from 'axios';

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const size = 200;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;
      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
      resolve(canvas.toDataURL('image/webp', 0.6));
    };
    img.onerror = reject;
    img.src = url;
  });
}

interface EditProfileFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    imageUrl(user?.profileImageUrl) ?? null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'El nombre es requerido.';
    if (password && password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user) {
      setErrors({ global: 'Sesión no válida. Cierre sesión y vuelva a entrar.' });
      return;
    }
    setLoading(true);

    try {
      let profileImageBase64: string | undefined;
      if (profileImage) {
        profileImageBase64 = await compressImage(profileImage);
      }

      const payload: any = { name: name.trim() };
      if (password) payload.password = password;
      if (profileImageBase64) payload.profileImageBase64 = profileImageBase64;

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL || 'https://neurorobibackendproduccion-production.up.railway.app'}/api/auth/profile/${user.id}`,
        payload
      );

      const updatedUser = { ...user, ...res.data };
      localStorage.setItem('neurorobi_user', JSON.stringify(updatedUser));
      localStorage.setItem('neurorobi_user_name', updatedUser.name);

      setSaved(true);
      setTimeout(() => {
        onSuccess();
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrors({ global: 'Error al actualizar el perfil. Intente de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    /* ── Backdrop ── */
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* ── Modal Card ── */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 fade-in duration-200">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Editar Mi Perfil</h2>
              <p className="text-[11px] text-slate-400 font-medium">Actualice su foto, nombre o contraseña</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-5">

          {/* Error global */}
          {errors.global && (
            <div className="bg-rose-50 text-rose-600 border border-rose-100 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <ShieldAlert size={14} /> {errors.global}
            </div>
          )}

          {/* Success */}
          {saved && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check size={14} /> ¡Perfil actualizado correctamente!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Foto de Perfil ── */}
            <div className="flex flex-col items-center gap-3 py-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`h-24 w-24 rounded-full overflow-hidden border-4 flex items-center justify-center transition-all duration-200 ${
                  previewUrl
                    ? 'border-teal-400 shadow-lg shadow-teal-100'
                    : 'border-dashed border-slate-300 bg-white'
                }`}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Perfil" className="h-full w-full object-cover" />
                  ) : (
                    <User size={36} className="text-slate-300" />
                  )}
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={22} className="text-white" />
                </div>
                {/* Camera badge */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-teal-600 hover:bg-teal-700 flex items-center justify-center shadow-md border-2 border-white transition-colors cursor-pointer"
                >
                  <Camera size={13} className="text-white" />
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs font-semibold text-slate-500">
                  {profileImage ? profileImage.name : 'Haz clic para cambiar la foto'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP · Máx. 5 MB</p>
              </div>

              {previewUrl && profileImage && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 font-semibold hover:bg-rose-50 px-2 py-1 rounded-lg transition-all cursor-pointer"
                >
                  <X size={11} /> Quitar foto seleccionada
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* ── Nombre ── */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Nombre Completo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-rose-300 focus:ring-rose-400'
                      : 'border-slate-200 focus:ring-teal-500 focus:border-teal-400'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-[10px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                  <ShieldAlert size={10} /> {errors.name}
                </p>
              )}
            </div>

            {/* ── Nueva Contraseña ── */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Nueva Contraseña{' '}
                <span className="text-slate-400 normal-case font-normal">(dejar vacío para no cambiar)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={14} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-rose-300 focus:ring-rose-400'
                      : 'border-slate-200 focus:ring-teal-500 focus:border-teal-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                  <ShieldAlert size={10} /> {errors.password}
                </p>
              )}
            </div>

            {/* ── Botones ── */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={loading || saved}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-md shadow-teal-600/20 active:scale-98 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : saved ? (
                  <Check size={14} />
                ) : (
                  <Save size={14} />
                )}
                {loading ? 'Guardando...' : saved ? 'Guardado ✓' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wide transition-all cursor-pointer"
              >
                <Undo size={14} />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
