import debugLevels from 'resolve-debug-levels'

const log = debugLevels('resolve:resolve-runtime:subscribe-handler')

const subscribeHandler = async (req, res) => {
  try {
    const parameters = req.method === 'POST' ? JSON.parse(req.body) : req.query
    const { origin, viewModelName, topics } = parameters
    await res.setHeader('Content-Type', 'application/json')
    await res.json(
      await req.resolve.getSubscribeAdapterOptions(
        req.resolve,
        origin,
        viewModelName,
        topics,
        req.jwt
      )
    )
  } catch (err) {
    log.warn('Subscribe handler error', err)
    await res.status(500)
    await res.setHeader('Content-Type', 'text/plain')
    await res.end(err.toString())
  }
}

export default subscribeHandler
