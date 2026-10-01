import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'

export default function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.55} luminanceSmoothing={0.2} />
      <Vignette offset={0.25} darkness={0.75} />
    </EffectComposer>
  )
}
