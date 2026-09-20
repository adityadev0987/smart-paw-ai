import { UsersRound } from "lucide-react";

function Community() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-10 text-slate-900 transition-colors duration-300 dark:bg-[#0b0f14] dark:text-slate-100 sm:px-6 sm:py-16 lg:px-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl dark:bg-orange-500/10" />
        <div className="absolute -right-32 top-96 h-80 w-80 rounded-full bg-orange-300/10 blur-3xl dark:bg-orange-500/5" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-10rem)] max-w-4xl items-center justify-center">
        <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10 lg:p-14 dark:border-slate-800 dark:bg-[#111820]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
            <UsersRound size={30} />
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-orange-600 dark:text-orange-400">
            Community
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Coming Soon
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base dark:text-slate-400">
            We are building a community where pet parents can share
            experiences, ask questions, discover useful pet-care discussions,
            and connect with other pet lovers.
          </p>

          <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
            <UsersRound size={15} />
            Coming Soon
          </div>
        </section>
      </div>
    </main>
  );
}

export default Community;
