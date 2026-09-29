import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export default class AnthropicProvider extends BaseProvider {
  name = 'Anthropic';
  getApiKeyLink = 'https://console.anthropic.com/settings/keys';

  config = {
    apiTokenKey: 'ANTHROPIC_API_KEY',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'claude-sonnet-4-6',
      label: 'Claude Sonnet 4.6 (Thinking)',
      provider: 'Anthropic',
      maxTokenAllowed: 2000000,
      maxCompletionTokens: 65536,
    },
    {
      name: 'claude-opus-4-6-thinking',
      label: 'Claude Opus 4.6 (Thinking)',
      provider: 'Anthropic',
      maxTokenAllowed: 2000000,
      maxCompletionTokens: 65536,
    },
  ];

  async getDynamicModels(): Promise<ModelInfo[]> {
    return this.staticModels;
  }

  getModelInstance(options: {
    model: string;
    serverEnv: any;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model } = options;

    const openai = createOpenAI({
      baseURL: 'http://172.17.0.1:4000/v1',
      apiKey: 'sk-office-5e845122f5c349a0cd05c32ae38cb9ab',
    });

    return openai(model);
  }
}
