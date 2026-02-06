"use client";

import { useState, useEffect } from "react";
import { ArrowDown, Info, TrendingUp, TrendingDown, RefreshCw, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// todo: remove mock data - replace with real token/share data
const mockTokens = [
  { symbol: "LDM", name: "LDM Technologies", price: 42.15 },
  { symbol: "MIPANDA", name: "MiPanda Holdings", price: 128.50 },
  { symbol: "SPDF", name: "SME Perpetual Dividend Fund", price: 156.80 },
  { symbol: "ETH", name: "Ethereum", price: 2345.67 },
  { symbol: "USDC", name: "USD Coin", price: 1.00 },
];

// Chart data for different symbols - price history over time
const chartData: Record<string, { time: string; price: number }[]> = {
  "LDM": [
    { time: "9:00", price: 40.12 },
    { time: "10:00", price: 40.45 },
    { time: "11:00", price: 40.28 },
    { time: "12:00", price: 40.85 },
    { time: "13:00", price: 41.12 },
    { time: "14:00", price: 40.95 },
    { time: "15:00", price: 41.45 },
    { time: "16:00", price: 41.78 },
    { time: "17:00", price: 41.52 },
    { time: "18:00", price: 42.05 },
    { time: "19:00", price: 41.88 },
    { time: "20:00", price: 42.15 },
  ],
  "MIPANDA": [
    { time: "9:00", price: 114.20 },
    { time: "10:00", price: 115.80 },
    { time: "11:00", price: 117.45 },
    { time: "12:00", price: 116.90 },
    { time: "13:00", price: 119.25 },
    { time: "14:00", price: 121.50 },
    { time: "15:00", price: 120.85 },
    { time: "16:00", price: 123.40 },
    { time: "17:00", price: 125.20 },
    { time: "18:00", price: 124.65 },
    { time: "19:00", price: 127.10 },
    { time: "20:00", price: 128.50 },
  ],
  "SPDF": [
    { time: "9:00", price: 144.50 },
    { time: "10:00", price: 146.20 },
    { time: "11:00", price: 145.80 },
    { time: "12:00", price: 148.35 },
    { time: "13:00", price: 150.10 },
    { time: "14:00", price: 149.45 },
    { time: "15:00", price: 152.20 },
    { time: "16:00", price: 153.85 },
    { time: "17:00", price: 153.20 },
    { time: "18:00", price: 155.40 },
    { time: "19:00", price: 156.10 },
    { time: "20:00", price: 156.80 },
  ],
  "ETH": [
    { time: "9:00", price: 2428.50 },
    { time: "10:00", price: 2415.30 },
    { time: "11:00", price: 2398.45 },
    { time: "12:00", price: 2410.20 },
    { time: "13:00", price: 2385.60 },
    { time: "14:00", price: 2372.80 },
    { time: "15:00", price: 2388.15 },
    { time: "16:00", price: 2365.40 },
    { time: "17:00", price: 2358.25 },
    { time: "18:00", price: 2370.90 },
    { time: "19:00", price: 2352.45 },
    { time: "20:00", price: 2345.67 },
  ],
  "USDC": [
    { time: "9:00", price: 1.00 },
    { time: "10:00", price: 1.00 },
    { time: "11:00", price: 1.00 },
    { time: "12:00", price: 1.00 },
    { time: "13:00", price: 1.00 },
    { time: "14:00", price: 1.00 },
    { time: "15:00", price: 1.00 },
    { time: "16:00", price: 1.00 },
    { time: "17:00", price: 1.00 },
    { time: "18:00", price: 1.00 },
    { time: "19:00", price: 1.00 },
    { time: "20:00", price: 1.00 },
  ],
};

// Chart metadata for different symbols
const chartMeta: Record<string, { change: string; isPositive: boolean }> = {
  "LDM": { change: "+5.26%", isPositive: true },
  "MIPANDA": { change: "+12.50%", isPositive: true },
  "SPDF": { change: "+8.45%", isPositive: true },
  "ETH": { change: "-3.45%", isPositive: false },
  "USDC": { change: "+0.00%", isPositive: true },
};

export function TradingChart({ symbol }: { symbol: string }) {
  const data = chartData[symbol] || chartData["LDM"];
  const meta = chartMeta[symbol] || chartMeta["LDM"];
  const tokenData = mockTokens.find(t => t.symbol === symbol);

  // Standard stock chart colors - green for positive, red for negative
  const strokeColor = meta.isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)";
  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const padding = (maxPrice - minPrice) * 0.1 || 0.01;

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          {tokenData?.name && (
            <span className="text-sm text-muted-foreground">{tokenData.name}</span>
          )}
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-foreground">{symbol}/USD</span>
            <span className="text-2xl font-mono font-bold text-foreground">
              ${tokenData?.price.toFixed(2)}
            </span>
            <span className={meta.isPositive ? "text-green-600 dark:text-green-400 text-sm" : "text-red-600 dark:text-red-400 text-sm"}>
              {meta.change}
            </span>
          </div>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <button className="px-2 py-1 rounded bg-muted/50" data-testid="button-timeframe-1h">1H</button>
          <button className="px-2 py-1 rounded bg-muted" data-testid="button-timeframe-1d">1D</button>
          <button className="px-2 py-1 rounded bg-muted/50" data-testid="button-timeframe-1w">1W</button>
          <button className="px-2 py-1 rounded bg-muted/50" data-testid="button-timeframe-1m">1M</button>
        </div>
      </div>
      <div className="h-48" data-testid="trading-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              width={65}
              domain={[minPrice - padding, maxPrice + padding]}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px'
              }}
              formatter={(value) => [`$${(value as number).toFixed(2)}`, 'Price']}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: strokeColor, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface TradingInterfaceProps {
  groupId: string;
  hideChart?: boolean;
  symbol?: string;
}

