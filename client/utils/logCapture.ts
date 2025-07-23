// Log capture system for real-time monitoring
interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  source?: string;
}

class LogCapture {
  private logs: LogEntry[] = [];
  private listeners: ((logs: LogEntry[]) => void)[] = [];
  private maxLogs = 1000;
  private originalConsole: {
    log: typeof console.log;
    info: typeof console.info;
    warn: typeof console.warn;
    error: typeof console.error;
    debug: typeof console.debug;
  };

  constructor() {
    this.originalConsole = {
      log: console.log.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      debug: console.debug.bind(console),
    };

    this.interceptConsole();
  }

  private interceptConsole() {
    console.log = (...args) => {
      this.addLog('log', args);
      this.originalConsole.log(...args);
    };

    console.info = (...args) => {
      this.addLog('info', args);
      this.originalConsole.info(...args);
    };

    console.warn = (...args) => {
      this.addLog('warn', args);
      this.originalConsole.warn(...args);
    };

    console.error = (...args) => {
      this.addLog('error', args);
      this.originalConsole.error(...args);
    };

    console.debug = (...args) => {
      this.addLog('debug', args);
      this.originalConsole.debug(...args);
    };
  }

  private addLog(level: LogEntry['level'], args: any[]) {
    const message = args
      .map(arg => {
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(' ');

    const logEntry: LogEntry = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      level,
      message,
      data: args.length > 1 ? args.slice(1) : undefined,
      source: this.detectSource(message),
    };

    this.logs.unshift(logEntry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Notify listeners
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  private detectSource(message: string): string {
    if (message.includes('🧠') || message.includes('OpenAI') || message.includes('AI')) {
      return 'AI';
    }
    if (message.includes('🔗') || message.includes('Supabase') || message.includes('Database')) {
      return 'Database';
    }
    if (message.includes('🏥') || message.includes('Health')) {
      return 'Health';
    }
    if (message.includes('🔍') || message.includes('Search')) {
      return 'Search';
    }
    if (message.includes('❌') || message.includes('Error')) {
      return 'Error';
    }
    if (message.includes('✅') || message.includes('Success')) {
      return 'Success';
    }
    return 'General';
  }

  subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.push(listener);
    // Send current logs immediately
    listener([...this.logs]);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.listeners.forEach(listener => listener([]));
  }

  exportLogs(): string {
    return this.logs
      .map(log => 
        `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`
      )
      .join('\n');
  }
}

// Create singleton instance
export const logCapture = new LogCapture();

// Export types
export type { LogEntry };
