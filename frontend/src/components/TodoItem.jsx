import { ListGroup, Stack, Button, Form } from 'react-bootstrap';

const TodoItem = ({ id, title, completed, deleteTask, toggleTask, isLoading }) => {
  return (
    <ListGroup.Item>
      <Stack direction="horizontal" gap={3}>
        <div>
          <Form.Check
            id="todo-0"
            type="checkbox"
            defaultChecked={completed}
            onChange={() => toggleTask(id)}
          />
        </div>
        <div className="text-break" style={{ textDecoration: completed ? 'line-through' : 'none' }}>
          {title}
        </div>
        <div className="ms-auto"></div>
        <div>
          <Button variant="light" size="sm" onClick={() => deleteTask(id)} disabled={isLoading}>
            x
          </Button>{' '}
        </div>
      </Stack>
    </ListGroup.Item>
  );
};

export default TodoItem;
