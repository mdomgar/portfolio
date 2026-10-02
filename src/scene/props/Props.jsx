import Mug from './Mug'
import Lamp from './Lamp'
import Headphones from './Headphones'
import Tower from './Tower'
import Phone from './Phone'
import Notebook from './Notebook'
import { DeskPlant, OliveTree } from './Plants'

export default function Props({ reducedMotion, sparkles }) {
  return (
    <>
      <Mug reducedMotion={reducedMotion} />
      <Lamp reducedMotion={reducedMotion} sparkles={sparkles} />
      <Headphones />
      <Tower />
      <Phone reducedMotion={reducedMotion} />
      <Notebook />
      <DeskPlant />
      <OliveTree />
    </>
  )
}
