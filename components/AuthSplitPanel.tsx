export default function AuthSplitPanel() {
  return (
    <div className="relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[28px] bg-organic-accent2-100 p-10">
      <div className="absolute left-10 top-10 h-16 w-16 rounded-full bg-organic-accent-200" />
      <div className="absolute left-[90px] top-[90px] h-8 w-8 rounded-full bg-organic-accent2-300" />
      <h2 className="relative max-w-xs">A quiet, tidy home for your files.</h2>
      <p className="relative text-muted-foreground">Simple. Secure. Fast.</p>
    </div>
  );
}
