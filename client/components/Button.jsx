export default function Button({ icon, children, onClick, className }) {
  return (
    <button
      className={`bg-[#1a1f25] text-[#4af626] rounded-none p-3 flex items-center gap-1 hover:bg-[#2a3543] transition-all ${className}`}
      onClick={onClick}
    >
      {icon}
      <span className="imperial-text opacity-90">{children}</span>
    </button>
  );
}
