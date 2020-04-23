import { BLOG_POST_CREATED, BLOG_POST_DELETED } from '../blog-post.events'
import { Aggregate } from 'resolve-core'

const aggregate: Aggregate = {
  create: (state, command, jwt) => {
    const { isExist } = state

    if (isExist) {
      throw Error(`the blog post already exist`)
    }

    // TODO: validate jwt

    const { authorId, content, title } = command.payload

    return {
      type: BLOG_POST_CREATED,
      payload: {
        authorId,
        content,
        title
      }
    }
  },
  delete: state => {
    const { isExist } = state

    if (!isExist) {
      throw Error(`the blog post not exist`)
    }

    return {
      type: BLOG_POST_DELETED
    }
  }
}

export default aggregate
