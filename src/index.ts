import 'dotenv/config';
import Client from './util/BaseClient';

Promise.resolve(Client).then(() => new Client());
