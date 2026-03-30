import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

export function ShaderBackground({ animate = true, position = "absolute" }: { animate?: boolean, position?: "absolute" | "fixed" }) {
  const shaderProps: any = {
    animate: animate ? "on" : "off",
    axesHelper: "off",
    brightness: 1.1,
    cAzimuthAngle: 169,
    cDistance: 4.1,
    cPolarAngle: 54,
    cameraZoom: 1,
    color1: "#0F172A",
    color2: "#0EA5E9",
    color3: "#DBEAFE",
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
    <div 
      className={`${position} top-0 left-0 right-0 bottom-0 -z-10 bg-black pointer-events-none`}
      style={{ overflow: 'hidden' }}
    >
      <ShaderGradientCanvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <ShaderGradient {...shaderProps} />
      </ShaderGradientCanvas>
    </div>
  );
}
