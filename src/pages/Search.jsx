import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

import axios from "axios";

import PokemonCard from "../components/PokemonCard/PokemonCard";
import Loading from "../components/Loading/Loading";
import Error from "../components/Error/Error";

const Search = () => {

  const [searchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const query = searchParams.get("q");

  const getSearchedPokemons = async () => {

    setLoading(true)
    setError(null)
    setData([])

    if (!query) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${query}`);
      const pokemonDetails = response.data; 

      setData([pokemonDetails]); 
    } catch (err) {
      setError(err)
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (query) { 
      getSearchedPokemons();
    }
  }, [query])

  return (
  <div className="app">
      <div className="container">
            {loading  && <Loading />}
            {error && <Error error={error} query={query} />}
            {data.length > 0 && data.map((pokemon) => 
              <PokemonCard pokemon={pokemon} />
            )}
      </div>
    </div>
  )
}

export default Search
