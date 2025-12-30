import packageJson from '../../package.json';

export default function Logo({ size = "default", showText = true, className = "" }) {
    const appName = "Coca Tet";
    const version = packageJson.version || "0.0.1";
    const isSmall = size === "small";

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <img 
                src="/logo.png" 
                alt="Logo" 
                className={isSmall ? "w-8 h-8" : "w-10 h-10"}
            />
            {showText && (
                <div className="flex flex-col">
                    <span className={`font-bold ${isSmall ? "text-xs" : "text-sm"}`}>
                        {appName}
                    </span>
                    <span className={`text-gray-400 ${isSmall ? "text-[10px]" : "text-xs"}`}>
                        v{version}
                    </span>
                </div>
            )}
        </div>
    );
}

