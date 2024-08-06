import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import './Pokemon.scss';

import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { CgPokemon } from "react-icons/cg";

import Loading from "../components/Loading/Loading";
import Error from '../components/Error/Error'

import AOS from 'aos';
import 'aos/dist/aos.css'

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
  const [evolutionChain, setEvolutionChain] = useState(null);
  const [evolutionImages, setEvolutionImages] = useState([])

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

      // Inicializar conjunto de forças com todas as forças do primeiro tipo
      let combinedStrengths = new Set();
      typeStrengths.forEach(typeStrength => {
        typeStrength.doubleDamageTo.forEach(type => combinedStrengths.add(type));
      });

      // Identificar forças mitigadas
      const halfAndNoDamage = new Set(
        typeStrengths.flatMap(typeStrength => [...typeStrength.halfDamageTo, ...typeStrength.noDamageTo])
      );

      // Filtrar forças removendo as que são mitigadas
      const filteredStrengths = [...combinedStrengths].filter(type => !halfAndNoDamage.has(type));

      // Atualizar o estado com os tipos de força
      setStrengths(filteredStrengths);

    } catch (error) {
      console.error('Error fetching Pokémon strengths:', error);
    }
  };

  const getPokemonEvolutionChain = async () => {
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
      const evolutionChainUrl = response.data.evolution_chain.url;

      const evolutionChainResponse = await axios.get(evolutionChainUrl);
      setEvolutionChain(evolutionChainResponse.data);

      // Função para obter imagens e tipos para todos os Pokémons na cadeia de evolução
      const fetchImages = async (chain) => {
        const images = [];
        let current = chain;

        while (current) {
          try {
            // Requisição para obter os dados do Pokémon
            const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${current.species.name}`);

            // Extrair os tipos do Pokémon
            const types = pokemonResponse.data.types.map(type => type.type.name);

            images.push({
              name: current.species.name,
              image: pokemonResponse.data.sprites.other['official-artwork'].front_default,
              types: types
            });

            // Mover para o próximo Pokémon na cadeia de evolução
            if (current.evolves_to.length > 0) {
              current = current.evolves_to[0];
            } else {
              break;
            }
          } catch (error) {
            console.error(`Error fetching data for ${current.species.name}:`, error);
            break; // Saia do loop em caso de erro
          }
        }

        setEvolutionImages(images);
      };

      fetchImages(evolutionChainResponse.data.chain);

    } catch (error) {
      console.error('Error fetching Pokémon evolution chain:', error);
    }
  };

  const getPreviousAndNextPokemon = async () => {
    try {
      const currentId = parseInt(id, 10);
      const prevId = currentId > 1 ? currentId - 1 : 1025;
      const nextId = currentId < 1025 ? currentId + 1 : 1;

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
      getPokemonEvolutionChain();
      getPokemonWeaknesses(pokemon.types);
      getPokemonStrengths(pokemon.types);
    }
  }, [pokemon]);

  useEffect(() => {
    AOS.init();
  },[]);

  const capitalizeFirstLetter = (string) => string ? string.charAt(0).toUpperCase() + string.slice(1) : '';

  const hasEvolution = evolutionImages.length > 0;
  const isSingleEvolution = hasEvolution && evolutionImages.length === 1 || evolutionImages.length === 0;
  const isTwoEvolutions = hasEvolution && evolutionImages.length === 2;

  return (
    <div className="app">
      <div className="container">
      {loading && <Loading />}
      {error && <Error />}
        <div className="previous-next" data-aos="fade-in" data-aos-duration="1000">
          <button className={`previous ${previousPokemon?.types?.[0]?.type?.name}`} onClick={handlePreviousPokemon}
          >
            {previousPokemon && (
              <>
                <FaArrowLeft />
                <div><span>{capitalizeFirstLetter(previousPokemon.name)}</span> N° {String(previousPokemon.id).padStart(4, '0')}</div>
                <CgPokemon className="pokeball" />
              </>
            )}
          </button>
          <button className={`next ${nextPokemon?.types?.[0]?.type?.name}`} onClick={handleNextPokemon} >
            {nextPokemon && (
              <>
                <CgPokemon className="pokeball" />
                <div><span>{capitalizeFirstLetter(nextPokemon.name)}</span> N° {String(nextPokemon.id).padStart(4, '0')}</div>
                <FaArrowRight />
              </>
            )}
          </button>
        </div>
        {pokemon && (
          <div className="about-pokemon" >
            <div className="name-id" data-aos="fade-in" data-aos-duration="1000">
              <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
              <h4 className='id'>N° {String(pokemon.id).padStart(4, '0')}</h4>
            </div>
            <div className="img-description" >
              <div >
                <img src={pokemon.sprites.other['official-artwork'].front_default} alt={pokemon.name} data-aos="fade-in" data-aos-duration="1000" />
                <div data-aos="fade-in" data-aos-duration="1000">
                  {pokemon.types.map((type) => (
                    <span key={type.type.name} className={`type ${type.type.name}`}>
                      {type.type.name}
                    </span>
                  ))}
                </div>
              </div>
              <p className="info" dangerouslySetInnerHTML={{ __html: description }}  data-aos="fade-in" data-aos-duration="1000"/>
              <div className="text-about">
                <div className="about" data-aos="fade-in" data-aos-duration="1000">
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
                  <div data-aos="fade-in" data-aos-duration="1000">
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
                  <div data-aos="fade-in" data-aos-duration="1000">
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

            <div className="stats-container" data-aos="fade-in" data-aos-duration="1000">
              <h4>Stats</h4>
              <ul className="stats-list">
                {pokemon.stats.map(stat => (
                  <li key={stat.stat.name} className="stats-item">
                    <span className="stat-name">{capitalizeFirstLetter(stat.stat.name)}:</span>
                    <div className="stat-bar" data-aos="fade-in" data-aos-duration="1000">
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
            <div className={`evolution-chain ${isTwoEvolutions ? 'two-evolutions' : ''} ${isSingleEvolution ? 'single-evolution' : ''}`} data-aos="fade-in" data-aos-duration="1000" >
              <h4>Evolutions</h4>
              {evolutionImages.length > 0 ? (
                <div className={`evolution-list ${isSingleEvolution ? 'single-evolution' : ''}`} data-aos="fade-in" data-aos-duration="1000">
                  {isSingleEvolution && <p>No has evolution</p>}
                  {evolutionImages.map((evolution, index) => (
                    <div key={index}>
                      <img src={evolution.image} alt={evolution.name} />
                      <p>{capitalizeFirstLetter(evolution.name)}</p>
                      <div className="types">
                        {evolution.types.map((type, typeIndex) => (
                          <span key={typeIndex} className={`type ${type}`}>
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`evolution-list ${isSingleEvolution ? 'single-evolution' : ''}`} data-aos="fade-in" data-aos-duration="1000">
                  <p>No has evolution</p>
                  <img src={pokemon.sprites.other['official-artwork'].front_default} alt={pokemon.name}  />
                  <p>{capitalizeFirstLetter(pokemon.name)}</p>
                  <div className="types">
                    {pokemon.types.map((type) => (
                      <span key={type.type.name} className={`type ${type.type.name}`}>
                        {type.type.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Pokemon;
