/**
 * Logger utility for Mastra components
 * Provides consistent logging across the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  userId?: string;
  error?: Error | unknown;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const component = context?.component ? `[${context.component}]` : '';
    return `${timestamp} ${level.toUpperCase()} ${component} ${message}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const formattedMessage = this.formatMessage(level, message, context);
    
    // In development, always log to console
    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          console.debug(formattedMessage, context);
          break;
        case 'info':
          console.info(formattedMessage, context);
          break;
        case 'warn':
          console.warn(formattedMessage, context);
          break;
        case 'error':
          console.error(formattedMessage, context);
          break;
      }
    }
    
    // In production, you could send to a logging service
    // For now, we'll suppress non-error logs in production
    if (!this.isDevelopment && level === 'error') {
      console.error(formattedMessage, context);
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }
}

export const logger = new Logger();