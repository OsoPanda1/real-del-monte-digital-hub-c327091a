import { describe, expect, it } from "vitest"

import { haversineKm, isValidGeoPoint } from "../haversine"

describe("geo-engine · haversineKm", () => {
  it("calcula 0 km para el mismo punto", () => {
    const d = haversineKm({ lat: 20, lon: -98 }, { lat: 20, lon: -98 })
    expect(d).toBeCloseTo(0, 5)
  })

  it("produce un valor razonable entre Real del Monte y Pachuca", () => {
    const rdm = { lat: 20.1368, lon: -98.6723 }
    const pachuca = { lat: 20.1011, lon: -98.7591 }
    const d = haversineKm(rdm, pachuca)
    expect(d).toBeGreaterThan(5)
    expect(d).toBeLessThan(20)
  })

  it("es simétrica entre dos puntos", () => {
    const a = { lat: 20.1368, lon: -98.6723 }
    const b = { lat: 20.1011, lon: -98.7591 }

    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 10)
  })

  it("valida rangos básicos de coordenadas", () => {
    expect(isValidGeoPoint({ lat: 20.1368, lon: -98.6723 })).toBe(true)
    expect(isValidGeoPoint({ lat: 95, lon: -98.6723 })).toBe(false)
    expect(isValidGeoPoint({ lat: 20.1368, lon: -195 })).toBe(false)
  })
})
