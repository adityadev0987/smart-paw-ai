import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Mic, Send, X } from "lucide-react";

const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const imageTypes = ["image/jpeg", "image/png", "image/webp"];

export default function ChatComposer({ draft, setDraft, onSend, disabled = false, busy = false, placeholder = "Write a message…", multiline = false, enterHint = false, inputRef }) {
  const [attachment, setAttachment] = useState(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [mediaError, setMediaError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const input = useRef(null); const recorder = useRef(null); const stream = useRef(null); const chunks = useRef([]); const startTime = useRef(0); const cancel = useRef(false); const previewUrl = useRef("");
  const blocked = disabled || busy || submitting || recording;
  const revokePreview = () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); previewUrl.current = ""; };
  useEffect(() => { if (!recording) return undefined; const timer = window.setInterval(() => { const elapsed = Math.floor((Date.now() - startTime.current) / 1000); setSeconds(Math.min(600, elapsed)); if (elapsed >= 600 && recorder.current?.state === "recording") recorder.current.stop(); }, 250); return () => window.clearInterval(timer); }, [recording]);
  useEffect(() => () => { if (recorder.current?.state === "recording") recorder.current.stop(); stream.current?.getTracks().forEach((track) => track.stop()); revokePreview(); }, []);

  const chooseImage = (event) => {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    if (!imageTypes.includes(file.type) || file.size > MAX_IMAGE_SIZE) { setMediaError(file.size > MAX_IMAGE_SIZE ? "Images must be 20 MB or smaller." : "Choose a JPG, PNG, or WebP image."); return; }
    setMediaError(""); revokePreview(); const preview = URL.createObjectURL(file); previewUrl.current = preview; setAttachment({ file, type: "image", duration: 0, preview });
  };
  const startRecording = async () => {
    setMediaError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error("Voice recording is not supported by this browser.");
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true }); stream.current = audioStream;
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
      const instance = new MediaRecorder(audioStream, mime ? { mimeType: mime } : undefined); chunks.current = []; cancel.current = false;
      instance.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data); };
      instance.onstop = () => {
        audioStream.getTracks().forEach((track) => track.stop()); stream.current = null;
        if (!cancel.current && chunks.current.length) {
          const originalMime = instance.mimeType || "audio/webm"; const mimeType = originalMime.split(";")[0];
          const blob = new Blob(chunks.current, { type: originalMime }); const ext = mimeType === "audio/ogg" ? "ogg" : mimeType === "audio/mp4" ? "m4a" : mimeType === "audio/mpeg" ? "mp3" : "webm";
          revokePreview(); setAttachment({ file: new File([blob], `voice-message.${ext}`, { type: mimeType }), type: "audio", duration: Math.max(1, Math.min(600, Math.round((Date.now() - startTime.current) / 1000))), preview: "" });
        }
        setRecording(false);
      };
      recorder.current = instance; startTime.current = Date.now(); setSeconds(0); setRecording(true); instance.start();
    } catch (error) { stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null; setMediaError(error.message || "Microphone access is unavailable. Check browser permission."); }
  };
  const stopRecording = (shouldCancel = false) => { if (!recorder.current) return; cancel.current = shouldCancel; recorder.current.stop(); };
  const removeAttachment = () => { revokePreview(); setAttachment(null); };
  const submit = async (event) => {
    event.preventDefault(); if ((!draft.trim() && !attachment) || blocked) return;
    setMediaError("");
    try { setSubmitting(true); await onSend(draft.trim(), attachment); removeAttachment(); }
    catch (error) { setMediaError(error?.message || "Unable to send. Please try again."); }
    finally { setSubmitting(false); }
  };

  return <form onSubmit={submit} className="w-full min-w-0">
    {attachment && <div className="mb-2 flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-[#18212b]">{attachment.type === "image" ? <img src={attachment.preview} alt="Selected photo preview" className="h-14 max-w-20 rounded-lg object-contain" /> : <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Mic size={17} className="shrink-0 text-orange-500"/><span className="truncate">Voice message · {attachment.duration}s</span></div>}<span className="min-w-0 flex-1 truncate text-xs text-slate-500">{attachment.type === "image" ? attachment.file.name : "Ready to send"}</span><button type="button" title="Remove attachment" aria-label="Remove attachment" onClick={removeAttachment} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 active:scale-95 dark:hover:bg-red-500/10"><X size={17}/></button></div>}
    {recording && <div className="mb-2 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"><span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60"/><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"/></span><span className="font-semibold">Recording {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span><span className="hidden text-xs opacity-75 sm:inline">Tap stop when finished</span><button type="button" onClick={() => stopRecording(true)} className="ml-auto rounded-lg px-2.5 py-1.5 text-xs font-bold transition hover:bg-red-100 dark:hover:bg-red-500/20">Cancel</button><button type="button" onClick={() => stopRecording(false)} className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-orange-600">Stop</button></div>}
    {mediaError && <p role="alert" className="mb-2 text-xs text-red-600 dark:text-red-400">{mediaError}</p>}
    <div className="flex min-w-0 items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition duration-200 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/10 dark:border-slate-700 dark:bg-[#18212b]">
      <input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage}/>
      <button type="button" title="Attach a photo" aria-label="Attach a photo" disabled={blocked} onClick={() => input.current?.click()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-orange-50 hover:text-orange-600 active:scale-95 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"><ImagePlus size={19}/></button>
      <button type="button" title={recording ? "Recording in progress" : "Record a voice message"} aria-label="Record a voice message" disabled={disabled || busy || recording} onClick={startRecording} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-orange-50 hover:text-orange-600 active:scale-95 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"><Mic size={19}/></button>
      {multiline ? <textarea ref={inputRef} rows={1} maxLength={4000} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={placeholder} disabled={disabled || busy || recording} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} className="max-h-32 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm leading-5 outline-none placeholder:text-slate-400 disabled:opacity-60 dark:placeholder:text-slate-500"/> : <input ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={placeholder} disabled={disabled || busy || recording} className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-slate-400 disabled:opacity-60 dark:placeholder:text-slate-500"/>}
      <button type="submit" disabled={disabled || busy || submitting || recording || (!draft.trim() && !attachment)} aria-label="Send message" title="Send message" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45">{busy || submitting ? <Loader2 size={18} className="animate-spin"/> : <Send size={18}/>}</button>
    </div>
    {enterHint && <p className="mx-auto mt-2 max-w-3xl text-center text-[9px] text-slate-400">Enter to send · Shift + Enter for a new line</p>}
  </form>;
}
