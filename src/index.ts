import 'dotenv/config';
import express from 'express';
import Client from './util/BaseClient';

express().get('/', (_: any, res: any) => res.send('Online.')).listen(3000);

new Client();
