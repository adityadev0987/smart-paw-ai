import { useEffect, useState } from "react";
import { getConsultationMediaUrl } from "../services/api";

export default function ConsultationMessageContent({ consultationId, message, onPreview, mediaLoader }) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true; let objectUrl = "";
    if (message.messageType === "image" || message.messageType === "audio") {
      (mediaLoader ? mediaLoader(message.mediaUrl) : getConsultationMediaUrl(consultationId, message.mediaUrl)).then((value) => { objectUrl = value; if (active) setUrl(value); else URL.revokeObjectURL(value); }).catch(() => { if (active) setFailed(true); });
    }
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [consultationId, message._id, message.mediaUrl, message.messageType, mediaLoader]);
  if (message.messageType === "image") return <>{url ? <button type="button" onClick={() => onPreview(url)} className="mb-2 block max-w-full rounded-xl transition hover:opacity-95"><img src={url} alt="Shared pet health photo" className="max-h-72 max-w-full rounded-xl object-contain" /></button> : <p className="mb-2 text-xs opacity-75">{failed ? "Image unavailable." : "Loading image…"}</p>}{message.message && <p className="whitespace-pre-wrap text-sm leading-6">{message.message}</p>}</>;
  if (message.messageType === "audio") return <>{url ? <div className="mb-2 w-full max-w-[280px]"><audio controls preload="metadata" src={url} className="h-10 w-full" /><p className="mt-1 text-[10px] opacity-75">Voice message · {message.mediaDuration || 0}s</p></div> : <p className="mb-2 text-xs opacity-75">{failed ? "Audio unavailable." : "Loading audio…"}</p>}{message.message && <p className="whitespace-pre-wrap text-sm leading-6">{message.message}</p>}</>;
  return message.message || message.content ? <p className="whitespace-pre-wrap text-sm leading-6">{message.message || message.content}</p> : null;
}
