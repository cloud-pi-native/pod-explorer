import axios from 'axios'
import express from 'express'
import { readFileSync } from 'fs'
import https from 'https'


const token = (readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token')).toString()
const cacert = (readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt')).toString()
const currentNs = (readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/namespace')).toString()

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // (NOTE: this will disable client verification)
  ca: cacert,
})

const app = express()
const port = 3000

const a = axios.create({
  headers: {
    "Authorization": `Bearer ${token}`
  },
  baseURL: `https://${process.env.KUBERNETES_SERVICE_HOST}/api/v1/`,
  httpsAgent,
  validateStatus: () => true
})
app.get('/healthz', async (req, res) => {
  res.status(200)
  res.send("OK")
})

app.get('/*', async (req, res) => {
  console.log(req.path);
  console.log(req.query);

  const namespace = req.query?.namespace ? `namespaces/${req.query?.namespace}/` : `namespaces/${currentNs}`
  const apiRes = await a.get(`${namespace}${req.path}`)
  if (apiRes.status > 299) {
    res.status(apiRes.status)
    return
  }
  res.json(apiRes.data)
})

app.listen(port, () => {
  console.log(`pod explorer listening on port ${port}`)
})

