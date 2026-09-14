import { build } from 'vite'
import { createViteConfig } from './vite.shared.mjs'

await build(createViteConfig())
