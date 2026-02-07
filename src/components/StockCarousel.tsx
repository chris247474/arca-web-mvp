"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  tagline?: string;
  logoUrl?: string;
  tradingViewSymbol?: string;
}

// Stocks without a tradingViewSymbol use the custom SVG chart
const popularStocks: Stock[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 189.43, change: 2.34, changePercent: 1.24, logoUrl: "https://logo.clearbit.com/apple.com", tradingViewSymbol: "NASDAQ:AAPL" },
  { symbol: "MIPANDA", name: "MiPanda Holdings", price: 128.50, change: 3.45, changePercent: 2.15, tagline: "Prominent milk tea chain in the Philippines" },
  { symbol: "LDM", name: "LDM Technologies", price: 42.15, change: 4.12, changePercent: 0.98, tagline: "#4 Driving School in the Philippines" },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 178.25, change: 3.45, changePercent: 1.87, logoUrl: "https://logo.clearbit.com/amazon.com", tradingViewSymbol: "NASDAQ:AMZN" },
];

// Chart paths for custom (non-TradingView) stocks
const chartPaths: Record<string, string> = {
  "LDM": "M 0 65 L 15 60 L 25 68 L 40 55 L 55 58 L 70 48 L 85 52 L 100 42 L 115 45 L 130 35 L 145 38 L 160 28 L 175 22 L 190 25 L 200 15",
  "MIPANDA": "M 0 70 L 12 62 L 28 67 L 45 52 L 60 56 L 75 45 L 90 50 L 105 38 L 120 42 L 140 30 L 155 35 L 170 22 L 185 28 L 200 12",
};

function CustomChart({ symbol, isPositive }: { symbol: string; isPositive: boolean }) {
  const chartPath = chartPaths[symbol] || chartPaths["LDM"];
  const fillPath = chartPath + " L 200 80 L 0 80 Z";

  const strokeColor = isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)";
  const gradientId = `gradient-${symbol}-${isPositive ? 'green' : 'red'}`;

  return (
    <div
      className="h-32 w-full flex items-end justify-center px-2 pb-2"
      data-testid={`chart-${symbol}`}
    >
      <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path
          d={fillPath}
          fill={`url(#${gradientId})`}
        />
        <path
          d={chartPath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function TradingViewChart({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!containerRef.current || !mounted) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: "100%",
      height: "100%",
      locale: "en",
      dateRange: "1D",
      colorTheme: "light",
      isTransparent: false,
      autosize: true,
      largeChartUrl: "",
      noTimeScale: true,
      chartOnly: true,
    });

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, mounted]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container h-32 w-full relative overflow-hidden rounded-b-lg"
      style={{ background: "hsl(var(--card))" }}
      data-testid={`chart-${symbol}`}
    >
      <style>{`
        .tradingview-widget-container iframe {
          pointer-events: none;
        }
        .tradingview-widget-copyright {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

function StockChart({ stock }: { stock: Stock }) {
  if (stock.tradingViewSymbol) {
    return <TradingViewChart symbol={stock.tradingViewSymbol} />;
  }
  return <CustomChart symbol={stock.symbol} isPositive={stock.change >= 0} />;
}

export function StockCarousel() {
  // Duplicate stocks for seamless infinite loop
  const duplicatedStocks = [...popularStocks, ...popularStocks];

  return (
    <div className="w-full mb-6 overflow-hidden">
      <div
        className="flex gap-4 animate-scroll"
        style={{
          width: 'fit-content',
        }}
      >
        {duplicatedStocks.map((stock, index) => (
          <div
            key={`${stock.symbol}-${index}`}
            className="flex-shrink-0 w-[280px] sm:w-[320px]"
          >
            <Card className="h-full" data-testid={`card-stock-${stock.symbol}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {stock.logoUrl && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={stock.logoUrl} alt={stock.name} />
                      <AvatarFallback className="text-xs">{stock.symbol.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate text-foreground">{stock.symbol}</h3>
                    <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                    {stock.tagline && (
                      <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{stock.tagline}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-1">
                  <span className="font-mono font-semibold text-foreground" data-testid={`price-${stock.symbol}`}>
                    ${stock.price.toFixed(2)}
                  </span>
                  <Badge
                    variant={stock.change >= 0 ? "default" : "destructive"}
                    className="gap-1"
                  >
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <StockChart stock={stock} />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 45s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
