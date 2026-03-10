export default function BootstrapPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-10 rounded-xl border shadow-lg bg-white text-center space-y-4">
        <h1 className="text-2xl font-bold">
          No existe una elección activa
        </h1>
        <p className="text-muted-foreground">
          Debes crear y activar una elección para comenzar a utilizar el sistema.
        </p>
      </div>
    </div>
  );
}