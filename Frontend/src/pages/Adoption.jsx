import { useCallback, useEffect, useState } from "react";
import { HeartHandshake, PawPrint, Plus, X } from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;
const ORIGIN = new URL(API).origin;
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("smartPawToken") || ""}` });
async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...auth(), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}
const photoUrl = (url) => url?.startsWith("http") || url?.startsWith("data:") ? url : `${ORIGIN}${url || ""}`;
const emptyForm = { about: "", reason: "", location: "", contact: "", temperament: "", healthInfo: "", requirements: "" };

export default function Adoption({ embedded = false }) {
  const { currentUser } = useAppContext();
  const [listings, setListings] = useState([]);
  const [pets, setPets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [petId, setPetId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [listingData, petData] = await Promise.all([
      request(`${API}/community/adoption/listings`), request(`${API}/pets`),
    ]);
    setListings(listingData.listings || []);
    setPets(petData.data || petData.pets || []);
  }, []);
  useEffect(() => { load().catch((e) => setError(e.message)); }, [load]);

  const selectedPet = pets.find((pet) => String(pet._id || pet.id) === String(petId));
  const setField = (event) => setForm((old) => ({ ...old, [event.target.name]: event.target.value }));

  async function publish(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const media = await Promise.all(mediaFiles.map(async (file) => {
        const body = new FormData(); body.append("image", file);
        const uploaded = await request(`${API}/uploads/community-image`, { method: "POST", body });
        return uploaded.imageUrl;
      }));
      await request(`${API}/community/adoption/listings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, petId, media }) });
      setShowForm(false); setForm(emptyForm); setMediaFiles([]); await load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  async function requestAdoption(listingId) {
    try {
      await request(`${API}/community/adoption/listings/${listingId}/requests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "I am interested in adopting this pet." }) });
      setError("Adoption request submitted successfully.");
    } catch (e) { setError(e.message); }
  }

  return <main className={embedded ? "min-w-0 py-2" : "mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6"}>
    <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-500">Find a companion</p><h1 className="mt-1 text-3xl font-black">Adoption</h1><p className="mt-2 text-sm text-slate-500">Meet pets looking for a loving home.</p></div>
      <button type="button" onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white"><Plus size={17}/> Create Adoption Listing</button>
    </header>
    {error && <p role="status" className="mb-4 rounded-xl bg-orange-50 p-3 text-sm text-orange-700">{error}</p>}
    {listings.length ? <div className="grid gap-5 md:grid-cols-2">
      {listings.map((listing) => { const pet = listing.petId || {}; const owner = listing.ownerId?._id || listing.ownerId; return <article key={listing._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0d131a]">
        <div className="relative h-64 bg-orange-50 dark:bg-slate-900">{listing.media?.[0] || pet.profilePhoto ? <img className="h-full w-full object-cover" src={photoUrl(listing.media?.[0] || pet.profilePhoto)} alt={pet.name || "Pet"}/> : <div className="flex h-full items-center justify-center text-orange-400"><PawPrint size={56}/></div>}</div>
        <div className="p-5"><div className="flex items-start justify-between"><div><h2 className="text-2xl font-black">{pet.name || "Pet"}</h2><p className="mt-1 text-sm text-slate-500">{[pet.breed, pet.age != null ? `${pet.age} years` : "", pet.gender].filter(Boolean).join(" · ")}</p></div><HeartHandshake className="text-orange-500"/></div>
          {listing.location && <p className="mt-3 text-xs font-bold text-slate-500">{listing.location}</p>}
          <Detail label="About the pet" value={listing.about}/><Detail label="Temperament" value={listing.temperament || (pet.behavior?.temperament || []).join(", ")}/><Detail label="Health & vaccinations" value={listing.healthInfo || pet.medical?.healthStatus}/><Detail label="Reason for adoption" value={listing.reason}/><Detail label="Adoption requirements" value={listing.requirements}/>
          {listing.contact && <p className="mt-3 text-xs text-slate-500">Preferred contact: {listing.contact}</p>}
          <button disabled={String(owner) === String(currentUser?._id || currentUser?.id)} onClick={() => requestAdoption(listing._id)} className="mt-5 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white disabled:opacity-50">Request Adoption</button>
        </div>
      </article>; })}
    </div> : <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">No adoption listings yet.</div>}
    {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"><form onSubmit={publish} className="my-6 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#0d131a]"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-orange-500">Adoption</p><h2 className="text-xl font-black">Create Adoption Listing</h2></div><button type="button" onClick={() => setShowForm(false)} aria-label="Close" className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X/></button></div>
      <label className="mb-4 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Select your pet<select required value={petId} onChange={(e) => setPetId(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-[#111923] dark:text-white dark:focus:border-orange-500 dark:focus:ring-orange-500/10"><option value="">Choose a pet</option>{pets.map((pet) => <option key={pet._id || pet.id} value={pet._id || pet.id}>{pet.name}{pet.breed ? ` · ${pet.breed}` : ""}</option>)}</select></label>
      {selectedPet && <div className="mb-4 rounded-xl bg-orange-50 p-3 text-sm dark:bg-orange-500/10"><b>{selectedPet.name}</b> · {[selectedPet.species, selectedPet.breed, selectedPet.age != null ? `${selectedPet.age} years` : "", selectedPet.gender, selectedPet.color].filter(Boolean).join(" · ")}<p className="mt-1 text-xs text-slate-500">Profile details are filled from your pet record. Review them above before publishing.</p></div>}
      <div className="grid gap-3 sm:grid-cols-2">{[["about","About the pet",true],["reason","Reason for adoption",true],["location","Location"],["contact","Preferred contact"],["temperament","Temperament / behavior"],["healthInfo","Health / vaccination information"],["requirements","Adoption requirements"]].map(([name,label,required])=><label key={name} className={`text-xs font-bold ${name === "requirements" ? "sm:col-span-2" : ""}`}>{label}<textarea required={required} name={name} value={form[name]} onChange={setField} rows={name === "about" || name === "reason" || name === "requirements" ? 3 : 2} className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent p-3 text-sm font-normal dark:border-slate-700" placeholder={name === "temperament" ? (selectedPet?.behavior?.temperament || []).join(", ") : name === "healthInfo" ? selectedPet?.medical?.healthStatus : ""}/></label>)}</div>
      <label className="mt-4 block text-xs font-bold">Pet photos<input className="mt-2 block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setMediaFiles(Array.from(e.target.files || []).slice(0,5))}/></label>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}<div className="mt-5 flex gap-3"><button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold dark:border-slate-700">Cancel</button><button disabled={busy || !pets.length} className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white disabled:opacity-50">{busy ? "Publishing..." : "Publish Listing"}</button></div>
    </form></div>}
  </main>;
}
function Detail({ label, value }) { return value ? <section className="mt-3"><h3 className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</h3><p className="mt-1 text-sm leading-6">{Array.isArray(value) ? value.join(", ") : value}</p></section> : null; }
