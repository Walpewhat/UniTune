export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[100dvh] grid place-items-center app-gradient p-6">
      {children}
    </main>
  );
}
