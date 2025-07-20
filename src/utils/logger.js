import { format } from 'date-fns';

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  formatMessage(level, message, data = null) {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(data && { data })
    };
    
    return JSON.stringify(logEntry);
  }

  info(message, data = null) {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  warn(message, data = null) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message, data = null) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, data));
    }
  }

  debug(message, data = null) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  shouldLog(level) {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  // Specialized logging for LangChain operations
  logLangChainOperation(operation, input, output, duration = null) {
    this.info(`LangChain ${operation}`, {
      input: typeof input === 'string' ? input.substring(0, 100) + '...' : input,
      output: typeof output === 'string' ? output.substring(0, 100) + '...' : output,
      duration: duration ? `${duration}ms` : null
    });
  }

  logApiRequest(method, path, statusCode, duration = null) {
    this.info(`API ${method} ${path}`, {
      statusCode,
      duration: duration ? `${duration}ms` : null
    });
  }
}

export const logger = new Logger(); 