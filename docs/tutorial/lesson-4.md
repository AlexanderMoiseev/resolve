# Frontend - Display View Model Data in the Browser

In the previous lesson, you modified your application so that it can answer queries. At this moment, your application does not provide a frontent that would present this data to an end-user. In this lesson, you will learn how to create a React frontend to display your reSolve application's data.

You can use the standard HTTP API to communicate with a reSolve backend and implement the frontend using any client side technology.

To facilitate client-server communication, reSolve provides the **resolve-redux** library providing HOCs allowing you to easily connect your React components to the backend.

Create a **ShoppingList.js** file end the client application's containers folder. In this file, implement a component that displays a list of values obtained ftom the **data** prop:

**client/containers/ShoppingList.js**

<!-- prettier-ignore-start -->
[embedmd]:# (../../examples/shopping-list-tutorial/lesson-4/client/containers/ShoppingList.js /import \{ ListGroup/ /^\}/)
```js
import { ListGroup, ListGroupItem, Checkbox } from 'react-bootstrap'

export class ShoppingList extends React.PureComponent {
  render() {
    const list = this.props.data
    return (
      <ListGroup style={{ maxWidth: '500px', margin: 'auto' }}>
        {list.map(todo => (
          <ListGroupItem key={todo.id}>
            <Checkbox inline>{todo.text}</Checkbox>
          </ListGroupItem>
        ))}
      </ListGroup>
    )
  }
}
```
<!-- prettier-ignore-end -->

The example code uses components from the **react-bootstrap** library to keep the markup compact.

Now you can use the **resolve-redux** library's **connectViewModel** function to bind your component to **ShoppingList** view model implemented earlier:

<!-- prettier-ignore-start -->
[embedmd]:# (../../examples/shopping-list-tutorial/lesson-4/client/containers/ShoppingList.js /export const mapStateToOptions/ /export default connectViewModel/)
```js
export const mapStateToOptions = (state, ownProps) => {
  return {
    viewModelName: 'ShoppingList',
    aggregateIds: ['root-id']
  }
}

export default connectViewModel
```
<!-- prettier-ignore-end -->

Run your application to see the result:
![result](images/lesson4_result.png)
