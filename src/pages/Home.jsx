import { useState, useEffect } from "react"
import axios from "axios"

import './Home.scss'

import PokemonCard from "../components/PokemonCard/PokemonCard"

const Home = () => {

  const [data, setData] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const getPokemons = async () => {

    setLoading(true)
    setError(null)

    try {

      const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=20')
      const pokemonList = response.data.results;

      const pokemonDetailsPromises = pokemonList.map((pokemon) =>
        axios.get(pokemon.url)
      );
      const detailsResponses = await Promise.all(pokemonDetailsPromises);
      const pokemonDetails = detailsResponses.map((res) => res.data);

      setData(pokemonDetails);
    } catch (err) {
      setError(err)
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getPokemons();
  }, [])

  return (
    <div className="app">
      <div className="container">
            {data.length === 0 && <p>Loading...</p>}
            {data.length > 0 && data.map((pokemon) => 
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            )}
      </div>
    </div>
  )
}

export default Home
