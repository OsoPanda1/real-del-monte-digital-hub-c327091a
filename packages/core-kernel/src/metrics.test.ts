import { beforeEach, describe, expect, it } from "vitest"

import {
  exportPrometheus,
  getMetricsSnapshot,
  incCounter,
  observeHistogram,
  recordAIError,
  recordAIRequest,
  recordRequest,
  resetMetricsSnapshot,
  setGauge,
} from "./metrics"

describe("core-kernel · metrics", () => {
  beforeEach(() => {
    resetMetricsSnapshot()
  })

  it("captures counters, gauges and histograms in snapshots", () => {
    incCounter("commerce_clicks_total", 2, { channel: "map" })
    setGauge("system_cpu_utilization", 0.42)
    observeHistogram("http_request_duration_ms", 125, { endpoint: "/places/:id" })

    const snapshot = getMetricsSnapshot()

    expect(snapshot.counters).toContainEqual(
      expect.objectContaining({
        name: "commerce_clicks_total",
        value: 2,
        labels: { channel: "map" },
      }),
    )
    expect(snapshot.gauges).toContainEqual(
      expect.objectContaining({ name: "system_cpu_utilization", value: 0.42 }),
    )
    expect(snapshot.histograms).toContainEqual(
      expect.objectContaining({
        name: "http_request_duration_ms",
        count: 1,
        max: 125,
      }),
    )
  })

  it("normalizes route identifiers before recording RED metrics", () => {
    recordRequest("/places/123", 25, false, { method: "GET" })

    const prometheus = exportPrometheus()

    expect(prometheus).toContain('http_requests_total{endpoint="/places/:id",method="GET"} 1')
    expect(prometheus).toContain('errors_total{endpoint="/places/:id",method="GET",service="http"} 1')
  })

  it("exports AI metrics in Prometheus format", () => {
    recordAIRequest("gemini", 240, 512, { feature: "assistant" })
    recordAIError("gemini", "rate_limited", { feature: "assistant" })

    const prometheus = exportPrometheus()

    expect(prometheus).toContain('ai_requests_total{provider="gemini",feature="assistant"} 1')
    expect(prometheus).toContain('ai_requests_error_total{provider="gemini",code="rate_limited",feature="assistant"} 1')
    expect(prometheus).toContain('# TYPE ai_latency_ms histogram')
  })
})
