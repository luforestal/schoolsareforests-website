'use client'
import WorldMap from './WorldMap'

// Simple wrapper – WorldMap now fetches via API so no SSR issues
export default function WorldMapWrapper({ schools }) {
  return <WorldMap schools={schools} />
}
