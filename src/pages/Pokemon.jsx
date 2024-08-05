import { useState, useEffect } from "react"
import { replace, useParams } from "react-router-dom"

import axios from "axios"
import PokemonCard from "../components/PokemonCard/PokemonCard"

const Pokemon = () => {

  const { id } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [description, setDescription] = useState(null);
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getPokemon = async () => {

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
      setPokemon(response.data);


    } catch (err) {
      setError(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPokemonDescription = async () => {
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
      const flavorTexts = response.data.flavor_text_entries;
      const englishDescription = flavorTexts.find(entry => entry.language.name === 'en');
      setDescription(englishDescription ? englishDescription.flavor_text : 'No description available.');

      const genera = response.data.genera;
      const genus = genera.find(entry => entry.language.name === 'en');
      const categoryText = genus ? genus.genus : 'Category not available.';
      setCategory(categoryText.replace('Pokémon', '').trim());
    } catch (error) {
      console.error('Error fetching Pokémon description:', error);
    }
  };

  useEffect(() => {
    getPokemon();
    getPokemonDescription();
  }, [id])


  console.log(pokemon)

  return (
    <div className="app">
      <div className="container">
        {pokemon && (
          <div>
            <div>
              <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
              <h3 className='id'>{pokemon.id}</h3>
            </div>
            <div>
              <div>
                <img src={pokemon.sprites.other['official-artwork'].front_default} alt={pokemon.name} />
              </div>
              <div>
                <p>{description}</p>
                <div>
                  <p><strong>Height:</strong> {pokemon.height / 10} m</p>
                  <p><strong>Weight:</strong> {pokemon.weight / 10} kg</p>
                  <p><strong>Category:</strong> {category}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  )
}

export default Pokemon
