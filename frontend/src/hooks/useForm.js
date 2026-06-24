import { useState } from 'react';

export const useForm = (initialState = {}, onSubmit) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  return {
    values,
    setValues,
    errors,
    setErrors,
    handleChange,
    handleSubmit
  };
};
