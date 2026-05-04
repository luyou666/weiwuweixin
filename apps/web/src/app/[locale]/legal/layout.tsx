/**
 * Legal pages layout — minimal, clean reading experience
 */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink-900">
      {children}
    </div>
  );
}
