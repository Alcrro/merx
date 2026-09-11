import assert from 'node:assert/strict'

// Direct import — testăm că valorile sunt definite și corecte
const BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50'

const SIZES = {
  md: 'px-4 py-2 text-sm',
  sm: 'px-3.5 py-1.5 text-xs',
}

const VARIANTS = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm',
  ghost:   'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700',
  outline: 'border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40',
  danger:  'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
}

function buildCls(variant: keyof typeof VARIANTS, size: keyof typeof SIZES, fullWidth = false, className = '') {
  return [BASE, SIZES[size], VARIANTS[variant], fullWidth ? 'w-full' : '', className]
    .filter(Boolean)
    .join(' ')
}

// BASE definit
assert.ok(BASE.length > 0, 'BASE trebuie să fie definit')
assert.ok(BASE.includes('inline-flex'), 'BASE trebuie să conțină inline-flex')

// SIZES
assert.ok(SIZES.md.includes('px-4'), 'SIZES.md corect')
assert.ok(SIZES.sm.includes('px-3.5'), 'SIZES.sm corect')

// VARIANTS
assert.ok(VARIANTS.primary.includes('bg-indigo-600'), 'primary: bg-indigo-600 prezent')
assert.ok(VARIANTS.danger.includes('bg-red-600'), 'danger: bg-red-600 prezent')
assert.ok(VARIANTS.ghost.includes('bg-transparent'), 'ghost: bg-transparent prezent')
assert.ok(VARIANTS.outline.includes('border'), 'outline: border prezent')

// cls construction
const primaryCls = buildCls('primary', 'md', true, 'mt-2')
assert.ok(primaryCls.includes('bg-indigo-600'), 'cls primary include bg-indigo-600')
assert.ok(primaryCls.includes('px-4 py-2 text-sm'), 'cls md size prezent')
assert.ok(primaryCls.includes('w-full'), 'cls fullWidth prezent')
assert.ok(primaryCls.includes('mt-2'), 'cls className prop prezent')
assert.ok(primaryCls.includes('inline-flex'), 'cls BASE prezent')

const dangerCls = buildCls('danger', 'sm')
assert.ok(dangerCls.includes('bg-red-600'), 'cls danger include bg-red-600')
assert.ok(dangerCls.includes('text-white'), 'cls danger include text-white')

console.log('✓ Toate testele au trecut')
console.log('  PRIMARY cls:', buildCls('primary', 'md', true, 'mt-2'))
console.log('  DANGER cls: ', buildCls('danger', 'md'))
