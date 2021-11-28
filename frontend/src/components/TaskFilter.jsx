import React from 'react';
import { Button } from 'react-bootstrap';

function TaskFilter(props) {
  return (
    <Button variant="outline-success" size="sm" onClick={props.filter}>
      {props.name}
    </Button>
  );
}

export default TaskFilter;
