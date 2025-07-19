interface Props {
  title: string;
  subtitle?: string;
}

export function FormSectionHeader({ title, subtitle }: Props) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
    </div>
  );
}
