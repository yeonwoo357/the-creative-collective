import Particles from "@/components/Particles";

/**
 * Interactive particle field behind the globe (React Bits "Particles", @react-bits/Particles-JS-CSS).
 * Settings from the design brief:
 * reactbits.dev/backgrounds/particles?particleColors=ad5d84,f8bcff,ffffff&twinkle=0.55&depthOfField=0.15&particleBaseSize=105&sizeRandomness=0.85
 */
export function SpaceBackground({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return (
    <div
      className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_100%,#2a1225_0%,#0d060d_55%,#000_100%)]"
      aria-hidden="true"
    >
      <Particles
        particleColors={["#ad5d84", "#f8bcff", "#ffffff"]}
        twinkle={0.55}
        depthOfField={0.15}
        particleBaseSize={105}
        sizeRandomness={0.85}
        paused={reducedMotion}
      />
    </div>
  );
}
