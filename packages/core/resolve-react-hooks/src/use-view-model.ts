import { useContext, useCallback, useMemo } from 'react'
import { ResolveContext } from './context'
import { Event, firstOfType } from 'resolve-core'
import { QueryOptions, SubscribeCallback, Subscription } from 'resolve-client'
import { useClient } from './use-client'
import { isCallback, isOptions } from './generic'

type StateChangedCallback = (state: any) => void
type EventReceivedCallback = (event: Event) => void
type PromiseOrVoid<T> = Promise<T> | void

type Closure = {
  state?: any
  subscription?: Subscription
  url?: string
  cursor?: string
}

type ViewModelConnection = {
  connect: (done?: SubscribeCallback) => PromiseOrVoid<Subscription>
  dispose: (done?: (error?: Error) => void) => PromiseOrVoid<void>
}

// TODO: add unit tests after new 'subscription' feature will be fixed

function useViewModel(
  modelName: string,
  aggregateIds: string[] | '*',
  stateChangeCallback: StateChangedCallback
): ViewModelConnection
function useViewModel(
  modelName: string,
  aggregateIds: string[] | '*',
  stateChangeCallback: StateChangedCallback,
  eventReceivedCallback: EventReceivedCallback
): ViewModelConnection
function useViewModel(
  modelName: string,
  aggregateIds: string[] | '*',
  stateChangeCallback: StateChangedCallback,
  queryOptions: QueryOptions
): ViewModelConnection
function useViewModel(
  modelName: string,
  aggregateIds: string[] | '*',
  stateChangeCallback: StateChangedCallback,
  eventReceivedCallback: EventReceivedCallback,
  queryOptions: QueryOptions
): ViewModelConnection
function useViewModel(
  modelName: string,
  aggregateIds: string[] | '*',
  stateChangeCallback: StateChangedCallback,
  eventReceivedCallback?: QueryOptions | EventReceivedCallback,
  queryOptions?: QueryOptions
): ViewModelConnection {
  const context = useContext(ResolveContext)
  const client = useClient()

  const { viewModels } = context
  const viewModel = viewModels.find(({ name }) => name === modelName)

  if (!viewModel) {
    throw Error(`View model ${modelName} not exist within context`)
  }

  const actualQueryOptions: QueryOptions | undefined = firstOfType<
    QueryOptions
  >(isOptions, eventReceivedCallback, queryOptions)

  const closure = useMemo<Closure>(
    () => ({
      state: viewModel.projection.Init ? viewModel.projection.Init() : null
    }),
    []
  )

  const setState = useCallback(state => {
    closure.state = state
    stateChangeCallback(closure.state)
  }, [])

  const queryState = useCallback(async () => {
    const result = await client.query(
      {
        name: modelName,
        aggregateIds,
        args: {}
      },
      actualQueryOptions
    )
    if (result) {
      const { data, url, cursor } = result
      setState(data)
      closure.url = url
      closure.cursor = cursor
    }
  }, [])

  const applyEvent = useCallback(event => {
    if (isCallback<EventReceivedCallback>(eventReceivedCallback)) {
      eventReceivedCallback(event)
    }
    setState(viewModel.projection[event.type](closure.state, event))
  }, [])

  const connect = useCallback((done?: SubscribeCallback): PromiseOrVoid<
    Subscription
  > => {
    const asyncConnect = async (): Promise<Subscription> => {
      await queryState()

      const subscribe = client.subscribe(
        closure.url ?? '',
        closure.cursor ?? '',
        modelName,
        aggregateIds,
        event => applyEvent(event),
        undefined,
        () => queryState()
      ) as Promise<Subscription>

      const subscription = await subscribe

      if (subscription) {
        closure.subscription = subscription
      }

      return subscription
    }
    if (typeof done !== 'function') {
      return asyncConnect()
    }

    asyncConnect()
      .then(result => done(null, result))
      .catch(error => done(error, null))

    return undefined
  }, [])

  const dispose = useCallback((done?: (error?: Error) => void): PromiseOrVoid<
    void
  > => {
    const asyncDispose = async (): Promise<void> => {
      if (closure.subscription) {
        await client.unsubscribe(closure.subscription)
      }
    }

    if (typeof done !== 'function') {
      return asyncDispose()
    }

    asyncDispose()
      .then(() => done())
      .catch(error => done(error))

    return undefined
  }, [])

  return useMemo(
    () => ({
      connect,
      dispose
    }),
    []
  )
}

export { useViewModel }
