export function createTodoCard(name) {
    return {
        aggregateName: 'todocard',
        type: 'create',
        name
    };
}

export function removeTodoCard(id) {
    return {
        aggregateName: 'todocard',
        type: 'remove',
        aggregateId: id
    };
}
