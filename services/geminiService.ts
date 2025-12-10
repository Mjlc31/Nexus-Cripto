import { GoogleGenAI } from "@google/genai";
import { CoinData, PortfolioPosition } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const analyzeStrategy = async (coin: CoinData): Promise<TAOGAnalysis | string> => {
  try {
    // 1. Generate Simulated Context for Multi-Timeframe Analysis
    // Since we don't have a real historical API in this demo, we simulate technical states 
    // to give the AI "substance" to analyze.
    
    const isBullishGlobal = coin.change24h > 0;
    
    // Simulate 4H Context (Noise/Volatility)
    const rsi4h = isBullishGlobal ? 45 + Math.random() * 30 : 35 + Math.random() * 30;
    const macd4h = Math.random() > 0.5 ? "Crossover Bullish" : "Divergência Bearish";
    
    // Simulate Daily Context (Trend)
    const smaDistance = ((coin.price - coin.sma8w) / coin.sma8w) * 100;
    const dailyStructure = smaDistance > 0 ? "Acima da SMA 8-Semanas" : "Abaixo da SMA 8-Semanas";
    const supertrendState = coin.supertrend;

    // Simulate Weekly Context (Macro)
    const s2fStatus = coin.s2fRatio < 1.0 ? "Subvalorizado (S2F)" : "Sobrevalorizado (S2F)";
    const weeklyVolume = isBullishGlobal ? "Crescente" : "Decrescente";

    const prompt = `
      Você é o **TAOG (Technical Analysis Operations General)** v3.0, o motor analítico institucional do Nexus Pro.
      Sua missão é analisar múltiplos timeframes e gerar uma tese de investimento profissional.

      DADOS TÉCNICOS DO ATIVO: ${coin.name} (${coin.symbol})
      Preço Atual: $${coin.price}
      
      CONTEXTO TÉCNICO DETECTADO (Input do Sistema):
      [H4 - Intraday] RSI: ${rsi4h.toFixed(1)}, MACD: ${macd4h}. Volatilidade de curto prazo.
      [D1 - Swing] Estrutura: ${dailyStructure}. SuperTrend: ${supertrendState}. Tendência principal.
      [W1 - Macro] Stock-to-Flow: ${coin.s2fRatio.toFixed(2)} (${s2fStatus}). Volume Semanal: ${weeklyVolume}.

      Gere um relatório JSON estrito com a seguinte estrutura:
      {
        "verdict": "COMPRA" | "VENDA" | "AGUARDAR",
        "confidenceScore": (número 0-100),
        "timeframeAnalysis": {
          "h4": { "status": "BULLISH"|"BEARISH"|"NEUTRAL", "signal": "Ex: Bandeira de Alta / RSI Sobrevendido", "keyLevel": "Nível chave intraday" },
          "d1": { "status": "BULLISH"|"BEARISH"|"NEUTRAL", "signal": "Ex: Rompimento SMA 8Sem / Rejeição Fibbo", "keyLevel": "Suporte/Resistência principal" },
          "w1": { "status": "BULLISH"|"BEARISH"|"NEUTRAL", "signal": "Ex: Estrutura de Fundo / Topo Duplo", "keyLevel": "Nível Macro" }
        },
        "levels": {
          "entryZone": "faixa de preço exata",
          "targets": ["alvo 1 (conservador)", "alvo 2 (agressivo)"],
          "stopLoss": "preço de invalidação técnica"
        },
        "executiveSummary": "Uma frase de impacto resumindo a oportunidade.",
        "detailedReasoning": "Um parágrafo denso (max 300 caracteres) explicando O PORQUÊ do veredito. Cite explicitamente a confluência entre o gráfico Diário e o Semanal. Mencione a relação com a SMA de 8 semanas e o Stock-to-Flow.",
        "riskFactor": "O principal risco técnico desta operação."
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
    
    // Parse JSON safely
    try {
      const jsonResponse = JSON.parse(text);
      return jsonResponse as TAOGAnalysis;
    } catch (e) {
      console.error("JSON Parse Error", e);
      return text; // Fallback to raw text if JSON fails
    }

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      verdict: 'AGUARDAR',
      confidenceScore: 0,
      timeframeAnalysis: {
        h4: { status: 'NEUTRAL', signal: 'Sem dados', keyLevel: '-' },
        d1: { status: 'NEUTRAL', signal: 'Sem dados', keyLevel: '-' },
        w1: { status: 'NEUTRAL', signal: 'Sem dados', keyLevel: '-' }
      },
      levels: { entryZone: '-', targets: ['-'], stopLoss: '-' },
      executiveSummary: "Sistema offline.",
      detailedReasoning: "Não foi possível conectar ao núcleo neural do TAOG para processar os dados multi-timeframe.",
      riskFactor: "Desconexão da API"
    };
  }
};

export const analyzePortfolio = async (positions: PortfolioPosition[]) => {
  try {
    const portfolioSummary = positions.map(p => 
      `- ${p.name} (${p.symbol}): $${p.valueUsd.toFixed(2)} (${p.allocation.toFixed(1)}%). P&L: ${p.pnlPercent.toFixed(1)}%.`
    ).join('\n');

    const prompt = `
      Aqui é o **TAOG**. Analise este portfólio cripto:
      ${portfolioSummary}
      
      Gere um relatório tático curto e direto focando em:
      1. Risco vs Retorno atual.
      2. Sugestão de rebalanceamento baseada em lucro excessivo ou proteção de capital.
      3. Nota de 0 a 10.
      
      Estilo: Profissional, direto, institucional.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
    });

    return response.text;

  } catch (error) {
    return "Falha na análise do portfólio.";
  }
}