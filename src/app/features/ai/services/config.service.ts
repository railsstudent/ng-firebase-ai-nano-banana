import remoteConfigDefaults from '@/firebase/remote_config_defaults.json';
import config from '@/public/config.json';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, isDevMode } from '@angular/core';
import { ThinkingConfig, ThinkingLevel, Tool } from 'firebase/ai';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { connectFunctionsEmulator, Functions, getFunctions } from 'firebase/functions';
import { fetchAndActivate, getRemoteConfig, getValue, RemoteConfig } from 'firebase/remote-config';
import { catchError, lastValueFrom, throwError } from 'rxjs';
import { FirebaseConfigResponse } from '../types/firebase-config.type';

@Injectable({
  providedIn: 'root'
})
export class ConfigService  {
    #appInstance: FirebaseApp | null = null;
    #remoteConfig: RemoteConfig | null = null;
    #functions: Functions | null = null;
    #thinkingConfig: ThinkingConfig | null = null;
    #tools: Tool[] | undefined = undefined;
    #modelName: string | null = null;

    get app(): FirebaseApp {
      if (!this.#appInstance) {
        throw new Error('FirebaseApp is not initialized yet.');
      }
      return this.#appInstance;
    }

    get remoteConfig(): RemoteConfig {
      if (!this.#remoteConfig) {
        throw new Error('RemoteConfig is not initialized yet.');
      }
      return this.#remoteConfig;
    }

    get functions(): Functions {
      if (!this.#functions) {
        throw new Error('Functions is not initialized yet.');
      }
      return this.#functions;
    }

    get thinkingConfig(): ThinkingConfig {
      if (!this.#thinkingConfig) {
        throw new Error('ThinkingConfig is not initialized yet.');
      }
      return this.#thinkingConfig;
    }

    get tools(): Tool[] {
      if (!this.#tools) {
        throw new Error('Tools are not initialized yet.');
      }
      return this.#tools;
    }

    get modelName(): string {
      if (!this.#modelName) {
        throw new Error('Model name is not initialized yet.');
      }
      return this.#modelName;
    }

    private async loadFirebaseConfig() {
      const httpService = inject(HttpClient);
      const firebaseConfig$ =
        httpService.get<FirebaseConfigResponse>(`${config.getFirebaseConfigUrl}`)
          .pipe(
            catchError((e) => throwError(() => e))
          );
      return lastValueFrom(firebaseConfig$);
    }

    private createThinkingConfig() {
      console.log('Creating thinking config for model:', this.modelName);

      if (['gemini-3.1-flash-image'].includes(this.modelName)) {
        const rawThinkingLevel = getValue(this.remoteConfig, 'thinkingLevel').asString();
        const thinkingLevel = ThinkingLevel[rawThinkingLevel as keyof typeof ThinkingLevel];

        const thinkingConfig: ThinkingConfig = {
          thinkingLevel,
          includeThoughts: true,
        };

        return {
          thinkingConfig,
          tools: [
            {
              googleSearch: {}
            }
          ],
        };
      }

      return {
        thinkingConfig: {
          includeThoughts: true,
          thinkingBudget: 1024,
        }
      };
    }

    private connectEmulators() {
      const functionRegion = getValue(this.remoteConfig, 'functionRegion').asString();
      this.#functions = getFunctions(this.app, functionRegion);
      console.log('configService -> functions region', this.#functions.region);

      const useEmulators = getValue(this.remoteConfig, 'useEmulators').asBoolean();
      if (useEmulators) {
        console.log('Connecting to emulators...');
        const host = getValue(this.remoteConfig, 'functionEmulatorHost').asString();
        const port = getValue(this.remoteConfig, 'functionEmulatorPort').asNumber();
        console.log('functionEmulator', `${host}:${port}`);
        connectFunctionsEmulator(this.#functions, host, port);
      }
    }

    async initialize() {
      try {
        const firebaseConfig = await this.loadFirebaseConfig();
        const { app, recaptchaSiteKey } = firebaseConfig;

        this.#appInstance = initializeApp(app);
        if (recaptchaSiteKey) {
          (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = isDevMode();
          initializeAppCheck(this.#appInstance, {
            provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
            isTokenAutoRefreshEnabled: true,
          });
        }

        this.#remoteConfig = getRemoteConfig(this.#appInstance);
        this.#remoteConfig.settings.minimumFetchIntervalMillis = isDevMode() ? 0 : 3600000;
        this.#remoteConfig.defaultConfig = remoteConfigDefaults;
        try {
          const activated = await fetchAndActivate(this.#remoteConfig);
          console.log('Remote Config initialized. Activated new values:', activated);
        } catch (error) {
          console.error('Failed to fetch and activate remote config:', error);
        }

        this.#modelName = getValue(this.remoteConfig, 'geminiImageModelName').asString();;
        const { thinkingConfig, tools } = this.createThinkingConfig();
        this.#thinkingConfig = thinkingConfig;
        this.#tools = tools;

        this.connectEmulators();
      } catch (err) {
        console.error(err);
      }
    }
}
