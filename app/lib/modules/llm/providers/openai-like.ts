import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export default class OpenAILikeProvider extends BaseProvider {
  name = 'OpenAILike';
  getApiKeyLink = '';

  config = {
    baseUrlKey: 'OPENAI_LIKE_API_BASE_URL',
    apiTokenKey: 'OPENAI_LIKE_API_KEY',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'gpt-oss-120b-medium',
      label: 'GPT-OSS 120B (Medium)',
      provider: 'OpenAILike',
      maxTokenAllowed: 128000,
      maxCompletionTokens: 8192,
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
