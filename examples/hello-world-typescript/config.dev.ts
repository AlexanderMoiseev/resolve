import { declareRuntimeEnv } from 'resolve-scripts'

const devConfig = {
  target: 'local',
  port: declareRuntimeEnv('PORT', '3000'),
  mode: 'development',
  rootPath: '',
  staticPath: 'static',
  staticDir: 'static',
  distDir: 'dist',
  readModelConnectors: {
    default: {
      module: 'resolve-readmodel-lite',
      options: {
        databaseFile: 'data/read-models.db'
      }
    }
    /*default: {
      module: 'resolve-readmodel-mysql',
      options: {
        host: 'localhost',
        port: 3306,
        user: 'customUser',
        password: 'customPassword',
        database: 'customDatabaseName'
      }
    }*/
  },
  snapshotAdapter: {
    module: 'resolve-snapshot-lite',
    options: {
      // pathToFile: 'path/to/file',
      bucketSize: 100
    }
  },
  /*{
    module: 'resolve-snapshot-mysql',
    options: {
      host: 'localhost',
      port: 3306,
      user: 'customUser',
      password: 'customPassword',
      database: 'customDatabaseName',
      eventsTableName: 'customTableName',
      bucketSize: 100
    }
  },*/
  eventstoreAdapter: {
    module: 'resolve-eventstore-lite',
    options: {
      databaseFile: 'data/storage.db'
    }
  },
  /*{
    module: 'resolve-eventstore-mysql',
    options: {
      host: 'localhost',
      port: 3306,
      user: 'customUser',
      password: 'customPassword',
      database: 'customDatabaseName',
      eventsTableName: 'customTableName'
    }
  },*/
  subscribeAdapter: {
    module: 'resolve-subscribe-socket.io',
    options: {}
  },
  /*{
    module: 'resolve-subscribe-mqtt',
    options: {}
  },*/
  jwtCookie: {
    name: 'jwt',
    maxAge: 31536000000
  },
  schedulers: {
    scheduler: {
      adapter: {
        module: 'resolve-scheduler-local',
        options: {}
      },
      connectorName: 'default'
    }
  }
}

export default devConfig