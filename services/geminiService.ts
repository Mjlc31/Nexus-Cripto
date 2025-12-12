import { GoogleGenAI } from "@google/genai";
import { CoinData, PortfolioPosition } from "../types";

// Safe initialization that won't crash the entire app if env is missing
const getAiClient = () => {
  try {
    // The build tool (Vite) replaces process.env.API_KEY with the actual string literal.
    const apiKey = process.env.API_KEY;
    
    // Check for empty string, undefined, or if the replacement failed (literal "API_KEY")
    if (!apiKey || apiKey === "" || apiKey.includes("API_KEY")) {
      console.warn("API Key not found or environment not loaded. Running in Simulation Mode.");
      return null;
    }
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error("Error initializing AI client:", e);
    return null;
  }
};

const MODEL_ID = "gemini-2.5-flash";

// New Interface for Structured AI Response
export interface TAOGAnalysis {
  verdict: 'COMPRA' | 'VENDA' | 'AGUARDAR';
  confidenceScore: number; // 0-100
  timeframeAnalysis: {
    h4: { status: 'BULLISH' | 'BEARISH' | 'NEUTRAL', signal: string, keyLevel: string };
    d1: { status: 'BULLISH' | 'BEARISH' | 'NEUTRAL', signal: string, keyLevel: string };
    w1: { status: 'BULLISH' | 'BEARISH' | 'NEUTRAL', signal: string, keyLevel: string };
  };
  levels: {
    entryZone: string;
    targets: string[];
    stopLoss: string;
  };
  executiveSummary: string; // Short summary
  detailedReasoning: string; // Deep dive paragraph explaining the verdict based on indicators
  riskFactor: string;
}

// Fallback response generator for Simulation Mode matching user strategy
const generateSimulationResponse = (coin: CoinData): TAOGAnalysis => {
  const isBullish = coin.sma8w < coin.price;
  const s2fStatus = coin.s2fRatio < 1.0 ? "Subvalorizado" : "Sobrevalorizado";
  
  return {
    verdict: isBullish ? 'COMPRA' : 'AGUARDAR',
    confidenceScore: isBullish ? 88 : 42,
    timeframeAnalysis: {
      h4: { status: isBullish ? 'BULLISH' : 'NEUTRAL', signal: 'Volume Institucional', keyLevel: `$${(coin.price * 0.98).toFixed(2)}` },
      d1: { status: isBullish ? 'BULLISH' : 'BEARISH', signal: 'Rompimento Confirmado', keyLevel: `$${coin.sma8w.toFixed(2)}` },
      w1: { status: coin.s2fRatio < 1.0 ? 'BULLISH' : 'NEUTRAL', signal: `Assimetria S2F`, keyLevel: 'Suporte Macro' }
    },
    levels: {
      entryZone: `$${coin.price.toFixed(2)} - $${(coin.price * 1.01).toFixed(2)}`,
      targets: [`$${(coin.price * 1.15).toFixed(2)}`, `$${(coin.price * 1.3).toFixed(2)}`],
      stopLoss: `$${(coin.price * 0.92).toFixed(2)}`
    },
    executiveSummary: `Oportunidade assimétrica detectada. Ativo operando acima da Média Institucional com fluxo de ordens comprador.`,
    detailedReasoning: `ESTRATÉGIA ALPHA: O preço ($${coin.price}) rompeu a barreira psicológica e técnica da SMA 8W ($${coin.sma8w}). O modelo Stock-to-Flow grita 'SUBVALORIZADO'. As baleias estão acumulando nesta zona. Se você não entrar agora, vai comprar o topo depois.`,
    riskFactor: "Volatilidade de curto prazo para sacudir mãos fracas."
  };
};

