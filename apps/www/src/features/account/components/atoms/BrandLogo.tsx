interface BrandLogoProps {
  brand: string
}

export function BrandLogo({ brand }: BrandLogoProps) {
  if (brand === 'visa') {
    return (
      <svg viewBox="0 0 48 16" className="h-5 fill-white opacity-90" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.1 0.5L11.6 15.5H7.6L4.4 3.7C4.2 3 3.7 2.4 3 2.1 1.9 1.6 0.8 1.2 0 1L0.1 0.5H6.7C7.6 0.5 8.4 1.1 8.6 2L10.3 10.9L14.2 0.5H18.1ZM34.2 10.6C34.2 7 29.1 6.8 29.1 5.2C29.1 4.7 29.6 4.2 30.7 4.1C31.2 4 32.7 3.9 34.4 4.7L35.1 1.4C34.3 1.1 33.2 0.8 31.8 0.8C28.2 0.8 25.6 2.7 25.6 5.4C25.6 7.4 27.4 8.5 28.7 9.1C30.1 9.8 30.5 10.2 30.5 10.8C30.5 11.7 29.4 12 28.4 12C26.6 12 25.5 11.5 24.7 11.1L24 14.5C24.8 14.9 26.3 15.2 27.8 15.2C31.6 15.3 34.2 13.4 34.2 10.6ZM43.4 15.5H47L43.9 0.5H40.6C39.8 0.5 39.1 1 38.8 1.7L33.3 15.5H37.1L37.9 13.1H42.5L43.4 15.5ZM38.9 10.1L40.9 4.4L42.1 10.1H38.9ZM23.3 0.5L20.2 15.5H16.6L19.7 0.5H23.3Z" />
      </svg>
    )
  }

  if (brand === 'mastercard') {
    return (
      <div className="flex">
        <div className="w-7 h-7 rounded-full bg-red-500 opacity-90" />
        <div className="w-7 h-7 rounded-full bg-orange-400 opacity-80 -ml-3" />
      </div>
    )
  }

  if (brand === 'amex') {
    return <span className="text-white font-bold text-sm tracking-widest opacity-90">AMEX</span>
  }

  return <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">{brand}</span>
}
