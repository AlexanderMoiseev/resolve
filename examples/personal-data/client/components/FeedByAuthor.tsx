import React, { useState, useEffect, useCallback } from 'react'
import { useQuery, useCommand } from 'resolve-react-hooks'
import v4 from 'uuid/v4'
import { FormGroup, Label, Form, Input, Button, Alert } from 'reactstrap'

import { UserProfile } from '../../common/types'
import Feed from './Feed'

const NewPost = ({
  user,
  successHandler
}: {
  user: UserProfile
  successHandler: (arg: any) => void
}) => {
  const [values, setValues] = useState({
    title: '',
    content: '',
    error: null,
    collapsed: true
  })
  const { title, content, collapsed, error } = values
  const publish = useCommand(
    {
      type: 'create',
      aggregateId: v4(),
      aggregateName: 'blog-post',
      payload: {
        authorId: user.id,
        content,
        title
      }
    },
    (error, result) => {
      if (error) {
        setValues({ ...values, error: true, collapsed: false })
      } else {
        setValues({
          ...values,
          error: false,
          title: '',
          content: '',
          collapsed: true
        })
        successHandler(result)
      }
    },
    [content]
  ) as () => void

  const handleChange = prop => event => {
    setValues({ ...values, error: false, [prop]: event.target.value })
  }

  const toggleCollapsed = () => {
    setValues({ ...values, collapsed: !collapsed })
  }

  return (
    <React.Fragment>
      {collapsed ? (
        <Button onClick={toggleCollapsed}> Publish new post</Button>
      ) : (
        <Form>
          <FormGroup>
            <Label for="addPostTitle">New post</Label>
            <Input id="addPostTitle" onChange={handleChange('title')} />
          </FormGroup>
          <FormGroup>
            <Input
              onChange={handleChange('content')}
              type="textarea"
              id="addPostContent"
            />
            {/* // TODO: <FormText>Use MD syntax</FormText> */}
          </FormGroup>
          <FormGroup>
            <Button onClick={publish} className="mt-3">
              Publish
            </Button>
          </FormGroup>
        </Form>
      )}
      {error && (
        <Alert color="danger">Ann error occurred while publishing</Alert>
      )}
    </React.Fragment>
  )
}

const FeedByAuthor = ({
  authorId,
  user
}: {
  authorId: string
  user: UserProfile
}) => {
  const [posts, setPosts] = useState([])

  const getPosts = useQuery(
    { name: 'blog-posts', resolver: 'feedByAuthor', args: { authorId } },
    (error, result) => {
      setPosts(result.data)
    }
  )
  useEffect(() => {
    getPosts()
  }, [])

  const successCallback = useCallback(
    result => {
      const nextPosts = posts.map(p => p)
      const {
        aggregateId,
        timestamp,
        payload: { authorId, title, content }
      } = result
      nextPosts.unshift({
        authorId,
        title,
        content,
        id: aggregateId,
        timestamp
      })
      setPosts(nextPosts)
    },
    [posts]
  )

  return (
    <React.Fragment>
      <div className="mb-3">
        {authorId === user.id && (
          <NewPost user={user} successHandler={successCallback} />
        )}
      </div>
      <Feed posts={posts} />
    </React.Fragment>
  )
}

export default FeedByAuthor
