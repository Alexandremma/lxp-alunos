import * as React from "react"

/** Alinhado ao breakpoint `lg:` do Tailwind (1024px). */
const LG_BREAKPOINT = 1024

export function useIsLargeScreen() {
  const [isLarge, setIsLarge] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`).matches,
  )

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`)
    const onChange = () => setIsLarge(mql.matches)
    mql.addEventListener("change", onChange)
    setIsLarge(mql.matches)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isLarge
}
