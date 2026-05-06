interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: Props) {
  return (
    <div
      className={`w-full rounded-2xl bg-white/8 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
