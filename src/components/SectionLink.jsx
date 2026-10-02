import { Link, useLocation } from 'react-router'

// On the home page a plain anchor lets Lenis scroll smoothly; elsewhere, go back home to that section.
export default function SectionLink({ id, children, ...props }) {
  const { pathname } = useLocation()
  if (pathname === '/') {
    return (
      <a href={`#${id}`} {...props}>
        {children}
      </a>
    )
  }
  return (
    <Link to={id === 'hero' ? '/' : `/#${id}`} {...props}>
      {children}
    </Link>
  )
}
