import React, { useState } from 'react';
import { Form, Button, Stack } from 'react-bootstrap';

const TaskForm = (props) => {
  const [name, setName] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    props.addTask(name);
    setName('');
    document.getElementById('new-todo').value = '';
  }

  function handleChange(e) {
    setName(e.target.value);
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Stack direction="horizontal" gap={2}>
        <Form.Control
          type="text"
          id="new-todo"
          title="text"
          autoComplete="off"
          onChange={handleChange}
          placeholder="What needs to be done?"
        />
        <Button variant="primary" type="submit" disabled={props.isLoading}>
          {props.isLoading ? <span>Loading</span> : <span>Add</span>}
        </Button>
      </Stack>
    </Form>
  );
};

export default TaskForm;
