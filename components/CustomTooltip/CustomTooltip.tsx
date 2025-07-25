import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import { CustomTooltipProps } from "./CustomTooltip.types";
import { Info } from "lucide-react";
import { TooltipProvider } from "@radix-ui/react-tooltip";

export function CustomTooltip(props: CustomTooltipProps) {
    const { content } = props;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Info strokeWidth={1} className="h-5 w-5" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
