export function GradientHeading({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-fuchsia-500 to-amber-400 animate-gradient">
        {children}
      </span>
    </h1>
  );
}
