import { Action } from 'redux'
import { QueryOptions, QueryResult, ViewModelQuery } from 'resolve-client'
import {
  viewModelEventReceived,
  ViewModelEventReceivedAction,
  viewModelStateUpdate,
  ViewModelStateUpdateAction
} from './actions'
import { ReduxState, ViewModelReactiveEvent } from '../types'
import { firstOfType } from 'resolve-core'
import { isActionCreators, isDependencies, isOptions } from '../helpers'
import { useDispatch } from 'react-redux'
import { useViewModel } from 'resolve-react-hooks'
import { useCallback } from 'react'

type HookData = {
  connect: () => void
  dispose: () => void
  selector: (state: ReduxState) => any
}

type ViewModelReduxActionsCreators = {
  /*
  request: (
    query: ViewModelQuery,
    selectorId?: string
  ) => QueryViewModelRequestAction | Action
  success: (
    query: ViewModelQuery,
    result: QueryResult,
    selectorId?: string
  ) => QueryViewModelSuccessAction | Action
  failure: (
    query: ViewModelQuery,
    error: Error,
    selectorId?: string
  ) => QueryViewModelFailureAction | Action
  */
  stateUpdate: (
    query: ViewModelQuery,
    result: QueryResult,
    selectorId?: string
  ) => ViewModelStateUpdateAction | Action
  eventReceived: (
    query: ViewModelQuery,
    event: ViewModelReactiveEvent,
    selectorId?: string
  ) => ViewModelEventReceivedAction | Action
}

type ReduxViewModelHookOptions = {
  queryOptions?: QueryOptions
  selectorId?: string
}

const defaultQueryOptions: QueryOptions = {
  method: 'GET'
}

const internalActions: ViewModelReduxActionsCreators = {
  //request: queryViewModelRequest,
  //success: queryViewModelSuccess,
  //failure: queryViewModelFailure,
  stateUpdate: viewModelStateUpdate,
  eventReceived: viewModelEventReceived
}

export function useReduxViewModel(
  query: ViewModelQuery,
  options?: ReduxViewModelHookOptions | ViewModelReduxActionsCreators | any[],
  actions?: ViewModelReduxActionsCreators | any[],
  dependencies?: any[]
): HookData {
  const actualOptions: ReduxViewModelHookOptions =
    firstOfType<ReduxViewModelHookOptions>(isOptions, options) || {}
  const actualActionCreators: ViewModelReduxActionsCreators =
    firstOfType<ViewModelReduxActionsCreators>(
      isActionCreators,
      options,
      actions
    ) || internalActions
  const actualDependencies: any[] =
    firstOfType<any[]>(isDependencies, options, actions, dependencies) ??
    [query, actualOptions, actualActionCreators].filter(i => i)

  const {
    stateUpdate,
    eventReceived
  } = actualActionCreators
  const { selectorId } = actualOptions
  const { name, aggregateIds, args } = query

  const dispatch = useDispatch()

  const stateChangeCallback = useCallback((state: any) => {
    if (typeof stateUpdate === 'function') {
      dispatch(stateUpdate(query, state, selectorId))
    }
  }, actualDependencies)
  const eventReceivedCallback = useCallback((event: ViewModelReactiveEvent) => {
    if (typeof eventReceived === 'function') {
      dispatch(eventReceived(query, event, selectorId))
    }
  }, actualDependencies)

  const { connect, dispose } = useViewModel(
    name,
    aggregateIds,
    args,
    stateChangeCallback,
    eventReceivedCallback,
    actualOptions.queryOptions || defaultQueryOptions
  )

  return {
    connect,
    dispose,
    selector: (state: ReduxState) =>
      state.viewModels ?? [query.name] ?? [query.aggregateIds] ?? [query.args]
  }
}
