import AWSXray from 'aws-xray-sdk-core'

const initPerformanceTracer = resolve => {
  Object.defineProperty(resolve, 'performanceTracer', {
    value: {
      getSegment: () => {
        const segment = process.env.TRACE ? AWSXray.getSegment() : null

        return {
          addNewSubsegment: subsegmentName => {
            const subsegment = process.env.TRACE
              ? segment.addNewSubsegment(subsegmentName)
              : null

            return {
              addAnnotation: (annotationName, data) => {
                if (process.env.TRACE) {
                  subsegment.addAnnotation(annotationName, data)
                }
              },
              addError: error => {
                if (process.env.TRACE) {
                  subsegment.addError(error)
                }
              },
              close: () => {
                if (process.env.TRACE) {
                  subsegment.close()
                }
              }
            }
          }
        }
      }
    }
  })
}

export default initPerformanceTracer
