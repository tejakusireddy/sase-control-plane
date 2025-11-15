import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from './middleware/auth';
import { gatewayAuthMiddleware } from './middleware/gatewayAuth';

const app = express();
const PORT = process.env.PORT || 4000;

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const POLICY_SERVICE_URL = process.env.POLICY_SERVICE_URL || 'http://localhost:4002';
const SESSION_SERVICE_URL = process.env.SESSION_SERVICE_URL || 'http://localhost:4003';

app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

app.get('/', (req, res) => {
  res.json({ 
    service: 'SASE Control Plane API Gateway',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/login',
      api: '/api/*'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

const loginProxy = createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  pathRewrite: { '^/api/auth': '/internal/auth' },
  changeOrigin: true,
  onError: (err, req, res) => {
    if (!res.headersSent) {
      res.status(503).json({
        error: { message: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' },
      });
    }
  },
});

app.post('/api/auth/login', loginProxy);

app.use(express.json());

app.post('/api/gateway/evaluate', gatewayAuthMiddleware, (req, res, next) => {
  const orgId = (req as any).gateway?.orgId || 'acme';
  const proxy = createProxyMiddleware({
    target: POLICY_SERVICE_URL,
    pathRewrite: (path) => `/internal/orgs/${orgId}/evaluate`,
    changeOrigin: true,
    onProxyReq: (proxyReq, req) => {
      if (req.body && !(req as any)._body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  });
  proxy(req, res, next);
});

app.post('/api/gateway/telemetry', gatewayAuthMiddleware, createProxyMiddleware({
  target: SESSION_SERVICE_URL,
  pathRewrite: { '^/api/gateway/telemetry': '/internal/sessions/record-decision' },
  changeOrigin: true,
}));

app.use('/api', (req, res, next) => {
  if (req.path === '/auth/login' || req.originalUrl === '/api/auth/login') {
    return next();
  }
  if (req.path.startsWith('/gateway/') || req.originalUrl.startsWith('/api/gateway/')) {
    return next();
  }
  return authMiddleware(req, res, next);
});

app.get('/api/me', createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  pathRewrite: { '^/api': '/internal/auth' },
  changeOrigin: true,
}));

app.use('/api/orgs/:orgId/policies', createProxyMiddleware({
  target: POLICY_SERVICE_URL,
  pathRewrite: { '^/api/orgs': '/internal/orgs' },
  changeOrigin: true,
}));

app.use('/api/orgs/:orgId/sessions', createProxyMiddleware({
  target: SESSION_SERVICE_URL,
  pathRewrite: { '^/api/orgs': '/internal/orgs' },
  changeOrigin: true,
}));

app.use('/api/orgs/:orgId/audit-logs', createProxyMiddleware({
  target: SESSION_SERVICE_URL,
  pathRewrite: { '^/api/orgs': '/internal/orgs' },
  changeOrigin: true,
}));

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`API Gateway running on port ${PORT}`);
  }
});

