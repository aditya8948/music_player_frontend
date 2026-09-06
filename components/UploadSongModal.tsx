"use client";

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { 
  UploadCloud, 
  X, 
  CheckCircle2, 
  AlertCircle,
  FileAudio,
  Disc3
} from 'lucide-react';
import { uploadSong } from '@/services/musicApi';

interface UploadSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const GENRE_PRESETS = [
  'Romantic',
  'Bollywood',
  'Pop',
  'Electronic',
  'Hip Hop',
  'Indie',
  'Soul',
  'Jazz',
  'Alt Rock',
  'Classical'
];

export default function UploadSongModal({ isOpen, onClose, onSuccess }: UploadSongModalProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('Bollywood');
  const [releaseYear, setReleaseYear] = useState<string>(new Date().getFullYear().toString());
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(180);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAudioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    setError(null);

    // Auto-populate title if blank
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
      setTitle(cleanName);
    }

    // Detect duration from audio file
    try {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setAudioDuration(Math.round(audio.duration));
        }
        URL.revokeObjectURL(url);
      };
    } catch {
      // Ignore fallback
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!audioFile) return setError('Please select an MP3 audio file');
    if (!title.trim()) return setError('Please enter song title');
    if (!artist.trim()) return setError('Please enter artist name');

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('artist', artist.trim());
      if (album.trim()) formData.append('album', album.trim());
      if (genre.trim()) formData.append('genre', genre.trim());
      if (audioDuration) formData.append('duration', String(audioDuration));
      if (releaseYear.trim()) formData.append('releaseYear', releaseYear.trim());
      formData.append('audioFile', audioFile);

      await uploadSong(formData);

      setSuccess(`✓ "${title.trim()}" uploaded successfully!`);
      setTimeout(() => {
        setSuccess(null);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to upload song:', err);
      setError(err.message || 'Song upload failed. Make sure backend is running.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div 
      className='fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200'
      onClick={onClose}
    >
      <div 
        className='relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#141822] p-6 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.1)] animate-in zoom-in-95 duration-200'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-white/10 pb-4'>
          <div className='flex items-center gap-3.5'>
            <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-300 text-black shadow-md shadow-lime-300/20'>
              <UploadCloud size={22} className='stroke-[2.5]' />
            </div>
            <div>
              <h2 className='text-lg font-bold text-white tracking-wide'>Upload New Song</h2>
              <p className='text-xs text-soft'>Add MP3 audio track to catalog (Default Artwork Applied)</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className='rounded-full border border-white/10 bg-white/5 p-2 text-soft hover:bg-white/10 hover:text-white transition'
          >
            <X size={16} />
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className='mt-4 flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-300 animate-in fade-in'>
            <AlertCircle size={16} className='flex-shrink-0 text-rose-400' />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className='mt-4 flex items-center gap-2 rounded-2xl border border-lime-400/40 bg-lime-400/15 px-4 py-2.5 text-xs font-bold text-lime-300 animate-in fade-in'>
            <CheckCircle2 size={16} className='flex-shrink-0 text-lime-300' />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className='mt-5 space-y-4'>
          {/* Full-Width Audio File Picker Dropzone */}
          <div 
            onClick={() => audioInputRef.current?.click()}
            className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
              audioFile 
                ? 'border-lime-300/80 bg-lime-300/10 shadow-inner' 
                : 'border-white/20 bg-white/[0.03] hover:border-lime-300/60 hover:bg-white/[0.06]'
            }`}
          >
            <input 
              ref={audioInputRef} 
              type='file' 
              accept='audio/*' 
              onChange={handleAudioChange} 
              className='hidden' 
            />
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-2 transition-colors ${
              audioFile ? 'bg-lime-300 text-black shadow-lg shadow-lime-300/30' : 'bg-white/10 text-soft group-hover:bg-lime-300/20 group-hover:text-lime-300'
            }`}>
              <FileAudio size={24} />
            </div>
            <div className='text-sm font-semibold text-white truncate max-w-[280px]'>
              {audioFile ? audioFile.name : 'Select MP3 Audio File *'}
            </div>
            <span className='mt-1 text-xs text-soft'>
              {audioFile ? `${(audioFile.size / (1024 * 1024)).toFixed(2)} MB • Audio Selected` : 'Click to browse or drop MP3 audio file'}
            </span>
          </div>

          {/* Metadata Inputs */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div>
              <label className='text-[11px] font-semibold uppercase tracking-wider text-soft block mb-1.5'>
                Song Title <span className='text-lime-300'>*</span>
              </label>
              <input 
                type='text' 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder='e.g. Tum Hi Ho' 
                className='w-full rounded-xl border border-white/15 bg-[#10141d] px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-lime-300/80 transition' 
                required 
              />
            </div>

            <div>
              <label className='text-[11px] font-semibold uppercase tracking-wider text-soft block mb-1.5'>
                Artist Name <span className='text-lime-300'>*</span>
              </label>
              <input 
                type='text' 
                value={artist} 
                onChange={(e) => setArtist(e.target.value)} 
                placeholder='e.g. Arijit Singh' 
                className='w-full rounded-xl border border-white/15 bg-[#10141d] px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-lime-300/80 transition' 
                required 
              />
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <div>
              <label className='text-[11px] font-semibold uppercase tracking-wider text-soft block mb-1.5'>
                Album
              </label>
              <input 
                type='text' 
                value={album} 
                onChange={(e) => setAlbum(e.target.value)} 
                placeholder='e.g. Aashiqui 2' 
                className='w-full rounded-xl border border-white/15 bg-[#10141d] px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-lime-300/80 transition' 
              />
            </div>

            <div>
              <label className='text-[11px] font-semibold uppercase tracking-wider text-soft block mb-1.5'>
                Genre
              </label>
              <select 
                value={genre} 
                onChange={(e) => setGenre(e.target.value)}
                className='w-full rounded-xl border border-white/15 bg-[#10141d] px-2.5 py-2 text-xs text-white outline-none focus:border-lime-300/80 transition'
              >
                {GENRE_PRESETS.map((g) => (
                  <option key={g} value={g} className='bg-[#141822] text-white'>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='text-[11px] font-semibold uppercase tracking-wider text-soft block mb-1.5'>
                Release Year
              </label>
              <input 
                type='number' 
                value={releaseYear} 
                onChange={(e) => setReleaseYear(e.target.value)} 
                placeholder='2026' 
                className='w-full rounded-xl border border-white/15 bg-[#10141d] px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-lime-300/80 transition' 
              />
            </div>
          </div>

          {/* Footer Actions with High-Visibility Submit Button */}
          <div className='flex items-center justify-end gap-3 pt-4 border-t border-white/10'>
            <button 
              type='button' 
              onClick={onClose} 
              className='rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 hover:text-white transition cursor-pointer'
            >
              Cancel
            </button>
            <button 
              type='submit' 
              disabled={uploading}
              style={{ backgroundColor: '#b8ff70', color: '#000000' }}
              className='inline-flex items-center gap-2 rounded-xl px-7 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-200 hover:brightness-110 active:scale-95 shadow-[0_0_25px_rgba(184,255,112,0.5)] cursor-pointer disabled:opacity-50'
            >
              {uploading ? (
                <>
                  <Disc3 size={16} className='animate-spin' style={{ color: '#000000' }} />
                  <span style={{ color: '#000000' }}>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={16} className='stroke-[2.5]' style={{ color: '#000000' }} />
                  <span style={{ color: '#000000' }}>Upload Song</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
