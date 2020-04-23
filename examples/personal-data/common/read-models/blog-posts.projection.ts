import { ReadModel } from 'resolve-core'
import { ResolveStore } from 'resolve-readmodel-base'
import { BLOG_POST_CREATED, BLOG_POST_DELETED } from '../blog-post.events'

const readModel: ReadModel<ResolveStore> = {
  Init: async (store): Promise<void> => {
    await store.defineTable('BlogPosts', {
      indexes: { id: 'string', author: 'string' },
      fields: ['timestamp', 'title', 'content']
    })
  },
  [BLOG_POST_CREATED]: async (store, event): Promise<void> => {
    const {
      aggregateId,
      timestamp,
      payload: { authorId, title, content }
    } = event

    await store.insert('BlogPosts', {
      author: authorId,
      id: aggregateId,
      timestamp,
      title,
      content
    })
  },
  [BLOG_POST_DELETED]: async (store, event): Promise<void> =>
    store.delete('BlogPosts', {
      id: event.aggregateId
    })
}

export default readModel
