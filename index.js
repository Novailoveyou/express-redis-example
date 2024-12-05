import express from 'express'
import axios from 'axios'
import cors from 'cors'
import { createClient } from 'redis'

const DEFAULT_EXPIRATION = 3600

const client = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .connect({
    url: process.env.CREDENTIALS
  })

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.get('/photos', async (req, res) => {
  const cache = await client.get('photos')

  if (cache) return res.json(cache)

  const { data } = await axios.get(
    'https://jsonplaceholder.typicode.com/photos',
  )

  if (data)
    await client.set('photos', JSON.stringify(data), { EX: DEFAULT_EXPIRATION })

  return res.json(data)
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`)
})
