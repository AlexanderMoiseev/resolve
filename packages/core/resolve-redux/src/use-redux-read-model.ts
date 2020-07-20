import { Action } from 'redux'
import { Query, QueryOptions, QueryResult } from 'resolve-client'
import { useQuery, HookExecutor } from 'resolve-react-hooks'
import {
  QueryReadModelFailureAction,
  QueryReadModelRequestAction,
  QueryReadModelSuccessAction
} from './actions'

type QueryExecutor = HookExecutor<void, void>

type ReadModelReduxActionsCreators = {
  request: (query: Query) => QueryReadModelRequestAction
  success: (result: QueryResult) => QueryReadModelSuccessAction
  failure: (error: Error) => QueryReadModelFailureAction
}

function useReduxReadModel(query: Query): QueryExecutor
function useReduxReadModel(query: Query, options: QueryOptions): QueryExecutor
function useReduxReadModel(
  query: Query,
  actions: ReadModelReduxActionsCreators
): QueryExecutor
function useReduxReadModel(query: Query, dependencies: any[]): QueryExecutor
function useReduxReadModel(
  query: Query,
  options: QueryOptions,
  actions: ReadModelReduxActionsCreators
): QueryExecutor
function useReduxReadModel(
  query: Query,
  options: QueryOptions,
  dependencies: any[]
): QueryExecutor
function useReduxReadModel(
  query: Query,
  options: QueryOptions,
  actions: ReadModelReduxActionsCreators,
  dependencies: any[]
): QueryExecutor
function useReduxReadModel(
  query: Query,
  options?: QueryOptions | ReadModelReduxActionsCreators | any[],
  actions?: ReadModelReduxActionsCreators | any[],
  dependencies?: any[]
): QueryExecutor {
  return () => {}
}
