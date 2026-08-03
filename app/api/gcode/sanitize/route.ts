import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Safety Limits configuration
const CONFIG = {
  limits: {
    maxExtruderTemp: 275, // Celsius
    maxBedTemp: 110,      // Celsius
    maxFeedrate: 5000,    // mm/min
    bed: {
      minX: 0,
      maxX: 220,
      minY: 0,
      maxY: 220,
      minZ: 0,
      maxZ: 250,
    },
  },
};

interface Violation {
  lineNum: number;
  content: string;
  parameter: string;
  value: number;
  limit: number;
  reason: string;
}

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const { gcode } = body;
    if (!gcode || typeof gcode !== 'string') {
      return NextResponse.json(
        { error: 'gcode field is required and must be a string' },
        { status: 400 }
      );
    }

    const lines = gcode.split('\n');
    const violations: Violation[] = [];

    // Stats observed
    let maxExtruderTemp = 0;
    let maxBedTemp = 0;
    let maxFeedrate = 0;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    for (let idx = 0; idx < lines.length; idx++) {
      const lineNum = idx + 1;
      const originalLine = lines[idx];
      // Strip comments starting with semicolon
      const cleanLine = originalLine.split(';')[0].trim();

      if (!cleanLine) continue;

      // 1. Thermal bounds: Extruder temperature (M104, M109)
      const extruderMatch = cleanLine.match(/M(104|109)\s*S(\d+(?:\.\d+)?)/i);
      if (extruderMatch) {
        const val = parseFloat(extruderMatch[2]);
        maxExtruderTemp = Math.max(maxExtruderTemp, val);
        if (val > CONFIG.limits.maxExtruderTemp) {
          violations.push({
            lineNum,
            content: originalLine,
            parameter: 'Extruder Temperature',
            value: val,
            limit: CONFIG.limits.maxExtruderTemp,
            reason: `Extruder temperature (${val}°C) exceeds safety limit of ${CONFIG.limits.maxExtruderTemp}°C`,
          });
        }
      }

      // 2. Thermal bounds: Bed temperature (M140, M190)
      const bedMatch = cleanLine.match(/M(140|190)\s*S(\d+(?:\.\d+)?)/i);
      if (bedMatch) {
        const val = parseFloat(bedMatch[2]);
        maxBedTemp = Math.max(maxBedTemp, val);
        if (val > CONFIG.limits.maxBedTemp) {
          violations.push({
            lineNum,
            content: originalLine,
            parameter: 'Bed Temperature',
            value: val,
            limit: CONFIG.limits.maxBedTemp,
            reason: `Bed temperature (${val}°C) exceeds safety limit of ${CONFIG.limits.maxBedTemp}°C`,
          });
        }
      }

      // 3. Feedrate bounds (F parameter in any command)
      const feedMatch = cleanLine.match(/F\s*(\d+(?:\.\d+)?)/i);
      if (feedMatch) {
        const val = parseFloat(feedMatch[1]);
        maxFeedrate = Math.max(maxFeedrate, val);
        if (val > CONFIG.limits.maxFeedrate) {
          violations.push({
            lineNum,
            content: originalLine,
            parameter: 'Feedrate',
            value: val,
            limit: CONFIG.limits.maxFeedrate,
            reason: `Feedrate (${val} mm/min) exceeds safety limit of ${CONFIG.limits.maxFeedrate} mm/min`,
          });
        }
      }

      // 4. Coordinate/Bed bounds (X, Y, Z parameters in movement G0-G3)
      const isMovement = /^(G[0-3])\b/i.test(cleanLine);
      if (isMovement) {
        const xMatch = cleanLine.match(/X\s*(-?\d+(?:\.\d+)?)/i);
        if (xMatch) {
          const val = parseFloat(xMatch[1]);
          minX = Math.min(minX, val);
          maxX = Math.max(maxX, val);
          if (val < CONFIG.limits.bed.minX || val > CONFIG.limits.bed.maxX) {
            violations.push({
              lineNum,
              content: originalLine,
              parameter: 'X Coordinate',
              value: val,
              limit: CONFIG.limits.bed.maxX,
              reason: `X coordinate (${val}) is outside build boundaries [${CONFIG.limits.bed.minX}, ${CONFIG.limits.bed.maxX}]`,
            });
          }
        }

        const yMatch = cleanLine.match(/Y\s*(-?\d+(?:\.\d+)?)/i);
        if (yMatch) {
          const val = parseFloat(yMatch[1]);
          minY = Math.min(minY, val);
          maxY = Math.max(maxY, val);
          if (val < CONFIG.limits.bed.minY || val > CONFIG.limits.bed.maxY) {
            violations.push({
              lineNum,
              content: originalLine,
              parameter: 'Y Coordinate',
              value: val,
              limit: CONFIG.limits.bed.maxY,
              reason: `Y coordinate (${val}) is outside build boundaries [${CONFIG.limits.bed.minY}, ${CONFIG.limits.bed.maxY}]`,
            });
          }
        }

        const zMatch = cleanLine.match(/Z\s*(-?\d+(?:\.\d+)?)/i);
        if (zMatch) {
          const val = parseFloat(zMatch[1]);
          minZ = Math.min(minZ, val);
          maxZ = Math.max(maxZ, val);
          if (val < CONFIG.limits.bed.minZ || val > CONFIG.limits.bed.maxZ) {
            violations.push({
              lineNum,
              content: originalLine,
              parameter: 'Z Coordinate',
              value: val,
              limit: CONFIG.limits.bed.maxZ,
              reason: `Z coordinate (${val}) is outside build boundaries [${CONFIG.limits.bed.minZ}, ${CONFIG.limits.bed.maxZ}]`,
            });
          }
        }
      }
    }

    if (violations.length > 0) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'G-code safety bounds check failed. Potential hardware damage detected.',
          violations,
        },
        { status: 400 }
      );
    }

    // Hash the G-code content to generate a sanitized fingerprint
    const hash = crypto.createHash('sha256').update(gcode).digest('hex');

    return NextResponse.json({
      status: 'success',
      sanitized_hash: `0x${hash}`,
      analysis: {
        totalLinesParsed: lines.length,
        observedLimits: {
          maxExtruderTemp: maxExtruderTemp > 0 ? `${maxExtruderTemp}°C` : 'N/A',
          maxBedTemp: maxBedTemp > 0 ? `${maxBedTemp}°C` : 'N/A',
          maxFeedrate: maxFeedrate > 0 ? `${maxFeedrate} mm/min` : 'N/A',
          xRange: minX !== Infinity ? `[${minX}, ${maxX}]` : 'N/A',
          yRange: minY !== Infinity ? `[${minY}, ${maxY}]` : 'N/A',
          zRange: minZ !== Infinity ? `[${minZ}, ${maxZ}]` : 'N/A',
        },
        safetyAudit: 'PASSED - Edge AI safety validation complete.',
      },
    });
  } catch (error) {
    console.error('G-code sanitization error:', error);
    return NextResponse.json(
      { error: 'Internal server error during G-code sanitization' },
      { status: 500 }
    );
  }
}
