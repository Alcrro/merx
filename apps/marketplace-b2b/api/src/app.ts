import express from 'express'
import cors from 'cors'
import { marketplaceRouter } from './modules/marketplace/marketplace.router'
import { errorHandler } from './middleware/errorHandler'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

app.use('/api/marketplace', marketplaceRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Marketplace API running on http://localhost:${PORT}`)
})

export default app
