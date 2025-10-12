import { Injectable, signal, WritableSignal } from '@angular/core';

const MAX_HISTORY_SIZE = 5;
const STORAGE_PREFIX = 'promptHistory_';

@Injectable({
  providedIn: 'root',
})
export class PromptHistoryService {
  private historySignals = new Map<string, WritableSignal<string[]>>();

  private getHistorySignal(key: string): WritableSignal<string[]> {
    if (!this.historySignals.has(key)) {
      const storedHistory = this.loadHistoryFromStorage(key);
      this.historySignals.set(key, signal<string[]>(storedHistory));
    }
    return this.historySignals.get(key)!;
  }

  private loadHistoryFromStorage(key: string): string[] {
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return item ? JSON.parse(item) : [];
    } catch (e) {
      console.error('Failed to load prompt history from localStorage', e);
      return [];
    }
  }

  private saveHistoryToStorage(key: string, history: string[]): void {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save prompt history to localStorage', e);
    }
  }

  getHistory(key: string): WritableSignal<string[]> {
    return this.getHistorySignal(key);
  }

  addPrompt(key: string, prompt: string): void {
    const historySignal = this.getHistorySignal(key);
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return;
    }

    historySignal.update(history => {
      const newHistory = [trimmedPrompt, ...history.filter(p => p !== trimmedPrompt)];
      const finalHistory = newHistory.slice(0, MAX_HISTORY_SIZE);
      this.saveHistoryToStorage(key, finalHistory);
      return finalHistory;
    });
  }

  clearHistory(key: string): void {
    const historySignal = this.getHistorySignal(key);
    historySignal.set([]);
    this.saveHistoryToStorage(key, []);
  }
}
