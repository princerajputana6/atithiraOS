import pino from "pino";
import { getEnv } from "@atithira/config";

/**
 * Structured JSON logging — every log line is a queryable event, per the
 * master plan's "observable by default" principle. Call logger.child({...})
 * to attach tenantId/requestId context rather than interpolating it into
 * the message string.
 */
export const logger = pino({
  level: getEnv().LOG_LEVEL,
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
