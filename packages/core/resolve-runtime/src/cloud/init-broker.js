import getSubscribeAdapterOptions from './get-subscribe-adapter-options'
import invokeEventBus from './invoke-event-bus'
import publishEvent from './publish-event'

const initBroker = resolve => {
  Object.assign(resolve.publisher, {
    pause: async eventSubscriber => {
      return await invokeEventBus(resolve.eventstoreCredentials, 'pause', {
        eventSubscriber
      })
    },
    acknowledge: async (batchId, result) => {
      return await invokeEventBus(
        resolve.eventstoreCredentials,
        'acknowledge',
        {
          batchId,
          result
        }
      )
    },
    publish: async event => {
      return await invokeEventBus(resolve.eventstoreCredentials, 'publish', {
        event
      })
    },
    resume: async eventSubscriber => {
      return await invokeEventBus(resolve.eventstoreCredentials, 'resume', {
        eventSubscriber
      })
    },
    status: async eventSubscriber => {
      return await invokeEventBus(resolve.eventstoreCredentials, 'status', {
        eventSubscriber
      })
    },
    reset: async eventSubscriber => {
      return await invokeEventBus(resolve.eventstoreCredentials, 'reset', {
        eventSubscriber
      })
    },
    read: async eventFilter => {
      return await invokeEventBus(resolve.eventstoreCredentials, 'read', {
        eventFilter
      })
    },
    subscribe: async (eventSubscriber, subscriptionOptions) => {
      return await invokeEventBus(resolve.eventstoreCredentials, 'subscribe', {
        eventSubscriber,
        subscriptionOptions
      })
    },
    resubscribe: async (eventSubscriber, subscriptionOptions) => {
      return await invokeEventBus(
        resolve.eventstoreCredentials,
        'resubscribe',
        {
          eventSubscriber,
          subscriptionOptions
        }
      )
    },
    unsubscribe: async eventSubscriber => {
      return await invokeEventBus(
        resolve.eventstoreCredentials,
        'unsubscribe',
        {
          eventSubscriber
        }
      )
    }
    // listProperties: async eventSubscriber => {
    //   return await invokeMeta(resolve, eventSubscriber, 'listProperties')
    // },
    // getProperty: async (eventSubscriber, key) => {
    //   return await invokeMeta(resolve, eventSubscriber, 'getProperty', { key })
    // },
    // setProperty: async (eventSubscriber, key, value) => {
    //   return await invokeMeta(resolve, eventSubscriber, 'setProperty', {
    //     key,
    //     value
    //   })
    // },
    // deleteProperty: async (eventSubscriber, key) => {
    //   return await invokeMeta(resolve, eventSubscriber, 'deleteProperty', {
    //     key
    //   })
    // }
  })

  Object.defineProperties(resolve, {
    getSubscribeAdapterOptions: {
      value: getSubscribeAdapterOptions.bind(null, resolve)
    },
    publishEvent: {
      value: publishEvent.bind(null, resolve)
    }
  })
}

export default initBroker
