import Mug from './Mug'
import Lamp from './Lamp'
import Headphones from './Headphones'
import Tower from './Tower'
import { DeskPlant, OliveTree } from './Plants'

export default function Props({ reducedMotion, sparkles }) {
  return (
    <>
      <Mug reducedMotion={reducedMotion} />
      <Lamp sparkles={sparkles} />
      <Headphones />
      <Tower />
      <DeskPlant />
      <OliveTree />
    </>
  )
}