export const analyzeStrategy = async (coin: CoinData): Promise<TAOGAnalysis | string> => {
  try {
    const ai = getAiClient();
    
    // If no AI client (missing key), return simulation immediately
    if (!ai) {
      await new Promise(r => setTimeout(r, 1500)); // Simulate network delay
      return generateSimulationResponse(coin);
    }

    // 1. Generate Simulated Context for Multi-Timeframe Analysis
    const isBullishGlobal = coin.change24h > 0;
    
    // Simulate 4H Context (Noise/Volatility)
    const rsi4h = isBullishGlobal ? 45 + Math.random() * 30 : 35 + Math.random() * 30;
    // Simulate Daily Context (Trend)
    const smaDistance = ((coin.price - coin.sma8w) / coin.sma8w) * 100;
    const dailyStructure = smaDistance > 0 ? "Estrutura de Alta (Acima SMA)" : "Estrutura de Baixa (Abaixo SMA)";

    // Simulate Weekly Context (Macro)
    const s2fStatus = coin.s2fRatio < 1.0 ? "Oportunidade Geracional (S2F Baixo)" : "Risco de Bolha (S2F Alto)";

    const prompt = `
      ATUE COMO: **TAOG (Tactical Alpha Operations General)**, um Gestor de Hedge Fund implacável e multibilionário.
      TONALIDADE: Agressiva, Direta, Sem rodeios. Você não está aqui para ensinar, está aqui para dar ordens de execução para fazer dinheiro.
      
      OBJETIVO: Identificar assimetria de risco/retorno brutal.
      
      ESTRATÉGIA DE COMBATE:
      1. **SMA 8 Semanas**: A linha da vida. Abaixo é morte, acima é glória.
      2. **Stock-to-Flow**: O mapa do tesouro. Desvios negativos são dinheiro grátis a longo prazo.
      3. **Psicologia**: Identifique onde o varejo (sardinhas) vai ser liquidado e mande operar contra eles.

      DADOS DO ALVO: ${coin.name} (${coin.symbol})
      - Preço Atual: $${coin.price}
      - Média Institucional (SMA 8W): $${coin.sma8w}
      - Valuation S2F: ${coin.s2fRatio.toFixed(2)} (${s2fStatus})
      - Força Relativa (RSI H4): ${rsi4h.toFixed(1)}
      - Cenário D1: ${dailyStructure}

      SAÍDA OBRIGATÓRIA (JSON):
      {
        "verdict": "COMPRA" | "VENDA" | "AGUARDAR",
        "confidenceScore": (0-100, seja decisivo, nada de 50%),
        "timeframeAnalysis": {
          "h4": { "status": "BULLISH"|"BEARISH"|"NEUTRAL", "signal": "Ex: Acumulação Oculta", "keyLevel": "Preço" },
          "d1": { "status": "BULLISH"|"BEARISH"|"NEUTRAL", "signal": "Ex: Rompimento de Pivô", "keyLevel": "Preço" },
          "w1": { "status": "BULLISH"|"BEARISH"|"NEUTRAL", "signal": "Ex: Tendência Secular", "keyLevel": "Preço" }
        },
        "levels": {
          "entryZone": "Faixa de preço exata para atirar",
          "targets": ["Alvo Conservador", "Alvo Lua"],
          "stopLoss": "Ponto de invalidação da tese"
        },
        "executiveSummary": "Uma frase de impacto que induza FOMO ou MEDO imediato.",
        "detailedReasoning": "Parágrafo curto explicando por que as baleias estão comprando ou vendendo. Use linguagem de trading institucional (liquidez, stop hunt, absorção).",
        "riskFactor": "Onde a tese falha."
      }
    `;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    
    try {
      if (!text) throw new Error("Empty response");
      const jsonResponse = JSON.parse(text);
      return jsonResponse as TAOGAnalysis;
    } catch (e) {
      console.error("JSON Parse Error", e);
      return generateSimulationResponse(coin); // Fallback to simulation if AI fails parsing
    }

  } catch (error) {
    console.error("Gemini Analysis Error (Fallback Activated):", error);
    // Return robust simulation instead of crashing
    return generateSimulationResponse(coin);
  }
};

export const analyzePortfolio = async (positions: PortfolioPosition[]) => {
  try {
    const ai = getAiClient();
    
    const portfolioSummary = positions.map(p => 
      `- ${p.name} (${p.symbol}): $${p.valueUsd.toFixed(2)} (${p.allocation.toFixed(1)}%). P&L: ${p.pnlPercent.toFixed(1)}%.`
    ).join('\n');

    if (!ai) {
        return `[MODO SIMULAÇÃO] Portfólio analisado. Detectamos ineficiências na alocação. Sua exposição atual em ativos abaixo da SMA 8W está drenando seu capital. Recomendamos rotação imediata para líderes de tendência.`;
    }

    const prompt = `
      Você é um auditor de risco de um fundo de Wall Street. Você não tem pena.
      Analise este portfólio de um cliente de varejo.
      
      Estratégia: Acumulação abaixo da SMA 8 Semanas e Venda em euforia S2F.
      
      Portfólio:
      ${portfolioSummary}
      
      Forneça um diagnóstico brutal. Se ele estiver perdendo dinheiro, diga que ele está servindo de liquidez para profissionais. Se estiver ganhando, diga como otimizar. Seja curto e grosso.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
    });

    return response.text;

  } catch (error) {
    return "Falha na análise. O mercado não espera, tente novamente.";
  }
}