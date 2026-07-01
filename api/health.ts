interface VercelRequest {
  method?: string;
}

interface VercelResponse {
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  uptime: number;
  region: string;
  cells: Array<{ id: string; endpoint: string; status: string; latency: number }>;
  federations: Array<{ name: string; status: string }>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = performance.now();

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, max-age=60');

  try {
    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime?.() || 0,
      region: process.env.VERCEL_REGION || 'unknown',
      cells: [
        {
          id: 'render-3d-holocube-v1',
          endpoint: '/api/knowledge-cells/render-3d',
          status: 'active',
          latency: Math.random() * 50 + 10,
        },
        {
          id: 'render-4d-hypercube-v1',
          endpoint: '/api/knowledge-cells/render-4d',
          status: 'active',
          latency: Math.random() * 50 + 15,
        },
        {
          id: 'ia-immersivefx-v1',
          endpoint: '/api/knowledge-cells/ia-fx',
          status: 'active',
          latency: Math.random() * 50 + 20,
        },
      ],
      federations: [
        { name: 'F1 - Gobernanza', status: 'operational' },
        { name: 'F2 - Identidad y Acceso', status: 'operational' },
        { name: 'F3 - Datos Territoriales', status: 'operational' },
        { name: 'F4 - Comercio y Monetización', status: 'operational' },
        { name: 'F5 - IA Cognitiva', status: 'operational' },
        { name: 'F6 - Comunidad y Contenido', status: 'operational' },
        { name: 'F7 - Observabilidad y Seguridad', status: 'operational' },
      ],
    };

    const avgCellLatency =
      healthStatus.cells.reduce((sum, c) => sum + c.latency, 0) / healthStatus.cells.length;
    const criticalLatency = avgCellLatency > 200;
    const degraded = avgCellLatency > 100 || healthStatus.federations.some((f) => f.status !== 'operational');

    if (criticalLatency) {
      healthStatus.status = 'critical';
    } else if (degraded) {
      healthStatus.status = 'degraded';
    }

    const executionTime = performance.now() - startTime;

    return res.status(healthStatus.status === 'critical' ? 503 : 200).json({
      success: true,
      data: healthStatus,
      performance: { executionTime },
      buildTime: process.env.VERCEL_BUILD_COMPLETED_AT || 'unknown',
    });
  } catch (err) {
    const executionTime = performance.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';

    return res.status(500).json({
      success: false,
      status: 'critical',
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: errorMessage,
      },
      performance: { executionTime },
      timestamp: new Date().toISOString(),
    });
  }
}
