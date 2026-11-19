export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-72 animate-pulse rounded-2xl bg-[#e5eeff]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-[#e5eeff]" />)}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-[#e5eeff]" />
    </div>
  );
}
