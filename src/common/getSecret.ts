import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { logger } from './logger';

/**
 * Loads secret value from Google Secret Manager.
 * See: https://cloud.google.com/secret-manager/docs/quickstart
 */
export default async (secretName: string): Promise<string> => {
  const client = new SecretManagerServiceClient();
  logger.info(`Requesting secret ${secretName} from secret manager.`);
  const [version] = await client.accessSecretVersion({ name: secretName });
  const value = version?.payload?.data;

  if (!value) {
    throw Error(`No value was found for the secret ${secretName}`);
  }

  const plainTextSecret = (value as Buffer).toString('utf8');

  return plainTextSecret;
};
