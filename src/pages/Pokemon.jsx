import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import './Pokemon.scss';

import { MdNavigateNext } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";

const Pokemon = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [pokemon, setPokemon] = useState(null);
  const [description, setDescription] = useState(null);
  const [weaknesses, setWeaknesses] = useState([]);
  const [strengths, setStrengths] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nextPokemon, setNextPokemon] = useState(null)
  const [previousPokemon, setPreviousPokemon] = useState(null)

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

  const getPokemonWeaknesses = async (types) => {
    try {
      const typeResponses = await Promise.all(
        types.map(type => axios.get(`https://pokeapi.co/api/v2/type/${type.type.name}`))
      );

      const typeWeaknesses = typeResponses.map(response => {
        const damageRelations = response.data.damage_relations;
        return {
          doubleDamageFrom: new Set(damageRelations.double_damage_from.map(type => type.name)),
          halfDamageFrom: new Set(damageRelations.half_damage_from.map(type => type.name)),
          noDamageFrom: new Set(damageRelations.no_damage_from.map(type => type.name))
        };
      });

      let combinedWeaknesses = new Set([...typeWeaknesses[0].doubleDamageFrom]);

      typeWeaknesses.slice(1).forEach(typeWeakness => {
        combinedWeaknesses = new Set([...combinedWeaknesses, ...typeWeakness.doubleDamageFrom]);
      });

      const halfAndNoDamage = new Set(
        typeWeaknesses.flatMap(typeWeakness => [...typeWeakness.halfDamageFrom, ...typeWeakness.noDamageFrom])
      );

      const filteredWeaknesses = [...combinedWeaknesses].filter(type => !halfAndNoDamage.has(type));

      setWeaknesses(filteredWeaknesses);
    } catch (error) {
      console.error('Error fetching Pokémon weaknesses:', error);
    }
  };

  const getPokemonStrengths = async (types) => {
    try {
      // Obter informações sobre todos os tipos do Pokémon
      const typeResponses = await Promise.all(
        types.map(type => axios.get(`https://pokeapi.co/api/v2/type/${type.type.name}`))
      );

      // Mapeie as forças de todos os tipos
      const typeStrengths = typeResponses.map(response => {
        const damageRelations = response.data.damage_relations;
        return {
          doubleDamageTo: new Set(damageRelations.double_damage_to.map(type => type.name)),
          halfDamageTo: new Set(damageRelations.half_damage_to.map(type => type.name)),
          noDamageTo: new Set(damageRelations.no_damage_to.map(type => type.name))
        };
      });

      console.log('Type Strengths:', typeStrengths);

      // Inicializar conjunto de forças com todas as forças do primeiro tipo
      let combinedStrengths = new Set();
      typeStrengths.forEach(typeStrength => {
        typeStrength.doubleDamageTo.forEach(type => combinedStrengths.add(type));
      });

      console.log('Combined Strengths:', [...combinedStrengths]);

      // Identificar forças mitigadas
      const halfAndNoDamage = new Set(
        typeStrengths.flatMap(typeStrength => [...typeStrength.halfDamageTo, ...typeStrength.noDamageTo])
      );

      console.log('Half and No Damage:', [...halfAndNoDamage]);

      // Filtrar forças removendo as que são mitigadas
      const filteredStrengths = [...combinedStrengths].filter(type => !halfAndNoDamage.has(type));

      console.log('Filtered Strengths:', filteredStrengths);

      // Atualizar o estado com os tipos de força
      setStrengths(filteredStrengths);

    } catch (error) {
      console.error('Error fetching Pokémon strengths:', error);
    }
  };

  const getPreviousAndNextPokemon = async () => {
    try {
      const currentId = parseInt(id, 10);
      const prevId = currentId > 1 ? currentId - 1 : null;
      const nextId = currentId < 1025 ? currentId + 1 : null;

      const responsePrevious = await axios.get(`https://pokeapi.co/api/v2/pokemon/${prevId}`)
      setPreviousPokemon(responsePrevious.data)

      const responseNext = await axios.get(`https://pokeapi.co/api/v2/pokemon/${nextId}`)
      setNextPokemon(responseNext.data)

    } catch (error) {
      console.error('Error determining previous and next Pokémon:', error);
    }
  };

  const handlePreviousPokemon = () => {
    if (previousPokemon) {
      navigate(`/pokemon/${previousPokemon.id}`);
    }
  };

  const handleNextPokemon = () => {
    if (nextPokemon) {
      navigate(`/pokemon/${nextPokemon.id}`);
    }
  };

  useEffect(() => {
    getPokemon();
  }, [id]);

  useEffect(() => {
    if (pokemon) {
      getPokemonDescription();
      getPreviousAndNextPokemon();
      getPokemonWeaknesses(pokemon.types);
      getPokemonStrengths(pokemon.types);
    }
  }, [pokemon]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  console.log(nextPokemon)

  return (
    <div className="app">
      <div className="container">
        <div className="previous-next">
          <button onClick={handlePreviousPokemon} disabled={!previousPokemon}>
            {previousPokemon && (
              <>
                <GrFormPrevious />
                <span>{capitalizeFirstLetter(previousPokemon.name)}</span> N° {previousPokemon.id}
              </>
            )}
          </button>
          <button onClick={handleNextPokemon} disabled={!nextPokemon}>
            {nextPokemon && (
              <>
                <span>{capitalizeFirstLetter(nextPokemon.name)}</span> N° {nextPokemon.id}
                <MdNavigateNext />
              </>
            )}
          </button>
        </div>
        {pokemon && (
          <div className="about-pokemon">
            <div className="name-id">
              <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
              <h4 className='id'>N° {String(pokemon.id).padStart(3, '0')}</h4>
            </div>
            <div className="img-description">
              <div>
                <img src={pokemon.sprites.other['official-artwork'].front_default} alt={pokemon.name} />
                <div>
                  {pokemon.types.map((type) => (
                    <span key={type.type.name} className={`type ${type.type.name}`}>
                      {type.type.name}
                    </span>
                  ))}
                </div>
              </div>
              <p className="info" dangerouslySetInnerHTML={{ __html: description }} />
              <div className="text-about">
                <div className="about">
                  <div>
                    <p><strong>Height</strong></p>
                    <span>{pokemon.height / 10} m</span>
                    <p><strong>Weight</strong></p>
                    <span>{pokemon.weight / 10} kg</span>
                  </div>
                  <div>
                    <p><strong>Category</strong></p>
                    <span>{category}</span>
                    <p><strong>Ability</strong></p>
                    <span>{pokemon.abilities.length > 0 ? capitalizeFirstLetter(pokemon.abilities[0].ability.name) : 'No abilities available'}</span>
                  </div>
                </div>
                <div className="types">
                  <div>
                    <h3>Weaknesses</h3>
                    {weaknesses.length > 0 ? (
                      weaknesses.map((weakness, index) => (
                        <span key={index} className={`type ${weakness}`}>
                          {weakness}
                        </span>
                      ))
                    ) : (
                      <p>No weaknesses </p>
                    )}
                  </div>
                  <div>
                    <h3>Strengths</h3>
                    {strengths.length > 0 ? (
                      strengths.map((strength, index) => (
                        <span key={index} className={`type ${strength}`}>
                          {strength}
                        </span>
                      ))
                    ) : (
                      <p>No strengths </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="stats-container">
              <h4>Stats</h4>
              <ul className="stats-list">
                {pokemon.stats.map(stat => (
                  <li key={stat.stat.name} className="stats-item">
                    <span className="stat-name">{capitalizeFirstLetter(stat.stat.name)}:</span>
                    <div className="stat-bar">
                      <div
                        className="stat-bar-fill"
                        style={{ width: `${stat.base_stat / 2}%` }}
                      >
                      </div>
                    </div>
                    <span className="stat-value">{stat.base_stat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Pokemon;
