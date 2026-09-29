import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export default class GoogleProvider extends BaseProvider {
  name = 'Google';
  getApiKeyLink = '';

  config = {
    apiTokenKey: 'GOOGLE_GENERATIVE_AI_API_KEY',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'gemini-3.8-flash',
      label: 'Gemini 3.8 Flash',
      provider: 'Google',
      maxTokenAllowed: 1000000,
      maxCompletionTokens: 16384,
    },
    {
      name: 'gemini-3.7-flash',
      label: 'Gemini 3.7 Flash',
      provider: 'Google',
      maxTokenAllowed: 1000000,
      maxCompletionTokens: 16384,
    },
    {
      name: 'gemini-3.6-flash',
      label: 'Gemini 3.6 Flash',
      provider: 'Google',
      maxTokenAllowed: 1000000,
      maxCompletionTokens: 16384,
    },
    {
      name: 'gemini-3.1-pro',
      label: 'Gemini 3.1 Pro',
      provider: 'Google',
      maxTokenAllowed: 2000000,
      maxCompletionTokens: 16384,
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
