import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import OwnerDetails from './OwnerDetails'
import { profile } from '../data/profile'

describe('OwnerDetails', () => {
  it('lists the owner, address and contact, leaving out a missing NIF', () => {
    render(<OwnerDetails legal={profile.legal} />)
    expect(screen.getByText('Miguel Ángel Domínguez García')).toBeInTheDocument()
    expect(screen.getByText('Jaén, España')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: profile.email })).toHaveAttribute('href', `mailto:${profile.email}`)
    expect(screen.queryByText('NIF')).not.toBeInTheDocument()
  })

  it('shows the NIF once it is filled in', () => {
    render(<OwnerDetails legal={{ ...profile.legal, nif: '00000000T' }} />)
    expect(screen.getByText('NIF')).toBeInTheDocument()
    expect(screen.getByText('00000000T')).toBeInTheDocument()
  })
})
