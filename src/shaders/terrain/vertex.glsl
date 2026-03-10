uniform float uTime;
uniform float uPositionFrequency;
uniform float uStrength;
uniform float uWarpFrequency;
uniform float uWarpStrength;

varying vec3 vPosition;
varying float vUpDot;

#include ../includes/simplexNoise2d.glsl

float getElevation(vec2 position)
{
  vec2 warpedPosition = position;
  warpedPosition += uTime * 0.2;
  warpedPosition += simplexNoise2d(warpedPosition * uPositionFrequency * uWarpFrequency) * uWarpStrength;

  float elevation = 0.0;
  elevation += simplexNoise2d(warpedPosition * uPositionFrequency) / 2.0;
  elevation += simplexNoise2d(warpedPosition * uPositionFrequency * 2.0) / 4.0;
  elevation += simplexNoise2d(warpedPosition * uPositionFrequency * 4.0) / 8.0;

  float elevationSign = sign(elevation);
  elevation = pow(abs(elevation), 2.0) * elevationSign;
  elevation *= uStrength;

  return elevation;
}

void main()
{
  float shift = 0.02;
  vec2 positionXZ = csm_Position.xz;
  float elevation = getElevation(positionXZ);
  float elevationLeft = getElevation(positionXZ + vec2(-shift, 0.0));
  float elevationRight = getElevation(positionXZ + vec2(shift, 0.0));
  float elevationBack = getElevation(positionXZ + vec2(0.0, -shift));
  float elevationFront = getElevation(positionXZ + vec2(0.0, shift));

  csm_Position.y += elevation;

  vec3 tangent = vec3(2.0 * shift, elevationRight - elevationLeft, 0.0);
  vec3 bitangent = vec3(0.0, elevationFront - elevationBack, 2.0 * shift);
  csm_Normal = normalize(cross(bitangent, tangent));

  vPosition = csm_Position;
  vPosition.xz += uTime * 0.2;
  vUpDot = clamp(dot(csm_Normal, vec3(0.0, 1.0, 0.0)), 0.0, 1.0);
}
