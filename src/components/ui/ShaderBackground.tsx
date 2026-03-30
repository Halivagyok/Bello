import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

export function ShaderBackground() {
  const shaderProps: any = {
    animate: "on",
    axesHelper: "off",
    brightness: 1.1,
    cAzimuthAngle: 169,
    cDistance: 4.1,
    cPolarAngle: 54,
    cameraZoom: 1,
    color1: "#333dff",
    color2: "#30d9ff",
    color3: "#00001e",
    destination: "onCanvas",
    embedMode: "off",
    envPreset: "city",
    format: "gif",
    fov: 50,
    frameRate: 10,
    gizmoHelper: "hide",
    grain: "off",
    lightType: "3d",
    pixelDensity: 1,
    positionX: 0,
    positionY: 0.9,
    positionZ: 0,
    range: "disabled",
    rangeEnd: 40,
    rangeStart: 0,
    reflection: 0.1,
    rotationX: 45,
    rotationY: 0,
    rotationZ: 0,
    shader: "defaults",
    type: "waterPlane",
    uAmplitude: 0,
    uDensity: 1.2,
    uFrequency: 0,
    uSpeed: 0.2,
    uStrength: 3.4,
    uTime: 0,
    wireframe: false,
    zoomOut: false
  };

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-black">
      <ShaderGradientCanvas style={{ pointerEvents: 'none' }}>
        <ShaderGradient {...shaderProps} />
      </ShaderGradientCanvas>
    </div>
  );
}
