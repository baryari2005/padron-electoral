// components/ContextualSearch.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type SearchResult = {
    id: string;
    type: "Agrupación" | "Mesa" | "Elector" | "Escuela" | "Circuito";
    label: string;
};

export function ContextualSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Cierre automático si se hace clic fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setResults([]);
                setActiveIndex(-1);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Manejo del teclado
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % results.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            handleNavigate(results[activeIndex]);
        }
    };

    // Navegación al hacer click o Enter
    const handleNavigate = (result: SearchResult) => {
        switch (result.type) {
            case "Agrupación":
                router.push(`/political-groups/${result.id}?modo=ver`);
                break;
            case "Mesa":
                router.push(`/mesas/${result.id}?modo=ver`);
                break;
            case "Elector":
                router.push(`/electoral-rolls/${result.id}?modo=ver`);
                break;
            case "Escuela":
                router.push(`/establishments/${result.id}?modo=ver`);
                break;
            case "Circuito":
                router.push(`/circuites/${result.id}?modo=ver`);
                break;
        }
        setResults([]);
        setQuery("");
        setActiveIndex(-1);
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/search?q=${value}`);
            const data = await res.json();
            setResults(data.results || []);
            setActiveIndex(-1);
        } catch (error) {
            console.error("Error fetching search results", error);
            setResults([]);
        }
        setLoading(false);
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-sm">
            <div className="flex items-center gap-2 bg-white border rounded-md shadow-sm px-3 py-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Buscar por agrupación, elector, escuela..."
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className="border-0 focus-visible:ring-0 h-6"
                />
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>

            {results.length > 0 && (
                <div className="absolute z-50 bg-white border shadow-md rounded-md mt-2 w-full max-h-[300px] overflow-y-auto">
                    {results.map((result, index) => (
                        <div
                            key={index}
                            className={cn(
                                "p-2 cursor-pointer text-sm transition-colors",
                                index === activeIndex ? "bg-gray-100 font-semibold" : "hover:bg-gray-100"
                            )}
                            onMouseDown={() => handleNavigate(result)} // usamos onMouseDown para evitar que se cierre antes
                        >
                            <span className="text-muted-foreground mr-1">[{result.type}]</span>
                            {result.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
