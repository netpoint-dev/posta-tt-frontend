export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white text-black font-sans antialiased">
      {children}
    </main>
  );
}
