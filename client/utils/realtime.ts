import { SummifyAPI } from "./api";

// Real-time sync utilities for SummifyAI
export class RealtimeSync {
  private static syncInterval: NodeJS.Timeout | null = null;
  private static callbacks: Array<(data: any) => void> = [];

  // Start periodic sync for user data
  static startSync(userId: string, intervalMs: number = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncUserData(userId);
      } catch (error) {
        console.warn("Background sync failed:", error);
      }
    }, intervalMs);
  }

  // Stop the sync
  static stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Subscribe to real-time updates
  static subscribe(callback: (data: any) => void) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  // Emit updates to all subscribers
  private static emit(data: any) {
    this.callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("Callback error:", error);
      }
    });
  }

  // Sync user data with backend
  private static async syncUserData(userId: string) {
    try {
      // Get latest user data from backend
      const userData = await SummifyAPI.getUserByEmail("current"); // This would need the current user's email

      if (userData) {
        this.emit({
          type: "USER_UPDATED",
          data: userData,
        });
      }
    } catch (error) {
      console.warn("User sync failed:", error);
    }
  }

  // Real-time credit updates
  static async updateCredits(userId: string, amount: number, reason: string) {
    try {
      const newBalance = await SummifyAPI.addCredits(
        parseInt(userId),
        amount,
        reason,
      );

      this.emit({
        type: "CREDITS_UPDATED",
        data: { newBalance, amount, reason },
      });

      return newBalance;
    } catch (error) {
      console.error("Credit update failed:", error);
      throw error;
    }
  }

  // Real-time sharing tracking
  static async trackShare(
    userId: string,
    summaryId: string,
    shareType: string,
  ) {
    try {
      await SummifyAPI.recordShare(
        parseInt(userId),
        parseInt(summaryId),
        shareType,
      );

      this.emit({
        type: "SHARE_RECORDED",
        data: { summaryId, shareType, timestamp: new Date().toISOString() },
      });

      // Award credit for sharing
      await this.updateCredits(userId, 1, `Shared ${shareType}`);
    } catch (error) {
      console.error("Share tracking failed:", error);
      throw error;
    }
  }

  // Real-time summary creation tracking
  static async createSummary(userId: string, summaryData: any) {
    try {
      const summary = await SummifyAPI.createSummary({
        userId: parseInt(userId),
        topic: summaryData.topic,
        content: summaryData.content,
        keyInsights: summaryData.keyInsights || [],
      });

      this.emit({
        type: "SUMMARY_CREATED",
        data: summary,
      });

      return summary;
    } catch (error) {
      console.error("Summary creation failed:", error);
      throw error;
    }
  }

  // Analytics tracking
  static trackEvent(eventName: string, properties: Record<string, any> = {}) {
    try {
      // Send analytics event to backend
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: eventName,
          properties: {
            ...properties,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
          },
        }),
      }).catch((error) => {
        console.warn("Analytics tracking failed:", error);
      });

      // Also store locally for fallback
      const events = JSON.parse(
        localStorage.getItem("analytics_events") || "[]",
      );
      events.push({
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
      });

      // Keep only last 100 events locally
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }

      localStorage.setItem("analytics_events", JSON.stringify(events));
    } catch (error) {
      console.error("Event tracking failed:", error);
    }
  }

  // Performance monitoring
  static measurePerformance(
    operationName: string,
    operation: () => Promise<any>,
  ) {
    const startTime = performance.now();

    return operation().finally(() => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.trackEvent("performance_measurement", {
        operation: operationName,
        duration: Math.round(duration),
        timestamp: new Date().toISOString(),
      });
    });
  }

  // Connection status monitoring
  static monitorConnection() {
    const updateConnectionStatus = () => {
      this.emit({
        type: "CONNECTION_STATUS",
        data: {
          online: navigator.onLine,
          timestamp: new Date().toISOString(),
        },
      });
    };

    window.addEventListener("online", updateConnectionStatus);
    window.addEventListener("offline", updateConnectionStatus);

    // Initial status
    updateConnectionStatus();

    // Return cleanup function
    return () => {
      window.removeEventListener("online", updateConnectionStatus);
      window.removeEventListener("offline", updateConnectionStatus);
    };
  }

  // Queue operations for offline support
  private static operationQueue: Array<{
    id: string;
    operation: () => Promise<any>;
    retries: number;
    maxRetries: number;
  }> = [];

  static queueOperation(operation: () => Promise<any>, maxRetries: number = 3) {
    const id = Math.random().toString(36).substr(2, 9);

    this.operationQueue.push({
      id,
      operation,
      retries: 0,
      maxRetries,
    });

    // Process queue if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return id;
  }

  private static async processQueue() {
    if (this.operationQueue.length === 0) return;

    const item = this.operationQueue[0];

    try {
      await item.operation();
      this.operationQueue.shift(); // Remove successful operation

      // Process next item
      if (this.operationQueue.length > 0) {
        setTimeout(() => this.processQueue(), 100);
      }
    } catch (error) {
      item.retries++;

      if (item.retries >= item.maxRetries) {
        console.error(
          `Operation ${item.id} failed after ${item.maxRetries} retries:`,
          error,
        );
        this.operationQueue.shift(); // Remove failed operation
      } else {
        console.warn(
          `Operation ${item.id} failed, retrying (${item.retries}/${item.maxRetries}):`,
          error,
        );
      }

      // Process next item or retry after delay
      setTimeout(() => this.processQueue(), item.retries * 1000);
    }
  }

  // Auto-save functionality
  static setupAutoSave(
    data: () => any,
    saveFunction: (data: any) => Promise<void>,
    intervalMs: number = 10000,
  ) {
    let lastSavedData = JSON.stringify(data());

    const autoSaveInterval = setInterval(async () => {
      const currentData = data();
      const currentDataStr = JSON.stringify(currentData);

      if (currentDataStr !== lastSavedData) {
        try {
          await saveFunction(currentData);
          lastSavedData = currentDataStr;

          this.emit({
            type: "AUTO_SAVE_SUCCESS",
            data: { timestamp: new Date().toISOString() },
          });
        } catch (error) {
          console.warn("Auto-save failed:", error);

          this.emit({
            type: "AUTO_SAVE_FAILED",
            data: { error: error.message, timestamp: new Date().toISOString() },
          });
        }
      }
    }, intervalMs);

    return () => clearInterval(autoSaveInterval);
  }
}

// Export utility functions for easy use
export const trackEvent = RealtimeSync.trackEvent.bind(RealtimeSync);
export const measurePerformance =
  RealtimeSync.measurePerformance.bind(RealtimeSync);
export const queueOperation = RealtimeSync.queueOperation.bind(RealtimeSync);
