// components/ui/LoadingMessage.tsx

export function LoadingMessage({ text = "Cargando datos..." }: { text?: string }) {
  return (
    <div className="flex justify-center items-center py-10 text-muted-foreground text-sm gap-2">
      <svg
        className="animate-spin h-5 w-5 text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
        />
      </svg>
      {text}
    </div>
  );
}
