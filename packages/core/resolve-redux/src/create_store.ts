import {
  createStore as reduxCreateStore,
  applyMiddleware,
  combineReducers,
  compose
} from 'redux'
import uuid from 'uuid/v4'

import createViewModelsReducer from './create_view_models_reducer'
import { create as createReadModelReducer } from './read-model/read-model-reducer'
import createJwtReducer from './create_jwt_reducer'
import createResolveMiddleware from './create_resolve_middleware'
import syncJwtProviderWithStore from './sync_jwt_provider_with_store'
import emptySubscribeAdapter from './empty_subscribe_adapter'

const createStore = ({
  redux: {
    reducers = {},
    middlewares = [],
    enhancers = [],
    sagas: customSagas = []
  } = {},
  viewModels = [],
  subscribeAdapter = emptySubscribeAdapter,
  initialState = undefined,
  jwtProvider = undefined,
  origin,
  rootPath,
  isClient,
  queryMethod
}: {
  redux: {
    reducers?: { [key: string]: string }
    middlewares?: any[]
    enhancers?: any[]
    sagas?: any[]
  }
  viewModels: any[]
  subscribeAdapter: any
  initialState: any
  jwtProvider: any
  origin: any
  rootPath: any
  isClient: boolean
  queryMethod: string
}): any => {
  const sessionId = uuid()

  const resolveMiddleware = createResolveMiddleware()

  const combinedReducers = combineReducers({
    ...reducers,
    viewModels: createViewModelsReducer(viewModels),
    readModels: createReadModelReducer(),
    jwt: createJwtReducer()
  })

  // disable all sagas
  const appliedMiddlewares = applyMiddleware(
    /* resolveMiddleware , */ ...middlewares
  )

  const composedEnhancers = compose(appliedMiddlewares, ...enhancers)

  const store = reduxCreateStore(
    combinedReducers,
    initialState,
    composedEnhancers
  ) as any

  resolveMiddleware.run({
    store,
    viewModels,
    origin,
    rootPath,
    subscribeAdapter,
    sessionId,
    jwtProvider,
    isClient,
    customSagas,
    queryMethod
  })

  if (jwtProvider != null) {
    syncJwtProviderWithStore(jwtProvider, store).catch(
      // eslint-disable-next-line no-console
      error => console.error(error)
    )
  }

  return store
}

export default createStore
