type Props = {
  children?: React.ReactNode;
};

export default function Divider({ children }: Props) {
  return (
    <div className="my-6 flex items-center gap-4">
      <div className="h-px flex-1 bg-ink-200" />
      {children && (
        <span className="text-xs font-medium uppercase tracking-wider text-ink-400">
          {children}
        </span>
      )}
      <div className="h-px flex-1 bg-ink-200" />
    </div>
  );
}
