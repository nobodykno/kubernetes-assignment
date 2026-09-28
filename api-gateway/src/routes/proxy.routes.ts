import { Router } from 'express';
import { config } from '@/config.js';
import { proxyGet } from '@/lib/proxy.js';

export const proxyRouter: Router= Router();

proxyRouter.get('/stats', proxyGet('stats', config.statsServiceUrl, '/stats'));
