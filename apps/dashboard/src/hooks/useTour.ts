import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function startStoreTour() {
  const isDark = document.documentElement.classList.contains('dark')

  const nodes = [...document.querySelectorAll('[data-tour]')] as HTMLElement[]
  const steps = nodes.map((el) => ({
    element: el,
    popover: {
      title: el.dataset.tourTitle ?? '',
      description: el.dataset.tourDescription ?? '',
      side: (el.dataset.tourSide ?? 'bottom') as 'top' | 'right' | 'bottom' | 'left',
      align: (el.dataset.tourAlign ?? 'start') as 'start' | 'center' | 'end',
    },
  }))

  driver({
    showProgress: true,
    progressText: '{{current}} din {{total}}',
    nextBtnText: 'Următor →',
    prevBtnText: '← Înapoi',
    doneBtnText: 'Gata',
    overlayOpacity: 0.55,
    smoothScroll: true,
    popoverClass: isDark ? 'merx-tour merx-tour-dark' : 'merx-tour',
    steps,
  }).drive()
}
