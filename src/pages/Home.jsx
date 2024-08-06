import { useState, useEffect } from "react";
import axios from "axios";
import PokemonCard from "../components/PokemonCard/PokemonCard";

import Loading from "../components/Loading/Loading";

import AOS from 'aos';
import 'aos/dist/aos.css'; 

import './Home.scss'

const Home = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [limit, setLimit] = useState(18);
  const [offset, setOffset] = useState(0);

  const getPokemons = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
      const pokemonList = response.data.results;

      if (pokemonList.length === 0) return; // Evitar carregamento desnecessário

      const pokemonDetailsPromises = pokemonList.map((pokemon) =>
        axios.get(pokemon.url)
      );
      const detailsResponses = await Promise.all(pokemonDetailsPromises);
      const pokemonDetails = detailsResponses.map((res) => res.data);
      
      setData(prevData => {
        // Filtra dados já existentes para evitar duplicação
        const existingPokemonIds = new Set(prevData.map(pokemon => pokemon.id));
        const newPokemons = pokemonDetails.filter(pokemon => !existingPokemonIds.has(pokemon.id));
        return [...prevData, ...newPokemons];
      });
    } catch (err) {
      setError(err);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPokemons();
    AOS.init()
  }, [limit, offset]);

  const morePokemons = () => {
    setOffset((prevOffset) => prevOffset + limit);  // Recurso para carregar mais a partir do que já tem
  };

  return (
    <div className="app">
      <div className="container" data-aos="fade-in" data-aos-duration="1000" key={data.id}>
        {data.length === 0 && loading && <Loading />}
        {error && <p>{error.message}</p>}
        {data.length > 0 && data.map((pokemon) => (
          <PokemonCard pokemon={pokemon} />
        ))}
      </div>
      {!loading && <button className="more-pokemons" onClick={morePokemons} disabled={loading}>More Pokémons</button>}
    </div>
  );
};

export default Home;
