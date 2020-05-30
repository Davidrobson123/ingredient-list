import React, { useReducer, useCallback, useMemo, useEffect } from 'react';

import IngredientForm from './IngredientForm';
import Search from './Search';
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import useHttp from "../../hooks/http";

const ingredientReducer = (currentIngredients, action) => {
    switch(action.type) {
        case 'SET':
            return action.ingredients
        case 'ADD':
            return [...currentIngredients, action.ingredient]
        case 'DELETE':
            return currentIngredients.filter(ing => ing.id !== action.id)
        default:
            throw new Error('should not get here')
    }
}

const Ingredients = () => {

  const [userIngredients, dispatch] = useReducer(ingredientReducer, [])
  const { isLoading, error, data, sendRequest, extra, identifier, clear } = useHttp();

  useEffect(() => {
      if(!isLoading && !error && identifier === 'REMOVE_INGREDIENT') {
          dispatch({type: 'DELETE', id: extra})
      } else if(!isLoading && !error && identifier === 'ADD_INGREDIENT') {
          dispatch({type: 'ADD', ingredient: {id: data.name, ...extra}})
      }

  }, [data, extra, identifier, isLoading, error])

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
      dispatch({type: 'SET', ingredients: filteredIngredients})
  }, [])

  const addIngredientHandler = useCallback(ingredient => {
      sendRequest('https://react-hooks-update-3c881.firebaseio.com/ingredients.json',
          'POST',
          JSON.stringify(ingredient),
          ingredient,
          'ADD_INGREDIENT')
  }, [sendRequest]);

  const removeIngredientHandler = useCallback(id => {
      sendRequest(`https://react-hooks-update-3c881.firebaseio.com/ingredients/${id}.json`, 'DELETE', id, 'REMOVE_INGREDIENT')
      dispatch({type: 'DELETE', id: id})
  }, [sendRequest]);

  const ingredientList = useMemo(() => {
      return (
          <IngredientList
              ingredients={userIngredients}
              onRemoveItem={removeIngredientHandler}/>
      )
  }, [userIngredients, removeIngredientHandler])

  return (
    <div className="App">

      {error && <ErrorModal onClose={clear} >{error}</ErrorModal>}

      <IngredientForm onAddIngredient={addIngredientHandler} loading={isLoading}/>

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler}/>
          {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
