import { createServer } from 'vite'
import { createViteConfig } from './vite.shared.mjs'

const server = await createServer(createViteConfig())
await server.listen()
server.printUrls()
