export default function LayoutAuth({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col justify-center h-full items-center">            
            {children}
        </div>
    )
}
