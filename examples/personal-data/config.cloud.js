import { declareRuntimeEnv } from 'resolve-scripts'

const cloudConfig = {
  target: 'cloud',
  mode: 'production',
  staticPath: declareRuntimeEnv('RESOLVE_CLOUD_STATIC_URL'),
  eventstoreAdapter: {
    module: 'resolve-eventstore-postgresql-serverless',
    options: {
      awsSecretStoreArn: declareRuntimeEnv('RESOLVE_ES_SECRET_ARN'),
      dbClusterOrInstanceArn: declareRuntimeEnv('RESOLVE_ES_CLUSTER_ARN'),
      databaseName: declareRuntimeEnv('RESOLVE_ES_DATABASE'),
      eventsTableName: declareRuntimeEnv('RESOLVE_ES_EVENTS_TABLE'),
      secretsTableName: declareRuntimeEnv('RESOLVE_ES_SECRETS_TABLE'),
      region: declareRuntimeEnv('AWS_REGION'),
      snapshotBucketSize: 100,
    },
  },
  readModelConnectors: {
    default: {
      module: 'resolve-readmodel-postgresql-serverless',
      options: {
        dbClusterOrInstanceArn: declareRuntimeEnv(
          'RESOLVE_READMODEL_CLUSTER_ARN'
        ),
        awsSecretStoreArn: declareRuntimeEnv('RESOLVE_READMODEL_SECRET_ARN'),
        databaseName: declareRuntimeEnv('RESOLVE_READMODEL_DATABASE_NAME'),
        region: declareRuntimeEnv('AWS_REGION'),
      },
    },
  },
  schedulers: {
    scheduler: {
      adapter: {
        module: 'resolve-scheduler-cloud',
        options: {},
      },
      connectorName: 'default',
    },
  },
  uploadAdapter: {
    module: 'resolve-upload-cloud',
    options: {
      encryptedDeploymentId: declareRuntimeEnv(
        'RESOLVE_ENCRYPTED_DEPLOYMENT_ID'
      ),
      deploymentId: declareRuntimeEnv('RESOLVE_DEPLOYMENT_ID'),
      CDN: declareRuntimeEnv('RESOLVE_UPLOADER_URL'),
      uploaderArn: declareRuntimeEnv('RESOLVE_UPLOADER_LAMBDA_ARN'),
    },
  },
}

export default cloudConfig
