process.env.NODE_ENV === "development"
  ? require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` })
  : require("dotenv").config();

const { default: slugify } = require("slugify");
const { isValidUrl, safeJsonParse } = require("../utils/http");
const prisma = require("../utils/prisma");
const { v4 } = require("uuid");
const { MetaGenerator } = require("../utils/boot/MetaGenerator");

function isNullOrNaN(value) {
  if (value === null) return true;
  return isNaN(value);
}

const SystemSettings = {
  protectedFields: ["multi_user_mode", "hub_api_key"],
  publicFields: [
    "footer_data",
    "support_email",
    "text_splitter_chunk_size",
    "text_splitter_chunk_overlap",
    "max_embed_chunk_size",
    "agent_search_provider",
    "agent_sql_connections",
    "default_agent_skills",
    "disabled_agent_skills",
    "imported_agent_skills",
    "custom_app_name",
    "feature_flags",
    "meta_page_title",
    "meta_page_favicon",
    "ontiblock_node_url",
    "ontiblock_network_id"
  ],
  supportedFields: [
    "logo_filename",
    "telemetry_id",
    "footer_data",
    "support_email",
    "text_splitter_chunk_size",
    "text_splitter_chunk_overlap",
    "agent_search_provider",
    "default_agent_skills",
    "disabled_agent_skills",
    "agent_sql_connections",
    "custom_app_name",
    "meta_page_title",
    "meta_page_favicon",
    "experimental_live_file_sync",
    "hub_api_key",
    "ontiblock_node_url",
    "ontiblock_wallet_address",
    "ontiblock_network_id",
    "ontiblock_gas_price",
    "ontiblock_gas_limit"
  ],
  validations: {
    ontiblock_node_url: (url) => {
      try {
        if (!url) return null;
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol))
          throw new Error('Invalid protocol');
        return parsed.toString();
      } catch (e) {
        console.error('Invalid OntiBlock node URL', e.message);
        return null;
      }
    },
    ontiblock_wallet_address: (address) => {
      try {
        if (!address) return null;
        if (!/^0x[a-fA-F0-9]{40}$/.test(address))
          throw new Error('Invalid wallet address format');
        return address;
      } catch (e) {
        console.error('Invalid OntiBlock wallet address', e.message);
        return null;
      }
    },
    ontiblock_network_id: (id) => {
      try {
        if (!id) return 1; // default to mainnet
        const num = Number(id);
        if (isNaN(num) || num < 1)
          throw new Error('Network ID must be positive number');
        return num;
      } catch (e) {
        console.error('Invalid OntiBlock network ID', e.message);
        return 1;
      }
    },
    ontiblock_gas_price: (price) => {
      try {
        if (!price) return null;
        const num = Number(price);
        if (isNaN(num) || num <= 0)
          throw new Error('Gas price must be positive number');
        return num;
      } catch (e) {
        console.error('Invalid OntiBlock gas price', e.message);
        return null;
      }
    },
    ontiblock_gas_limit: (limit) => {
      try {
        if (!limit) return null;
        const num = Number(limit);
        if (isNaN(num) || num <= 0)
          throw new Error('Gas limit must be positive number');
        return num;
      } catch (e) {
        console.error('Invalid OntiBlock gas limit', e.message);
        return null;
      }
    },
    footer_data: (updates) => {
      try {
        const array = JSON.parse(updates)
          .filter((setting) => isValidUrl(setting.url))
          .slice(0, 3); // max of 3 items in footer.
        return JSON.stringify(array);
      } catch (e) {
        console.error(`Failed to run validation function on footer_data`);
        return JSON.stringify([]);
      }
    },
    agent_sql_connections: async (updates) => {
      const existingConnections = safeJsonParse(
        (await SystemSettings.get({ label: "agent_sql_connections" }))?.value,
        []
      );
      try {
        const updatedConnections = mergeConnections(
          existingConnections,
          safeJsonParse(updates, [])
        );
        return JSON.stringify(updatedConnections);
      } catch (e) {
        console.error(`Failed to merge connections`);
        return JSON.stringify(existingConnections ?? []);
      }
    },
    experimental_live_file_sync: (update) => {
      if (typeof update === "boolean")
        return update === true ? "enabled" : "disabled";
      if (!["enabled", "disabled"].includes(update)) return "disabled";
      return String(update);
    },
    meta_page_title: (newTitle) => {
      try {
        if (typeof newTitle !== "string" || !newTitle) return null;
        return String(newTitle);
      } catch {
        return null;
      } finally {
        new MetaGenerator().clearConfig();
      }
    },
    meta_page_favicon: (faviconUrl) => {
      if (!faviconUrl) return null;
      try {
        const url = new URL(faviconUrl);
        return url.toString();
      } catch {
        return null;
      } finally {
        new MetaGenerator().clearConfig();
      }
    },
    hub_api_key: (apiKey) => {
      if (!apiKey) return null;
      return String(apiKey);
    }
  },
  currentSettings: async function () {
    const { hasVectorCachedFiles } = require("../utils/files");
    const llmProvider = process.env.LLM_PROVIDER;
    const vectorDB = process.env.VECTOR_DB;
    return {
      // --------------------------------------------------------
      // General Settings
      // --------------------------------------------------------
      RequiresAuth: !!process.env.AUTH_TOKEN,
      AuthToken: !!process.env.AUTH_TOKEN,
      JWTSecret: !!process.env.JWT_SECRET,
      StorageDir: process.env.STORAGE_DIR,
      MultiUserMode: await this.isMultiUserMode(),
      DisableTelemetry: process.env.DISABLE_TELEMETRY || "false",

      // --------------------------------------------------------
      // Embedder Provider Selection Settings & Configs
      // --------------------------------------------------------
      EmbeddingEngine: process.env.EMBEDDING_ENGINE,
      HasExistingEmbeddings: await this.hasEmbeddings(), // check if they have any currently embedded documents active in workspaces.
      HasCachedEmbeddings: hasVectorCachedFiles(), // check if they any currently cached embedded docs.
      EmbeddingBasePath: process.env.EMBEDDING_BASE_PATH,
      EmbeddingModelPref: process.env.EMBEDDING_MODEL_PREF,
      EmbeddingModelMaxChunkLength:
        process.env.EMBEDDING_MODEL_MAX_CHUNK_LENGTH,
      VoyageAiApiKey: !!process.env.VOYAGEAI_API_KEY,
      GenericOpenAiEmbeddingApiKey:
        !!process.env.GENERIC_OPEN_AI_EMBEDDING_API_KEY,
      GenericOpenAiEmbeddingMaxConcurrentChunks:
        process.env.GENERIC_OPEN_AI_EMBEDDING_MAX_CONCURRENT_CHUNKS || 500,
      GeminiEmbeddingApiKey: !!process.env.GEMINI_EMBEDDING_API_KEY,

      // --------------------------------------------------------
      // VectorDB Provider Selection Settings & Configs
      // --------------------------------------------------------
      VectorDB: vectorDB,
      ...this.vectorDBPreferenceKeys(),

      // --------------------------------------------------------
      // LLM Provider Selection Settings & Configs
      // --------------------------------------------------------
      LLMProvider: llmProvider,
      ...this.llmPreferenceKeys(),

      // --------------------------------------------------------
      // Whisper (Audio transcription) Selection Settings & Configs
      // - Currently the only 3rd party is OpenAI, so is OPEN_AI_KEY is set
      // - then it can be shared.
      // --------------------------------------------------------
      WhisperProvider: process.env.WHISPER_PROVIDER || "local",
      WhisperModelPref:
        process.env.WHISPER_MODEL_PREF || "Xenova/whisper-small",

      // --------------------------------------------------------
      // TTS/STT  Selection Settings & Configs
      // - Currently the only 3rd party is OpenAI or the native browser-built in
      // --------------------------------------------------------
      TextToSpeechProvider: process.env.TTS_PROVIDER || "native",
      TTSOpenAIKey: !!process.env.TTS_OPEN_AI_KEY,
      TTSOpenAIVoiceModel: process.env.TTS_OPEN_AI_VOICE_MODEL,

      // Eleven Labs TTS
      TTSElevenLabsKey: !!process.env.TTS_ELEVEN_LABS_KEY,
      TTSElevenLabsVoiceModel: process.env.TTS_ELEVEN_LABS_VOICE_MODEL,
      // Piper TTS
      TTSPiperTTSVoiceModel:
        process.env.TTS_PIPER_VOICE_MODEL ?? "en_US-hfc_female-medium",
      // OpenAI Generic TTS
      TTSOpenAICompatibleKey: !!process.env.TTS_OPEN_AI_COMPATIBLE_KEY,
      TTSOpenAICompatibleVoiceModel:
        process.env.TTS_OPEN_AI_COMPATIBLE_VOICE_MODEL,
      TTSOpenAICompatibleEndpoint: process.env.TTS_OPEN_AI_COMPATIBLE_ENDPOINT,

      // --------------------------------------------------------
      // Agent Settings & Configs
      // --------------------------------------------------------
      AgentGoogleSearchEngineId: process.env.AGENT_GSE_CTX || null,
      AgentGoogleSearchEngineKey: !!process.env.AGENT_GSE_KEY || null,
      AgentSearchApiKey: !!process.env.AGENT_SEARCHAPI_API_KEY || null,
      AgentSearchApiEngine: process.env.AGENT_SEARCHAPI_ENGINE || "google",
      AgentSerperApiKey: !!process.env.AGENT_SERPER_DEV_KEY || null,
      AgentBingSearchApiKey: !!process.env.AGENT_BING_SEARCH_API_KEY || null,
      AgentSerplyApiKey: !!process.env.AGENT_SERPLY_API_KEY || null,
      AgentSearXNGApiUrl: process.env.AGENT_SEARXNG_API_URL || null,
      AgentTavilyApiKey: !!process.env.AGENT_TAVILY_API_KEY || null,

      // --------------------------------------------------------
      // Compliance Settings
      // --------------------------------------------------------
      // Disable View Chat History for the whole instance.
      DisableViewChatHistory:
