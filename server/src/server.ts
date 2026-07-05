import { httpServer } from './app';
import { config } from './config';
import { logger } from './utils/logger';

httpServer.listen(config.PORT, () => {
  logger.info(`Server is running on port ${config.PORT}`);
});
