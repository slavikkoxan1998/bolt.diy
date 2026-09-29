import React, { useState, useEffect, useCallback } from 'react';
import { IconButton } from '~/components/ui/IconButton';
import type { ProviderInfo } from '~/types/model';
import Cookies from 'js-cookie';

interface APIKeyManagerProps {
  provider: ProviderInfo;
  apiKey: string;
  setApiKey: (key: string) => void;
  getApiKeyLink?: string;
  labelForGetApiKey?: string;
}

const providerEnvKeyStatusCache: Record<string, boolean> = {};
const apiKeyMemoizeCache: { [k: string]: Record<string, string> } = {};

export function getApiKeysFromCookies() {
  const storedApiKeys = Cookies.get('apiKeys');
  let parsedKeys: Record<string, string> = {};

  if (storedApiKeys) {
    parsedKeys = apiKeyMemoizeCache[storedApiKeys];
    if (!parsedKeys) {
      parsedKeys = apiKeyMemoizeCache[storedApiKeys] = JSON.parse(storedApiKeys);
    }
  }
  return parsedKeys;
}

export const APIKeyManager: React.FC<APIKeyManagerProps> = ({ provider, apiKey, setApiKey }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [isEnvKeySet, setIsEnvKeySet] = useState(false);

  useEffect(() => {
    const savedKeys = getApiKeysFromCookies();
    const savedKey = savedKeys[provider.name] || '';
    setTempKey(savedKey);
    setApiKey(savedKey);
    setIsEditing(false);
  }, [provider.name]);

  const checkEnvApiKey = useCallback(async () => {
    if (providerEnvKeyStatusCache[provider.name] !== undefined) {
      setIsEnvKeySet(providerEnvKeyStatusCache[provider.name]);
      return;
    }
    try {
      const response = await fetch(`/api/check-env-key?provider=${encodeURIComponent(provider.name)}`);
      const data = await response.json();
      const isSet = (data as { isSet: boolean }).isSet;
      providerEnvKeyStatusCache[provider.name] = isSet;
      setIsEnvKeySet(isSet);
    } catch (error) {
      console.error('Failed to check environment API key:', error);
      setIsEnvKeySet(false);
    }
  }, [provider.name]);

  useEffect(() => {
    checkEnvApiKey();
  }, [checkEnvApiKey]);

  const handleSave = () => {
    setApiKey(tempKey);
    const currentKeys = getApiKeysFromCookies();
    const newKeys = { ...currentKeys, [provider.name]: tempKey };
    Cookies.set('apiKeys', JSON.stringify(newKeys));
    setIsEditing(false);
  };

  if (provider.name === 'Google') {
    return (
      <div className="flex flex-col gap-3 py-4 px-3 bg-bolt-elements-background-depth-2 rounded-lg border border-bolt-elements-borderColor mt-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="i-ph:google-logo text-xl text-blue-500" />
          <h3 className="text-sm font-semibold text-bolt-elements-textPrimary">Авторизація Google (Gemini Pro)</h3>
        </div>
        
        {!apiKey && !isEnvKeySet && !isEditing ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-bolt-elements-textSecondary">
              Для використання моделей Gemini з вашої підписки, вам потрібно авторизуватись та отримати код доступу.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href={provider.getApiKeyLink || 'https://aistudio.google.com/app/apikey'} 
                target="_blank" 
                rel="noreferrer"
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-1.5 px-3 rounded flex items-center gap-2 transition-colors"
              >
                <div className="i-ph:link w-4 h-4" />
                Отримати код доступу
              </a>
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-bolt-elements-button-secondary-background hover:bg-bolt-elements-button-secondary-backgroundHover text-bolt-elements-button-secondary-text text-xs font-medium py-1.5 px-3 rounded transition-colors"
              >
                Ввести код
              </button>
            </div>
          </div>
        ) : isEditing ? (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-bolt-elements-textSecondary">Вставте отриманий код (API Key) нижче:</label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={tempKey}
                placeholder="AIzaSy..."
                onChange={(e) => setTempKey(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm rounded border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <IconButton onClick={handleSave} title="Зберегти" className="bg-green-500/10 hover:bg-green-500/20 text-green-500">
                <div className="i-ph:check w-4 h-4" />
              </IconButton>
              <IconButton onClick={() => setIsEditing(false)} title="Скасувати" className="bg-red-500/10 hover:bg-red-500/20 text-red-500">
                <div className="i-ph:x w-4 h-4" />
              </IconButton>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="i-ph:check-circle-fill text-green-500 w-4 h-4" />
              <span className="text-xs text-green-500">Авторизовано через {apiKey ? 'код доступу' : 'змінні середовища'}</span>
            </div>
            <IconButton onClick={() => setIsEditing(true)} title="Змінити код" className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500">
              <div className="i-ph:pencil-simple w-4 h-4" />
            </IconButton>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-3 px-1">
      <div className="flex items-center gap-2 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-bolt-elements-textSecondary">{provider?.name} API Key:</span>
          {!isEditing && (
            <div className="flex items-center gap-2">
              {apiKey ? (
                <>
                  <div className="i-ph:check-circle-fill text-green-500 w-4 h-4" />
                  <span className="text-xs text-green-500">Set via UI</span>
                </>
              ) : isEnvKeySet ? (
                <>
                  <div className="i-ph:check-circle-fill text-green-500 w-4 h-4" />
                  <span className="text-xs text-green-500">Set via environment variable</span>
                </>
              ) : (
                <>
                  <div className="i-ph:x-circle-fill text-red-500 w-4 h-4" />
                  <span className="text-xs text-red-500">Not Set (Please set via UI or ENV_VAR)</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={tempKey}
              placeholder="Enter API Key"
              onChange={(e) => setTempKey(e.target.value)}
              className="w-[300px] px-3 py-1.5 text-sm rounded border border-bolt-elements-borderColor 
                        bg-bolt-elements-prompt-background text-bolt-elements-textPrimary 
                        focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus"
            />
            <IconButton
              onClick={handleSave}
              title="Save API Key"
              className="bg-green-500/10 hover:bg-green-500/20 text-green-500"
            >
              <div className="i-ph:check w-4 h-4" />
            </IconButton>
            <IconButton
              onClick={() => setIsEditing(false)}
              title="Cancel"
              className="bg-red-500/10 hover:bg-red-500/20 text-red-500"
            >
              <div className="i-ph:x w-4 h-4" />
            </IconButton>
          </div>
        ) : (
          <>
            {
              <IconButton
                onClick={() => setIsEditing(true)}
                title="Edit API Key"
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500"
              >
                <div className="i-ph:pencil-simple w-4 h-4" />
              </IconButton>
            }
            {provider?.getApiKeyLink && !apiKey && (
              <IconButton
                onClick={() => window.open(provider?.getApiKeyLink)}
                title="Get API Key"
                className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 flex items-center gap-2"
              >
                <span className="text-xs whitespace-nowrap">{provider?.labelForGetApiKey || 'Get API Key'}</span>
                <div className={`${provider?.icon || 'i-ph:key'} w-4 h-4`} />
              </IconButton>
            )}
          </>
        )}
      </div>
    </div>
  );
};
