import window from 'global/window'
import createSubscribeAdapter from './subscribe-adapter'
import { Context } from './context'
import { rootCallback, addCallback, removeCallback } from './subscribe-callback'
import determineOrigin from './determine-origin'
import { GenericError } from './errors'
import { request } from './request'

interface SubscriptionKey {
  aggregateId: string
  eventType: string
}

interface Topic {
  topicId: string
  topicName: string
}

type AggregateSelector = string[] | '*'

const REFRESH_TIMEOUT = 5000
const setTimeoutSafe =
  window && typeof window.setTimeout === 'function'
    ? window.setTimeout
    : setTimeout
const clearTimeoutSafe = (timeout: number | NodeJS.Timeout): void => {
  if (typeof timeout === 'number') {
    if (typeof window.clearTimeout === 'function') {
      window.clearTimeout(timeout)
    }
  } else {
    clearTimeout(timeout)
  }
}
let adaptersMap = new Map()
const buildKey = (viewModelName: string, topics: Array<Topic>): string => {
  const aggregateIds: AggregateSelector = topics.map(({ topicId }) => topicId)
  const sortedAggregateIds = ([] as Array<string>)
    .concat(aggregateIds)
    .sort((a, b) => a.localeCompare(b))
  return [viewModelName].concat(sortedAggregateIds).join(':')
}

let refreshTimeout: number | NodeJS.Timeout | null

export const getSubscriptionKeys = (
  context: Context,
  viewModelName: string,
  aggregateIds: Array<string> | '*'
): Array<SubscriptionKey> => {
  const { viewModels } = context
  const viewModel = viewModels.find(({ name }) => name === viewModelName)
  if (!viewModel) {
    return []
  }
  const eventTypes = Object.keys(viewModel.projection).filter(
    eventType => eventType !== 'Init'
  )
  return eventTypes.reduce((acc: Array<SubscriptionKey>, eventType) => {
    if (Array.isArray(aggregateIds)) {
      acc.push(...aggregateIds.map(aggregateId => ({ aggregateId, eventType })))
    } else if (aggregateIds === '*') {
      acc.push({ aggregateId: '*', eventType })
    }
    return acc
  }, [])
}

export interface SubscribeAdapterOptions {
  appId: string
  url: string
}

export const getSubscribeAdapterOptions = async (
  context: Context,
  adapterName: string,
  viewModelName: string,
  topics: Array<object>
): Promise<SubscribeAdapterOptions> => {
  const { rootPath, origin: customOrigin } = context
  const origin = determineOrigin(customOrigin)

  const response = await request(context, '/api/subscribe', {
    origin,
    rootPath,
    adapterName,
    viewModelName,
    topics
  })

  try {
    return await response.json()
  } catch (error) {
    throw new GenericError(error)
  }
}

const initSubscribeAdapter = async (
  context: Context,
  viewModelName: string,
  topics: Array<Topic>
): Promise<any> => {
  const { url } = await getSubscribeAdapterOptions(
    context,
    createSubscribeAdapter.adapterName,
    viewModelName,
    topics
  )

  const subscribeAdapter = createSubscribeAdapter({
    url,
    onEvent: rootCallback
  })
  await subscribeAdapter.init()

  if (!refreshTimeout) {
    refreshTimeout = setTimeoutSafe(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      () => refreshSubscribeAdapter(context, viewModelName, topics, false),
      REFRESH_TIMEOUT
    )
  }

  return subscribeAdapter
}

export const refreshSubscribeAdapter = async (
  context: Context,
  viewModelName: string,
  topics: Array<Topic>,
  subscribeAdapterRecreated?: boolean
): Promise<any> => {
  let subscribeAdapter

  const key = buildKey(viewModelName, topics)

  try {
    if (!adaptersMap.has(key)) {
      subscribeAdapter = await initSubscribeAdapter(
        context,
        viewModelName,
        topics
      )
    } else {
      subscribeAdapter = adaptersMap.get(key)
    }
  } catch (error) {
    adaptersMap.delete(key)
    if (refreshTimeout) {
      clearTimeoutSafe(refreshTimeout)
    }
    refreshTimeout = setTimeoutSafe(
      () => refreshSubscribeAdapter(context, viewModelName, topics, true),
      REFRESH_TIMEOUT
    )
    return Promise.resolve()
  }

  if (!subscribeAdapterRecreated) {
    try {
      if (subscribeAdapter.isConnected()) {
        // still connected
        if (refreshTimeout) {
          clearTimeoutSafe(refreshTimeout)
        }
        refreshTimeout = setTimeoutSafe(
          () => refreshSubscribeAdapter(context, viewModelName, topics, false),
          REFRESH_TIMEOUT
        )
        return Promise.resolve()
      }
    } catch (error) {}
  }

  // disconnected

  try {
    if (subscribeAdapter != null) {
      await subscribeAdapter.close()
      adaptersMap.delete(key)
    }
    adaptersMap.set(
      key,
      await initSubscribeAdapter(context, viewModelName, topics)
    )
  } catch (err) {}

  if (refreshTimeout) {
    clearTimeoutSafe(refreshTimeout)
  }
  refreshTimeout = setTimeoutSafe(
    () => refreshSubscribeAdapter(context, viewModelName, topics, false),
    REFRESH_TIMEOUT
  )
  return Promise.resolve()
}

export const dropSubscribeAdapterPromise = (): void => {
  adaptersMap = new Map()
  if (refreshTimeout) {
    clearTimeoutSafe(refreshTimeout)
  }
  refreshTimeout = null
}

const connect = async (
  context: Context,
  aggregateIds: AggregateSelector,
  eventCallback: Function,
  viewModelName: string,
  subscribeCallback?: Function
): Promise<void> => {
  const subscriptionKeys = getSubscriptionKeys(
    context,
    viewModelName,
    aggregateIds
  )

  const topics = subscriptionKeys.map(({ eventType, aggregateId }) => ({
    topicName: eventType,
    topicId: aggregateId
  }))

  const key = buildKey(viewModelName, topics)

  if (adaptersMap.has(key)) {
    return Promise.resolve()
  }

  const subscribeAdapter = await initSubscribeAdapter(
    context,
    viewModelName,
    topics
  )

  if (subscribeAdapter === null) {
    return Promise.resolve()
  }

  adaptersMap.set(key, subscribeAdapter)

  for (const { eventType, aggregateId } of subscriptionKeys) {
    addCallback(eventType, aggregateId, eventCallback, subscribeCallback)
  }
}

const disconnect = async (
  context: Context,
  aggregateIds: AggregateSelector,
  viewModelName: string,
  callback?: Function
): Promise<void> => {
  const subscriptionKeys = getSubscriptionKeys(
    context,
    viewModelName,
    aggregateIds
  )

  const topics = subscriptionKeys.map(({ eventType, aggregateId }) => ({
    topicName: eventType,
    topicId: aggregateId
  }))

  const key = buildKey(viewModelName, topics)
  const subscribeAdapter = adaptersMap.get(key)

  await subscribeAdapter.close()

  adaptersMap.delete(key)

  for (const { eventType, aggregateId } of subscriptionKeys) {
    removeCallback(eventType, aggregateId, callback)
  }
}

export { connect, disconnect }