export function TradingInterface({ groupId, hideChart = false, symbol }: TradingInterfaceProps) {
  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const [tradeType, setTradeType] = useState<"long" | "short" | "swap">("long");
  const [payAmount, setPayAmount] = useState("");
  const [payToken, setPayToken] = useState("USDC");
  const [receiveToken, setReceiveToken] = useState(symbol || "LDM");
  const [leverage, setLeverage] = useState([1]);
  const [orderType, setOrderType] = useState("market");

  useEffect(() => {
    if (symbol) {
      setReceiveToken(symbol);
    }
  }, [symbol]);

  const payTokenData = mockTokens.find((t) => t.symbol === payToken);
  const receiveTokenData = mockTokens.find((t) => t.symbol === receiveToken);

  const payAmountNum = parseFloat(payAmount) || 0;
  const positionSize = payAmountNum * leverage[0];
  const entryPrice = receiveTokenData?.price || 0;
  const liquidationPrice = tradeType === "long"
    ? entryPrice * (1 - 0.9 / leverage[0])
    : entryPrice * (1 + 0.9 / leverage[0]);

  const handleSwapTokens = () => {
    const temp = payToken;
    setPayToken(receiveToken);
    setReceiveToken(temp);
  };

  const handleExecuteTrade = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to execute trades.",
        variant: "destructive",
      });
      login();
      return;
    }
    toast({
      title: "Trade Simulated",
      description: `${tradeType === "long" ? "Long" : tradeType === "short" ? "Short" : "Swap"} order placed successfully (simulated).`,
    });
  };

  return (
    <div className="w-full" data-testid="trading-interface">
      <div className="flex justify-end mb-3">
        <Button variant="outline" size="sm" asChild data-testid="button-partner-exchange">
          <a href="https://app.gmx.io" target="_blank" rel="noopener noreferrer">
            Trade on Partner Exchange
            <ExternalLink className="h-4 w-4 ml-2" />
          </a>
        </Button>
      </div>
      <div className={`grid gap-6 ${hideChart ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
        <Card>
          <CardHeader className="pb-4">
            <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as "long" | "short" | "swap")}>
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger
                  value="long"
                  className="gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500"
                  data-testid="tab-long"
                >
                  <TrendingUp className="h-4 w-4" />
                  Long
                </TabsTrigger>
                <TabsTrigger
                  value="short"
                  className="gap-2 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-500"
                  data-testid="tab-short"
                >
                  <TrendingDown className="h-4 w-4" />
                  Short
                </TabsTrigger>
                <TabsTrigger
                  value="swap"
                  className="gap-2"
                  data-testid="tab-swap"
                >
                  <RefreshCw className="h-4 w-4" />
                  Swap
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pay</span>
                <span className="text-muted-foreground">Balance: 10,000.00</span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="flex-1 text-lg font-mono"
                  data-testid="input-pay-amount"
                />
                <Select value={payToken} onValueChange={setPayToken}>
                  <SelectTrigger className="w-28" data-testid="select-pay-token">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground text-right">
                ~${(payAmountNum * (payTokenData?.price || 0)).toFixed(2)}
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSwapTokens}
                className="rounded-full"
                data-testid="button-swap-tokens"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {tradeType === "swap" ? "Receive" : tradeType === "long" ? "Long" : "Short"}
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  readOnly
                  value={payAmountNum > 0 ? ((payAmountNum * (payTokenData?.price || 0)) / (receiveTokenData?.price || 1)).toFixed(4) : ""}
                  placeholder="0.00"
                  className="flex-1 text-lg font-mono bg-muted/50"
                  data-testid="input-receive-amount"
                />
                <Select value={receiveToken} onValueChange={setReceiveToken}>
                  <SelectTrigger className="w-28" data-testid="select-receive-token">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTokens.filter((t) => t.symbol !== payToken).map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {tradeType !== "swap" && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Leverage</span>
                    <span className="font-mono font-semibold">{leverage[0]}x</span>
                  </div>
                  <Slider
                    value={leverage}
                    onValueChange={setLeverage}
                    min={1}
                    max={100}
                    step={1}
                    className="w-full"
                    data-testid="slider-leverage"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1x</span>
                    <span>25x</span>
                    <span>50x</span>
                    <span>75x</span>
                    <span>100x</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Order Type</span>
                  </div>
                  <Select value={orderType} onValueChange={setOrderType}>
                    <SelectTrigger data-testid="select-order-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                      <SelectItem value="stop">Stop Market</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2 p-3 rounded-md bg-muted/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  Entry Price
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The price at which your position opens</p>
                    </TooltipContent>
                  </Tooltip>
                </span>
                <span className="font-mono text-foreground">${entryPrice.toFixed(2)}</span>
              </div>

              {tradeType !== "swap" && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Liq. Price
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Position auto-closes at this price</p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                    <span className="font-mono text-orange-600 dark:text-orange-400">
                      ${liquidationPrice > 0 ? liquidationPrice.toFixed(2) : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Position Size</span>
                    <span className="font-mono text-foreground">
                      ${positionSize.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fees</span>
                    <span className="font-mono text-muted-foreground">
                      ~${(positionSize * 0.001).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <Button
              className={`w-full ${
                tradeType === "long"
                  ? "bg-green-600 hover:bg-green-700"
                  : tradeType === "short"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }`}
              size="lg"
              disabled={!payAmountNum}
              onClick={handleExecuteTrade}
              data-testid="button-execute-trade"
            >
              {tradeType === "long" && "Open Long"}
              {tradeType === "short" && "Open Short"}
              {tradeType === "swap" && "Swap"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Trading is simulated. No real transactions will occur.
            </p>
          </CardContent>
        </Card>

        {!hideChart && (
          <Card className="p-6">
            <TradingChart symbol={receiveToken} />
          </Card>
        )}
      </div>
    </div>
  );
}
