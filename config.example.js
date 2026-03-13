// ===================================
//   CREATIV AI DEMO — CONFIGURAÇÕES
//   Exemplo de arquivo de configuração
// ===================================

const CONFIG = {
  // ⚠️  COLOQUE SUA GEMINI API KEY AQUI
  //     Obtenha em: https://aistudio.google.com/app/apikey
  GEMINI_API_KEY: "SUA_CHAVE_AQUI",

  // Endpoint da Gemini API
  GEMINI_MODEL: "gemini-2.0-flash",

  // Webhook n8n para captura de leads (opcional)
  // Deixe vazio ("") para desativar
  N8N_WEBHOOK_URL: "",

  // Supabase
  SUPABASE_URL: "SUA_URL_SUPABASE",
  SUPABASE_ANON_KEY: "SUA_CHAVE_ANON_SUPABASE",

  // Dados dos setores para personalização
  SECTORS: {
    logistica: {
      label: "Transporte e Logística",
      icon: "🚛",
      benchmarks: {
        accidentRate: 0.042,
        fuelWaste: 0.18,
        idleTime: 0.22,
        costPerVehicle: 4800,
      }
    },
    mineracao: {
      label: "Mineração",
      icon: "⛏️",
      benchmarks: {
        accidentRate: 0.062,
        fuelWaste: 0.25,
        idleTime: 0.30,
        costPerVehicle: 12000,
      }
    },
    utilities: {
      label: "Utilities",
      icon: "⚡",
      benchmarks: {
        accidentRate: 0.035,
        fuelWaste: 0.15,
        idleTime: 0.20,
        costPerVehicle: 5500,
      }
    },
    sucroenergetico: {
      label: "Sucroenergético",
      icon: "🌾",
      benchmarks: {
        accidentRate: 0.055,
        fuelWaste: 0.22,
        idleTime: 0.28,
        costPerVehicle: 8500,
      }
    },
    florestal: {
      label: "Florestal",
      icon: "🌲",
      benchmarks: {
        accidentRate: 0.058,
        fuelWaste: 0.20,
        idleTime: 0.25,
        costPerVehicle: 7200,
      }
    },
    construcao: {
      label: "Construção",
      icon: "🏗️",
      benchmarks: {
        accidentRate: 0.048,
        fuelWaste: 0.19,
        idleTime: 0.26,
        costPerVehicle: 6800,
      }
    }
  }
};
